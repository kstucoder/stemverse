/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 
          700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        neon: {
          cyan: '#22d3ee',
          pink: '#f472b6',
          green: '#34d399',
          yellow: '#fbbf24',
          orange: '#fb923c',
          purple: '#a78bfa',
        },
        surface: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569',
          700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        game: {
          bg: '#0c1222',
          card: '#141d30',
          border: '#1e293b',
          hover: '#1a2440',
          text: '#e2e8f0',
          muted: '#64748b',
        },
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569',
          700: '#1a2440', 800: '#141d30', 900: '#0c1222', 950: '#080c18',
        },
      },
      fontFamily: {
        game: ['"Fredoka One"', 'cursive', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(135deg, #0c1222 0%, #141d30 50%, #0c1222 100%)',
        'brand-gradient': 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
        'neon-gradient': 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%)',
        'warm-gradient': 'linear-gradient(135deg, #fbbf24 0%, #fb923c 50%, #f472b6 100%)',
        'mesh-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(34,211,238,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(99,102,241,0.2)',
        'glow': '0 0 15px rgba(99,102,241,0.3)',
        'glow-lg': '0 0 30px rgba(99,102,241,0.15)',
        'card': '0 2px 12px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
