import { pipeline, env } from '@xenova/transformers';
import { logger } from '../lib/logger';

// Configure local model cache
env.localModelPath = './models';
env.allowRemoteModels = true;
env.remoteHost = 'https://huggingface.co';

let embedder: any = null;

export async function getEmbedder() {
  if (!embedder) {
    logger.info('Loading embedding model...');
    try {
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      logger.info('Embedding model loaded successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to load embedding model');
      throw error;
    }
  }
  return embedder;
}

export async function embedText(text: string): Promise<number[]> {
  try {
    const emb = await getEmbedder();
    const result = await emb(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(result.data);
  } catch (error) {
    logger.error({ error, text: text.substring(0, 100) }, 'Failed to embed text');
    throw error;
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(texts.map((t) => embedText(t)));
  return results;
}

