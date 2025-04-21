/**
 * Utility functions for detecting and using the development proxy
 */

/**
 * Check if we're running in a local development environment
 */
export const isLocalDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Get the appropriate API base URL
 * - In local development, use the CLI dev proxy (port 8787)
 * - Otherwise, use the configured API base
 */
export const getApiBaseUrl = (configuredBase: string): string => {
  if (!isLocalDevelopment()) {
    return configuredBase;
  }

  // In local development, use the CLI dev proxy
  // This will be running on port a proxy on port 8787
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8787`;
};

/**
 * Determine if we should use the dev proxy based on the API base URL
 */
export const isUsingDevProxy = (apiBase: string): boolean => {
  return apiBase.includes('localhost:8787') || apiBase.includes('127.0.0.1:8787');
};