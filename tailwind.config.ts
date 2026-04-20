import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#f3eeff',
          100: '#e8d9ff',
          200: '#d4b8ff',
          300: '#b88aff',
          400: '#9b6fd4',
          500: '#6B3FA0',
          600: '#4e2d78',
          700: '#3a2059',
          800: '#2d2040',
          900: '#1a1228',
        },
        accent: '#c084fc',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config
