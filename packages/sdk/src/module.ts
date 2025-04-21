import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
// import { fileURLToPath } from 'url'; // Not used in current implementation

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
    
    // Choose just one auto-import approach to avoid duplication warnings
    // Only register the composables explicitly and don't scan directories
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
    
    // DEPENDENCIES CHECK
    console.log('[Pincast] Checking SDK dependencies...');
    
    // Make sure required modules are added
    const modules = nuxt.options.modules as string[];
    
    // Check for Pinia
    if (!modules.includes('@pinia/nuxt')) {
      console.warn('[Pincast] WARNING: @pinia/nuxt module not found. Adding it automatically.');
      modules.push('@pinia/nuxt');
      console.log('[Pincast] ✅ Added Pinia to modules list');
    } else {
      console.log('[Pincast] ✅ Found @pinia/nuxt module');
    }
    
    // Check for Logto
    if (!modules.includes('@logto/nuxt')) {
      console.warn('[Pincast] WARNING: @logto/nuxt module not found. Adding it automatically.');
      modules.push('@logto/nuxt');
      console.log('[Pincast] ✅ Added Logto to modules list');
    } else {
      console.log('[Pincast] ✅ Found @logto/nuxt module');
    }
    
    console.log('[Pincast] Dependencies check complete. SDK will use available modules.')
    
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