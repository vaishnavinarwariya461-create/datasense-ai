/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060609',
          900: '#0a0a0f', // Primary ultra-dark background
          850: '#0f0f16',
          800: '#111118', // Card / component secondary background
          750: '#151522',
          700: '#1a1a2e', // Elevated panel background
          600: '#23233c',
          500: '#32324f',
        },
        brand: {
          purple: {
            DEFAULT: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            glow: 'rgba(139, 92, 246, 0.35)',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
            glow: 'rgba(6, 182, 212, 0.35)',
          },
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))' },
          '100%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.6))' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.55)',
        'glow-purple': '0 0 30px -5px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.4)',
        'glow-sm-purple': '0 0 15px -3px rgba(139, 92, 246, 0.35)',
        'glow-sm-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
}
