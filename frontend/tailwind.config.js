/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary accent — the neon red of the BlackWall
        crimson: '#FF003C',
        'crimson-dark': '#C8234A',
        'crimson-dim': '#8C1F35',
        // Backgrounds
        void: '#050505',
        'void-light': '#0d0d0d',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'scanline-move': 'scanlineMove 9s linear infinite',
        flicker: 'flicker 0.12s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        scanlineMove: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%': { opacity: '1' },
          '49%': { opacity: '1' },
          '50%': { opacity: '0.82' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
