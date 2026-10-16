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
          red: '#DC2626',
          yellow: '#D97706',
          green: '#16A34A',
          dark: '#0F172A',
          card: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}
