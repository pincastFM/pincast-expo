<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full p-6 bg-white rounded-md border border-primary shadow-primary">
      <h1 class="text-3xl font-semibold text-primary mb-6 font-mono">
        Pincast Expo
      </h1>
      <p class="text-gray-700 mb-6 font-mono">
        A marketplace for vibe-coding location-based applications
      </p>
      <div class="flex space-x-4">
        <NuxtLink 
          to="/browse" 
          class="px-4 py-2 bg-primary text-white border border-primary rounded-md font-mono font-semibold shadow-primary hover:bg-white hover:text-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-hover"
        >
          Browse Apps
        </NuxtLink>
        <NuxtLink 
          to="/submit" 
          class="px-4 py-2 bg-white text-primary border border-primary rounded-md font-mono font-semibold shadow-primary hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-hover"
        >
          Developer Portal
        </NuxtLink>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/composables/useUserStore'

// Initialize user store to ensure Pinia is working
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)

// Log auth state for debugging
onMounted(() => {
  console.log('Index page mounted')
  console.log('Authentication state:', isAuthenticated.value)
})
</script>