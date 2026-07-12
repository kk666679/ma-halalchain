import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
export declare function createContext({ req, res }: CreateExpressContextOptions): {
    req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    res: import("express").Response<any, Record<string, any>>;
    prisma: any;
    user: {
        id: string;
        role: string;
    } | null;
};
export type Context = inferAsyncReturnType<typeof createContext>;
