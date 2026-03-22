/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(var(--color-primary-50, 221 97% 96%))',
          100: 'hsl(var(--color-primary-100, 221 95% 92%))',
          200: 'hsl(var(--color-primary-200, 221 90% 85%))',
          300: 'hsl(var(--color-primary-300, 221 80% 72%))',
          400: 'hsl(var(--color-primary-400, 221 70% 60%))',
          500: 'hsl(var(--color-primary-500, 221 83% 50%))',
          600: 'hsl(var(--color-primary-600, 221 83% 42%))',
          700: 'hsl(var(--color-primary-700, 221 83% 35%))',
          800: 'hsl(var(--color-primary-800, 221 83% 28%))',
          900: 'hsl(var(--color-primary-900, 221 83% 22%))',
        },
        accent: 'var(--color-accent, #10b981)',
      },
    },
  },
  plugins: [],
};
