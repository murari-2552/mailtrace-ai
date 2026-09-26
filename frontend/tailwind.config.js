/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        panel: '#111827',
        'panel-border': '#1E293B',
        'panel-hover': '#1F2937',
        cyber: {
          cyan: '#06B6D4',
          blue: '#0EA5E9',
          light: '#38BDF8',
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#10B981',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
