/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map white to dark background
        white: '#121212',
        // Map black to light text
        black: '#f3f4f6',
        
        // Map gray to inverse for dark mode
        gray: {
          50: '#1a1a1a',
          100: '#242424',
          200: '#2a2a2a',
          300: '#404040',
          400: '#525252',
          500: '#737373',
          600: '#a3a3a3',
          700: '#d4d4d4',
          800: '#e5e5e5',
          900: '#f5f5f5',
          950: '#ffffff',
        },
        
        // Map primary colors (blue) to Gold
        blue: {
          50: '#fbf8eb',
          100: '#f5eed3',
          200: '#ead8a2',
          300: '#dec16b',
          400: '#d4ae41',
          500: '#D4AF37', // Classic Gold
          600: '#c59b27',
          700: '#9d751b',
          800: '#7e5a1b',
          900: '#67481a',
          950: '#3c270b',
        },

        // Adapt other status colors for dark mode (optional, but good for contrast)
        purple: {
          50: '#1e1a24',
          100: '#2a2432',
          200: '#3d304a',
          300: '#544068',
          400: '#71548c',
          500: '#8e69af',
          600: '#aa86c9',
          700: '#c0a3d9',
          800: '#d3bee5',
          900: '#e5d7f0',
          950: '#f4eff8',
        },
        green: {
          50: '#141c17',
          100: '#1c2820',
          200: '#253d2d',
          300: '#32573d',
          400: '#407550',
          500: '#4f9464',
          600: '#67b37d',
          700: '#88cd9c',
          800: '#b0e2be',
          900: '#d6f2df',
          950: '#f0f9f2',
        },
        yellow: {
          50: '#211d14',
          100: '#2e2819',
          200: '#423821',
          300: '#5c4b27',
          400: '#7d642f',
          500: '#a17f38',
          600: '#c29f4d',
          700: '#dbc16d',
          800: '#ead799',
          900: '#f4ebd0',
          950: '#fbf7ef',
        },
        red: {
          50: '#261616',
          100: '#361b1b',
          200: '#542323',
          300: '#782d2d',
          400: '#a33939',
          500: '#cc4b4b',
          600: '#e66e6e',
          700: '#f29696',
          800: '#f7c1c1',
          900: '#fce3e3',
          950: '#fef5f5',
        },
      }
    },
  },
  plugins: [],
}
