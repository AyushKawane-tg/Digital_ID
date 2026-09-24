/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8fc",
          100: "#d5eef8",
          200: "#aedcf1",
          300: "#74c3e4",
          400: "#38a4d0",
          500: "#0088cc",
          600: "#0074ad",
          700: "#065d8c",
          800: "#0a4d73",
          900: "#061833",
          950: "#041226",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 16px 40px -18px rgba(6, 24, 51, 0.22)",
      },
    },
  },
  plugins: [],
};
