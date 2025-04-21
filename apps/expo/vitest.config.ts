import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      // Set up environment variables for tests
      env: {
        PG_URL_TEST: 'postgres://postgres:postgres@localhost:5432/pincast_test',
        POSTGRES_URL: 'postgres://postgres:postgres@localhost:5432/pincast_test',
        PINCAST_JWT_SECRET: 'test-jwt-secret-min-32-characters-long-text',
        LOGTO_ENDPOINT: 'https://auth.test.pincast.fm',
        LOGTO_APP_ID: 'test-app-id',
        LOGTO_APP_SECRET: 'test-app-secret',
        SEED_EMAIL_STAFF: 'test-staff@pincast.fm',
        SEED_EMAIL_DEV: 'test-dev@pincast.fm'
      }
    },
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '#app': fileURLToPath(new URL('./node_modules/nuxt/dist/app', import.meta.url))
    }
  }
})