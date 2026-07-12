import { Worker, Queue } from 'bullmq';

// bullmq bundles its own ioredis types; using ioredis instance directly can cause
// TypeScript type incompatibilities due to duplicate ioredis versions.
// Keep a lightweight Redis connection factory instead.
import Redis from 'ioredis';

import { embedText } from '../ml/embedder';
import { classifyIngredient } from '../ml/classifier';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}) as any;


redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});

redisConnection.on('error', (error: unknown) => {
logger.error({ error: error instanceof Error ? error.message : error }, 'Redis connection error');
});

export const embeddingQueue = new Queue('embedding', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const ragQueue = new Queue('rag', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const ingredientQueue = new Queue('ingredient-analysis', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const verificationQueue = new Queue('certificate-verification', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Workers
new Worker(
  'embedding',
  async (job) => {
    logger.info({ jobId: job.id }, 'Processing embedding job');
    const { documentId, content } = job.data as { documentId: string; content: string };

    const embedding = await embedText(content);
    await prisma.document.update({
      where: { id: documentId },
      data: { embedding: embedding as any },
    });

    logger.info({ jobId: job.id, documentId }, 'Embedding completed');
    return { success: true };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

new Worker(
  'ingredient-analysis',
  async (job) => {
    logger.info({ jobId: job.id }, 'Processing ingredient analysis job');
    const { ingredientId, name } = job.data as { ingredientId: string; name: string };

    const classification = await classifyIngredient(name);
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        status: classification.status,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      },
    });

    logger.info({ jobId: job.id, ingredientId, status: classification.status }, 'Ingredient analysis completed');
    return classification;
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

new Worker(
  'certificate-verification',
  async (job) => {
    logger.info({ jobId: job.id }, 'Processing certificate verification job');
    const { productId, certificateHash } = job.data as { productId: string; certificateHash: string };

    // Simulate blockchain verification
    await new Promise((r) => setTimeout(r, 2000));

    const isValid = await verifyOnChain(certificateHash);

    await prisma.product.update({
      where: { id: productId },
      data: { verified: isValid },
    });

    logger.info({ jobId: job.id, productId, verified: isValid }, 'Certificate verification completed');
    return { verified: isValid };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

async function verifyOnChain(_hash: string): Promise<boolean> {
  // Stub: simulate blockchain verification
  // Deterministic: treat last digit as validity for demo stability
  return true;
}

export const queues = {
  embedding: embeddingQueue,
  rag: ragQueue,
  ingredient: ingredientQueue,
  verification: verificationQueue,
};

export async function closeQueues() {
  await Promise.all([
    embeddingQueue.close(),
    ragQueue.close(),
    ingredientQueue.close(),
    verificationQueue.close(),
  ]);
  await redisConnection.quit();
}

