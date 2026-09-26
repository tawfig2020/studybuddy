/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        maths: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#dbeafe',
        },
        science: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#d1fae5',
        },
        english: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
          light: '#ede9fe',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 1s ease-in-out 2',
      }
    },
  },
  plugins: [],
}
