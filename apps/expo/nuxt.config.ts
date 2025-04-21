// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@logto/nuxt',
    '@nuxt/icon',
    '@pincast/sdk'
  ],
  
  // Icon configuration to prevent circular import
  icon: {
    mode: 'svg'
  },

  // Use standard Vercel preset for better Node.js compatibility
  nitro: {
    preset: 'vercel',
    // Explicitly set Node.js version compatibility
    nodeCompatibility: true
  },

  // Logto configuration
  logto: {
    endpoint: process.env.LOGTO_ENDPOINT || '',
    appId: process.env.LOGTO_APP_ID || '',
    appSecret: process.env.LOGTO_APP_SECRET || '',
    scopes: ['email', 'roles', 'custom_data'],
    pathnames: {
      signIn: '/login',
      signOut: '/logout',
      callback: '/callback'
    }
  },

  // Runtime config
  runtimeConfig: {
    // Private keys (server-side only)
    logtoAppSecret: process.env.LOGTO_APP_SECRET || '',
    pincastJwtSecret: process.env.PINCAST_JWT_SECRET || 'dev-secret-do-not-use-in-production',
    logtoJwksUrl: process.env.LOGTO_JWKS_URL || '',
    // Public keys (exposed to client)
    public: {
      logtoEndpoint: process.env.LOGTO_ENDPOINT || '',
      logtoAppId: process.env.LOGTO_APP_ID || '',
      pincastApi: process.env.PINCAST_API_URL || '/api' // Default to relative path for local development
    }
  },

  // SDK configuration is now handled by the module itself
  // Public configuration is available via runtimeConfig.public.pincastApi

  typescript: {
    strict: true,
    typeCheck: true
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  compatibilityDate: '2025-04-20'
})