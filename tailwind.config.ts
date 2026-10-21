import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#1d1d1f",
        mist: "#f5f5f7",
        muted: "#6e6e73",
        line: "#d2d2d7",
      },
      letterSpacing: { tightest: "-0.045em" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.22,1,0.36,1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
} satisfies Config
