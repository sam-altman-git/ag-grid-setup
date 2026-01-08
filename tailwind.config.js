/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-primary": "#393E46",
        "dark-secondary": "#26282B",
        "light-primary": "#ffffff",
        "light-secondary": "#ffffff60",
        "theme-red": "#F44336",
        "theme-blue": "#90B8F8",
      },
    },
  },
  plugins: [],
};
