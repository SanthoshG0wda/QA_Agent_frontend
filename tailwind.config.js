/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--surface-bg)',
          card: 'var(--surface-card)',
          sidebar: 'var(--surface-sidebar)',
          border: 'var(--surface-border)',
          hover: 'var(--surface-hover)',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#60A5FA',
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'card': 'var(--card-shadow)',
      },
    },
  },
  plugins: [],
}
