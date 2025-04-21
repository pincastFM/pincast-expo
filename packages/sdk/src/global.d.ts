// Global type declarations for the SDK

interface PincastGlobal {
  appId?: string;
  [key: string]: any;
}

interface Window {
  $pincast?: PincastGlobal;
  $customerio?: {
    track: (event: string, properties?: Record<string, any>) => Promise<boolean>;
    identify: (id: string, traits?: Record<string, any>) => Promise<boolean>;
  };
}