export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
        prisma: any;
        user: {
            id: string;
            role: string;
        } | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            status: string;
            timestamp: string;
            uptime: number;
        };
        meta: object;
    }>;
    verifyCertificate: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            certHash: string;
            checkOnChain?: boolean | undefined;
        };
        output: {
            product: any;
            verificationQueued: boolean;
            message: string;
            verified?: undefined;
        } | {
            message?: undefined;
            product: any;
            verificationQueued: boolean;
            verified: any;
        };
        meta: object;
    }>;
    addProduct: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            batchNumber: string;
            certificateHash: string;
            ingredients: {
                name: string;
                eCode?: string | undefined;
            }[];
        };
        output: TOutputOut extends import("@trpc/server").TRPCUnsetMarker ? $Output : TOutputOut;
        meta: object;
    }>;
    getProduct: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id?: string | undefined;
            batchNumber?: string | undefined;
        };
        output: TOutputOut extends import("@trpc/server").TRPCUnsetMarker ? $Output_1 : TOutputOut;
        meta: object;
    }>;
    ask: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            question: string;
            productId?: string | undefined;
            includeSources?: boolean | undefined;
        };
        output: {
            answer: string;
            sources: never[];
            productContext: string[];
            count?: undefined;
        } | {
            productContext?: undefined;
            answer: string;
            sources: any[] | undefined;
            count: number;
        };
        meta: object;
    }>;
    addDocument: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            title: string;
            content: string;
            productId?: string | undefined;
            metadata?: Record<any, unknown> | undefined;
            autoEmbed?: boolean | undefined;
        };
        output: TOutputOut extends import("@trpc/server").TRPCUnsetMarker ? $Output : TOutputOut;
        meta: object;
    }>;
    searchDocuments: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            query: string;
            productId?: string | undefined;
            limit?: number | undefined;
        };
        output: TOutputOut extends import("@trpc/server").TRPCUnsetMarker ? $Output_1 : TOutputOut;
        meta: object;
    }>;
    getIngredientStatus: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            name: string;
            eCode?: string | undefined;
        };
        output: TOutputOut extends import("@trpc/server").TRPCUnsetMarker ? $Output_1 : TOutputOut;
        meta: object;
    }>;
}>>;
export type AppRouter = typeof appRouter;
