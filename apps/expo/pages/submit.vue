<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-3xl font-bold mb-6">Submit Your App</h1>
      <p class="text-gray-600 mb-8">
        This page is only accessible to developers and staff.
      </p>
      
      <div class="space-y-6">
        <!-- App submission form would go here -->
        <div class="bg-gray-50 p-4 rounded-lg border">
          <p class="text-center text-gray-500">App submission form placeholder</p>
        </div>
        
        <div class="flex justify-between">
          <NuxtLink 
            to="/"
            class="px-4 py-2 border border-primary-500 text-primary-500 rounded hover:bg-primary-50 transition"
          >
            Back to Home
          </NuxtLink>
          <button
            class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
          >
            Submit App
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  requiresRole: 'developer'
})
</script>