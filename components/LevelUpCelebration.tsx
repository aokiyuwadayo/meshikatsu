"use client";

import { stageFromLevel } from "@/lib/xp";
import StageArt from "@/components/character/StageArt";

interface LevelUpCelebrationProps {
  /** 到達した新しいレベル。null なら非表示 */
  level: number | null;
  /** このレベルアップでキャラの「姿」が変わったか */
  newStage?: boolean;
  onClose: () => void;
}

/**
 * レベルアップ時の全画面お祝い演出。
 * 料理記録・レシート・使い切りで XP を得てレベルが上がった瞬間に表示する。
 */
export default function LevelUpCelebration({
  level,
  newStage = false,
  onClose,
}: LevelUpCelebrationProps) {
  if (level == null) return null;
  const stage = stageFromLevel(level);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 px-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="レベルアップ"
    >
      <div
        className="animate-pop-in relative w-full max-w-xs overflow-hidden rounded-4xl bg-gradient-to-b from-white to-cream p-8 text-center shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 後光バースト */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-burst h-48 w-48 rounded-full bg-gold/30" />
        </div>

        <p className="relative text-sm font-black tracking-widest text-accent">
          {newStage ? "✨ シンカ！ ✨" : "LEVEL UP!"}
        </p>

        <div className="relative mt-2 flex justify-center">
          <div className="animate-float-slow">
            <StageArt stage={stage.stage} size={132} />
          </div>
        </div>

        <p className="relative mt-2 text-3xl font-black text-ink">
          Lv.{level}
        </p>
        <p className="relative mt-1 text-sm font-bold text-brand">
          {stage.name}
        </p>
        {newStage && (
          <p className="relative mt-2 text-xs text-ink-soft">
            キャラクターが新しい姿に成長した！
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-primary relative mt-6 w-full"
        >
          つづける
        </button>
      </div>
    </div>
  );
}
