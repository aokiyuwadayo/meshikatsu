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
        urgent: "#dc2626",
        warn: "#d97706",
        safe: "#0F857B",
        // ブランド：洗練されたティール（青緑）— 清潔感の主役
        brand: {
          DEFAULT: "#0F857B",
          dark: "#0B6B62",
          light: "#E3F2F0",
        },
        // アクセント：テラコッタ（オレンジっぽい茶色）— 差し色・CTA
        accent: {
          DEFAULT: "#C2693E",
          dark: "#A8552F",
          light: "#F6E7DC",
        },
        gold: "#C2693E",
        // 文字色：クールなチャコール（焦茶をやめて締まった黒緑寄り）
        ink: {
          DEFAULT: "#17211F",
          soft: "#5C6764",
        },
        // 微妙な塗り用のごく淡いニュートラル（背景は白に）
        cream: "#F2F5F4",
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
        "4xl": "1.5rem",
      },
      boxShadow: {
        // 清潔感重視：薄く繊細な影に
        card: "0 1px 2px rgba(23,33,31,0.04), 0 10px 24px -20px rgba(23,33,31,0.20)",
        pop: "0 1px 0 rgba(23,33,31,0.04)",
        glow: "0 8px 20px -14px rgba(15,133,123,0.45)",
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
