"use client";

// 担当: エンジニアA（キャラクター詳細 /character）
// docs/tasks/A-home-character.md の受け入れ条件に対応

import { useEffect, useState } from "react";
import { getProgress, getLogs } from "@/lib/storage";
import { xpToNextLevel, STAMPS_PER_REWARD, STAGES, stageFromLevel } from "@/lib/xp";
import CharacterDisplay from "@/components/CharacterDisplay";
import XPBar from "@/components/XPBar";
import StageArt from "@/components/character/StageArt";
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
  const [coupon, setCoupon] = useState<string | null>(null);

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
  const currentStage = stageFromLevel(progress.level);

  function handleRedeem() {
    // MVP: クーポンコードを発行して表示（提携店で提示する想定）
    const code = `MESHI-${String(progress.totalXP).padStart(4, "0")}-${progress.stamps}`;
    setCoupon(code);
  }

  return (
    <main className="page">
      <h1 className="page-title">⭐ キャラクター</h1>

      {/* レベルと次までのXP */}
      <section className="mt-4 overflow-hidden rounded-4xl bg-gradient-to-b from-brand-light to-white p-6 shadow-card">
        <CharacterDisplay level={progress.level} size="lg" />
        <div className="mt-5">
          <XPBar totalXP={progress.totalXP} />
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-ink-soft">
          次のレベルまで あと{xpToNextLevel(progress.totalXP)} XP
        </p>
      </section>

      {/* 成長ロードマップ（5段階） */}
      <section className="mt-6">
        <h2 className="section-title">🌱 成長ロードマップ</h2>
        <div className="flex items-end justify-between gap-1 rounded-3xl border border-black/5 bg-white p-4 shadow-card">
          {STAGES.map((s) => {
            const reached = progress.level >= s.minLevel;
            const isCurrent = s.stage === currentStage.stage;
            return (
              <div
                key={s.stage}
                className={`flex flex-1 flex-col items-center text-center transition ${
                  reached ? "" : "opacity-30 grayscale"
                }`}
              >
                <div className={isCurrent ? "animate-float-slow" : ""}>
                  <StageArt stage={s.stage} size={isCurrent ? 52 : 40} />
                </div>
                <p
                  className={`mt-1 text-[9px] font-bold leading-tight ${
                    isCurrent ? "text-brand" : "text-ink-soft"
                  }`}
                >
                  Lv.{s.minLevel}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* スタンプカード */}
      <section className="mt-6">
        <h2 className="section-title">🎟 スタンプカード</h2>
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-card">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: STAMPS_PER_REWARD }, (_, i) => {
              const filled = i < stamps;
              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-full border-2 text-lg font-black ${
                    filled
                      ? "animate-stamp-in border-brand bg-brand-light text-brand"
                      : "border-dashed border-ink/20 text-ink-soft/40"
                  }`}
                  aria-label={filled ? "獲得済みスタンプ" : "未獲得スタンプ"}
                >
                  {filled ? "⭐" : i + 1}
                </div>
              );
            })}
          </div>

          {canRedeem ? (
            coupon ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-gold bg-gold/10 p-4 text-center">
                <p className="text-xs font-bold text-ink-soft">クーポンコード</p>
                <p className="mt-1 text-xl font-black tracking-widest text-ink">
                  {coupon}
                </p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  提携店でこの画面を見せてください 🎁
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRedeem}
                className="btn-accent mt-4 w-full"
              >
                🎁 特典と交換する
              </button>
            )
          ) : (
            <p className="mt-4 text-center text-xs font-semibold text-ink-soft">
              あと{STAMPS_PER_REWARD - progress.stamps}個で特典と交換できます
            </p>
          )}
        </div>
      </section>

      {/* 過去の料理記録一覧 */}
      <section className="mt-6">
        <h2 className="section-title">📖 料理の記録</h2>
        {logs.length === 0 ? (
          <p className="card-soft text-sm text-ink-soft">
            まだ料理の記録がありません。料理を記録してXPを貯めましょう！
          </p>
        ) : (
          <ul className="space-y-2.5">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-card"
              >
                {log.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={log.photoUrl}
                    alt={log.dishName}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">
                    {log.dishName}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {new Date(log.cookedAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-black text-brand">
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
