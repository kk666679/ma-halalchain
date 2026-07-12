import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from '../lib/prisma';

export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    prisma,
    user: null as { id: string; role: string } | null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

