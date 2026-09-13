// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    'nuxt-vue3-google-signin',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon', 'shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  googleSignIn: {
    clientId: '684474965587-1cuvtv4lhd2p8a7hmo4o7k7qlg42nhvq.apps.googleusercontent.com',
  }
})
