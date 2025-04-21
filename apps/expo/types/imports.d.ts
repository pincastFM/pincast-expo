declare module '#imports' {
  // Re-export Vue core functionality
  export * from 'vue';
  
  // Re-export Vue Router functionality
  export { useRoute, useRouter } from 'vue-router';
  
  // Re-export Nuxt core functionality
  export const definePageMeta: (meta: any) => void;
  export const useRuntimeConfig: () => any;
  export const useAsyncData: (key: string, fn: () => Promise<any>, options?: any) => Promise<any>;
  export const useFetch: (url: string, options?: any) => Promise<any>;
  export const defineEventHandler: (handler: (event: any) => any) => any;
  export const createError: (options: {statusCode: number, message: string}) => Error;
  export const getRequestHeader: (event: any, header: string) => string | undefined;
  export const readBody: (event: any) => Promise<any>;
  export const setResponseStatus: (event: any, status: number) => void;
  export const appendHeader: (event: any, name: string, value: string) => void;
}

// Path alias imports
declare module '~/server/db/queries' {
  export default {
    getAppBySlug: (slug: string) => Promise<any>,
    getAppById: (id: string) => Promise<any>,
    listApps: (filters?: any) => Promise<any[]>,
    createApp: (data: any) => Promise<any>,
    updateAppState: (id: string, state: string) => Promise<any>,
    rollbackVersion: (id: string) => Promise<any>,
    getUserByLogtoId: (logtoId: string) => Promise<any>,
    getVersionsByAppId: (appId: string) => Promise<any[]>,
    recordAnalyticsEvent: (event: any) => Promise<any>
  };
}

declare module '~/server/utils/logto' {
  export function validateToken(token: string): Promise<any>;
  export function getRoles(userId: string): Promise<string[]>;
  export function hasRole(userId: string, role: string): Promise<boolean>;
  export function verifyLogtoToken(token: string): Promise<any>;
  export function extractBearerToken(authHeader: string): string | null;
}

declare module '~/server/utils/runtime' {
  export function getRuntimeEnv(): {
    [key: string]: string;
  };
}

declare module '~/server/api/catalog.get' {
  export default function handler(event: any): Promise<any>;
}

declare module '~/server/api/ci/apps.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '~/server/api/token/app.post' {
  export default function handler(event: any): Promise<any>;
}

// Relative imports for test files
declare module '../../../server/api/ci/apps.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '../../../server/api/token/app.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '../../../server/db/queries' {
  export default {
    getAppBySlug: (slug: string) => Promise<any>,
    getAppById: (id: string) => Promise<any>,
    listApps: (filters?: any) => Promise<any[]>,
    createApp: (data: any) => Promise<any>,
    updateAppState: (id: string, state: string) => Promise<any>,
    rollbackVersion: (id: string) => Promise<any>,
    getUserByLogtoId: (logtoId: string) => Promise<any>,
    getVersionsByAppId: (appId: string) => Promise<any[]>,
    recordAnalyticsEvent: (event: any) => Promise<any>
  };
}

declare module '../../../server/utils/logto' {
  export function validateToken(token: string): Promise<any>;
  export function verifyLogtoToken(token: string): Promise<any>;
  export function extractBearerToken(authHeader: string): string | null;
  export function getRoles(userId: string): Promise<string[]>;
  export function hasRole(userId: string, role: string): Promise<boolean>;
}

// For the relative import error in server/utils/jwt.ts
declare module '~/server/api/ingest.post' {
  export default function handler(event: any): Promise<any>;
}

declare module './runtime' {
  interface Runtime {
    pincastJwtSecret: string;
    [key: string]: any;
  }
  
  export function getRuntime(): Runtime;
  export function assertString(value: any, errorMsg?: string): string;
  export default { getRuntime, assertString };
}