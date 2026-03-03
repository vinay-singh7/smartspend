import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.2) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
