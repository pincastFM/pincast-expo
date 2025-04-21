/**
 * Helper to get runtime config (type-safe way to access environment variables)
 */
export function getRuntime() {
  let config;
  
  try {
    // In Nuxt environment, useRuntimeConfig is available
    // @ts-ignore - This is available at runtime in Nuxt
    config = useRuntimeConfig();
  } catch (e) {
    // In test environment, we'll use environment variables
    config = {
      pincastJwtSecret: process.env.PINCAST_JWT_SECRET || 'test-secret-for-unit-tests',
      public: {
        logtoEndpoint: process.env.LOGTO_ENDPOINT || 'https://auth.pincast.fm'
      }
    };
  }
  
  return {
    ...config,
    pincastJwtSecret: process.env.PINCAST_JWT_SECRET || config.pincastJwtSecret,
    logtoJwksUrl: process.env.LOGTO_JWKS_URL
  };
}

/**
 * Type-safe assertion functions for runtime checks
 * These functions help ensure values are of the expected type,
 * and throw appropriate errors when they're not
 */

/**
 * Assert that a value is defined (not undefined or null)
 * @param value The value to check
 * @param errorMessage Optional custom error message
 * @returns The value if it's defined
 * @throws 400 Bad Request if value is undefined or null
 */
export function assertDefined<T>(value: T | null | undefined, errorMessage = 'Required value is missing'): T {
  if (value === undefined || value === null) {
    throw createError({
      statusCode: 400,
      message: errorMessage
    });
  }
  return value;
}

/**
 * Assert that a value is a string
 * @param value The value to check
 * @param errorMessage Optional custom error message
 * @returns The value as a string
 * @throws 400 Bad Request if value is not a string
 */
export function assertString(value: unknown, errorMessage = 'Expected a string'): string {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: errorMessage
    });
  }
  return value;
}

/**
 * Assert that a value is a number
 * @param value The value to check
 * @param errorMessage Optional custom error message
 * @returns The value as a number
 * @throws 400 Bad Request if value is not a number
 */
export function assertNumber(value: unknown, errorMessage = 'Expected a number'): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw createError({
      statusCode: 400,
      message: errorMessage
    });
  }
  return value;
}

/**
 * Safely get a property value, defaulting to undefined if object is null/undefined
 * @param obj The object to get the property from
 * @param key The property key
 * @returns The property value or undefined
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj ? obj[key] : undefined;
}

// Import Nuxt's createError function or use a test fallback
let createError: (options: { statusCode: number; message: string }) => Error;

try {
  // In Nuxt environment
  // @ts-ignore - This is available at runtime in Nuxt
  const imports = require('#imports');
  createError = imports.createError;
} catch (e) {
  // In test environment, provide a mock implementation
  createError = (options: { statusCode: number; message: string }) => {
    const error = new Error(options.message) as any;
    error.statusCode = options.statusCode;
    return error;
  };
}

// Default export for compatibility with existing imports
export default {
  getRuntime,
  assertDefined,
  assertString,
  assertNumber,
  safeGet
};