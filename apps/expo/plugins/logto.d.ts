// Define the Logto plugin interface
interface LogtoPlugin {
  isAuthenticated: boolean;
  user: {
    sub: string;
    email?: string;
    role?: string;
    [key: string]: any;
  } | null;
  signIn: (options?: { redirectUri?: string }) => Promise<void>;
  signOut: (options?: { postLogoutRedirectUri?: string }) => Promise<void>;
  handleSignInCallback: () => Promise<void>;
  getIdTokenClaims: () => Promise<{
    sub: string;
    email?: string;
    role?: string;
    [key: string]: any;
  } | null>;
}

declare module '#app' {
  interface NuxtApp {
    $logto: LogtoPlugin;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $logto: LogtoPlugin;
  }
}

export {}