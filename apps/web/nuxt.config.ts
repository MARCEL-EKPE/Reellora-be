// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE ?? 'http://localhost:3000',
    public: {},
  },

  modules: [
    '@clerk/nuxt',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  colorMode: {
    preference: 'light',
  },
})
