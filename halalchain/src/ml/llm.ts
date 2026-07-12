import { pipeline } from '@xenova/transformers';
import { logger } from '../lib/logger';

let generationPipeline: any = null;

export async function getLLMPipeline() {
  if (!generationPipeline) {
    logger.info('Loading LLM model...');
    try {
      generationPipeline = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
      logger.info('LLM model loaded successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to load LLM model');
      throw error;
    }
  }
  return generationPipeline;
}

export async function generateAnswer(question: string, context: string[]): Promise<string> {
  try {
    const pipe = await getLLMPipeline();

    const prompt = `
Context information:
${context.join('\n---\n')}

Question: ${question}

Based on the context provided above, please answer the question accurately:
`;

    const result = await pipe(prompt, {
      max_length: 300,
      temperature: 0.3,
      top_p: 0.9,
      do_sample: true,
    });

    return result[0].generated_text.trim() ||
      'Unable to generate an answer from the provided context.';
  } catch (error) {
    logger.error({ error, question }, 'Failed to generate answer');
    return 'An error occurred while generating the answer. Please try again.';
  }
}

