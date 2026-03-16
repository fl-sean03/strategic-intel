import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        navy: '#1E3A5F',
        'navy-light': '#2A4F7F',
        // Risk levels
        'risk-critical': '#DC2626',
        'risk-high': '#D97706',
        'risk-moderate': '#2563EB',
        'risk-low': '#059669',
        'risk-neutral': '#94A3B8',
        // Background
        surface: '#FAFAFA',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
