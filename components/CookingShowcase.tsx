"use client";

// ============================================================
// とくい料理ショーケース
// レベルに応じて作れる料理が上がっていく（Lv.1 卵焼き → Lv.50 ホールケーキ）。
// 湯気の立つお皿に現在の料理を表示し、次に解放される料理を予告して育成動機を作る。
// ============================================================

import { dishForLevel, nextDish, DISHES } from "@/lib/dishes";

export default function CookingShowcase({ level }: { level: number }) {
  const dish = dishForLevel(level);
  const next = nextDish(level);
  const unlocked = DISHES.filter((d) => d.minLevel <= level).length;

  return (
    <div className="mt-4 rounded-2xl border border-ink/[0.08] bg-white/70 p-4">
      <p className="text-center text-[11px] font-semibold tracking-widest text-brand">
        SPECIALITY
      </p>
      <div className="mt-1 flex items-center justify-center gap-3">
        {/* お皿＋湯気＋料理 */}
        <div className="relative flex h-20 w-24 items-end justify-center">
          {/* 湯気 */}
          <svg
            viewBox="0 0 40 24"
            className="absolute top-0 left-1/2 h-6 w-10 -translate-x-1/2"
            aria-hidden
          >
            {[
              { x: 13, delay: "0s" },
              { x: 20, delay: "0.6s" },
              { x: 27, delay: "1.2s" },
            ].map((p, i) => (
              <path
                key={i}
                d={`M${p.x} 22 q2 -3 0 -6 q-2 -3 0 -6`}
                fill="none"
                stroke="#B9C7C4"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0"
              >
                <animate attributeName="opacity" values="0;0.8;0" dur="1.8s" begin={p.delay} repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0 3; 0 -6" dur="1.8s" begin={p.delay} repeatCount="indefinite" />
              </path>
            ))}
          </svg>
          {/* 料理（emoji） */}
          <span className="relative z-10 mb-2 text-4xl leading-none" aria-hidden>
            {dish.emoji}
          </span>
          {/* お皿 */}
          <svg viewBox="0 0 96 20" className="absolute bottom-0 w-full" aria-hidden>
            <ellipse cx="48" cy="10" rx="44" ry="8" fill="#FFFFFF" stroke="#E3E8E6" strokeWidth="1.5" />
            <ellipse cx="48" cy="9" rx="30" ry="5" fill="#F2F5F4" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-ink-soft">いま作れる代表料理</p>
          <p className="text-lg font-bold text-ink">{dish.name}</p>
          <p className="text-[11px] font-semibold text-ink-soft/70">
            レパートリー {unlocked}/{DISHES.length}
          </p>
        </div>
      </div>
      {/* 次の料理の予告（育成動機） */}
      <p className="mt-2 text-center text-[11px] font-semibold text-accent">
        {next
          ? `Lv.${next.minLevel} で「${next.name} ${next.emoji}」が作れるようになる！`
          : "✨ 全ての料理をマスターした！"}
      </p>
    </div>
  );
}
