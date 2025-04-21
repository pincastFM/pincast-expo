<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
      <p class="text-gray-600">Completing sign-in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/composables/useUserStore'
// Use Logto from Nuxt plugin
const { $logto } = useNuxtApp()
const logto = $logto as unknown as { 
  handleSignInCallback: () => Promise<void>,
  getIdTokenClaims: () => Promise<{ sub: string; email?: string; role?: string; [key: string]: any } | null>
}
const { handleSignInCallback, getIdTokenClaims } = logto
const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  try {
    await handleSignInCallback()
    
    // Update user store with claims from ID token
    const claims = await getIdTokenClaims()
    
    if (claims) {
      const role = claims.role as string || 'player' // Default to player if no role specified
      
      userStore.setUser({
        id: claims.sub as string,
        email: claims.email as string,
        role: role as 'player' | 'developer' | 'staff'
      })
    }
    
    // Redirect to home page
    router.push('/')
  } catch (error) {
    console.error('Failed to handle sign-in callback:', error)
    router.push('/login')
  }
})
</script>