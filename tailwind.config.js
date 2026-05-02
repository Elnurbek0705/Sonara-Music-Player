export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "var(--accent)",
        "brand-strong": "var(--accent-strong)",
        "main-bg": "var(--bg-primary)",
        "secondary-bg": "var(--bg-secondary)",
        surface: "var(--bg-surface)",
        "surface-dark": "var(--bg-surface-dark)",
        "text-main": "var(--text-main)",
        "text-dim": "var(--text-dim)",
        border: "var(--border-color)",
      },
    },
  },
};
