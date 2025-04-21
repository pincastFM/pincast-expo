import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['./test/**/*.test.ts'],
    exclude: ['./node_modules/**', './dist/**'],
  },
});