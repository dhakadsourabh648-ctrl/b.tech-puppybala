/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f0e9',
          200: '#e8ded0',
          300: '#d7c5ad',
          400: '#be9f7f',
          800: '#3c2f25',
          900: '#261e18',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 25px -5px rgba(180, 83, 9, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(245, 158, 11, 0.35)',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '16/9': '16 / 9',
      }
    },
  },
  plugins: [],
}
