/**
 * Token handling utilities for the Pincast SDK
 * Provides automatic handling of authentication tokens for API requests
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Extract token from URL query parameters
 * This is used when the SDK is initialized in an iframe with the token passed via query param
 */
function getTokenFromUrl(): string | null {
  if (!isBrowser) return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

/**
 * Get the stored token, either from URL or from localStorage
 */
export function getAuthToken(): string | null {
  // First check URL for token (highest priority)
  const urlToken = getTokenFromUrl();
  if (urlToken) {
    // If found in URL, also store in localStorage for future use
    if (isBrowser) {
      localStorage.setItem('pincastToken', urlToken);
    }
    return urlToken;
  }
  
  // Fall back to localStorage
  if (isBrowser) {
    return localStorage.getItem('pincastToken');
  }
  
  return null;
}

/**
 * Manually set the auth token
 * This can be used if the token is obtained through other means
 */
export function setAuthToken(token: string): void {
  if (isBrowser) {
    localStorage.setItem('pincastToken', token);
  }
}

/**
 * Clear the stored auth token
 * Useful for logout functionality
 */
export function clearAuthToken(): void {
  if (isBrowser) {
    localStorage.removeItem('pincastToken');
  }
}

/**
 * Create a fetch wrapper with Authorization header
 * This automatically adds the token to all requests
 */
export function createAuthorizedFetch(originalFetch: typeof fetch = fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = getAuthToken();
    
    if (!token) {
      return originalFetch(input, init);
    }
    
    // Clone and modify the request options to include the Authorization header
    const headers = new Headers(init?.headers || {});
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const modifiedInit = {
      ...init,
      headers
    };
    
    return originalFetch(input, modifiedInit);
  };
}

/**
 * Override the global fetch with our authorized version
 * This should be called during SDK initialization
 */
export function installTokenInterceptor(): void {
  if (isBrowser) {
    const token = getTokenFromUrl();
    
    // Only install if we have a token
    if (token) {
      // Store the token for future use
      setAuthToken(token);
      
      // Override the global fetch
      const originalFetch = window.fetch;
      window.fetch = createAuthorizedFetch(originalFetch);
      
      console.log('Pincast SDK: Token interceptor installed');
    }
  }
}

// Automatically install the token interceptor when this module is imported
if (isBrowser) {
  installTokenInterceptor();
}