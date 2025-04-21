<script setup lang="ts">
import { usePincastAuth, usePincastLocation, usePincastData, usePincastAnalytics } from '@pincast/sdk';

const { player, signIn, isAuthenticated } = usePincastAuth();
const { coords, getCurrentPosition } = usePincastLocation();
const todos = usePincastData<{ id: string; text: string }>('todos');
const { track } = usePincastAnalytics();

// Try to get location when page loads
if (process.client) {
  getCurrentPosition().catch(error => {
    console.warn('Could not get location:', error.message);
  });
}

// Track page view
track('diagnostic_page_view');
</script>

<template>
  <div class="p-4 text-sm">
    <h1 class="text-xl font-bold mb-4">SDK Diagnostics</h1>
    
    <div class="mb-4 p-4 bg-gray-100 rounded">
      <h2 class="font-bold">Authentication</h2>
      <div class="my-2">
        <span class="font-semibold">Status:</span> 
        <span :class="isAuthenticated ? 'text-green-600' : 'text-red-600'">
          {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
        </span>
      </div>
      <pre class="text-xs bg-gray-800 text-white p-2 rounded">User: {{ JSON.stringify(player, null, 2) }}</pre>
      <button 
        @click="signIn()"
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign In
      </button>
    </div>
    
    <div class="mb-4 p-4 bg-gray-100 rounded">
      <h2 class="font-bold">Location</h2>
      <pre class="text-xs bg-gray-800 text-white p-2 rounded">{{ JSON.stringify(coords, null, 2) }}</pre>
      <button 
        @click="getCurrentPosition"
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Current Position
      </button>
    </div>
    
    <div class="p-4 bg-gray-100 rounded">
      <h2 class="font-bold">Data API</h2>
      <p>Collection: todos</p>
      <button 
        @click="todos.getAll().then(items => console.log('Todo items:', items))"
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Fetch Todos
      </button>
      <div class="mt-2">
        <button 
          @click="track('test_event', { source: 'diagnostics' })"
          class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Track Test Event
        </button>
        <p class="text-xs mt-1 text-gray-600">Check console for tracking output</p>
      </div>
    </div>
  </div>
</template>