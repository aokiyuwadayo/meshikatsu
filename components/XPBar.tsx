"use client";

import {
  levelProgressRatio,
  xpIntoLevel,
  xpToNextLevel,
  isMaxLevel,
  XP_PER_LEVEL,
  LEVEL_CAP,
} from "@/lib/xp";

interface XPBarProps {
  totalXP: number;
  /** ラベル（"あとXXP" など）を表示するか */
  showLabel?: boolean;
}

/** 経験値バー。現在レベル内の進捗を 0〜100% で表示（Lv.99 でカンスト） */
export default function XPBar({ totalXP, showLabel = true }: XPBarProps) {
  const ratio = levelProgressRatio(totalXP);
  const into = xpIntoLevel(totalXP);
  const toNext = xpToNextLevel(totalXP);
  const maxed = isMaxLevel(totalXP);

  return (
    <div className="w-full">
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            maxed
              ? "bg-gradient-to-r from-gold to-accent"
              : "bg-gradient-to-r from-brand to-accent"
          }`}
          style={{ width: `${Math.max(4, Math.round(ratio * 100))}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-ink-soft">
          {maxed ? (
            <span className="mx-auto font-bold text-accent">
              🏅 Lv.{LEVEL_CAP} カンスト達成！（上限は今後のアプデで解放）
            </span>
          ) : (
            <>
              <span>
                {into} / {XP_PER_LEVEL} XP
              </span>
              <span>次のレベルまで {toNext} XP</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
