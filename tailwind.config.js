/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
          accent: "var(--brand-accent)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          soft: "var(--surface-soft)",
          hard: "var(--surface-hard)",
        }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      fontFamily: {
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
