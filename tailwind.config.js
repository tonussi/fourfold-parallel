/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      colors: {
        gospel: {
          matthew: '#3b82f6',
          mark: '#ef4444',
          luke: '#10b981',
          john: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
