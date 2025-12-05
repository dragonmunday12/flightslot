/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // Automatically follows OS dark mode preference
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#6b7280',
        available: '#3b82f6',
        unavailable: '#9ca3af',
        assigned: '#10b981',
        blocked: '#ef4444',
      },
    },
  },
  plugins: [],
}
