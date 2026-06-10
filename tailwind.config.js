/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Per-school themeable via CSS variables (see src/theme/applyTheme.js).
        // Variables hold space-separated RGB channels so opacity modifiers work.
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        teacher: {
          50: '#F5F0FB',
          100: '#E8DDF4',
          200: '#D1BBE9',
          300: '#B08FD9',
          400: '#8E63C9',
          500: '#5B3A8C',
          600: '#4A2F72',
          700: '#382357',
          800: '#27183D',
          900: '#150D22',
        },
        student: {
          50: '#EDF4F8',
          100: '#D5E6F0',
          200: '#ABCDE1',
          300: '#71AAC9',
          400: '#3D88B2',
          500: '#1A5276',
          600: '#15425F',
          700: '#103247',
          800: '#0A2130',
          900: '#051118',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F3F1ED',
          bg: '#FAFAF8',
        },
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          light: 'rgb(var(--gold-light) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.06)',
        card: '0 4px 16px rgba(0,0,0,0.08)',
        elevated: '0 12px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
