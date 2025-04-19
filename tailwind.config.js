/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8e5',
          100: '#faedbb',
          200: '#f7e291',
          300: '#f4d766',
          400: '#f1cc3c',
          500: '#eec212', // primary color
          600: '#c4a010',
          700: '#9b7d0d',
          800: '#735d09',
          900: '#493b06',
        },
        secondary: {
          50: '#e6f3fe',
          100: '#bfdcfd',
          200: '#98c5fc',
          300: '#72adfa',
          400: '#4b96f9',
          500: '#247ef7', // secondary color
          600: '#1d65c6',
          700: '#154b94',
          800: '#0e3263',
          900: '#071931',
        },
        tertiary: {
          50: '#e8f7e8',
          100: '#c4eac4',
          200: '#a0dda0',
          300: '#7ccf7c',
          400: '#58c258',
          500: '#34b534', // tertiary color
          600: '#2a912a',
          700: '#216d21',
          800: '#174917',
          900: '#0d240d',
        },
        // Semantic colors
        success: {
          50: '#eaf7ed',
          100: '#c7ebd0',
          200: '#a4dfb4',
          300: '#81d397',
          400: '#5ec77b',
          500: '#3bbb5e',
          600: '#30954c',
          700: '#257039',
          800: '#1a4a26',
          900: '#0d2513',
        },
        warning: {
          50: '#fef5e7',
          100: '#fde4c0',
          200: '#fbd399',
          300: '#fac272',
          400: '#f9b14b',
          500: '#f8a024',
          600: '#c6801d',
          700: '#946016',
          800: '#63400e',
          900: '#312007',
        },
        error: {
          50: '#fdebe8',
          100: '#f9c9c1',
          200: '#f6a79a',
          300: '#f28573',
          400: '#ef634c',
          500: '#eb4125',
          600: '#bc341e',
          700: '#8c2716',
          800: '#5d1a0f',
          900: '#2f0d08',
        },
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'storybook': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        'page-turn': {
          '0%': { transform: 'rotateY(0deg)', transformOrigin: 'left' },
          '100%': { transform: 'rotateY(-180deg)', transformOrigin: 'left' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'page-turn': 'page-turn 1.5s ease-in-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};