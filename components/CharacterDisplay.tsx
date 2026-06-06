"use client";

import { stageFromLevel } from "@/lib/xp";

interface CharacterDisplayProps {
  level: number;
  /** 絵文字のサイズ（Tailwind text-* クラス） */
  size?: "md" | "lg";
}

/** 現在レベルに対応するキャラクター（絵文字＋名前）を表示 */
export default function CharacterDisplay({
  level,
  size = "lg",
}: CharacterDisplayProps) {
  const stage = stageFromLevel(level);
  const emojiClass = size === "lg" ? "text-7xl" : "text-4xl";

  return (
    <div className="flex flex-col items-center">
      <div className={`${emojiClass} leading-none`} aria-hidden>
        {stage.emoji}
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-slate-800">{stage.name}</p>
        <p className="text-xs text-slate-500">
          Lv.{level} ・ ステージ{stage.stage}
        </p>
      </div>
    </div>
  );
}
