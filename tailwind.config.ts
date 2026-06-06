import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 消費期限の色分け（赤=緊急 / 黄=注意 / 緑=安全）
        urgent: "#ef4444",
        warn: "#f59e0b",
        safe: "#22c55e",
        // ブランド：温かみのある緑（HTML版と統一 = 折衷でも色がぶれない）
        brand: {
          DEFAULT: "#2FBF5B",
          dark: "#1F9D55",
          light: "#E9F8EC",
        },
        // アクセント：CTA・XP・注目
        accent: {
          DEFAULT: "#FF7A1A",
          dark: "#FF6300",
          light: "#FFE3C2",
        },
        gold: "#F5B301",
        // 文字色（純黒の代わりに温かい焦茶）
        ink: {
          DEFAULT: "#3A2A1B",
          soft: "#6F6457",
        },
        cream: "#FFF8EF",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 14px 30px -16px rgba(58,42,27,0.28)",
        pop: "0 10px 0 rgba(58,42,27,0.06)",
        glow: "0 14px 30px -12px rgba(47,191,91,0.55)",
      },
      keyframes: {
        "xp-pop": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.8)" },
          "25%": { opacity: "1", transform: "translateY(0) scale(1.1)" },
          "60%": { opacity: "1", transform: "translateY(-8px) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.8) rotate(-12deg)" },
          "60%": { transform: "scale(0.92) rotate(3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0)" },
        },
        "burst": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.6)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "xp-pop": "xp-pop 1.5s ease-out forwards",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "burst": "burst 0.8s ease-out forwards",
        "float-slow": "float-slow 3.5s ease-in-out infinite",
        "toast-in": "toast-in 0.3s ease-out both",
        "slide-up": "slide-up 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
