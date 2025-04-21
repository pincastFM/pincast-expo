<template>
  <div class="flex min-h-screen flex-col">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo.svg" alt="Pincast Logo" class="h-8 w-8" />
          <span class="text-xl font-bold text-pincast-blue dark:text-white">Pincast Expo</span>
        </NuxtLink>
        
        <div class="flex items-center gap-4">
          <span class="text-xs px-2 py-1 rounded-full bg-pincast-blue/10 text-pincast-blue">
            SDK v{{ sdkVersion }}
          </span>
          <SearchBar />
          <button
            @click="toggleDark"
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            <div v-if="isDark">
              <IconSun class="h-5 w-5" />
            </div>
            <div v-else>
              <IconMoon class="h-5 w-5" />
            </div>
          </button>
          <a
            href="https://github.com/pincast/expo"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <IconGitHub class="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <aside class="w-64 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:block">
        <DocsSidebar />
      </aside>
      
      <main class="flex-1 min-w-0">
        <div class="container mx-auto px-4 py-8">
          <NuxtPage />
        </div>
      </main>
    </div>

    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} Pincast. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

// Get SDK version from runtime config
const config = useRuntimeConfig()
const sdkVersion = computed(() => config.public.sdkVersion)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

html {
  scroll-behavior: smooth;
}

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}

:target {
  scroll-margin-top: 4rem;
}
</style>