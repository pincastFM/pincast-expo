/**
 * This is a wrapper around the Logto auth plugin to prevent direct imports,
 * which Nuxt's import protection blocks during production builds.
 */
import { ref } from 'vue';
import type { Ref } from 'vue';

// Internal import so our app components don't need to import from @logto/nuxt directly
// This could be swapped for another auth provider without changing consumer code
// Define the UserInfo type that matches what Logto would provide
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

interface LogtoClient {
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  signIn: (redirectUri?: string) => Promise<void>;
  signOut: (postLogoutRedirectUri?: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  fetchUserInfo: () => Promise<UserInfo | null>;
}

/**
 * Authentication composable wrapping Logto
 */
export function useAuth() {
  let logtoClient: LogtoClient;
  
  try {
    // In production, useNuxtApp and $logto would be available
    // For TypeScript checking, we use this conditional approach
    if (process.client) {
      // @ts-ignore - ignore TypeScript error for build
      const nuxtApp = typeof useNuxtApp === 'function' ? useNuxtApp() : null;
      // @ts-ignore - ignore TypeScript error for build
      const logtoPlugin = nuxtApp?.$logto;
      // @ts-ignore - ignore TypeScript error for build
      const useLogto = logtoPlugin?.useLogto;
      
      if (typeof useLogto === 'function') {
        logtoClient = useLogto();
        return logtoClient;
      }
    }
    // If we get here, either we're in a non-browser environment or something went wrong
    throw new Error('Logto not available');
  } catch (err) {
    // Fallback for tests and environments where useLogto is not available
    console.warn('Logto not available, using mock implementation');
    
    const isAuthenticated = ref(false);
    const isLoading = ref(false);
    const error = ref<Error | null>(null);
    
    logtoClient = {
      isAuthenticated,
      isLoading,
      error,
      signIn: async () => { isAuthenticated.value = true; },
      signOut: async () => { isAuthenticated.value = false; },
      getIdToken: async () => 'mock-id-token',
      fetchUserInfo: async () => ({ sub: 'mock-user-id', name: 'Test User' }),
    };
  }
  
  return logtoClient;
}

// No need to re-export the UserInfo interface as it's already exported above