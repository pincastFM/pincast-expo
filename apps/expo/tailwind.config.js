/**
 * Tailwind configuration that extends tokens from NuxtSitev1
 */
export default {
  theme: {
    extend: {
      // These values will be replaced with actual values from NuxtSitev1
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#ADC8FF',
          300: '#85ADFF',
          400: '#5C91FF',
          500: '#3B82F6',
          600: '#0A5AE2',
          700: '#0747B3',
          800: '#053585',
          900: '#032056',
          950: '#021843'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px'
      }
    }
  },
  plugins: []
}