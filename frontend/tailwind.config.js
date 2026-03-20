/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Roboto', 'sans-serif'],
        bauhaus: ['Outfit', 'sans-serif'],
      },
      colors: {
        md: {
          primary: '#6750A4',
          'on-primary': '#FFFFFF',
          'primary-container': '#EADDFF',
          'on-primary-container': '#21005D',
          secondary: '#625B71',
          'secondary-container': '#E8DEF8',
          'on-secondary-container': '#1D192B',
          tertiary: '#7D5260',
          'on-tertiary': '#FFFFFF',
          'tertiary-container': '#FFD8E4',
          'on-tertiary-container': '#31111D',
          background: '#FFFBFE',
          'on-background': '#1C1B1F',
          surface: '#FFFBFE',
          'on-surface': '#1C1B1F',
          'surface-container': '#F3EDF7',
          'surface-container-low': '#E7E0EC',
          outline: '#79747E',
          'on-surface-variant': '#49454F',
          error: '#B3261E',
          'on-error': '#FFFFFF',
        },
        bauhaus: {
          bg: '#F0F0F0',
          black: '#121212',
          red: '#D02020',
          blue: '#1040C0',
          yellow: '#F0C020',
          muted: '#E0E0E0',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          DEFAULT: '#14b8a6',
        },
      },
      boxShadow: {
        'elevation-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'elevation-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
      },
      borderRadius: {
        "xs": "8px",
        "sm": "12px",
        "md": "16px",
        "lg": "24px",
        "xl": "28px",
        "2xl": "32px",
        "3xl": "48px",
        "full": "9999px"
      },
      transitionTimingFunction: {
        'md3': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
