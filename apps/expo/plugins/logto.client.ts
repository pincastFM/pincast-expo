// This plugin is a no-op, but it ensures that the type definitions in 
// logto.d.ts are loaded before any pages attempt to use the Logto plugin.
export default defineNuxtPlugin(() => {
  return {
    provide: {
      logtoLoaded: true
    }
  }
});