import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052CC',
          light: '#4C9AFF',
          dark: '#003E99',
          50: '#E6F0FF',
          100: '#B3D4FF',
          200: '#80B8FF',
          300: '#4C9AFF',
          400: '#2684FF',
          500: '#0052CC',
          600: '#0047B3',
          700: '#003D99',
          800: '#003380',
          900: '#002966',
        },
        accent: {
          DEFAULT: '#FF6B35',
          light: '#FF8F66',
          dark: '#E55A25',
          50: '#FFF3ED',
          100: '#FFE0CC',
          200: '#FFBF99',
          300: '#FF9F66',
          400: '#FF7F33',
          500: '#FF6B35',
          600: '#E55A25',
          700: '#CC4A15',
          800: '#B33A05',
          900: '#992F00',
        },
        success: {
          DEFAULT: '#36B37E',
          light: '#79F2C0',
          dark: '#006644',
        },
        warning: {
          DEFAULT: '#FFAB00',
          light: '#FFE380',
          dark: '#FF8B00',
        },
        danger: {
          DEFAULT: '#FF5630',
          light: '#FF8F73',
          dark: '#DE350B',
        },
        background: '#F4F5F7',
        card: '#FFFFFF',
        sidebar: {
          DEFAULT: '#0A1628',
          light: '#0D2137',
        },
        text: {
          primary: '#172B4D',
          secondary: '#5E6C84',
          muted: '#97A0AF',
        },
        border: '#DFE1E6',
        'border-light': '#EBECF0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '10px',
        bar: '3px',
      },
      maxWidth: {
        content: '1400px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.08)',
        sidebar: '4px 0 24px rgba(0, 0, 0, 0.08)',
        topbar: '0 2px 8px rgba(0, 0, 0, 0.04)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
