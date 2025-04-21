<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-3xl font-bold text-center text-red-500 mb-6">
        Access Denied
      </h1>
      <p class="text-gray-600 mb-8 text-center">
        You don't have permission to access this resource.
      </p>
      <div class="flex justify-center space-x-4">
        <NuxtLink 
          to="/"
          class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
        >
          Return Home
        </NuxtLink>
        <NuxtLink 
          to="/logout"
          class="px-4 py-2 border border-primary-500 text-primary-500 rounded hover:bg-primary-50 transition"
        >
          Sign Out
        </NuxtLink>
      </div>
    </div>
  </div>
</template>