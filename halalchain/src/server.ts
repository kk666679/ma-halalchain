import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { httpLogger } from './middleware/logger';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(httpLogger);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'healthy',
        redis: 'healthy',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, type, path, input }) => {
      logger.error(
        {
          error: {
            message: error.message,
            code: (error as any).code,
            stack: error.stack,
          },
          type,
          path,
          input,
        },
        'tRPC error'
      );
    },
  })
);

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  logger.info(`🚀 HalalChain server running on http://localhost:${PORT}`);
  logger.info(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
  logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;

