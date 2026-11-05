/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['Manrope', 'sans-serif'], mono: ['DM Mono', 'monospace'] },
    colors: { ink: '#080d18', panel: '#101827', line: '#202c40', mint: '#5ce1b4', blue: '#7aa7ff' }
  }},
  plugins: []
}
