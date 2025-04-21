import Conf from 'conf';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

interface PincastConfig {
  devToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  userId?: string;
  clientId?: string;
}

// Create ~/.pincast directory if it doesn't exist
const configDir = path.join(os.homedir(), '.pincast');
fs.ensureDirSync(configDir);

// Initialize configuration
const config = new Conf<PincastConfig>({
  projectName: 'pincast',
  cwd: configDir,
  configName: 'config'
});

/**
 * Get the Pincast configuration
 */
export function getConfig(): Conf<PincastConfig> {
  return config;
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = config.get('devToken');
  const expiresAt = config.get('expiresAt');
  
  // Check if token exists and is not expired
  return !!token && !!expiresAt && expiresAt > Date.now();
}

/**
 * Save authentication tokens to config
 */
export function saveAuthTokens(tokens: {
  devToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}): void {
  config.set('devToken', tokens.devToken);
  config.set('refreshToken', tokens.refreshToken);
  config.set('expiresAt', tokens.expiresAt);
  config.set('userId', tokens.userId);
}

/**
 * Clear authentication tokens from config
 */
export function clearAuthTokens(): void {
  config.delete('devToken');
  config.delete('refreshToken');
  config.delete('expiresAt');
}

/**
 * Get the project configuration from pincast.json
 */
export function getProjectConfig(): any {
  try {
    const configPath = path.join(process.cwd(), 'pincast.json');
    if (fs.existsSync(configPath)) {
      return fs.readJSONSync(configPath);
    }
  } catch (error) {
    // Ignore errors
  }
  
  return null;
}

/**
 * Save project configuration to pincast.json
 */
export function saveProjectConfig(projectConfig: any): void {
  const configPath = path.join(process.cwd(), 'pincast.json');
  fs.writeJSONSync(configPath, projectConfig, { spaces: 2 });
}