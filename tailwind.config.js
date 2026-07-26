/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/frontend/index.html', './src/frontend/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // AppSumo-leaning palette: charcoal surfaces, bright signature yellow.
        ink: '#1A1A1A', // charcoal headers / dark surfaces (AppSumo black)
        gold: '#FFC800', // bright AppSumo yellow — primary actions & accents
        'gold-ink': '#7A5C00', // readable text tone on/near yellow fills
        status: {
          green: '#2E9E5B',
          amber: '#E8A317',
          red: '#C93A3A',
        },
        muted: '#6B7280', // secondary text
        fill: '#F6F6F4', // warm card fills (AppSumo off-white)
        line: '#E6E6E1', // warm borders
      },
      fontFamily: {
        // Poppins gives the bold, rounded, friendly AppSumo feel; system fallback.
        sans: [
          'Poppins',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
