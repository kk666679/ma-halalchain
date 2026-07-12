"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const embedder_1 = require("../ml/embedder");
const llm_1 = require("../ml/llm");
const queues_1 = require("../queues");
const logger_1 = require("../lib/logger");
const library_1 = require("@prisma/client/runtime/library");
const t = server_1.initTRPC.context().create();
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
    const apiKey = ctx.req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
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
exports.appRouter = t.router({
    health: t.procedure.query(async () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })),
    verifyCertificate: t.procedure
        .input(zod_1.z.object({
        certHash: zod_1.z.string().min(10),
        checkOnChain: zod_1.z.boolean().optional().default(true),
    }))
        .mutation(async ({ input, ctx }) => {
        logger_1.logger.info({ certHash: input.certHash }, 'Verifying certificate');
        const product = await ctx.prisma.product.findUnique({
            where: { certificateHash: input.certHash },
            include: { ingredients: true },
        });
        if (!product) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Product not found with this certificate hash' });
        }
        if (input.checkOnChain) {
            await queues_1.queues.verification.add('verify', {
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
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        batchNumber: zod_1.z.string().min(1),
        certificateHash: zod_1.z.string().min(10),
        ingredients: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string().min(1),
            eCode: zod_1.z.string().optional(),
        })),
    }))
        .mutation(async ({ input, ctx }) => {
        logger_1.logger.info({ productName: input.name, batch: input.batchNumber }, 'Adding product');
        const existing = await ctx.prisma.product.findUnique({ where: { batchNumber: input.batchNumber } });
        if (existing) {
            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Product with this batch number already exists' });
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
            await queues_1.queues.ingredient.add('analyze', {
                ingredientId: ingredient.id,
                name: ingredient.name,
            });
        }
        await queues_1.queues.verification.add('verify', {
            productId: product.id,
            certificateHash: input.certificateHash,
        });
        logger_1.logger.info({ productId: product.id }, 'Product added successfully');
        return product;
    }),
    getProduct: t.procedure
        .input(zod_1.z.object({
        id: zod_1.z.string().optional(),
        batchNumber: zod_1.z.string().optional(),
    }))
        .query(async ({ input, ctx }) => {
        if (!input.id && !input.batchNumber) {
            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Either id or batchNumber is required' });
        }
        const product = await ctx.prisma.product.findFirst({
            where: {
                OR: [{ id: input.id }, { batchNumber: input.batchNumber }].filter(Boolean),
            },
            include: {
                ingredients: true,
                documents: true,
            },
        });
        if (!product) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        return product;
    }),
    ask: t.procedure
        .use(rateLimit)
        .input(zod_1.z.object({
        question: zod_1.z.string().min(1).max(1000),
        productId: zod_1.z.string().optional(),
        includeSources: zod_1.z.boolean().optional().default(true),
    }))
        .query(async ({ input, ctx }) => {
        logger_1.logger.info({ question: input.question, productId: input.productId }, 'Processing RAG query');
        const queryEmbedding = await (0, embedder_1.embedText)(input.question);
        let results = [];
        if (input.productId) {
            results = await ctx.prisma.$queryRaw `
          SELECT id, title, content, metadata,
                 1 - (embedding::vector <=> ${queryEmbedding}::vector) AS similarity
          FROM "Document"
          WHERE "productId" = ${input.productId}
            AND embedding IS NOT NULL
          ORDER BY similarity DESC
          LIMIT 5;
        `;
        }
        else {
            results = await ctx.prisma.$queryRaw `
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
                const answer = await (0, llm_1.generateAnswer)(input.question, context);
                return { answer, sources: [], productContext: context };
            }
        }
        const contexts = results.map((r) => r.content);
        const answer = await (0, llm_1.generateAnswer)(input.question, contexts);
        return {
            answer,
            sources: input.includeSources ? results : undefined,
            count: results.length,
        };
    }),
    addDocument: t.procedure
        .use(isAuthenticated)
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1),
        content: zod_1.z.string().min(1),
        productId: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
        autoEmbed: zod_1.z.boolean().optional().default(true),
    }))
        .mutation(async ({ input, ctx }) => {
        logger_1.logger.info({ title: input.title, productId: input.productId }, 'Adding document');
        const document = await ctx.prisma.document.create({
            data: {
                title: input.title,
                content: input.content,
                productId: input.productId,
                metadata: input.metadata || {},
            },
        });
        if (input.autoEmbed) {
            await queues_1.queues.embedding.add('embed', {
                documentId: document.id,
                content: input.content,
            });
        }
        return document;
    }),
    searchDocuments: t.procedure
        .input(zod_1.z.object({
        query: zod_1.z.string().min(1),
        productId: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(20).default(10),
    }))
        .query(async ({ input, ctx }) => {
        const queryEmbedding = await (0, embedder_1.embedText)(input.query);
        const results = await ctx.prisma.$queryRaw `
        SELECT id, title, content, metadata,
               1 - (embedding::vector <=> ${queryEmbedding}::vector) AS similarity
        FROM "Document"
        WHERE embedding IS NOT NULL
          ${input.productId ? (0, library_1.sql) `AND "productId" = ${input.productId}` : (0, library_1.sql) ``}
        ORDER BY similarity DESC
        LIMIT ${input.limit};
      `;
        return results;
    }),
    getIngredientStatus: t.procedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        eCode: zod_1.z.string().optional(),
    }))
        .query(async ({ input }) => {
        const classification = await classifyIngredient(input.name);
        return classification;
    }),
});
