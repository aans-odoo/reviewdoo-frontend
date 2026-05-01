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
        border: "var(--border)",
        "border-light": "var(--border-light)",
        input: "var(--border)",
        ring: "var(--primary)",
        background: "var(--body)",
        foreground: "var(--text)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          muted: "var(--primary-muted)",
        },
        secondary: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-muted)",
        },
        popover: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text)",
        },
        theme: {
          body: "var(--body)",
          bg: "var(--bg)",
          "bg-card": "var(--bg-card)",
          "bg-elevated": "var(--bg-elevated)",
          "bg-hover": "var(--bg-hover)",
          text: "var(--text)",
          "text-muted": "var(--text-muted)",
          "text-dim": "var(--text-dim)",
          primary: "var(--primary)",
          "primary-light": "var(--primary-light)",
          "primary-dark": "var(--primary-dark)",
          "primary-muted": "var(--primary-muted)",
          accent: "var(--accent)",
          "accent-light": "var(--accent-light)",
          success: "var(--success)",
          danger: "var(--danger)",
          info: "var(--info)",
          cyan: "var(--cyan)",
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
