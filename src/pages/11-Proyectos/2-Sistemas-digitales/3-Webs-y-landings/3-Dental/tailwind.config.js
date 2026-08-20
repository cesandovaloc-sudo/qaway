/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff6f8",
          100: "#ffeef3",
          200: "#ffd8e5",
          300: "#ffbfd4",
          400: "#ff8eb1",
          500: "#ff5f91",
          600: "#f0447d",
          700: "#cb2d62",
          800: "#a92854",
          900: "#6d1b37"
        },
        ink: "#1f2433",
        mist: "#f8f4f6"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(245, 104, 150, 0.16)",
        glow: "0 18px 45px rgba(255, 95, 145, 0.28)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "page-glow": "radial-gradient(circle at top left, rgba(255, 192, 213, 0.65), transparent 30%), radial-gradient(circle at 85% 10%, rgba(255, 232, 239, 0.95), transparent 20%), linear-gradient(180deg, #fffdfd 0%, #fff4f7 100%)"
      }
    }
  },
  plugins: []
};
