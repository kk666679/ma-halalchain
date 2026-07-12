import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { embedText } from '../ml/embedder';
import { generateAnswer } from '../ml/llm';
import { queues } from '../queues';
import { logger } from '../lib/logger';
import { sql } from '@prisma/client/runtime/library';

const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const apiKey = ctx.req.headers['x-api-key'] as string | undefined;
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
  }
  return next({
    ctx: {
      ...ctx,
      user: { id: 'system', role: 'admin' },
    },
  });
});

const rateLimit = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.ip || 'unknown';
  void ip;
  return next();
});

export const appRouter = t.router({
  health: t.procedure.query(async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })),

  verifyCertificate: t.procedure
    .input(
      z.object({
        certHash: z.string().min(10),
        checkOnChain: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ certHash: input.certHash }, 'Verifying certificate');

      const product = await ctx.prisma.product.findUnique({
        where: { certificateHash: input.certHash },
        include: { ingredients: true },
      });

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found with this certificate hash' });
      }

      if (input.checkOnChain) {
        await queues.verification.add('verify', {
          productId: product.id,
          certificateHash: input.certHash,
        });

        return {
          product,
          verificationQueued: true,
          message: 'Verification job queued for processing',
        };
      }

      return {
        product,
        verificationQueued: false,
        verified: product.verified,
      };
    }),

  addProduct: t.procedure
    .use(isAuthenticated)
    .input(
      z.object({
        name: z.string().min(1),
        batchNumber: z.string().min(1),
        certificateHash: z.string().min(10),
        ingredients: z.array(
          z.object({
            name: z.string().min(1),
            eCode: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ productName: input.name, batch: input.batchNumber }, 'Adding product');

      const existing = await ctx.prisma.product.findUnique({ where: { batchNumber: input.batchNumber } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Product with this batch number already exists' });
      }

      const product = await ctx.prisma.product.create({
        data: {
          name: input.name,
          batchNumber: input.batchNumber,
          certificateHash: input.certificateHash,
          ingredients: {
            create: input.ingredients.map((ing) => ({
              name: ing.name,
              eCode: ing.eCode || '',
              status: 'Pending',
              confidence: 0,
              reasoning: 'Queued for analysis',
            })),
          },
        },
        include: { ingredients: true },
      });

      for (const ingredient of product.ingredients) {
        await queues.ingredient.add('analyze', {
          ingredientId: ingredient.id,
          name: ingredient.name,
        });
      }

      await queues.verification.add('verify', {
        productId: product.id,
        certificateHash: input.certificateHash,
      });

      logger.info({ productId: product.id }, 'Product added successfully');
      return product;
    }),

  getProduct: t.procedure
    .input(
      z.object({
        id: z.string().optional(),
        batchNumber: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.id && !input.batchNumber) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Either id or batchNumber is required' });
      }

      const product = await ctx.prisma.product.findFirst({
        where: {
          OR: [{ id: input.id }, { batchNumber: input.batchNumber }].filter(Boolean) as any,
        },
        include: {
          ingredients: true,
          documents: true,
        },
      });

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      }

      return product;
    }),

  ask: t.procedure
    .use(rateLimit)
    .input(
      z.object({
        question: z.string().min(1).max(1000),
        productId: z.string().optional(),
        includeSources: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      logger.info({ question: input.question, productId: input.productId }, 'Processing RAG query');

      const queryEmbedding = await embedText(input.question);

      let results: any[] = [];

      if (input.productId) {
        results = await ctx.prisma.$queryRaw`
          SELECT id, title, content, metadata,
                 1 - (embedding::vector <=> ${queryEmbedding}::vector) AS similarity
          FROM "Document"
          WHERE "productId" = ${input.productId}
            AND embedding IS NOT NULL
          ORDER BY similarity DESC
          LIMIT 5;
        `;
      } else {
        results = await ctx.prisma.$queryRaw`
          SELECT id, title, content, metadata,
                 1 - (embedding::vector <=> ${queryEmbedding}::vector) AS similarity
          FROM "Document"
          WHERE embedding IS NOT NULL
          ORDER BY similarity DESC
          LIMIT 5;
        `;
      }

      if (results.length === 0 && input.productId) {
        const product = await ctx.prisma.product.findUnique({
          where: { id: input.productId },
          include: { ingredients: true },
        });

        if (product) {
          const context = [
            `Product: ${product.name}`,
            `Batch: ${product.batchNumber}`,
            `Ingredients: ${product.ingredients
              .map((i) => `${i.name}${i.eCode ? ` (${i.eCode})` : ''} - ${i.status} (${(i.confidence * 100).toFixed(1)}% confidence)`)
              .join(', ')}`,
          ];

          const answer = await generateAnswer(input.question, context);
          return { answer, sources: [], productContext: context };
        }
      }

      const contexts = results.map((r) => r.content);
      const answer = await generateAnswer(input.question, contexts);

      return {
        answer,
        sources: input.includeSources ? results : undefined,
        count: results.length,
      };
    }),

  addDocument: t.procedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        productId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        autoEmbed: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ title: input.title, productId: input.productId }, 'Adding document');

      const document = await ctx.prisma.document.create({
        data: {
          title: input.title,
          content: input.content,
          productId: input.productId,
          metadata: input.metadata || {},
        },
      });

      if (input.autoEmbed) {
        await queues.embedding.add('embed', {
          documentId: document.id,
          content: input.content,
        });
      }

      return document;
    }),

  searchDocuments: t.procedure
    .input(
      z.object({
        query: z.string().min(1),
        productId: z.string().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const queryEmbedding = await embedText(input.query);

      const results = await ctx.prisma.$queryRaw`
        SELECT id, title, content, metadata,
               1 - (embedding::vector <=> ${queryEmbedding}::vector) AS similarity
        FROM "Document"
        WHERE embedding IS NOT NULL
          ${input.productId ? sql`AND "productId" = ${input.productId}` : sql``}
        ORDER BY similarity DESC
        LIMIT ${input.limit};
      `;

      return results;
    }),

  getIngredientStatus: t.procedure
    .input(
      z.object({
        name: z.string(),
        eCode: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const classification = await classifyIngredient(input.name);
      return classification;
    }),
});

export type AppRouter = typeof appRouter;

