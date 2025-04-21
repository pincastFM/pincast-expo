import { vi } from 'vitest';

// Set up environment variables for tests
process.env.PG_URL_TEST = 'postgres://postgres:postgres@localhost:5432/pincast_test';
process.env.POSTGRES_URL = 'postgres://postgres:postgres@localhost:5432/pincast_test';
process.env.PINCAST_JWT_SECRET = 'test-jwt-secret-min-32-characters-long-text';
process.env.LOGTO_ENDPOINT = 'https://auth.test.pincast.fm';
process.env.LOGTO_APP_ID = 'test-app-id';
process.env.LOGTO_APP_SECRET = 'test-app-secret';
process.env.SEED_EMAIL_STAFF = 'test-staff@pincast.fm';
process.env.SEED_EMAIL_DEV = 'test-dev@pincast.fm';

// Add any global mocks required for all tests here

// Mock #imports for Nuxt
vi.mock('#imports', () => ({
  defineEventHandler: (handler: any) => handler,
  getQuery: (event: any) => event.$query || {},
  getRouterParam: (event: any, param: string) => event.context?.params?.[param],
  createError: (options: { statusCode: number; message: string }) => {
    const error = new Error(options.message) as any;
    error.statusCode = options.statusCode;
    return error;
  },
  useRuntimeConfig: () => ({
    pincastJwtSecret: process.env.PINCAST_JWT_SECRET || 'test-secret',
    public: {
      logtoEndpoint: process.env.LOGTO_ENDPOINT || 'https://auth.test.pincast.fm'
    }
  })
}));

// Mock Nuxt's defineNuxtRouteMiddleware
vi.mock('#app', () => ({
  defineNuxtRouteMiddleware: (middleware: any) => middleware,
  useRuntimeConfig: () => ({
    pincastJwtSecret: process.env.PINCAST_JWT_SECRET || 'test-secret',
    public: {
      logtoEndpoint: process.env.LOGTO_ENDPOINT || 'https://auth.test.pincast.fm'
    }
  })
}));

// Skip DB connections in test environment by default
vi.mock('~/server/db/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            groupBy: vi.fn().mockImplementation(() => ({
              orderBy: vi.fn().mockResolvedValue([]),
            })),
            orderBy: vi.fn().mockResolvedValue([]),
          })),
          orderBy: vi.fn().mockResolvedValue([]),
          groupBy: vi.fn().mockImplementation(() => ({
            orderBy: vi.fn().mockResolvedValue([]),
          })),
        })),
        leftJoin: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            groupBy: vi.fn().mockImplementation(() => ({
              orderBy: vi.fn().mockResolvedValue([]),
            })),
          })),
        })),
      }))
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
      })),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
        })),
      })),
    })),
  }
}));