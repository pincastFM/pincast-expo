<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-primary-600 mb-6">
        Pincast Expo
      </h1>
      <p class="text-gray-700 mb-4">
        A marketplace for vibe-coding location-based applications
      </p>
      <div class="flex space-x-4">
        <NuxtLink to="/browse" class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition">
          Browse Apps
        </NuxtLink>
        <NuxtLink to="/submit" class="px-4 py-2 border border-primary-500 text-primary-500 rounded hover:bg-primary-50 transition">
          Developer Portal
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Initial setup for index page
</script>