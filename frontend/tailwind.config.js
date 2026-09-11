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
        'bg-base': '#F7F8FA',
        'bg-surface': '#FFFFFF',
        'border-subtle': '#E2E6EB',
        'text-primary': '#1A2733',
        'text-secondary': '#5B6B7A',
        'text-muted': '#8C9AA8',
        success: {
          600: '#1E7A46',
          100: '#E1F3E8',
        },
        warning: {
          600: '#B36B0D',
          100: '#FBEBD6',
        },
        error: {
          600: '#B3261E',
          100: '#FBE4E2',
        },
        info: {
          600: '#2563A8',
          100: '#E3EDF7',
        },
      },
      fontFamily: {
        heading: ['Sora', 'Lexend', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
