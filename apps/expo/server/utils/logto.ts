import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from 'jose';
import { getRuntime } from './runtime';

// Cache JWK set to avoid repetitive network requests
let jwkSetCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwkSetLastFetched = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// Get Logto JWKS URL from environment
const getJwksUrl = () => {
  const config = getRuntime();
  const jwksUrl = config.logtoJwksUrl || `${config.public.logtoEndpoint}/.well-known/jwks.json`;
  return jwksUrl;
};

/**
 * Get JWKS from Logto for verifying tokens
 */
export const getLogtoJwkSet = () => {
  const jwksUrl = getJwksUrl();
  const now = Date.now();
  
  if (!jwkSetCache || now - jwkSetLastFetched > CACHE_TTL) {
    jwkSetCache = createRemoteJWKSet(new URL(jwksUrl));
    jwkSetLastFetched = now;
  }
  
  return jwkSetCache;
};

/**
 * Verify a JWT token issued by Logto
 */
export async function verifyLogtoToken(token: string, audience?: string): Promise<JWTVerifyResult> {
  try {
    const jwks = getLogtoJwkSet();
    const config = getRuntime();
    const issuer = config.public.logtoEndpoint;
    
    const verifyOptions: any = {
      issuer
    };
    
    if (audience) {
      verifyOptions.audience = audience;
    }
    
    const result = await jwtVerify(token, jwks, verifyOptions);
    return result;
  } catch (error) {
    console.error('Error verifying Logto token:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  
  const matches = header.match(/^Bearer\s+(.+)$/i);
  return matches && matches[1] ? matches[1] : null;
}

/**
 * Check if a token has the specified scope
 */
export function hasScope(payload: any, scope: string): boolean {
  if (!payload || !payload.scope) return false;
  
  if (typeof payload.scope === 'string') {
    const scopes = payload.scope.split(' ');
    return scopes.includes(scope);
  }
  
  if (Array.isArray(payload.scope)) {
    return payload.scope.includes(scope);
  }
  
  return false;
}

// Export default object for compatibility with imports
export default {
  verifyLogtoToken,
  extractBearerToken,
  hasScope,
  getLogtoJwkSet
};