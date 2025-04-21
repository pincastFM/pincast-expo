// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pincast/sdk',
    '@pinia/nuxt'
  ],
  css: [
    'mapbox-gl/dist/mapbox-gl.css'
  ],
  runtimeConfig: {
    public: {
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || ''
    }
  }
})