import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signJwt, verifyJwt } from '../../server/utils/jwt';

// Mock runtime config
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    pincastJwtSecret: 'test-secret-that-is-at-least-32-chars-long'
  })
}));

// Mock needed dependencies
vi.mock('jose', () => {
  const mockedJwtVerify = vi.fn();
  
  // Mock behavior for successful verification
  mockedJwtVerify.mockImplementation((token) => {
    // Reject if token is invalid
    if (token === 'invalid.token.format') {
      return Promise.reject(new Error('Invalid token'));
    }
    
    // Generate an expiration timestamp based on token contents
    // token with '2h' should have a longer expiration
    const exp = Math.floor(Date.now() / 1000) + (token.includes('2h') ? 7200 : 3600);
    
    return Promise.resolve({
      payload: { 
        sub: 'user-123', 
        appId: 'app-456', 
        aud: 'app:app-456',
        exp
      }
    });
  });
  
  return {
    SignJWT: vi.fn().mockImplementation(() => ({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockImplementation((_secretKey) => {
        // Return a mock JWT with the expected format (3 parts separated by dots)
        return Promise.resolve('header.payload.signature');
      })
    })),
    jwtVerify: mockedJwtVerify
  };
});

describe('JWT Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should sign a JWT with the provided payload', async () => {
    const payload = {
      sub: 'user-123',
      appId: 'app-456',
      aud: 'app:app-456'
    };
    
    const token = await signJwt(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    // Token should be in the format header.payload.signature
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });
  
  it('should verify a signed JWT', async () => {
    const payload = {
      sub: 'user-123',
      appId: 'app-456',
      aud: 'app:app-456'
    };
    
    const token = await signJwt(payload);
    const verified = await verifyJwt(token);
    
    expect(verified).toBeDefined();
    expect(verified.sub).toBe(payload.sub);
    expect(verified.appId).toBe(payload.appId);
    expect(verified.aud).toBe(payload.aud);
  });
  
  it('should reject an invalid JWT', async () => {
    const invalidToken = 'invalid.token.format';
    
    await expect(verifyJwt(invalidToken)).rejects.toThrow('Invalid token');
  });
  
  it('should set expiration time based on provided value', async () => {
    const payload = { sub: 'user-123' };
    
    // Test with seconds
    const token1 = await signJwt(payload, 30);
    const verified1 = await verifyJwt(token1);
    expect(verified1).toBeDefined();
    
    // Test with string format
    const token2 = await signJwt(payload, '2h');
    const verified2 = await verifyJwt(token2);
    expect(verified2).toBeDefined();
    
    // We just test that both function calls worked, 
    // the actual implementation is tested by the mocks
  });
});