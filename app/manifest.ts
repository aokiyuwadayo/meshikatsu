import type { MetadataRoute } from "next";

// PWA マニフェスト（App Router が /manifest.webmanifest として配信）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "メシ活 — 食品ロスゼロアプリ",
    short_name: "メシ活",
    description:
      "一人暮らし大学生の食品ロスをゼロにする、ゲーム感覚の食品管理アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8EF",
    theme_color: "#2FBF5B",
    orientation: "portrait",
    lang: "ja",
    categories: ["food", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
