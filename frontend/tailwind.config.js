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
  plugins: [
    function({ addBase }) {
      addBase({
        'html, body': {
          'overflow-x': 'hidden',
          'overscroll-behavior': 'none',
          'height': '100%',
          'touch-action': 'manipulation',
        },
        '#root': {
          'height': '100%',
          'overflow-x': 'hidden',
          'overscroll-behavior': 'none',
        }
      })
    }
  ],
};
