/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        volt: {
          DEFAULT: '#ccff00',
          400: '#ccff00',
          500: '#b8e600',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.25)', opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
