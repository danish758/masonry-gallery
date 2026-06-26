/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        surface: '#1a1a24',
        accent: '#6c8ef5',
        skeleton: '#2a2a38',
        'text-primary': '#e8e8ec',
        'text-secondary': '#888888',
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.07)',
      },
    },
  },
  plugins: [],
};
