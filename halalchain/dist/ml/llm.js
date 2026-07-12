"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMPipeline = getLLMPipeline;
exports.generateAnswer = generateAnswer;
const transformers_1 = require("@xenova/transformers");
const logger_1 = require("../lib/logger");
let generationPipeline = null;
async function getLLMPipeline() {
    if (!generationPipeline) {
        logger_1.logger.info('Loading LLM model...');
        try {
            generationPipeline = await (0, transformers_1.pipeline)('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
            logger_1.logger.info('LLM model loaded successfully');
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to load LLM model');
            throw error;
        }
    }
    return generationPipeline;
}
async function generateAnswer(question, context) {
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
    }
    catch (error) {
        logger_1.logger.error({ error, question }, 'Failed to generate answer');
        return 'An error occurred while generating the answer. Please try again.';
    }
}
