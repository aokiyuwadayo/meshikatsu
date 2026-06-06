"use client";

// 担当: エンジニアA（ホーム・ダッシュボード）
// docs/tasks/A-home-character.md の受け入れ条件に対応

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, getFridge } from "@/lib/storage";
import { sortByExpiry, statusLabel, statusClasses, expiryStatus } from "@/lib/expiry";
import CharacterDisplay from "@/components/CharacterDisplay";
import XPBar from "@/components/XPBar";
import type { FoodItem, UserProgress } from "@/types";

// storage の DEFAULT_PROGRESS 相当（SSR と初期描画の整合用）
const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  totalXP: 0,
  stamps: 0,
  cookingCount: 0,
};

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [alerts, setAlerts] = useState<FoodItem[]>([]);

  // localStorage 読み出しは useEffect 内（ハイドレーション不整合を避ける）
  useEffect(() => {
    setProgress(getProgress());
    setAlerts(sortByExpiry(getFridge()).slice(0, 3));
  }, []);

  return (
    <main className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800">メシ活</h1>
      <p className="mt-1 text-sm text-slate-500">
        今日も食品ロスゼロを目指そう！
      </p>

      {/* キャラクター + XPバー */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <CharacterDisplay level={progress.level} />
        <div className="mt-4">
          <XPBar totalXP={progress.totalXP} />
        </div>
      </section>

      {/* 期限アラート */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-800">⏰ 期限が近い食材</h2>
        {alerts.length === 0 ? (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            期限が近い食材はありません。冷蔵庫に食材を追加しましょう。
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {alerts.map((item) => {
              const status = expiryStatus(item.expiryDate);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <span className="text-sm text-slate-700">
                    {statusLabel(item.expiryDate)}で{item.name}が期限切れ
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClasses(
                      status
                    )}`}
                  >
                    {statusLabel(item.expiryDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* クイックアクション */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-800">クイックアクション</h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Link
            href="/cook"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-brand px-4 py-6 text-white shadow-sm transition-transform active:scale-95"
          >
            <span className="text-3xl" aria-hidden>
              🍳
            </span>
            <span className="text-sm font-semibold">料理を記録</span>
          </Link>
          <Link
            href="/receipt"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-brand bg-white px-4 py-6 text-brand shadow-sm transition-transform active:scale-95"
          >
            <span className="text-3xl" aria-hidden>
              🧾
            </span>
            <span className="text-sm font-semibold">レシート読取</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
