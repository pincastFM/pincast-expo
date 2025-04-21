// @ts-ignore - Using Nuxt's virtual module
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { createPincastClient } from '../runtime/client';
import { initAuth } from '../composables/usePincastAuth';
import { initDataClient } from '../composables/usePincastData';
import { initAnalytics } from '../composables/usePincastAnalytics';
import type { PincastPlugin } from '../types';

// Ensure Pinia is installed
const ensurePinia = async (nuxtApp: any) => {
  // Skip Pinia initialization - we'll rely on the @pinia/nuxt module
  // Which should have been added to the modules in nuxt.config.ts
  if (!nuxtApp.$pinia) {
    console.warn('[Pincast] Pinia not found. Make sure @pinia/nuxt is installed and configured.');
    console.warn('[Pincast] Some features might not work correctly.');
  }
};

// Customer.io types are now defined in types.d.ts

// Default Customer.io tracker function
const defaultTracker = (event: string, properties?: Record<string, any>) => {
  // If Customer.io is available, use it
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.$customerio) {
      return w.$customerio.track(event, properties);
    }
  }
  
  // Otherwise, log to console in dev mode
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Event: ${event}`, properties);
  }
  
  return Promise.resolve(true);
};

// Default Customer.io identify function
const defaultIdentify = (id: string, traits?: Record<string, any>) => {
  // If Customer.io is available, use it
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.$customerio) {
      return w.$customerio.identify(id, traits);
    }
  }
  
  // Otherwise, log to console in dev mode
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Identify user: ${id}`, traits);
  }
  
  return Promise.resolve(true);
};

// Create a Singleton for consistency
let pincastInstance: PincastPlugin | null = null;

// First plugin: Initialization only - runs in client mode
export default defineNuxtPlugin(async (nuxtApp: any) => {
  // Check if instance already exists (prevents re-initialization)
  if (pincastInstance) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Pincast] Using existing instance');
    }
    
    // Return without providing to avoid conflicts
    return {};
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Pincast] Initializing SDK...');
  }
  
  // Ensure Pinia is available
  await ensurePinia(nuxtApp);
  
  // Get runtime config
  const runtime = useRuntimeConfig();
  const apiBase = runtime.public.pincastApi || 'https://api.pincast.fm';
  
  // Initialize the data client
  const data = createPincastClient(apiBase);
  
  // Get Logto from nuxtApp - handle gracefully if not available
  let logto = null;
  try {
    logto = nuxtApp.$logto;
    
    // Check if Logto is properly initialized
    if (!logto) {
      // Show warning in development but not in production
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Pincast] Logto plugin not found. Authentication will require manual setup.');
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Pincast] Error accessing Logto');
    }
  }
  
  // Initialize the auth module with Logto (will handle null gracefully)
  initAuth(logto, nuxtApp);
  
  // Initialize the data client
  initDataClient(data);
  
  // Create the Pincast plugin object 
  const pincast: PincastPlugin = {
    auth: {
      signIn: async (options?: { redirectUri?: string }) => {
        if (!logto) throw new Error('Logto not initialized');
        return logto.signIn(options);
      },
      signOut: async (options?: { postLogoutRedirectUri?: string }) => {
        if (!logto) throw new Error('Logto not initialized');
        return logto.signOut(options);
      },
      getToken: async () => {
        if (!logto) return null;
        try {
          return await logto.getAccessToken();
        } catch (e) {
          return null;
        }
      },
      getSession: async () => {
        if (!logto) {
          return {
            id: '',
            email: null,
            role: 'player',
            isAuthenticated: false
          };
        }
        
        const isAuthenticated = await logto.isAuthenticated();
        
        if (!isAuthenticated) {
          return {
            id: '',
            email: null,
            role: 'player',
            isAuthenticated: false
          };
        }
        
        const claims = await logto.getIdTokenClaims();
        
        return {
          id: claims?.sub || '',
          email: claims?.email || null,
          role: (claims?.role as any) || 'player',
          isAuthenticated: true
        };
      }
    },
    data: data.collection,
    analytics: {
      track: defaultTracker,
      identify: defaultIdentify
    }
  };
  
  // Default batch implementation for analytics
  const defaultBatch = async (events: Array<{event: string, properties?: Record<string, any>}>): Promise<boolean> => {
    // If Customer.io is available, use it for each event
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.$customerio) {
        try {
          // Process each event individually through Customer.io
          for (const { event, properties } of events) {
            await w.$customerio.track(event, properties);
          }
          return true;
        } catch (error) {
          console.error('[Analytics] Failed to batch events through Customer.io:', error);
          return false;
        }
      }
    }
    
    // If we're using the Pincast API, send the batch to the ingest endpoint
    try {
      // Get auth token for the request
      const token = await pincast.auth.getToken();
      
      if (!token) {
        console.warn('[Analytics] No auth token available for batch event tracking');
        return false;
      }
      
      // Send the batch to the ingest endpoint
      const response = await fetch(`${apiBase}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(events)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('[Analytics] Failed to send batch events to API:', error);
      
      // Log to console in dev mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Analytics] Batch events:', events);
      }
      
      return false;
    }
  };
  
  // Initialize analytics with Customer.io and batch support
  initAnalytics(
    defaultTracker, 
    defaultIdentify,
    defaultBatch,
    {
      batchEvents: true,
      batchInterval: 5000, // 5 seconds
      maxBatchSize: 20
    }
  );
  
  // Store the instance for reuse
  pincastInstance = pincast;
  
  // Also store on window for cross-plugin access
  if (typeof window !== 'undefined') {
    // @ts-ignore - We're adding a custom property to window
    window.__PINCAST_SDK_INSTANCE = pincast;
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Pincast] SDK initialized successfully');
  }
  
  // Don't provide anything here to avoid redefinition
  return {};
});

// Second plugin: Provider only - has been moved to provider.ts