import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Onboarding from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "メシ活 — ひとりの自炊を、みんなで続ける",
  description:
    "ひとりの自炊を、みんなで続ける料理SNS。冷蔵庫・レシピ・記録で自炊が楽しく続き、食品ロスも自然と減る。",
  applicationName: "メシ活",
  appleWebApp: {
    capable: true,
    title: "メシ活",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F857B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-wood">
        {/* デスクトップ余白は木のテーブル、アプリ内はごく薄い木目（白カードが浮かぶ） */}
        <div className="app-shell relative mx-auto min-h-screen max-w-md bg-wood-soft shadow-xl shadow-ink/10">
          {children}
        </div>
        <Navigation />
        {/* 初回起動時のチュートリアル（localStorage フラグで一度だけ） */}
        <Onboarding />
      </body>
    </html>
  );
}
