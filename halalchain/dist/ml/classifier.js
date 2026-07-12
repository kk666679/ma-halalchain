"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyIngredient = classifyIngredient;
exports.trainClassifier = trainClassifier;
const embedder_1 = require("./embedder");
const logger_1 = require("../lib/logger");
// Known E-code classifications
const eCodeMap = {
    E100: 'Halal',
    E101: 'Halal',
    E110: 'Mushbooh',
    E120: 'Haram',
    E140: 'Halal',
    E150: 'Halal',
    E160: 'Halal',
    E200: 'Halal',
    E210: 'Mushbooh',
    E220: 'Mushbooh',
    E250: 'Mushbooh',
    E270: 'Halal',
    E300: 'Halal',
    E322: 'Mushbooh',
    E330: 'Halal',
    E407: 'Mushbooh',
    E410: 'Halal',
    E412: 'Halal',
    E415: 'Halal',
    E440: 'Halal',
    E460: 'Halal',
    E470: 'Mushbooh',
    E471: 'Mushbooh',
    E472: 'Mushbooh',
    E473: 'Mushbooh',
    E474: 'Mushbooh',
    E475: 'Mushbooh',
    E476: 'Mushbooh',
    E477: 'Mushbooh',
    E500: 'Halal',
    E621: 'Mushbooh',
    E631: 'Mushbooh',
    E635: 'Mushbooh',
    E900: 'Halal',
    E951: 'Mushbooh',
    E961: 'Mushbooh',
    E965: 'Mushbooh',
    E967: 'Mushbooh',
    E968: 'Mushbooh',
};
async function classifyIngredient(name) {
    const eCodeMatch = name.match(/E\d{3}/i);
    if (eCodeMatch) {
        const eCode = eCodeMatch[0].toUpperCase();
        if (eCodeMap[eCode]) {
            return {
                status: eCodeMap[eCode],
                confidence: 0.95,
                reasoning: `Known classification from E-code ${eCode}`,
            };
        }
    }
    const nameLower = name.toLowerCase();
    const halalKeywords = [
        'plant',
        'vegetable',
        'fruit',
        'water',
        'salt',
        'sugar',
        'halal-certified',
    ];
    const haramKeywords = ['pork', 'alcohol', 'blood', 'carrion', 'animal fat', 'gelatin'];
    if (halalKeywords.some((k) => nameLower.includes(k))) {
        return {
            status: 'Halal',
            confidence: 0.85,
            reasoning: 'Likely halal based on ingredient source',
        };
    }
    if (haramKeywords.some((k) => nameLower.includes(k))) {
        return {
            status: 'Haram',
            confidence: 0.9,
            reasoning: 'Likely haram based on ingredient source',
        };
    }
    // Fallback: embedding-based heuristic (stub)
    try {
        const embedding = await (0, embedder_1.embedText)(name);
        return runHeuristicInference(embedding);
    }
    catch (error) {
        logger_1.logger.warn({ error, name }, 'ML classification failed, using fallback');
        return {
            status: 'Unknown',
            confidence: 0.3,
            reasoning: 'Unable to classify, requires human review',
        };
    }
}
function runHeuristicInference(embedding) {
    const sum = embedding.reduce((a, b) => a + b, 0);
    const avg = sum / embedding.length;
    // Deterministic: avoid Math.random for consistent behavior
    if (avg > 0.1) {
        return {
            status: 'Halal',
            confidence: 0.78,
            reasoning: 'Heuristic inference suggests halal classification',
        };
    }
    if (avg < -0.1) {
        return {
            status: 'Haram',
            confidence: 0.78,
            reasoning: 'Heuristic inference suggests haram classification',
        };
    }
    return {
        status: 'Mushbooh',
        confidence: 0.62,
        reasoning: 'Heuristic inference suggests questionable classification',
    };
}
// Train a simple model (stub for production)
async function trainClassifier(_trainingData) {
    logger_1.logger.info('Training classifier...');
    // In production, implement actual training
    return true;
}
