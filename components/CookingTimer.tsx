"use client";

// ============================================================
// 料理タイマー UI
// 開始 → キャラと一緒に調理中（カウントダウン）→ できあがりで XP 受け取り。
// 受け取り後は「写真を撮って記録 → さらに+50XP」へ誘導（記録がメインXP）。
// ============================================================

import { useEffect, useState } from "react";
import {
  getTimer,
  startTimer,
  clearTimer,
  timerXP,
  type CookingTimerState,
} from "@/lib/timer";
import { stageFromLevel, XP_REWARDS } from "@/lib/xp";
import StageArt from "@/components/character/StageArt";

const PRESETS = [5, 10, 15, 30];

interface CookingTimerProps {
  level: number;
  /** できあがりXPの受け取り（親側で applyXP・演出を行う） */
  onClaim: (xp: number) => void;
}

export default function CookingTimer({ level, onClaim }: CookingTimerProps) {
  const [timer, setTimer] = useState<CookingTimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [custom, setCustom] = useState("");
  const [claimedXP, setClaimedXP] = useState<number | null>(null);
  const [notified, setNotified] = useState(false);

  // マウント時に保存済みタイマーを復元 + 1秒ごとに時刻を進める
  useEffect(() => {
    setTimer(getTimer());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const endsAt = timer ? new Date(timer.endsAt).getTime() : 0;
  const remainMs = timer ? Math.max(0, endsAt - now) : 0;
  const isDone = Boolean(timer) && remainMs === 0;
  const totalMs = timer ? timer.minutes * 60_000 : 1;
  const progress = timer ? Math.min(1, 1 - remainMs / totalMs) : 0;

  // できあがった瞬間に通知（許可済みのときだけ）
  useEffect(() => {
    if (isDone && !notified) {
      setNotified(true);
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("メシ活 🍳", { body: "料理タイマー終了！できあがり〜" });
        }
      } catch {
        /* noop */
      }
    }
  }, [isDone, notified]);

  function handleStart(minutes: number) {
    setClaimedXP(null);
    setNotified(false);
    setTimer(startTimer(minutes));
  }

  function handleCancel() {
    clearTimer();
    setTimer(null);
  }

  function handleClaim() {
    if (!timer) return;
    const xp = timerXP(timer.minutes);
    clearTimer();
    setTimer(null);
    setClaimedXP(xp);
    onClaim(xp);
  }

  const mm = String(Math.floor(remainMs / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((remainMs % 60_000) / 1000)).padStart(2, "0");
  const stage = stageFromLevel(level).stage;

  return (
    <section className="card relative overflow-hidden">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        ⏲️ 料理タイマー
        <span className="ml-auto text-[11px] font-semibold text-ink-soft">
          完走で +1XP/分（最大+30）
        </span>
      </h2>

      {/* 状態1: 未開始 → プリセット選択 */}
      {!timer && claimedXP === null && (
        <div className="mt-3">
          <div className="flex gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleStart(m)}
                className="flex-1 rounded-xl border border-brand/40 bg-brand-light/40 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-light"
              >
                {m}分
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={180}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="自由入力（分）"
              className="field mt-0 flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const m = Number(custom);
                if (m >= 1) handleStart(m);
              }}
              disabled={!(Number(custom) >= 1)}
              className="btn-primary shrink-0"
            >
              スタート
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-soft">
            煮込み・炊飯のあいだは放置でOK。アプリを閉じても進みます。
          </p>
        </div>
      )}

      {/* 状態2: 調理中（カウントダウン＋キャラが並走） */}
      {timer && !isDone && (
        <div className="mt-3 flex items-center gap-4">
          <div className="shrink-0">
            <StageArt stage={stage} size={72} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-bold tabular-nums tracking-wider text-ink">
              {mm}:{ss}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cream">
              <div
                className="h-full rounded-full bg-brand transition-all duration-1000"
                style={{ width: `${Math.max(3, progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-ink-soft">
              キャラも一緒に調理中… 完走で +{timerXP(timer.minutes)} XP
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="shrink-0 self-start text-xs font-semibold text-ink-soft/60 hover:text-urgent"
          >
            中止
          </button>
        </div>
      )}

      {/* 状態3: できあがり → XP受け取り */}
      {timer && isDone && (
        <div className="mt-3 text-center">
          <div className="mx-auto w-fit animate-pop-in">
            <StageArt stage={stage} size={84} />
          </div>
          <p className="mt-1 text-lg font-bold text-ink">できあがり！🎉</p>
          <button
            type="button"
            onClick={handleClaim}
            className="btn-accent mt-3 w-full py-3 text-base"
          >
            +{timerXP(timer.minutes)} XP を受け取る
          </button>
        </div>
      )}

      {/* 状態4: 受け取り後 → 記録への導線（メインXP） */}
      {!timer && claimedXP !== null && (
        <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-accent-light/40 p-3 text-center">
          <p className="text-sm font-semibold text-ink">
            +{claimedXP} XP ゲット！
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            できた料理を下のフォームで記録すると、さらに{" "}
            <span className="font-bold text-accent">+{XP_REWARDS.cookPhoto} XP</span>{" "}
            🔥
          </p>
        </div>
      )}
    </section>
  );
}
