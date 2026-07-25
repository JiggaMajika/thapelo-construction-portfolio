/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/frontend/index.html', './src/frontend/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#11141C', // near-black headers / dark surfaces
        gold: '#F2B705', // single accent, primary actions only
        status: {
          green: '#2E9E5B',
          amber: '#E8A317',
          red: '#C93A3A',
        },
        muted: '#6B7280', // secondary text
        fill: '#F5F6F8', // card fills
        line: '#E3E6EC', // borders
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
