"use client";

// 担当: エンジニアA（キャラクター詳細 /character）
// docs/tasks/A-home-character.md の受け入れ条件に対応

import { useEffect, useState } from "react";
import { getProgress, getLogs } from "@/lib/storage";
import { xpToNextLevel, STAMPS_PER_REWARD } from "@/lib/xp";
import CharacterDisplay from "@/components/CharacterDisplay";
import XPBar from "@/components/XPBar";
import type { CookingLog, UserProgress } from "@/types";

// storage の DEFAULT_PROGRESS 相当
const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  totalXP: 0,
  stamps: 0,
  cookingCount: 0,
};

export default function CharacterPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [logs, setLogs] = useState<CookingLog[]>([]);

  // localStorage 読み出しは useEffect 内
  useEffect(() => {
    setProgress(getProgress());
    // addLog は先頭追加なので getLogs 自体が新しい順だが、明示的に並べ替える
    setLogs(
      [...getLogs()].sort(
        (a, b) =>
          new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
      )
    );
  }, []);

  const stamps = Math.min(progress.stamps, STAMPS_PER_REWARD);
  const canRedeem = progress.stamps >= STAMPS_PER_REWARD;

  return (
    <main className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800">キャラクター</h1>

      {/* レベルと次までのXP */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <CharacterDisplay level={progress.level} size="lg" />
        <div className="mt-4">
          <XPBar totalXP={progress.totalXP} />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          次のレベルまで あと{xpToNextLevel(progress.totalXP)} XP
        </p>
      </section>

      {/* スタンプカード */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-800">スタンプカード</h2>
        <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: STAMPS_PER_REWARD }, (_, i) => {
              const filled = i < stamps;
              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-full border-2 text-lg ${
                    filled
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-dashed border-slate-300 text-slate-300"
                  }`}
                  aria-label={filled ? "獲得済みスタンプ" : "未獲得スタンプ"}
                >
                  {filled ? "⭐" : i + 1}
                </div>
              );
            })}
          </div>
          {canRedeem ? (
            <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-center text-sm font-semibold text-amber-700">
              🎁 特典と交換できます！
            </p>
          ) : (
            <p className="mt-4 text-center text-xs text-slate-500">
              あと{STAMPS_PER_REWARD - progress.stamps}個で特典と交換できます
            </p>
          )}
        </div>
      </section>

      {/* 過去の料理記録一覧 */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-800">料理の記録</h2>
        {logs.length === 0 ? (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            まだ料理の記録がありません。料理を記録してXPを貯めましょう！
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                {log.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={log.photoUrl}
                    alt={log.dishName}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-2xl">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {log.dishName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(log.cookedAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  +{log.xpEarned} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
