import pino from 'pino';
export declare const logger: pino.Logger<never, boolean>;
export declare function createChildLogger(component: string): pino.Logger<never, boolean>;
