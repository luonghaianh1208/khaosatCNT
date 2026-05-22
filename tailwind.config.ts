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
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'slide-left': 'slideLeft 0.25s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}

export default config
