// Provider plugin for Pincast SDK
// This file is separate to avoid conflicts with multiple plugin initialization
import { defineNuxtPlugin } from '#app'
import type { PincastPlugin } from '../types'

// Reference to the singleton instance from the main plugin
// Access the global object to get the instance that was set in the main plugin
let globalPincastInstance: PincastPlugin | null = null

// Try to get the global instance if we're in a browser environment
if (typeof window !== 'undefined') {
  // @ts-ignore - Access the global window.__PINCAST_SDK_INSTANCE
  globalPincastInstance = window.__PINCAST_SDK_INSTANCE || null
}

// Provider plugin - only provides the instance once it's initialized
export default defineNuxtPlugin((_nuxtApp: any) => {
  if (!globalPincastInstance) {
    console.warn('[Pincast] SDK instance not found. Creating fallback.')
    
    // Create a fallback instance with appropriate TypeScript types
    globalPincastInstance = {
      auth: {
        signIn: async () => { throw new Error('SDK not initialized') },
        signOut: async () => { throw new Error('SDK not initialized') },
        getToken: async () => null,
        getSession: async () => ({ id: '', email: null, role: 'player', isAuthenticated: false })
      },
      // Need to match the type signature exactly
      data: (collection: string) => ({
        getAll: async () => [] as any[],
        getById: async () => null as any,
        create: async () => null as any,
        update: async () => null as any,
        delete: async () => null as any,
        near: async () => [] as any[],
      }),
      analytics: {
        track: () => Promise.resolve(false),
        identify: () => Promise.resolve(false)
      }
    }
  }
  
  // Provide the instance to the app
  return {
    provide: {
      pincast: globalPincastInstance
    }
  }
})