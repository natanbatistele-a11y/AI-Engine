import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'ui-sans-serif'],
        heading: ['Sora', 'sans-serif']
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        sky: {
          brand: '#0ea5e9'
        }
      },
      boxShadow: {
        floating: '0 20px 45px -35px rgba(15, 23, 42, 0.65)'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 280ms ease-out'
      }
    }
  },
  safelist: ['bg-[var(--background)]', 'text-[var(--foreground)]', 'bg-[var(--card)]', 'border-[var(--border)]'],
  plugins: []
};

export default config;
