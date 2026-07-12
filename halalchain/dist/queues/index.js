"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queues = exports.verificationQueue = exports.ingredientQueue = exports.ragQueue = exports.embeddingQueue = exports.redisConnection = void 0;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
// bullmq bundles its own ioredis types; using ioredis instance directly can cause
// TypeScript type incompatibilities due to duplicate ioredis versions.
// Keep a lightweight Redis connection factory instead.
const ioredis_1 = __importDefault(require("ioredis"));
const embedder_1 = require("../ml/embedder");
const classifier_1 = require("../ml/classifier");
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../lib/logger");
exports.redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});
exports.redisConnection.on('connect', () => {
    logger_1.logger.info('Connected to Redis');
});
exports.redisConnection.on('error', (error) => {
    logger_1.logger.error({ error: error instanceof Error ? error.message : error }, 'Redis connection error');
});
exports.embeddingQueue = new bullmq_1.Queue('embedding', {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
exports.ragQueue = new bullmq_1.Queue('rag', {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
exports.ingredientQueue = new bullmq_1.Queue('ingredient-analysis', {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
exports.verificationQueue = new bullmq_1.Queue('certificate-verification', {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    },
});
// Workers
new bullmq_1.Worker('embedding', async (job) => {
    logger_1.logger.info({ jobId: job.id }, 'Processing embedding job');
    const { documentId, content } = job.data;
    const embedding = await (0, embedder_1.embedText)(content);
    await prisma_1.prisma.document.update({
        where: { id: documentId },
        data: { embedding: embedding },
    });
    logger_1.logger.info({ jobId: job.id, documentId }, 'Embedding completed');
    return { success: true };
}, {
    connection: exports.redisConnection,
    concurrency: 5,
});
new bullmq_1.Worker('ingredient-analysis', async (job) => {
    logger_1.logger.info({ jobId: job.id }, 'Processing ingredient analysis job');
    const { ingredientId, name } = job.data;
    const classification = await (0, classifier_1.classifyIngredient)(name);
    await prisma_1.prisma.ingredient.update({
        where: { id: ingredientId },
        data: {
            status: classification.status,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
        },
    });
    logger_1.logger.info({ jobId: job.id, ingredientId, status: classification.status }, 'Ingredient analysis completed');
    return classification;
}, {
    connection: exports.redisConnection,
    concurrency: 10,
});
new bullmq_1.Worker('certificate-verification', async (job) => {
    logger_1.logger.info({ jobId: job.id }, 'Processing certificate verification job');
    const { productId, certificateHash } = job.data;
    // Simulate blockchain verification
    await new Promise((r) => setTimeout(r, 2000));
    const isValid = await verifyOnChain(certificateHash);
    await prisma_1.prisma.product.update({
        where: { id: productId },
        data: { verified: isValid },
    });
    logger_1.logger.info({ jobId: job.id, productId, verified: isValid }, 'Certificate verification completed');
    return { verified: isValid };
}, {
    connection: exports.redisConnection,
    concurrency: 5,
});
async function verifyOnChain(_hash) {
    // Stub: simulate blockchain verification
    // Deterministic: treat last digit as validity for demo stability
    return true;
}
exports.queues = {
    embedding: exports.embeddingQueue,
    rag: exports.ragQueue,
    ingredient: exports.ingredientQueue,
    verification: exports.verificationQueue,
};
async function closeQueues() {
    await Promise.all([
        exports.embeddingQueue.close(),
        exports.ragQueue.close(),
        exports.ingredientQueue.close(),
        exports.verificationQueue.close(),
    ]);
    await exports.redisConnection.quit();
}
