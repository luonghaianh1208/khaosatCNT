import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00549B',
          hover: '#003D73',
          dark: '#002A4F',
        },
        interactive: '#007AFF',
        crimson: {
          DEFAULT: '#C41330',
          dark: '#E73A35',
        },
        'secondary-nav': '#37538D',
        success: '#28A745',
        warning: '#FFC107',
        info: '#17A2B8',
        'text-primary': '#212529',
        'text-secondary': '#495057',
        'text-tertiary': '#6C757D',
        'text-muted': '#999999',
        white: '#FFFFFF',
        'bg-light': '#F8F9FA',
        border: '#DEE2E6',
        'bg-disabled': '#EDEDED',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '17.5px',
        'lg': '20px',
        'xl': '28px',
      },
      borderRadius: {
        'button': '2px',
        'modal': '3.8px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
      },
      maxWidth: {
        'large': '1200px',
      },
      screens: {
        'mobile': { 'max': '575px' },
        'tablet': { 'min': '576px', 'max': '768px' },
        'desktop': { 'min': '768px', 'max': '992px' },
        'large': { 'min': '992px' },
      },
    },
  },
  plugins: [],
}

export default config
