"use client";

import { useEffect, useState } from "react";
import {
  notifySupported,
  getPermission,
  isEnabled,
  setEnabled,
  enableNotifications,
  notifyExpiring,
} from "@/lib/notify";
import type { FoodItem } from "@/types";

interface NotifyToggleProps {
  /** 通知プレビューに使う冷蔵庫の中身 */
  items: FoodItem[];
}

/** 期限アラート通知のオプトインカード */
export default function NotifyToggle({ items }: NotifyToggleProps) {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setPerm(getPermission());
    setOn(isEnabled() && getPermission() === "granted");
  }, []);

  async function handleEnable() {
    setBusy(true);
    setMsg(null);
    const ok = await enableNotifications();
    setPerm(getPermission());
    setOn(ok);
    if (ok) {
      const sent = await notifyExpiring(items, true);
      setMsg(
        sent
          ? "通知を送りました📩 ロック画面を確認してね"
          : "オンにしました。期限が近い食材ができたらお知らせします"
      );
    } else if (getPermission() === "denied") {
      setMsg("ブラウザの設定で通知がブロックされています");
    }
    setBusy(false);
  }

  function handleDisable() {
    setEnabled(false);
    setOn(false);
    setMsg(null);
  }

  if (!notifySupported() || perm === "unsupported") return null;

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-black/5 bg-white p-4 shadow-card">
      <span className="text-2xl" aria-hidden>
        🔔
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">期限が近い食材を通知</p>
        <p className="text-xs text-ink-soft">
          {msg ?? "腐らせる前にお知らせ。アプリを開いた時に1日1回まで。"}
        </p>
      </div>
      {on ? (
        <button
          type="button"
          onClick={handleDisable}
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white"
        >
          ON
        </button>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={busy || perm === "denied"}
          className="btn-ghost shrink-0 px-3 py-2 text-xs"
        >
          {busy ? "…" : perm === "denied" ? "ブロック中" : "オンにする"}
        </button>
      )}
    </div>
  );
}
