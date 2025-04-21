<template>
  <nav class="px-4 py-6">
    <div v-for="section in navigation" :key="section.title" class="mb-8">
      <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {{ section.title }}
      </h2>
      <ul class="space-y-1">
        <li v-for="item in section.items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="block px-3 py-2 rounded-md text-sm transition-colors"
            :class="{
              'bg-pincast-blue/10 text-pincast-blue font-medium': isCurrentRoute(item.to),
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !isCurrentRoute(item.to),
            }"
          >
            {{ item.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const navigation = [
  {
    title: 'Introduction',
    items: [
      { title: 'Getting Started', to: '/getting-started' },
      { title: 'Installation', to: '/installation' },
      { title: 'Quick Start', to: '/quick-start' },
    ]
  },
  {
    title: 'Concepts',
    items: [
      { title: 'Authentication', to: '/concepts/auth' },
      { title: 'Geolocation', to: '/concepts/geolocation' },
      { title: 'Data Storage', to: '/concepts/data-storage' },
      { title: 'Analytics', to: '/concepts/analytics' },
    ]
  },
  {
    title: 'SDK',
    items: [
      { title: 'Overview', to: '/sdk' },
      { title: 'Authentication', to: '/sdk/auth' },
      { title: 'Location', to: '/sdk/location' },
      { title: 'Data', to: '/sdk/data' },
      { title: 'Analytics', to: '/sdk/analytics' },
    ]
  },
  {
    title: 'CLI',
    items: [
      { title: 'Overview', to: '/cli' },
      { title: 'Login', to: '/cli/login' },
      { title: 'Init', to: '/cli/init' },
      { title: 'Create', to: '/cli/create' },
      { title: 'Deploy', to: '/cli/deploy' },
    ]
  },
  {
    title: 'Extension',
    items: [
      { title: 'Installation', to: '/extension' },
      { title: 'Commands', to: '/extension/commands' },
    ]
  },
  {
    title: 'Tutorials',
    items: [
      { title: 'Build a Quest', to: '/tutorials/quest' },
      { title: 'AR Mural Hunt', to: '/tutorials/ar-mural' },
      { title: 'AI Chat Guide', to: '/tutorials/ai-chat' },
    ]
  },
  {
    title: 'Staff',
    items: [
      { title: 'Review Process', to: '/staff/review' },
    ]
  },
]

function isCurrentRoute(path: string): boolean {
  return route.path === path
}
</script>