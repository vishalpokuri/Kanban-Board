/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        mainBgColor: "#0d1117",
        columnBgColor: "#161c22",
      },
    },
  },
  plugins: [],
};
