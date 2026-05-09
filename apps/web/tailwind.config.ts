import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#F7F8F5",
        mint: "#0F766E",
        coral: "#E4572E",
        gold: "#F59E0B"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
