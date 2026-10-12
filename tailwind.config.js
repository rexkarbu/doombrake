/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0B0F17',
          light: '#F8FAFC',
        },
        surface: {
          dark: '#161F30',
          light: '#FFFFFF',
        },
        surfaceElevated: {
          dark: '#1E293B',
          light: '#F1F5F9',
        },
        doom: {
          safe: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          accent: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
