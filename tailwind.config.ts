import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#dcfce7",
          100: "#dcfce7",
          200: "#86efac",
          500: "#22c55e",
          800: "#15803d",
          900: "#166534",
          DEFAULT: "#15803d",
        },
        accent: {
          50: "#fef3c7",
          100: "#fef3c7",
          400: "#fbbf24",
          600: "#d97706",
          900: "#92400e",
          DEFAULT: "#d97706",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
