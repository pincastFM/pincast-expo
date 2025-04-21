<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
      <p class="text-gray-600">Signing out...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/composables/useUserStore'
// Use Logto from Nuxt plugin
const { $logto } = useNuxtApp()
const logto = $logto as unknown as { signOut: (options?: { postLogoutRedirectUri?: string }) => Promise<void> }
const { signOut } = logto
const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  try {
    // Clear user data from store
    userStore.clearUser()
    
    // Sign out from Logto
    await signOut()
    
    // Redirect to home page
    router.push('/')
  } catch (error) {
    console.error('Sign out failed:', error)
    router.push('/')
  }
})
</script>