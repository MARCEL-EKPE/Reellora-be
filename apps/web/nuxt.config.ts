// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE ?? 'http://localhost:3000',
    public: {},
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-vue3-google-signin',
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

  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '684474965587-1cuvtv4lhd2p8a7hmo4o7k7qlg42nhvq.apps.googleusercontent.com',
  },
})
