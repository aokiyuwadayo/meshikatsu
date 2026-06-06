import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "メシ活 — 食品ロスゼロアプリ",
  description: "一人暮らし大学生の食品ロスをゼロにする、ゲーム感覚の食品管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-cream">
        {/* デスクトップでは中央のスマホ幅カラム。背景は温かいグラデーション */}
        <div className="app-shell relative mx-auto min-h-screen max-w-md bg-gradient-to-b from-accent-light/40 via-cream to-cream shadow-xl shadow-ink/5">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
