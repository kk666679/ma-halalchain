import { Queue } from 'bullmq';
export declare const redisConnection: any;
export declare const embeddingQueue: Queue<any, any, string, any, any, string>;
export declare const ragQueue: Queue<any, any, string, any, any, string>;
export declare const ingredientQueue: Queue<any, any, string, any, any, string>;
export declare const verificationQueue: Queue<any, any, string, any, any, string>;
export declare const queues: {
    embedding: Queue<any, any, string, any, any, string>;
    rag: Queue<any, any, string, any, any, string>;
    ingredient: Queue<any, any, string, any, any, string>;
    verification: Queue<any, any, string, any, any, string>;
};
export declare function closeQueues(): Promise<void>;
