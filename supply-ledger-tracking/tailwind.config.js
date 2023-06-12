/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'primary': '#0A1026',
        'secounday': '#F3DA38',
        // "white":"#fff"
      },
      height: {
        '30': '10rem', // Set custom height value
        '40': '10rem', // Another custom height value
      },
    },
  },
  plugins: [],
}

