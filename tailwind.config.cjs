/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.{js,jsx,ts,tsx}',
    './index.{js,ts,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
