"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 料理意欲SNSの主役導線。投稿を中央のメインボタンに、キャラはマイページへ集約。
const TABS = [
  { href: "/feed", label: "フィード", icon: "👥" },
  { href: "/recipe", label: "レシピ", icon: "📖" },
  { href: "/cook", label: "投稿", icon: "＋", primary: true }, // 中央の主役ボタン
  { href: "/fridge", label: "冷蔵庫", icon: "🧊" },
  { href: "/", label: "マイページ", icon: "👤" },
];

/** 下部固定ナビゲーションバー */
export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <ul className="mx-auto flex max-w-md items-end justify-between gap-1 border-t border-black/5 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          // 中央の「投稿」だけブランドカラーの大きな丸ボタンとして浮かせる
          if (tab.primary) {
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-0.5 pb-2 text-[11px] font-bold text-brand"
                >
                  <span
                    className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-3xl font-light leading-none text-white shadow-glow ring-4 ring-white transition-transform active:scale-95"
                    aria-hidden
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-all ${
                  active ? "text-brand" : "text-ink-soft/60"
                }`}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full text-lg transition-all ${
                    active ? "-translate-y-0.5 bg-brand-light" : ""
                  }`}
                  aria-hidden
                >
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
