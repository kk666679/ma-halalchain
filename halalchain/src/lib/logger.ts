import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' }
  },
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME,
  },
});

export function createChildLogger(component: string) {
  return logger.child({ component });
}

