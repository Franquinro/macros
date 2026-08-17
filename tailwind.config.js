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
        wow: {
          dark: '#0d1117',
          darker: '#080a0f',
          card: '#161b22',
          hover: '#21262d',
          border: '#30363d',
          gold: '#f3b006',
          'gold-light': '#ffdf78',
          'gold-dark': '#a36d00',
          arcane: '#a855f7',
          'arcane-glow': '#c084fc',
          fel: '#22c55e',
          'fel-glow': '#4ade80',
          frost: '#38bdf8',
          'frost-glow': '#7dd3fc',
          blood: '#ef4444',
          'blood-glow': '#f87171',
          shadow: '#6366f1',
          ascension: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Cinzel', 'Trajan Pro', 'Cinzel Decorative', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 15px -3px rgba(243, 176, 6, 0.4)',
        'glow-fel': '0 0 15px -3px rgba(34, 197, 94, 0.4)',
        'glow-arcane': '0 0 15px -3px rgba(168, 85, 247, 0.4)',
        'glow-frost': '0 0 15px -3px rgba(56, 189, 248, 0.4)',
        'glow-blood': '0 0 15px -3px rgba(239, 68, 68, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
