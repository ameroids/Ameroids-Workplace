/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--color-base-950) / <alpha-value>)',
          900: 'rgb(var(--color-base-900) / <alpha-value>)',
          850: 'rgb(var(--color-base-850) / <alpha-value>)',
          800: 'rgb(var(--color-base-800) / <alpha-value>)',
          700: 'rgb(var(--color-base-700) / <alpha-value>)',
          600: 'rgb(var(--color-base-600) / <alpha-value>)',
          500: 'rgb(var(--color-base-500) / <alpha-value>)',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        ink: {
          100: 'rgb(var(--color-ink-100) / <alpha-value>)',
          200: 'rgb(var(--color-ink-200) / <alpha-value>)',
          300: 'rgb(var(--color-ink-300) / <alpha-value>)',
          400: 'rgb(var(--color-ink-400) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(139,92,246,0.25), 0 8px 30px -8px rgba(139,92,246,0.35)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.97)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'slide-up': 'slide-up 0.22s ease-out',
        'slide-in-right': 'slide-in-right 0.24s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scale-in 0.16s ease-out',
      },
    },
  },
  plugins: [],
}
