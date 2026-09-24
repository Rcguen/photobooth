/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        photobooth: {
          dark: '#121212',
          card: '#1e1e24',
          accent: '#ff4b72',
          accentHover: '#e03a5e',
        }
      }
    },
  },
  plugins: [],
}
