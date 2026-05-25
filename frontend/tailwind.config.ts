import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vulnforge: {
          bg: "#0a0e17",
          surface: "#111827",
          card: "#1a1f2e",
          border: "#1e293b",
          accent: "#00ff88",
          "accent-dim": "#00cc6a",
          warning: "#ff6b35",
          danger: "#ff3860",
          info: "#3b82f6",
          purple: "#a855f7",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        flicker: "flicker 1.5s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "gauge-fill": "gauge-fill 2s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in-scale": "fade-in-scale 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "typing-cursor": "typing-cursor 1s step-end infinite",
        "bar-rise": "bar-rise 1s ease-out forwards",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "gauge-fill": {
          "0%": { strokeDashoffset: "327" },
          "100%": { strokeDashoffset: "var(--gauge-target)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(0, 255, 136, 0.1)" },
          "50%": { borderColor: "rgba(0, 255, 136, 0.3)" },
        },
        "typing-cursor": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "bar-rise": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
