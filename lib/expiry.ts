// ============================================================
// 消費期限の緊急度判定（/fridge の色分け・ホームのアラートで使用）
// ============================================================

import type { ExpiryStatus, FoodItem } from "@/types";

/** 今日(0時)を基準に、期限まであと何日かを返す（過ぎていれば負の値） */
export function daysUntilExpiry(expiryDate: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = new Date(expiryDate);
  const expiryDay = new Date(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate()
  );
  const ms = expiryDay.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * 期限ステータス:
 *   expired = 期限切れ / urgent = 0〜2日 / warn = 3〜5日 / safe = 6日以上
 */
export function expiryStatus(expiryDate: string, now = new Date()): ExpiryStatus {
  const d = daysUntilExpiry(expiryDate, now);
  if (d < 0) return "expired";
  if (d <= 2) return "urgent";
  if (d <= 5) return "warn";
  return "safe";
}

/** ステータス→Tailwind クラス（バッジ用） */
export function statusClasses(status: ExpiryStatus): string {
  switch (status) {
    case "expired":
      return "bg-gray-200 text-gray-600 border-gray-300";
    case "urgent":
      return "bg-red-100 text-red-700 border-red-300";
    case "warn":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "safe":
      return "bg-green-100 text-green-700 border-green-300";
  }
}

/** ステータス→日本語ラベル */
export function statusLabel(expiryDate: string, now = new Date()): string {
  const d = daysUntilExpiry(expiryDate, now);
  if (d < 0) return `${Math.abs(d)}日超過`;
  if (d === 0) return "今日まで";
  return `あと${d}日`;
}

/** 期限が近い順にソート（ホームのアラート用） */
export function sortByExpiry(items: FoodItem[]): FoodItem[] {
  return [...items].sort(
    (a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate)
  );
}
