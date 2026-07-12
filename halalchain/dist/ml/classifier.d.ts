interface Classification {
    status: string;
    confidence: number;
    reasoning: string;
}
export declare function classifyIngredient(name: string): Promise<Classification>;
export declare function trainClassifier(_trainingData: any[]): Promise<boolean>;
export {};
