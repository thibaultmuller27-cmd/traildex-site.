import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "monospace"],
        display: ["Luckiest Guy", "Impact", "Arial Black", "sans-serif"],
      },
      colors: {
        // DNF Cards: night background, light text, lime / mint / violet accents
        ink: "#f4f1fb",
        mist: "#1c1338",
        muted: "#b4abd6",
        line: "#3b2f6e",
        night: "#0f0b1e",
        lime: "#c6e536",
        mint: "#1fd6a0",
        violet: "#7a2cff",
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
