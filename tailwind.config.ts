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
        brand: {
          DEFAULT: "#16a34a",
          dark: "#15803d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
