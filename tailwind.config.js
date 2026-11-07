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
          DEFAULT: '#2C353D',
          card: '#485664',
          muted: '#6A7B8C',
        },
        gold: {
          DEFAULT: '#D8C3A5',
          accent: '#A38E70',
          dark: '#8C7757',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
