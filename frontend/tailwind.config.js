/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#A3DFF2',
        'medical-pink': '#FADADD',
        'medical-white': '#FDFDFD',
        'medical-green': '#B4D3B2',
      },
    },
  },
  plugins: [],
};
