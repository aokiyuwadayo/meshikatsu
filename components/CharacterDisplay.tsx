"use client";

import { stageFromLevel, STAGES } from "@/lib/xp";
import StageArt from "@/components/character/StageArt";

interface CharacterDisplayProps {
  level: number;
  /** 表示サイズ（lg=大きめ / md=小さめ） */
  size?: "md" | "lg";
  /** SVGアートの代わりに絵文字で表示する（軽量フォールバック） */
  emojiOnly?: boolean;
}

/** 現在レベルに対応するキャラクター（SVGアート＋名前＋進化プログレス）を表示 */
export default function CharacterDisplay({
  level,
  size = "lg",
  emojiOnly = false,
}: CharacterDisplayProps) {
  const stage = stageFromLevel(level);
  const artSize = size === "lg" ? 150 : 72;
  const emojiClass = size === "lg" ? "text-7xl" : "text-4xl";
  // 次の進化（最終形なら undefined）
  const nextStage = STAGES.find((s) => s.stage === stage.stage + 1);

  return (
    <div className="flex flex-col items-center">
      {emojiOnly ? (
        <div className={`${emojiClass} leading-none`} aria-hidden>
          {stage.emoji}
        </div>
      ) : (
        <StageArt stage={stage.stage} size={artSize} />
      )}
      <div className="mt-2 text-center">
        <p className="text-base font-bold text-ink">{stage.name}</p>
        <p className="text-xs font-semibold text-ink-soft">Lv.{level}</p>
      </div>

      {/* 進化プログレス（lg のみ）: ●●●○○ ＋ 次の進化まで */}
      {size === "lg" && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            {STAGES.map((s) => (
              <span
                key={s.stage}
                className={`block rounded-full transition-all ${
                  s.stage < stage.stage
                    ? "h-2 w-2 bg-brand/40"
                    : s.stage === stage.stage
                      ? "h-2.5 w-2.5 bg-brand"
                      : "h-2 w-2 bg-ink/10"
                }`}
                title={s.name}
              />
            ))}
          </div>
          {nextStage ? (
            <p className="text-[11px] font-semibold text-accent">
              次の進化「{nextStage.name}」まで あとLv.{nextStage.minLevel - level}
            </p>
          ) : (
            <p className="text-[11px] font-semibold text-accent">✨ 最終進化！</p>
          )}
        </div>
      )}
    </div>
  );
}
