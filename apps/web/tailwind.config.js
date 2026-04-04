/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FC',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        'space-mono': ['var(--font-space-mono)', 'monospace'],
        outfit: ['var(--font-outfit)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
