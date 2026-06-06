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
      <body>
        <div className="app-shell mx-auto min-h-screen max-w-md bg-white">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}
