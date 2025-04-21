import fetch from 'node-fetch';
import open from 'open';
import ora from 'ora';

const LOGTO_BASE_URL = process.env.LOGTO_BASE_URL || 'https://auth.pincast.fm';
const CLIENT_ID = process.env.LOGTO_CLIENT_ID || 'pincast-cli';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
}

export interface AuthTokens {
  devToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

/**
 * Starts the device authorization flow with Logto
 */
export async function startDeviceFlow(): Promise<AuthTokens> {
  // Request device code
  const codeResponse = await fetch(`${LOGTO_BASE_URL}/oauth/device-authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: 'openid profile email offline_access developer:api'
    }),
  });

  if (!codeResponse.ok) {
    throw new Error(`Failed to start device flow: ${codeResponse.statusText}`);
  }

  const deviceCode = await codeResponse.json() as DeviceCodeResponse;

  // Display user code and open verification URI
  console.log(`\nPlease authenticate in your browser using code: ${deviceCode.user_code}`);
  await open(deviceCode.verification_uri_complete);

  // Start polling for token
  const spinner = ora('Waiting for authentication...').start();
  const token = await pollForToken(deviceCode);
  spinner.succeed('Successfully authenticated!');

  // Extract user ID from JWT
  const payload = parseJwt(token.id_token);
  const userId = payload.sub;
  
  return {
    devToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    userId
  };
}

/**
 * Poll the token endpoint until the user completes authentication
 */
async function pollForToken(deviceCode: DeviceCodeResponse): Promise<TokenResponse> {
  const startTime = Date.now();
  const expiresAt = startTime + deviceCode.expires_in * 1000;
  
  // Use device code interval or default to 5 seconds
  const interval = deviceCode.interval || 5;
  
  while (Date.now() < expiresAt) {
    try {
      const response = await fetch(`${LOGTO_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode.device_code,
        }),
      });
      
      if (response.ok) {
        return await response.json() as TokenResponse;
      }
      
      const error = await response.json();
      
      // "authorization_pending" is the expected error while waiting
      if (error.error !== 'authorization_pending') {
        throw new Error(`Authentication failed: ${error.error}`);
      }
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'authorization_pending') {
        throw error;
      }
    }
    
    // Wait for the specified interval before polling again
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
  }
  
  throw new Error('Authentication timed out. Please try again.');
}

/**
 * Parse a JWT token to get the payload
 */
function parseJwt(token: string): { sub: string, [key: string]: any } {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    Buffer.from(base64, 'base64')
      .toString()
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}