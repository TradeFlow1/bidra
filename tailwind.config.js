/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bidra: {
          canvas: "var(--bidra-canvas)",
          surface: "var(--bidra-surface)",
          surface2: "var(--bidra-surface-2)",
          border: "var(--bidra-border)",

          ink: "var(--bidra-ink)",
          ink2: "var(--bidra-ink-2)",
          ink3: "var(--bidra-ink-3)",

          blue: "var(--bidra-blue)",
          blue2: "var(--bidra-blue-2)",
          blueSoft: "var(--bidra-blue-soft)",

          dark: "var(--bidra-dark)",
        },
      },
      borderRadius: {
        "bidra-card": "var(--bidra-radius-card)",
        "bidra-input": "var(--bidra-radius-input)",
        "bidra-btn": "var(--bidra-radius-btn)",
      },
      boxShadow: {
        "bidra-card": "var(--bidra-shadow-card)",
      },
    },
  },
  plugins: [],
};
