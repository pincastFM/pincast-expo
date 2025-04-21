import { defineConfig } from 'tsup';

// This config is only used for dev/watch mode
// Build mode uses direct CLI args in package.json
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    module: 'src/module.ts',
    'runtime/plugin': 'src/runtime/plugin.ts'
  },
  dts: true,
  format: ['esm', 'cjs'],
  clean: true,
  sourcemap: true,
  minify: false,
  external: [
    'vue',
    'pinia',
    'nuxt',
    '#app',
    '@logto/nuxt',
    '@logto/vue',
    '@nuxt/kit',
    'defu'
  ]
});