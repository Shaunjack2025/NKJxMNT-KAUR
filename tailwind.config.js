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
        game: {
          bg: '#0a0914',
          card: '#131124',
          border: '#272347',
          pink: {
            DEFAULT: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
            deep: '#be185d',
            glow: '#ff2d87',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#38bdf8',
            dark: '#0891b2',
          },
          gold: {
            DEFAULT: '#f59e0b',
            light: '#fbbf24',
            sparkle: '#fef08a',
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'heading-pop': 'headingPop 6s ease-in-out infinite',
        'sparkle': 'sparkle 1.8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'dice-spin': 'diceSpin 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(236, 72, 153, 0.4), inset 0 0 15px rgba(254, 240, 138, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(236, 72, 153, 0.8), 0 0 50px rgba(245, 158, 11, 0.5), inset 0 0 25px rgba(254, 240, 138, 0.6)' },
        },
        headingPop: {
          '0%, 90%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))' },
          '93%': { transform: 'scale(1.03) translateY(-2px)', filter: 'drop-shadow(0 0 25px rgba(236, 72, 153, 0.8))' },
          '96%': { transform: 'scale(0.99) translateY(0px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.8) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
