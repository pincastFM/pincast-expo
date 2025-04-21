<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-center mb-6">Sign In</h1>
      <p class="text-gray-600 mb-8 text-center">
        Sign in to access your Pincast Expo account
      </p>
      <div class="flex justify-center">
        <button 
          @click="handleSignIn" 
          class="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center"
        >
          <span>Sign in with Logto</span>
        </button>
      </div>
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-primary-500 hover:text-primary-600 transition">
          Return to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use Logto from Nuxt plugin
const { $logto } = useNuxtApp()
const logto = $logto as unknown as { signIn: (options?: { redirectUri?: string }) => Promise<void> }
const { signIn } = logto
const redirectUri = window.location.origin + '/callback'

const handleSignIn = async () => {
  try {
    await signIn({ redirectUri })
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
</script>