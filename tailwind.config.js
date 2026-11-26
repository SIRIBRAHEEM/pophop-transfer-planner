/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coral: '#FF5A3C',
        tang: '#FF9E2C',
        grape: '#7C3AED',
        ink: '#1E1B2E',
        mint: '#0E9F6E',
        sky: '#2D9CDB',
        blush: '#FFF1E8',
        lilac: '#F1EAFE',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        chunk: '0 4px 0 #1E1B2E',
        chunkSm: '0 3px 0 #1E1B2E',
        soft: '0 12px 30px rgba(30,27,46,0.10)',
      },
    },
  },
  plugins: [],
};
