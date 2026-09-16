// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE ?? 'http://localhost:3000',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
    },
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@clerk/nuxt',
  ],

  clerk: {
    signInForceRedirectUrl: '/dashboard',
    signUpForceRedirectUrl: '/dashboard',
    skipServerMiddleware: true,
  },

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
