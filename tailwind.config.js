/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe5fe",
          200: "#bfd3fe",
          300: "#93b8fd",
          400: "#6094fa",
          500: "#3b72f6",
          600: "#2553eb",
          700: "#1d3fd8",
          800: "#1e35af",
          900: "#1e308a",
          950: "#172054",
        },
      },
    },
  },
  plugins: [],
}
