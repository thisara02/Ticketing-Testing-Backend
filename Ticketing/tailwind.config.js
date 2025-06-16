/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.html", "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
         jura: ['Jura', 'sans-serif'],
      },
      colors: {
        primary: "#f44358"
      }
    }
  },
  plugins: [],
}

