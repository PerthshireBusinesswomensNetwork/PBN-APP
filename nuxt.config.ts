export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxt/image',
  ],

  supabase: {
    // Redirect is disabled — we handle admin auth manually via PIN
    redirect: false,
  },

  runtimeConfig: {
    // Server-only (not exposed to client)
    adminPin: process.env.ADMIN_PIN,
    // Public (exposed to client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  app: {
    head: {
      title: 'PBWN AGM 2025',
      meta: [
        { name: 'description', content: 'Perthshire Business Women\'s Network AGM — Networking Directory' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#6B3FA0' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },

  devtools: { enabled: false },
  compatibilityDate: '2024-07-03',
})
