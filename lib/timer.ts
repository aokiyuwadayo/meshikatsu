// ============================================================
// 料理タイマー
// 「料理中の放置」を経験値に変える仕組み。
// XPバランス: タイマー完走 = 分数×1 XP（上限30）/ 料理の記録 = +50 XP（メイン）。
// タイマーは控えめ・記録が主役、の二段構えで二重取り感を避ける。
// endsAt を localStorage に保存するのでアプリを閉じても進行する。
// ============================================================

const KEY = "meshikatsu:cookingTimer";

export interface CookingTimerState {
  startedAt: string; // ISO
  endsAt: string; // ISO
  minutes: number;
}

/** タイマー完走で得られるXP（分数×1、上限30） */
export function timerXP(minutes: number): number {
  return Math.min(30, Math.max(1, Math.round(minutes)));
}

export function getTimer(): CookingTimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CookingTimerState) : null;
  } catch {
    return null;
  }
}

/** タイマー開始（同時に1本だけ） */
export function startTimer(minutes: number): CookingTimerState {
  const m = Math.min(180, Math.max(1, Math.round(minutes)));
  const now = new Date();
  const ends = new Date(now.getTime() + m * 60_000);
  const t: CookingTimerState = {
    startedAt: now.toISOString(),
    endsAt: ends.toISOString(),
    minutes: m,
  };
  localStorage.setItem(KEY, JSON.stringify(t));
  return t;
}

/** タイマー破棄（キャンセル・受け取り後の両方で使う） */
export function clearTimer(): void {
  localStorage.removeItem(KEY);
}

// ---- 受け取り直後の「記録で+50XP」導線をリロード後も保つためのマーカー ----

const CLAIM_KEY = "meshikatsu:timerClaim";
const CLAIM_TTL_MS = 30 * 60_000; // 30分

/** 受け取りを記録（XPと時刻） */
export function markClaimed(xp: number): void {
  localStorage.setItem(CLAIM_KEY, JSON.stringify({ xp, at: Date.now() }));
}

/** 30分以内の受け取りがあれば返す（リロード後の導線表示用） */
export function getRecentClaim(): { xp: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLAIM_KEY);
    if (!raw) return null;
    const { xp, at } = JSON.parse(raw) as { xp: number; at: number };
    if (Date.now() - at > CLAIM_TTL_MS) {
      localStorage.removeItem(CLAIM_KEY);
      return null;
    }
    return { xp };
  } catch {
    return null;
  }
}

/** 導線を消す（料理を記録したとき） */
export function clearClaim(): void {
  localStorage.removeItem(CLAIM_KEY);
}
