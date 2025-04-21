// Add Nuxt app types for plugin development
declare module '#app' {
  interface NuxtApp {
    $logto: any;
    $pincast: import('./src/types').PincastPlugin;
  }
}

// Add global types
declare global {
  interface Window {
    $customerio?: {
      track: (event: string, properties?: Record<string, any>) => Promise<boolean>;
      identify: (id: string, traits?: Record<string, any>) => Promise<boolean>;
    };
  }
}

export {};