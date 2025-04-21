import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';

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
    
    // Create a wrapper file for the provider plugin to avoid Nuxt.js specific imports at build time
    // This is a standard plugin file that Nuxt can import directly
    try {
      console.log('[Pincast] Generating runtime plugin...');
      
      // Create plugins directory if it doesn't exist
      const pluginDir = resolve('../runtime');
      
      // Using simple addPlugin approach
      addPlugin({
        src: resolve('./runtime/provider'),
        mode: 'client'
      });
      
      console.log('[Pincast] Plugin registered successfully');
      
    } catch (error) {
      console.error('[Pincast] Failed to create runtime plugin:', error);
    }
    
    // Register composables for auto-import
    nuxt.hook('imports:dirs', (dirs) => {
      // Add the composables directory to auto-imports
      dirs.push(resolve('./composables'));
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