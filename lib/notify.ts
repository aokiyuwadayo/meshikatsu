// ============================================================
// 期限アラートの通知（PWA通知・サーバー不要のクライアント実装）
// 機能: 消費期限が近い食材をブラウザ通知。アプリ起動時に1日1回まで。
// ※ 端末が閉じている間のスケジュール配信には別途プッシュサーバが必要。
// ============================================================

import type { FoodItem } from "@/types";
import { daysUntilExpiry, sortByExpiry } from "@/lib/expiry";

const ENABLED_KEY = "meshikatsu:notifyEnabled";
const LAST_KEY = "meshikatsu:lastNotified";

/** 通知が使える環境か */
export function notifySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

/** 現在の許可状態（"default" | "granted" | "denied" | "unsupported"） */
export function getPermission(): NotificationPermission | "unsupported" {
  if (!notifySupported()) return "unsupported";
  return Notification.permission;
}

export function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ENABLED_KEY) === "1";
}
export function setEnabled(on: boolean): void {
  try {
    localStorage.setItem(ENABLED_KEY, on ? "1" : "0");
  } catch {
    /* noop */
  }
}

/** Service Worker を登録して registration を返す */
async function ensureRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

/** 通知を有効化（許可を求め、SW を登録）。成功で true */
export async function enableNotifications(): Promise<boolean> {
  if (!notifySupported()) return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  await ensureRegistration();
  setEnabled(true);
  return true;
}

/** 期限が近い食材（あと2日以内、または期限切れ）を抽出 */
export function expiringSoon(items: FoodItem[]): FoodItem[] {
  return sortByExpiry(items).filter((i) => daysUntilExpiry(i.expiryDate) <= 2);
}

/** 今日まだ通知していなければ true（1日1回スロットル） */
function canNotifyToday(): boolean {
  try {
    const today = new Date().toDateString();
    return localStorage.getItem(LAST_KEY) !== today;
  } catch {
    return true;
  }
}
function markNotifiedToday(): void {
  try {
    localStorage.setItem(LAST_KEY, new Date().toDateString());
  } catch {
    /* noop */
  }
}

/**
 * 期限が近い食材を通知する。
 * @param force true ならスロットルを無視（トグルON直後のプレビュー用）
 * 戻り値: 実際に通知を出したか
 */
export async function notifyExpiring(
  items: FoodItem[],
  force = false
): Promise<boolean> {
  if (getPermission() !== "granted") return false;
  if (!force && !canNotifyToday()) return false;

  const soon = expiringSoon(items);
  if (soon.length === 0) return false;

  const head = soon[0];
  const title =
    soon.length === 1
      ? `「${head.name}」の期限が近づいています`
      : `期限が近い食材が${soon.length}件あります`;
  const body =
    soon.length === 1
      ? "今日中に使い切って食品ロスゼロ＆XPゲット！"
      : `${soon.map((i) => i.name).slice(0, 3).join("・")} など。使い切ってXPを貯めよう`;

  const options: NotificationOptions = {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "meshikatsu-expiry",
    data: { url: "/fridge" },
  };

  const reg = await ensureRegistration();
  try {
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
    markNotifiedToday();
    return true;
  } catch {
    return false;
  }
}
