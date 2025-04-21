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

// Define interfaces for query results to fix type errors
interface AppVersion {
  id: string;
  appId: string;
  buildUrl: string;
  deployUrl?: string;
  createdAt: Date;
  semver: string;
  state: string;
  changelog?: string | null;
  lighthouseScore?: number | null;
  repoUrl?: string | null;
  [key: string]: any;
}

interface User {
  id: string;
  email: string | null;
  role: string;
  name?: string | null;
  logtoId: string;
  [key: string]: any;
}

// ===== MODULE TYPE DECLARATIONS =====

// SERVER MODULE TYPE DECLARATIONS

// Database schema module declarations
// The main path ~/ version
declare module '~/server/db/schema' {
  import { z } from 'zod';
  
  // Role enum types
  export type UserRole = 'player' | 'developer' | 'staff';
  export type AppState = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden';
  
  // Table exports
  export const users: any;
  export const apps: any;
  export const versions: any;
  export const analytics: any;
  export const payments: any;
  
  // Type definitions
  export type User = {
    id: string;
    logtoId: string;
    email: string | null;
    role: UserRole;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type App = {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    heroUrl: string | null;
    category: string | null;
    priceCents: number;
    isPaid: boolean;
    state: AppState;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type Version = {
    id: string;
    appId: string;
    semver: string;
    changelog: string | null;
    lighthouseScore: number | null;
    repoUrl: string | null;
    deployUrl: string | null;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type AnalyticsEvent = {
    id: number;
    appId: string;
    userId: string;
    event: string;
    ts: Date;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
  
  export type Payment = {
    id: string;
    appId: string;
    stripeChargeId: string | null;
    amountCents: number;
    feeCents: number;
    ts: Date;
    [key: string]: any;
  };
  
  // "New" types for insertion
  export type NewUser = Omit<User, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewApp = Omit<App, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewVersion = Omit<Version, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewAnalyticsEvent = Omit<AnalyticsEvent, 'id' | 'ts'> & { id?: number; ts?: Date };
  export type NewPayment = Omit<Payment, 'id' | 'ts'> & { id?: string; ts?: Date };
}

// Relative path version for direct imports
declare module './schema' {
  import { z } from 'zod';
  
  // Role enum types
  export type UserRole = 'player' | 'developer' | 'staff';
  export type AppState = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden';
  
  // Table exports
  export const users: any;
  export const apps: any;
  export const versions: any;
  export const analytics: any;
  export const payments: any;
  
  // Type definitions
  export type User = {
    id: string;
    logtoId: string;
    email: string | null;
    role: UserRole;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type App = {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    heroUrl: string | null;
    category: string | null;
    priceCents: number;
    isPaid: boolean;
    state: AppState;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type Version = {
    id: string;
    appId: string;
    semver: string;
    changelog: string | null;
    lighthouseScore: number | null;
    repoUrl: string | null;
    deployUrl: string | null;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type AnalyticsEvent = {
    id: number;
    appId: string;
    userId: string;
    event: string;
    ts: Date;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
  
  export type Payment = {
    id: string;
    appId: string;
    stripeChargeId: string | null;
    amountCents: number;
    feeCents: number;
    ts: Date;
    [key: string]: any;
  };
  
  // "New" types for insertion
  export type NewUser = Omit<User, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewApp = Omit<App, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewVersion = Omit<Version, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewAnalyticsEvent = Omit<AnalyticsEvent, 'id' | 'ts'> & { id?: number; ts?: Date };
  export type NewPayment = Omit<Payment, 'id' | 'ts'> & { id?: string; ts?: Date };
}

// PostGIS module for the ~/server/db path
declare module '~/server/db/postgis' {
  export function makePoint(longitude: number, latitude: number): any;
  export function checkPostGIS(): Promise<boolean>;
  export function withinDistance(geoColumn: any, point: any, distanceMeters: number): any;
  export function asText(geoColumn: any): any;
  export function distance(geoColumn: any, point: any): any;
}

// PostGIS module for the relative path
declare module './postgis' {
  export function makePoint(longitude: number, latitude: number): any;
  export function checkPostGIS(): Promise<boolean>;
  export function withinDistance(geoColumn: any, point: any, distanceMeters: number): any;
  export function asText(geoColumn: any): any;
  export function distance(geoColumn: any, point: any): any;
}

// Another relative path version used in API routes
declare module '../../../db/schema' {
  import { z } from 'zod';
  
  // Role enum types
  export type UserRole = 'player' | 'developer' | 'staff';
  export type AppState = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden';
  
  // Table exports
  export const users: any;
  export const apps: any;
  export const versions: any;
  export const analytics: any;
  export const payments: any;
  
  // Type definitions
  export type User = {
    id: string;
    logtoId: string;
    email: string | null;
    role: UserRole;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type App = {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    heroUrl: string | null;
    category: string | null;
    priceCents: number;
    isPaid: boolean;
    state: AppState;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type Version = {
    id: string;
    appId: string;
    semver: string;
    changelog: string | null;
    lighthouseScore: number | null;
    repoUrl: string | null;
    deployUrl: string | null;
    createdAt: Date;
    [key: string]: any;
  };
  
  export type AnalyticsEvent = {
    id: number;
    appId: string;
    userId: string;
    event: string;
    ts: Date;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
  
  export type Payment = {
    id: string;
    appId: string;
    stripeChargeId: string | null;
    amountCents: number;
    feeCents: number;
    ts: Date;
    [key: string]: any;
  };
  
  // "New" types for insertion
  export type NewUser = Omit<User, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewApp = Omit<App, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewVersion = Omit<Version, 'id' | 'createdAt'> & { id?: string; createdAt?: Date };
  export type NewAnalyticsEvent = Omit<AnalyticsEvent, 'id' | 'ts'> & { id?: number; ts?: Date };
  export type NewPayment = Omit<Payment, 'id' | 'ts'> & { id?: string; ts?: Date };
}
declare module '~/server/db/queries' {
  export const getAppBySlug: (slug: string) => Promise<any>;
  export const getAppById: (id: string) => Promise<any>;
  export const listApps: (filters?: any) => Promise<any[]>;
  export const createApp: (data: any) => Promise<any>;
  export const updateAppState: (id: string, state: string) => Promise<any>;
  export const rollbackVersion: (id: string) => Promise<any>;
  export const getUserByLogtoId: (logtoId: string) => Promise<User>;
  export const getVersionsByAppId: (appId: string) => Promise<AppVersion[]>;
  export const recordAnalyticsEvent: (event: any) => Promise<any>;
  export const createVersion: (data: any) => Promise<any>;
  
  const queries = {
    getAppBySlug,
    getAppById,
    listApps,
    createApp,
    updateAppState,
    rollbackVersion,
    getUserByLogtoId,
    getVersionsByAppId,
    recordAnalyticsEvent,
    createVersion
  };
  
  export default queries;
}

declare module '~/server/utils/logto' {
  export const validateToken: (token: string) => Promise<any>;
  export const getRoles: (userId: string) => Promise<string[]>;
  export const hasRole: (userId: string, role: string) => Promise<boolean>;
  export const verifyLogtoToken: (token: string) => Promise<any>;
  export const extractBearerToken: (authHeader: string | undefined) => string | null;
  export const hasScope: (token: any, scope: string) => boolean;
  
  const logtoUtils = {
    validateToken,
    getRoles,
    hasRole,
    verifyLogtoToken,
    extractBearerToken,
    hasScope
  };
  
  export default logtoUtils;
}

declare module '~/server/utils/jwt' {
  export const verifyJwt: (token: string) => Promise<any>;
  export const signJwt: (payload: any, expiresIn?: string | number) => Promise<string>;
  export const decodeJwt: (token: string) => any;
  
  // No default export
}

declare module '~/server/utils/runtime' {
  export const getRuntime: () => {
    pincastJwtSecret: string;
    [key: string]: any;
  };
  export const assertString: (value: any, errorMsg?: string) => string;
  export const assertDefined: <T>(value: T | null | undefined, errorMsg?: string) => T;
  export const assertNumber: (value: any, errorMsg?: string) => number;
  export const safeGet: <T, K extends keyof T>(obj: T | null | undefined, key: K) => T[K] | undefined;
  
  const runtime = {
    getRuntime,
    assertString,
    assertDefined,
    assertNumber,
    safeGet
  };
  
  export default runtime;
}

// API ENDPOINTS TYPE DECLARATIONS
declare module '~/server/api/catalog.get' {
  export interface CatalogItem {
    id: string;
    title: string;
    slug: string;
    heroUrl: string | null;
    distanceMeters?: number;
    sessions7d: number;
  }
  
  export default function handler(event: any): Promise<CatalogItem[]>;
}

declare module '~/server/api/apps/[slug].get' {
  export interface AppDetail {
    id: string;
    title: string;
    slug: string;
    heroUrl: string | null;
    ownerName: string;
    buildUrl: string;
    semver: string;
    geo: {
      center: [number, number]; // [longitude, latitude]
      radiusMeters: number;
    };
  }
  
  export default function handler(event: any): Promise<AppDetail>;
}

declare module '~/server/api/ci/apps.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '~/server/api/token/app.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '~/server/api/ingest.post' {
  export default function handler(event: any): Promise<any>;
}

// RELATIVE PATH MODULE DECLARATIONS
// These are for the test files that use relative imports
declare module '../../../server/api/ci/apps.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '../../../server/api/token/app.post' {
  export default function handler(event: any): Promise<any>;
}

declare module '../../../server/db/queries' {
  export const getAppBySlug: (slug: string) => Promise<any>;
  export const getAppById: (id: string) => Promise<any>;
  export const listApps: (filters?: any) => Promise<any[]>;
  export const createApp: (data: any) => Promise<any>;
  export const updateAppState: (id: string, state: string) => Promise<any>;
  export const rollbackVersion: (id: string) => Promise<any>;
  export const getUserByLogtoId: (logtoId: string) => Promise<User>;
  export const getVersionsByAppId: (appId: string) => Promise<AppVersion[]>;
  export const recordAnalyticsEvent: (event: any) => Promise<any>;
  export const createVersion: (data: any) => Promise<any>;
  
  const queries = {
    getAppBySlug,
    getAppById,
    listApps,
    createApp,
    updateAppState,
    rollbackVersion,
    getUserByLogtoId,
    getVersionsByAppId,
    recordAnalyticsEvent,
    createVersion
  };
  
  export default queries;
}

declare module '../../../server/utils/logto' {
  export const validateToken: (token: string) => Promise<any>;
  export const getRoles: (userId: string) => Promise<string[]>;
  export const hasRole: (userId: string, role: string) => Promise<boolean>;
  export const verifyLogtoToken: (token: string) => Promise<any>;
  export const extractBearerToken: (authHeader: string | undefined) => string | null;
  export const hasScope: (token: any, scope: string) => boolean;
  
  const logtoUtils = {
    validateToken,
    getRoles,
    hasRole,
    verifyLogtoToken,
    extractBearerToken,
    hasScope
  };
  
  export default logtoUtils;
}

declare module '../../../server/utils/jwt' {
  export const verifyJwt: (token: string) => Promise<any>;
  export const signJwt: (payload: any, expiresIn?: string | number) => Promise<string>;
  export const decodeJwt: (token: string) => any;
  
  const jwtUtils = {
    verifyJwt,
    signJwt,
    decodeJwt
  };
  
  export default jwtUtils;
}

// For the relative import error in server/utils/jwt.ts
declare module './runtime' {
  export function getRuntime(): {
    pincastJwtSecret: string;
    [key: string]: any;
  };
  export function assertString(value: any, errorMsg?: string): string;
  export function assertDefined<T>(value: T | null | undefined, errorMsg?: string): T;
  export function assertNumber(value: any, errorMsg?: string): number;
  export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined;
  
  const runtime = {
    getRuntime,
    assertString,
    assertDefined,
    assertNumber,
    safeGet
  };
  
  export default runtime;
}