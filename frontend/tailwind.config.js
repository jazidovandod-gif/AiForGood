/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        venado: {
          primary: '#003366',
          secondary: '#SE7032',
          tertiary: '#D32F2F',
          dark: '#4A4A4A',
          light: '#FSF7FA'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
