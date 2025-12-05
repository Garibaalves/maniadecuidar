import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        brand: {
          soft: "#f7d1ca",
          primary: "#a4222e",
          deep: "#5c3129",
        },
        primary: {
          DEFAULT: "#a4222e",
          foreground: "#f7d1ca",
        },
        secondary: {
          DEFAULT: "#5c3129",
          foreground: "#f7d1ca",
        },
        background: "#f7d1ca",
        foreground: "#5c3129",
        muted: {
          DEFAULT: "#eac0b6",
          foreground: "#5c3129",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#5c3129",
        },
        border: "#e7b6ac",
        input: "#e7b6ac",
        ring: "#a4222e",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px rgba(92, 49, 41, 0.12)",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [animate],
};

export default config;
