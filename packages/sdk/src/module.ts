import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
import { fileURLToPath } from 'url';

export interface ModuleOptions {
  /**
   * Base URL for the Pincast API
   * @default 'https://api.pincast.fm'
   */
  apiBase?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@pincast/sdk',
    configKey: 'pincast',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    apiBase: 'https://api.pincast.fm'
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    // Note: runtimeDir is currently unused but may be needed for future extensions
    // const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));
    
    // Add the Pincast plugin
    addPlugin({
      src: resolve('./runtime/plugin'),
      mode: 'client'
    });
    
    // Auto-import composables
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve('./composables'));
    });
    
    // Add auto-imports for the SDK composables
    nuxt.hook('imports:sources', (sources) => {
      sources.push({
        from: '@pincast/sdk',
        imports: [
          'usePincastAuth',
          'usePincastLocation',
          'usePincastData',
          'usePincastAnalytics'
        ]
      });
    });
    
    // Make sure Logto module is added
    const modules = nuxt.options.modules as string[];
    
    if (!modules.includes('@logto/nuxt')) {
      console.warn('[Pincast] @logto/nuxt module not found. Adding it automatically.');
      modules.push('@logto/nuxt');
    }
    
    if (!modules.includes('@pinia/nuxt')) {
      console.warn('[Pincast] @pinia/nuxt module not found. Adding it automatically.');
      modules.push('@pinia/nuxt');
    }
    
    // Set public runtime config for API base URL and defaults
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {};
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.pincast = {
      apiBase: options.apiBase,
      // Default values for the SDK
      devProxy: {
        enabled: true,
        port: 8787
      }
    };
  }
});