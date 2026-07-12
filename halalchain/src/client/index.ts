import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../trpc/router';

export interface HalalClientOptions {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export function createHalalClient(options: HalalClientOptions) {
  const { baseUrl, apiKey, headers = {} } = options;

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        headers: {
          ...headers,
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
      }),
    ],
  });
}

export type { AppRouter };
export * from '../trpc/router';

