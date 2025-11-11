/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: "var(--slate-950)",
          900: "var(--slate-900)",
          800: "var(--slate-800)"
        },
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)"
      },
      spacing: {
        7.5: "1.875rem"
      }
    },
  },
  plugins: [
    // Uncomment any plugins you want and install them as devDependencies
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}
