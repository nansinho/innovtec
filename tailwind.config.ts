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
          DEFAULT: '#D4A017',
          light: '#E8B931',
          dark: '#B8860B',
          50: '#FDF8E8',
          100: '#FAF0C8',
          200: '#F5E08F',
          300: '#F0D056',
          400: '#E8B931',
          500: '#D4A017',
          600: '#B8860B',
          700: '#9A6F09',
          800: '#7D5907',
          900: '#604305',
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
        background: '#F0F2F5',
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
        'card-lg': '20px',
        button: '10px',
        bar: '3px',
      },
      maxWidth: {
        content: '1400px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-elevated': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 16px 48px rgba(0, 0, 0, 0.12)',
        sidebar: '4px 0 24px rgba(0, 0, 0, 0.12)',
        topbar: '0 1px 3px rgba(0, 0, 0, 0.04)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
        banner: '0 20px 60px rgba(0, 82, 204, 0.15)',
        'glow-primary': '0 0 40px rgba(0, 82, 204, 0.15)',
        'glow-accent': '0 0 40px rgba(212, 160, 23, 0.15)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, transparent 50%, var(--tw-gradient-to) 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
