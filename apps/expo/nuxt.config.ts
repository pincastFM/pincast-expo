// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@logto/nuxt',
    'nuxt-icon',
    'unocss'
  ],
  // Set default runtime to edge
  nitro: {
    preset: 'vercel-edge'
  },
  // Logto configuration
  logto: {
    endpoint: process.env.NUXT_LOGTO_ENDPOINT || '',
    appId: process.env.NUXT_LOGTO_APP_ID || '',
    appSecret: process.env.NUXT_LOGTO_APP_SECRET || '',
    cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY || '',
    scopes: ['email', 'roles', 'custom_data'],
    pathnames: {
      signIn: '/sign-in',
      signOut: '/sign-out',
      callback: '/callback'
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})