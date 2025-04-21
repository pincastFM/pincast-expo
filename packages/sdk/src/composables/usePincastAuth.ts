import { ComputedRef, computed, ref } from 'vue';
import type { PincastSession } from '../types';

// These will be provided by the Nuxt plugin context
let logtoInstance: any = null;
let nuxtAppInstance: any = null;

/**
 * Initialize the auth composable with the Logto instance
 * This is called by the Nuxt plugin
 */
export const initAuth = (logto: any, nuxtApp: any) => {
  logtoInstance = logto;
  nuxtAppInstance = nuxtApp;
};

/**
 * Composable for Pincast authentication
 * Wraps the Logto auth with Pincast-specific functionality
 */
export const usePincastAuth = () => {
  // Use Logto from plugin context
  if (!logtoInstance && typeof window !== 'undefined') {
    // When running outside the plugin context, try to get from nuxtApp
    // This is mostly for testing scenarios
    try {
      const nuxtApp = nuxtAppInstance;
      logtoInstance = nuxtApp?.$logto;
    } catch (error) {
      console.warn('Logto instance not available. Authentication functions will not work properly.');
    }
  }

  // Reactive session state
  const sessionState = ref<PincastSession>({
    id: '',
    email: null,
    role: 'player', // Default role
    isAuthenticated: false
  });

  // Load session data when requested
  const refreshSession = async (): Promise<PincastSession> => {
    if (!logtoInstance) {
      console.warn('Logto instance not available. Using default session.');
      return sessionState.value;
    }

    try {
      const isAuthenticated = await logtoInstance.isAuthenticated();
      sessionState.value.isAuthenticated = isAuthenticated;

      if (isAuthenticated) {
        const claims = await logtoInstance.getIdTokenClaims();
        
        if (claims) {
          sessionState.value.id = claims.sub || '';
          sessionState.value.email = claims.email || null;
          
          // Use the role from claims or default to 'player'
          sessionState.value.role = (claims.role as PincastSession['role']) || 'player';
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }

    return sessionState.value;
  };

  // Get auth token
  const getToken = async (): Promise<string | null> => {
    if (!logtoInstance) return null;
    
    try {
      return await logtoInstance.getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  };

  // Sign in
  const signIn = async (options?: { redirectUri?: string }): Promise<void> => {
    if (!logtoInstance) {
      throw new Error('Logto instance not available. Cannot sign in.');
    }

    const redirectUri = options?.redirectUri || window.location.origin + '/callback';
    return logtoInstance.signIn({ redirectUri });
  };

  // Sign out
  const signOut = async (options?: { postLogoutRedirectUri?: string }): Promise<void> => {
    if (!logtoInstance) {
      throw new Error('Logto instance not available. Cannot sign out.');
    }

    const postLogoutRedirectUri = options?.postLogoutRedirectUri || window.location.origin;
    return logtoInstance.signOut({ postLogoutRedirectUri });
  };

  // Get current session (refreshes data)
  const getSession = async (): Promise<PincastSession> => {
    return refreshSession();
  };

  // Computed properties for reactive access
  const session: ComputedRef<PincastSession> = computed(() => sessionState.value);
  const isAuthenticated: ComputedRef<boolean> = computed(() => sessionState.value.isAuthenticated);
  const player = computed(() => ({
    id: sessionState.value.id,
    email: sessionState.value.email
  }));
  const role: ComputedRef<PincastSession['role']> = computed(() => sessionState.value.role);

  // Initialize session data
  refreshSession();

  return {
    // Methods
    signIn,
    signOut,
    getToken,
    getSession,
    refreshSession,
    
    // Reactive properties
    session,
    isAuthenticated,
    player,
    role
  };
};