import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font)"],
      },
      colors: {
        border: "rgba(var(--border) / var(--border-opacity))",
        "border-light": "rgba(var(--border-light) / var(--border-light-opacity))",
        input: "rgba(var(--border) / var(--border-opacity))",
        ring: "rgb(var(--primary) / <alpha-value>)",
        background: "rgb(var(--body) / <alpha-value>)",
        foreground: "rgb(var(--text) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
          dark: "rgb(var(--primary-dark) / <alpha-value>)",
          muted: "rgba(var(--primary-muted) / var(--primary-muted-opacity))",
        },
        secondary: {
          DEFAULT: "rgb(var(--bg-elevated) / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--bg-elevated) / <alpha-value>)",
          foreground: "rgb(var(--text-muted) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--bg-elevated) / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--bg-card) / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
        theme: {
          body: "rgb(var(--body) / <alpha-value>)",
          bg: "rgb(var(--bg) / <alpha-value>)",
          "bg-card": "rgb(var(--bg-card) / <alpha-value>)",
          "bg-elevated": "rgb(var(--bg-elevated) / <alpha-value>)",
          "bg-hover": "rgb(var(--bg-hover) / <alpha-value>)",
          text: "rgb(var(--text) / <alpha-value>)",
          "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
          "text-dim": "rgb(var(--text-dim) / <alpha-value>)",
          primary: "rgb(var(--primary) / <alpha-value>)",
          "primary-light": "rgb(var(--primary-light) / <alpha-value>)",
          "primary-dark": "rgb(var(--primary-dark) / <alpha-value>)",
          "primary-muted": "rgba(var(--primary-muted) / var(--primary-muted-opacity))",
          accent: "rgb(var(--accent) / <alpha-value>)",
          "accent-light": "rgb(var(--accent-light) / <alpha-value>)",
          success: "rgb(var(--success) / <alpha-value>)",
          danger: "rgb(var(--danger) / <alpha-value>)",
          info: "rgb(var(--info) / <alpha-value>)",
          cyan: "rgb(var(--cyan) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
