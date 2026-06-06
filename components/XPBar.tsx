"use client";

import { levelProgressRatio, xpIntoLevel, xpToNextLevel, XP_PER_LEVEL } from "@/lib/xp";

interface XPBarProps {
  totalXP: number;
  /** ラベル（"あとXXP" など）を表示するか */
  showLabel?: boolean;
}

/** 経験値バー。現在レベル内の進捗を 0〜100% で表示 */
export default function XPBar({ totalXP, showLabel = true }: XPBarProps) {
  const ratio = levelProgressRatio(totalXP);
  const into = xpIntoLevel(totalXP);
  const toNext = xpToNextLevel(totalXP);

  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>
            {into} / {XP_PER_LEVEL} XP
          </span>
          <span>次のレベルまで {toNext} XP</span>
        </div>
      )}
    </div>
  );
}
