import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractBearerToken, hasScope } from '../../server/utils/logto';

// Mock jose functions
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn()
}));

// Mock runtime config
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    logtoJwksUrl: 'https://auth.pincast.fm/.well-known/jwks.json',
    public: {
      logtoEndpoint: 'https://auth.pincast.fm'
    }
  })
}));

describe('Logto Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('extractBearerToken', () => {
    it('should extract token from valid Authorization header', () => {
      const header = 'Bearer abc123token';
      const token = extractBearerToken(header);
      expect(token).toBe('abc123token');
    });
    
    it('should handle case-insensitive Bearer prefix', () => {
      const header = 'bearer abc123token';
      const token = extractBearerToken(header);
      expect(token).toBe('abc123token');
    });
    
    it('should return null for invalid Authorization header', () => {
      const header = 'Basic abc123token';
      const token = extractBearerToken(header);
      expect(token).toBeNull();
    });
    
    it('should return null for undefined header', () => {
      const token = extractBearerToken(undefined);
      expect(token).toBeNull();
    });
  });
  
  describe('hasScope', () => {
    it('should return true when scope is present in string format', () => {
      const payload = { scope: 'read write developer:api' };
      expect(hasScope(payload, 'read')).toBe(true);
      expect(hasScope(payload, 'write')).toBe(true);
      expect(hasScope(payload, 'developer:api')).toBe(true);
    });
    
    it('should return true when scope is present in array format', () => {
      const payload = { scope: ['read', 'write', 'developer:api'] };
      expect(hasScope(payload, 'read')).toBe(true);
      expect(hasScope(payload, 'write')).toBe(true);
      expect(hasScope(payload, 'developer:api')).toBe(true);
    });
    
    it('should return false when scope is not present', () => {
      const payload = { scope: 'read write' };
      expect(hasScope(payload, 'delete')).toBe(false);
      expect(hasScope(payload, 'developer:api')).toBe(false);
    });
    
    it('should return false when payload is missing scope property', () => {
      const payload = { sub: 'user-123' };
      expect(hasScope(payload, 'read')).toBe(false);
    });
    
    it('should return false when payload is null or undefined', () => {
      expect(hasScope(null, 'read')).toBe(false);
      expect(hasScope(undefined, 'read')).toBe(false);
    });
  });
});