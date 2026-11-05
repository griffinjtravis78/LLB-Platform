// File: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#0E0E0E',
          card: '#161616',
          muted: '#1F2937',
        },
        gold: {
          DEFAULT: '#C5A059',
          accent: '#D4AF37',
          dark: '#9A7B38',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
