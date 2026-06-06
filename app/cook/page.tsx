"use client";

// 担当: エンジニアC（料理記録 /cook）
// 作った料理を写真付きで記録し、XP を獲得してキャラクターを育てる画面。
// docs/tasks/C-cook.md の受け入れ条件に従う。

import { useEffect, useRef, useState } from "react";
import {
  getProgress,
  saveProgress,
  addLog,
  getLogs,
  genId,
} from "@/lib/storage";
import { applyXP, XP_REWARDS } from "@/lib/xp";
import type { CookingLog } from "@/types";

export default function CookPage() {
  // 入力フォームの状態
  const [dishName, setDishName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  // 過去の料理記録（新しい順）
  const [logs, setLogs] = useState<CookingLog[]>([]);
  // 「+50 XP!」アニメの表示トグル
  const [showXP, setShowXP] = useState(false);

  // ファイル選択 input をリセットするための参照
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localStorage の読み出しは必ず useEffect 内で（SSR / ハイドレーション対策）
  useEffect(() => {
    setLogs(getLogs());
  }, []);

  // 写真を base64 data URL に変換して photoUrl に保持
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!dishName.trim()) return;

    // 1) 料理記録を保存
    const log: CookingLog = {
      id: genId(),
      dishName: dishName.trim(),
      photoUrl, // base64 data URL（未選択なら空文字）
      xpEarned: XP_REWARDS.cookPhoto,
      cookedAt: new Date().toISOString(),
    };
    const nextLogs = addLog(log);

    // 2) XP を加算（incrementCooking=true で料理回数+1 → スタンプ再計算）
    const next = applyXP(getProgress(), XP_REWARDS.cookPhoto, true);
    saveProgress(next);

    // 3) 一覧を更新してフォームをクリア
    setLogs(nextLogs);
    setDishName("");
    setPhotoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    // 4) 「+50 XP!」アニメを発火（一定時間後に消す）
    setShowXP(false);
    // 連続記録でも再発火させるため次フレームで true に
    requestAnimationFrame(() => setShowXP(true));
    window.setTimeout(() => setShowXP(false), 1500);
  }

  const canSave = dishName.trim().length > 0;

  return (
    <div className="app-shell mx-auto max-w-md px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">料理を記録</h1>
        <p className="mt-1 text-sm text-slate-500">
          作った料理を記録して、キャラクターを育てよう！
        </p>
      </header>

      {/* 入力カード */}
      <section className="relative rounded-2xl bg-white p-4 shadow-sm">
        {/* 料理名 */}
        <label className="block text-sm font-medium text-slate-700">
          料理名
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="例：肉じゃが"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>

        {/* 写真アップロード */}
        <div className="mt-4">
          <span className="block text-sm font-medium text-slate-700">写真</span>
          <label className="mt-1 flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-brand">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="料理の写真プレビュー"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm">📷 写真を撮る / 選ぶ</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        </div>

        {/* 記録ボタン */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="mt-5 w-full rounded-xl bg-brand py-3 text-base font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          記録して +{XP_REWARDS.cookPhoto} XP
        </button>

        {/* XP獲得アニメーション（ふわっと上に浮かびながらフェードアウト） */}
        {showXP && (
          <div
            key={logs.length /* 記録ごとに再マウントして再生 */}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex justify-center"
          >
            <span
              className="text-3xl font-extrabold text-brand drop-shadow"
              style={{ animation: "xp-pop 1.5s ease-out forwards" }}
            >
              +{XP_REWARDS.cookPhoto} XP!
            </span>
          </div>
        )}
      </section>

      {/* 過去の記録（新しい順） */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-800">これまでの料理</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">
            まだ記録がありません。最初の一品を記録しよう！
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {log.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={log.photoUrl}
                      alt={log.dishName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🍽️
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">
                    {log.dishName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.cookedAt).toLocaleString("ja-JP", {
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-brand">
                  +{log.xpEarned} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* XP獲得アニメ用 keyframes */}
      <style jsx>{`
        @keyframes xp-pop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          25% {
            opacity: 1;
            transform: translateY(0) scale(1.1);
          }
          60% {
            opacity: 1;
            transform: translateY(-8px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
