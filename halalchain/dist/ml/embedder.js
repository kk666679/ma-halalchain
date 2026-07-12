"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedder = getEmbedder;
exports.embedText = embedText;
exports.embedBatch = embedBatch;
const transformers_1 = require("@xenova/transformers");
const logger_1 = require("../lib/logger");
// Configure local model cache
transformers_1.env.localModelPath = './models';
transformers_1.env.allowRemoteModels = true;
transformers_1.env.remoteHost = 'https://huggingface.co';
let embedder = null;
async function getEmbedder() {
    if (!embedder) {
        logger_1.logger.info('Loading embedding model...');
        try {
            embedder = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            logger_1.logger.info('Embedding model loaded successfully');
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to load embedding model');
            throw error;
        }
    }
    return embedder;
}
async function embedText(text) {
    try {
        const emb = await getEmbedder();
        const result = await emb(text, {
            pooling: 'mean',
            normalize: true,
        });
        return Array.from(result.data);
    }
    catch (error) {
        logger_1.logger.error({ error, text: text.substring(0, 100) }, 'Failed to embed text');
        throw error;
    }
}
async function embedBatch(texts) {
    const results = await Promise.all(texts.map((t) => embedText(t)));
    return results;
}
