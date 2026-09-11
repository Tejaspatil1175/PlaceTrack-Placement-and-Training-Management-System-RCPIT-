/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0F2A47',
          700: '#1C3F63',
          500: '#2D5A82',
          100: '#E4EBF2',
        },
        accent: {
          500: '#B8862E',
        },
        beige: {
          50: '#FAF8F5',
          100: '#F5F0E6',
          200: '#EAE1D2',
          300: '#D8C9B4',
          500: '#A69282',
          700: '#6E5D4F',
          900: '#3D332A',
        },
        darkgrey: {
          100: '#E4E4E7',
          300: '#A1A1AA',
          500: '#71717A',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        'bg-base': '#F5F0E6',
        'bg-surface': '#FFFFFF',
        'border-subtle': '#3F3F46', // Dark Grey thin border
        'border-dark': '#27272A',
        'text-primary': '#18181B',
        'text-secondary': '#52525B',
        'text-muted': '#71717A',
        success: {
          600: '#16A34A',
          100: '#DCFCE7',
        },
        warning: {
          600: '#D97706',
          100: '#FEF3C7',
        },
        error: {
          600: '#DC2626',
          100: '#FEE2E2',
        },
        info: {
          600: '#2563EB',
          100: '#DBEAFE',
        },
      },
      boxShadow: {
        'pop': '0 10px 25px -5px rgba(24, 24, 27, 0.08), 0 8px 10px -6px rgba(24, 24, 27, 0.04)',
        'pop-hover': '0 20px 30px -10px rgba(24, 24, 27, 0.12), 0 10px 15px -5px rgba(24, 24, 27, 0.06)',
      },
      fontFamily: {
        heading: ['Sora', 'Lexend', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
