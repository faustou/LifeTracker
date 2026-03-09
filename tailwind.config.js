/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'ring-progress': {
          '0%': { 'stroke-dashoffset': '50.3' },
          '100%': { 'stroke-dashoffset': '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'ring-progress': 'ring-progress 500ms linear forwards',
      },
    },
  },
  plugins: [],
}
