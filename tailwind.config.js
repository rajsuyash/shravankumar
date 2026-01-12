/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#d15400',
        'background-light': '#f8f7f5',
        'background-dark': '#23170f',
        'ivory-dark': '#eceae5',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        sans: ['Lexend', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      backgroundImage: {
        'paper-gradient': 'radial-gradient(circle at center, #ffffff 0%, #f8f7f5 100%)',
      },
    },
  },
  plugins: [],
};
