"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDone: () => void;
  /** 表示種別で色を変える */
  tone?: "success" | "info";
  duration?: number;
}

/** 画面上部にふわっと出る共通トースト。message が入ると表示、duration 後に自動で消える */
export default function Toast({
  message,
  onDone,
  tone = "success",
  duration = 2200,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(t);
  }, [message, duration, onDone]);

  if (!message) return null;

  const toneClass =
    tone === "success" ? "bg-brand text-white" : "bg-ink text-white";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`animate-toast-in max-w-[90%] rounded-full px-5 py-2.5 text-sm font-bold shadow-card ${toneClass}`}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
