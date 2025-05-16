/**
 * Tailwind configuration for Pincast Expo
 * Based on the Pincaster style guide
 */
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(153 100% 20%)',
          50: 'hsl(153 100% 98%)',
          100: 'hsl(153 100% 95%)',
          200: 'hsl(153 100% 90%)',
          300: 'hsl(153 100% 85%)',
          400: 'hsl(153 100% 75%)',
          500: 'hsl(153 100% 65%)',
          600: 'hsl(153 100% 55%)',
          700: 'hsl(153 100% 45%)',
          800: 'hsl(153 100% 35%)',
          900: 'hsl(153 100% 25%)',
          950: 'hsl(153 100% 20%)'
        },
        secondary: 'hsl(333, 100%, 45%)',
        tertiary: 'hsl(43, 100%, 50%)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'primary': '4px 4px 0px 0px hsl(153 100% 20%)',
        'primary-hover': '0px 0px 0px 0px rgba(79,153,153,0)',
        'card-hover': '6px 6px 0px 0px hsl(153 100% 20%)'
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)'
      },
      backgroundSize: {
        'grid': '24px 24px'
      },
      animation: {
        'pulse-custom': 'pulse 1.75s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s infinite step-start',
        'flash': 'flash 0.5s ease-in-out'
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' }
        },
        flash: {
          '0%, 100%': { backgroundColor: 'var(--primary)' },
          '50%': { backgroundColor: 'var(--background)' }
        }
      }
    }
  },
  plugins: []
}