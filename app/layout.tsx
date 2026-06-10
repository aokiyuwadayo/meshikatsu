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
      <body className="bg-[#F2F5F4]">
        {/* デスクトップでは中央のスマホ幅カラム。背景は白でクリーンに */}
        <div className="app-shell relative mx-auto min-h-screen max-w-md bg-white shadow-xl shadow-ink/5">
          {children}
        </div>
        <Navigation />
        {/* 初回起動時のチュートリアル（localStorage フラグで一度だけ） */}
        <Onboarding />
      </body>
    </html>
  );
}
