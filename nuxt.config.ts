export default defineNuxtConfig({
  ssr: false,

  modules: ['@pinia/nuxt'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/scss/mixins";',
          silenceDeprecations: ['import'],
        },
      },
    },
  },

  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/todo-list-app/' : '/',
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Notes App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A Notes application with Todo lists' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
})
