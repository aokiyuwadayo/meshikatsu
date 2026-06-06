// ============================================================
// localStorage ラッパー（MVP のデータ永続化レイヤー）
// SSR 中は window が無いので必ずガードする
// ============================================================

import type { FoodItem, CookingLog, UserProgress } from "@/types";

const KEYS = {
  fridge: "meshikatsu:fridge",
  logs: "meshikatsu:logs",
  progress: "meshikatsu:progress",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 容量超過などは無視（MVP）
  }
}

// ---- 簡易 ID 生成（crypto.randomUUID が無い環境のフォールバック付き） ----
export function genId(): string {
  if (isBrowser() && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// ---- 冷蔵庫（FoodItem[]） ----
export function getFridge(): FoodItem[] {
  return read<FoodItem[]>(KEYS.fridge, []);
}
export function saveFridge(items: FoodItem[]): void {
  write(KEYS.fridge, items);
}
export function addFoodItem(item: FoodItem): FoodItem[] {
  const next = [...getFridge(), item];
  saveFridge(next);
  return next;
}
export function removeFoodItem(id: string): FoodItem[] {
  const next = getFridge().filter((f) => f.id !== id);
  saveFridge(next);
  return next;
}

// ---- 料理記録（CookingLog[]） ----
export function getLogs(): CookingLog[] {
  return read<CookingLog[]>(KEYS.logs, []);
}
export function saveLogs(logs: CookingLog[]): void {
  write(KEYS.logs, logs);
}
export function addLog(log: CookingLog): CookingLog[] {
  const next = [log, ...getLogs()];
  saveLogs(next);
  return next;
}

// ---- ユーザー進捗（UserProgress） ----
const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  totalXP: 0,
  stamps: 0,
  cookingCount: 0,
};

export function getProgress(): UserProgress {
  return read<UserProgress>(KEYS.progress, DEFAULT_PROGRESS);
}
export function saveProgress(progress: UserProgress): void {
  write(KEYS.progress, progress);
}

/** デモ用：全データをリセット */
export function resetAll(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}
