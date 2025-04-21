import { ref } from 'vue';
import { useCookie } from 'nuxt/app';
import { useAuth } from './useAuth';

/**
 * Manages player authentication tokens for accessing apps
 */
export function usePlayerToken() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const token = ref<string | null>(null);
  
  // Store token in a cookie (1 hour expiry)
  const tokenCookie = useCookie('pincastToken', {
    maxAge: 3600,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  // Get the Logto client for authentication
  const { isAuthenticated, signIn, getIdToken } = useAuth();
  
  /**
   * Gets a player token for a specific app
   * If user is not authenticated, starts the authentication flow
   */
  const getPlayerToken = async (appId: string): Promise<string> => {
    loading.value = true;
    error.value = null;
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated.value) {
        // If not authenticated, initiate Logto sign-in
        // This will redirect to Logto login page
        await signIn();
        return ''; // This line will never be reached due to redirect
      }
      
      // Get ID token from Logto
      const idToken = await getIdToken();
      
      if (!idToken) {
        throw new Error('Failed to get ID token');
      }
      
      // Request app-specific token from our API
      const response = await $fetch<{ token: string }>('/api/token/app', {
        method: 'POST',
        body: {
          idToken,
          appId
        }
      });
      
      // Store token both in ref and cookie
      token.value = response.token;
      tokenCookie.value = response.token;
      
      return response.token;
    } catch (err) {
      console.error('Error getting player token:', err);
      error.value = err instanceof Error ? err.message : 'Failed to get player token';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Checks if we have a stored token, retrieves it from cookie if available
   */
  const getStoredToken = (): string | null => {
    if (token.value) {
      return token.value;
    }
    
    if (tokenCookie.value) {
      token.value = tokenCookie.value;
      return token.value;
    }
    
    return null;
  };
  
  /**
   * Clears the stored token
   */
  const clearToken = () => {
    token.value = null;
    tokenCookie.value = null;
  };
  
  return {
    loading,
    error,
    token,
    getPlayerToken,
    getStoredToken,
    clearToken
  };
}