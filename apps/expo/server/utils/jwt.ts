import { SignJWT, jwtVerify, decodeJwt as joseDecodeJwt } from 'jose';
import runtime from './runtime';

/**
 * Sign a JWT with the app's secret
 */
export async function signJwt(payload: any, expiresIn: string | number = '1h'): Promise<string> {
  const config = runtime.getRuntime();
  const secret = config.pincastJwtSecret;
  
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  const secretKey = new TextEncoder().encode(secret);
  
  // Convert expiresIn to seconds if it's a string format like '1h'
  let expirationTime: number;
  if (typeof expiresIn === 'string') {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const valueStr = runtime.assertString(match[1], 'Invalid expiration format');
      const value = parseInt(valueStr);
      const unit = runtime.assertString(match[2], 'Invalid expiration unit');
      
      switch (unit) {
        case 's': expirationTime = value; break;
        case 'm': expirationTime = value * 60; break;
        case 'h': expirationTime = value * 60 * 60; break;
        case 'd': expirationTime = value * 60 * 60 * 24; break;
        default: expirationTime = 3600; // Default to 1 hour
      }
    } else {
      // Default to 1 hour if the format is invalid
      expirationTime = 3600;
    }
  } else {
    expirationTime = expiresIn;
  }
  
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
    .sign(secretKey);
  
  return jwt;
}

/**
 * Verify a JWT signed by our app
 */
export async function verifyJwt(token: string): Promise<any> {
  const config = runtime.getRuntime();
  const secret = config.pincastJwtSecret;
  
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  const secretKey = new TextEncoder().encode(secret);
  
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid token');
  }
}

/**
 * Decode a JWT without verifying its signature
 */
export function decodeJwt(token: string): any {
  try {
    return joseDecodeJwt(token);
  } catch (error) {
    console.error('JWT decoding failed:', error);
    throw new Error('Invalid token format');
  }
}