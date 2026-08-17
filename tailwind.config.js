/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f19',
          card: '#131b2e',
          accent: '#06b6d4', // cyan-500
          neon: '#10b981', // emerald-500
          pink: '#ec4899', // pink-500
          gold: '#f59e0b', // amber-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
