/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand — electric cyan (matches landing --energy)
        brand: {
          50:  '#f0feff',
          100: '#ccf9ff',
          200: '#99f3ff',
          300: '#55e8ff',
          400: '#00EEFF', // main electric cyan
          500: '#00CEDF',
          600: '#00A8B8',
          700: '#007F8C',
          800: '#005560',
          900: '#003340',
          950: '#001820',
        },
        // CTA / energy — neon orange
        energy: {
          300: '#FFAE72',
          400: '#FF8C42',
          500: '#FF6920',
          600: '#E04E00',
          700: '#B33D00',
        },
        // Neon accents
        neon: {
          cyan:   '#00EEFF',
          pink:   '#FF2D78',
          green:  '#00FF88',
          yellow: '#FFE600',
          orange: '#FF6920',
          purple: '#9B5DE5',
        },
        // Dark backgrounds — deep space
        dark: {
          50:  '#e8ecf4',
          100: '#c5cedf',
          200: '#8fa4c0',
          300: '#607a9a',
          400: '#4a6280',
          500: '#344d66',
          600: '#1e3350',
          700: '#0f1e38',
          800: '#080E1C',  // card surface
          900: '#04060E',  // main bg — deep space
          950: '#02030A',
        },
        // Surface aliases for readability
        surface: {
          card:    '#080E1C',
          panel:   '#0B1120',
          border:  'rgba(0,238,255,0.12)',
          hover:   '#0D1829',
        },
      },
      fontFamily: {
        game:   ['"Orbitron"', '"Chakra Petch"', 'monospace'],
        display:['"Orbitron"', 'sans-serif'],
        ui:     ['"Chakra Petch"', 'sans-serif'],
        body:   ['"DM Sans"', 'sans-serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
        // Legacy compat
        Oswald: ['"Oswald"', 'sans-serif'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'glow-energy':  'glowEnergy 2s ease-in-out infinite alternate',
        'float':        'float 4s ease-in-out infinite',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':   'slideDown 0.3s ease-out',
        'fade-in':      'fadeIn 0.4s ease-out',
        'scan':         'scan 4s linear infinite',
        'circuit':      'circuit 3s ease-in-out infinite',
        'flicker':      'flicker 3s step-end infinite',
        'neon-pulse':   'neonPulse 2s ease-in-out infinite',
        'wiggle':       'wiggle 0.3s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 4px rgba(0,238,255,0.2), 0 0 8px rgba(0,238,255,0.1)' },
          '100%': { boxShadow: '0 0 12px rgba(0,238,255,0.5), 0 0 24px rgba(0,238,255,0.2)' },
        },
        glowEnergy: {
          '0%':   { boxShadow: '0 0 4px rgba(255,105,32,0.3)' },
          '100%': { boxShadow: '0 0 16px rgba(255,105,32,0.6), 0 0 32px rgba(255,105,32,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%':   { backgroundPosition: '0 -100%' },
          '100%': { backgroundPosition: '0 200%' },
        },
        circuit: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        flicker: {
          '0%,92%,96%,100%': { opacity: '1' },
          '93%,97%':          { opacity: '0.6' },
          '94%':              { opacity: '0.8' },
        },
        neonPulse: {
          '0%, 100%': { textShadow: '0 0 4px rgba(0,238,255,0.8), 0 0 8px rgba(0,238,255,0.4)' },
          '50%':      { textShadow: '0 0 12px rgba(0,238,255,1), 0 0 24px rgba(0,238,255,0.6), 0 0 40px rgba(0,238,255,0.2)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-3deg)' },
          '75%':      { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'game-gradient':   'linear-gradient(135deg, #04060E 0%, #080E1C 50%, #04060E 100%)',
        'brand-gradient':  'linear-gradient(135deg, #00EEFF 0%, #00CEDF 50%, #9B5DE5 100%)',
        'energy-gradient': 'linear-gradient(135deg, #FF8C42 0%, #FF6920 60%, #E04E00 100%)',
        'neon-gradient':   'linear-gradient(135deg, #00EEFF 0%, #9B5DE5 50%, #FF2D78 100%)',
        'card-gradient':   'linear-gradient(135deg, #080E1C 0%, #0B1120 100%)',
        'mesh-gradient':   'radial-gradient(ellipse at 20% 50%, rgba(0,238,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(155,93,229,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255,105,32,0.04) 0%, transparent 50%)',
        'circuit-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='rgba(0,238,255,0.04)' stroke-width='1'%3E%3Cpath d='M0 30h20M40 30h20M30 0v20M30 40v20'/%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      boxShadow: {
        'glow-xs':  '0 0 4px rgba(0,238,255,0.2)',
        'glow-sm':  '0 0 8px rgba(0,238,255,0.3)',
        'glow':     '0 0 16px rgba(0,238,255,0.3), 0 0 32px rgba(0,238,255,0.1)',
        'glow-lg':  '0 0 32px rgba(0,238,255,0.25), 0 0 64px rgba(0,238,255,0.1)',
        'energy':   '0 0 12px rgba(255,105,32,0.4), 0 0 24px rgba(255,105,32,0.15)',
        'energy-lg':'0 0 20px rgba(255,105,32,0.5), 0 0 48px rgba(255,105,32,0.2)',
        'card':     '0 2px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,238,255,0.06)',
        'card-lg':  '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,238,255,0.08)',
        'inset-glow': 'inset 0 1px 0 rgba(0,238,255,0.1)',
      },
      borderColor: {
        'cyan-dim':    'rgba(0,238,255,0.15)',
        'cyan-mid':    'rgba(0,238,255,0.3)',
        'cyan-bright': 'rgba(0,238,255,0.6)',
      },
    },
  },
  plugins: [],
};
