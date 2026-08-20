/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rose: { 50: "#fff5f8", 100: "#ffe8ef", 200: "#ffd1dc", 300: "#ffabc0", 400: "#fb789c", 500: "#f84f7d", 600: "#e83b6a", 700: "#bf2852" },
        ink: "#121927",
      },
      fontFamily: { sans: ["Manrope", "sans-serif"] },
    },
  },
  plugins: [],
};
