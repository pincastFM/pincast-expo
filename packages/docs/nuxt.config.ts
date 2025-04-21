// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'Pincast Expo Documentation',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: 'Official documentation for Pincast Expo SDK, CLI, and Extension' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      sdkVersion: process.env.SDK_VERSION || '0.1.0'
    }
  },
  content: {
    documentDriven: true,
    highlight: {
      theme: 'github-dark',
      preload: [
        'typescript',
        'vue',
        'bash',
        'json',
        'markdown',
        'yaml'
      ]
    },
    markdown: {
      anchorLinks: true,
      toc: {
        depth: 3,
        searchDepth: 3
      }
    }
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark'
  },
  typescript: {
    strict: true,
    shim: false
  }
})