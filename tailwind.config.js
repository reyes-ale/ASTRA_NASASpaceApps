/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: { 950: '#020823', 900: '#040C33', 800: '#051558', 700: '#0A2080' },
        ice: '#7CC4F0',
        lilac: '#B9A5FF',
        violet: '#9B6BFF',
        alert: '#FF7A7A',
        ink: '#F1F4F9',
        mist: '#A9BEEA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
