import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

prisma.$on('query', (e: any) => {
  logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query');
});


export { prisma };

