import type { MetadataRoute } from "next";

// 静的書き出し（output: export）では明示が必要
export const dynamic = "force-static";

const BASE = "/meshikatsu"; // GitHub Pages のサブパス

// PWA マニフェスト（App Router が /manifest.webmanifest として配信）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "メシ活 — ひとりの自炊を、みんなで続ける",
    short_name: "メシ活",
    description:
      "ひとりの自炊を、みんなで続ける料理SNS。冷蔵庫・レシピ・記録で自炊が続き、食品ロスも減る。",
    start_url: `${BASE}/`,
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0F857B",
    orientation: "portrait",
    lang: "ja",
    categories: ["food", "lifestyle", "productivity"],
    icons: [
      {
        src: "/meshikatsu/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/meshikatsu/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
