/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        correct: '#059669',
        incorrect: '#DC2626',
        gray: {
          50: '#F9FAFB',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        'question': ['1.5rem', { lineHeight: '2rem' }]
      },
      transitionDuration: {
        '300': '300ms'
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)'
      }
    },
  },
  plugins: [],
}