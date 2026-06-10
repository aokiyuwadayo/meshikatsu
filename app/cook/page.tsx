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
import { applyXP, XP_REWARDS, stageFromLevel } from "@/lib/xp";
import LevelUpCelebration from "@/components/LevelUpCelebration";
import CookingTimer from "@/components/CookingTimer";
import { createRemotePost } from "@/lib/posts";
import { getClientName } from "@/lib/profile";
import { compressImage } from "@/lib/image";
import type { CookingLog } from "@/types";

export default function CookPage() {
  // 入力フォームの状態
  const [dishName, setDishName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  // 過去の料理記録（新しい順）
  const [logs, setLogs] = useState<CookingLog[]>([]);
  // 「+50 XP!」アニメの表示トグル
  const [showXP, setShowXP] = useState(false);
  // レベルアップお祝い
  const [levelUp, setLevelUp] = useState<{ level: number; newStage: boolean } | null>(null);
  // タイマーの「一緒に調理中」キャラ表示用
  const [level, setLevel] = useState(1);

  // ファイル選択 input をリセットするための参照
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localStorage の読み出しは必ず useEffect 内で（SSR / ハイドレーション対策）
  useEffect(() => {
    setLogs(getLogs());
    setLevel(getProgress().level);
  }, []);

  /** タイマー完走XPの受け取り（料理回数は増やさない＝記録XPと役割分担） */
  function handleTimerClaim(xp: number) {
    const before = getProgress();
    const next = applyXP(before, xp, false);
    saveProgress(next);
    setLevel(next.level);
    if (next.level > before.level) {
      setLevelUp({
        level: next.level,
        newStage:
          stageFromLevel(next.level).stage !== stageFromLevel(before.level).stage,
      });
    }
  }

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

    // 1.5) 共有フィードにも投稿（Supabase 設定時のみ。未設定なら何もしない）
    //      写真は縮小してから添付（大きすぎる場合はテキストのみ）
    void (async () => {
      const shared = photoUrl ? await compressImage(photoUrl) : undefined;
      await createRemotePost({
        userName: getClientName(),
        text: `「${log.dishName}」を作りました！`,
        kind: "cook",
        photoUrl: shared,
      });
    })();

    // 2) XP を加算（incrementCooking=true で料理回数+1 → スタンプ再計算）
    const before = getProgress();
    const next = applyXP(before, XP_REWARDS.cookPhoto, true);
    saveProgress(next);
    setLevel(next.level);

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

    // 5) レベルが上がったらお祝い演出
    if (next.level > before.level) {
      setLevelUp({
        level: next.level,
        newStage:
          stageFromLevel(next.level).stage !== stageFromLevel(before.level).stage,
      });
    }
  }

  const canSave = dishName.trim().length > 0;

  return (
    <main className="page">
      <LevelUpCelebration
        level={levelUp?.level ?? null}
        newStage={levelUp?.newStage}
        onClose={() => setLevelUp(null)}
      />

      <header className="mb-5">
        <h1 className="page-title">🍳 料理を記録</h1>
        <p className="page-sub">作った料理を記録して、キャラクターを育てよう！</p>
      </header>

      {/* 料理タイマー（放置で +1XP/分・最大30） */}
      <div className="mb-4">
        <CookingTimer level={level} onClaim={handleTimerClaim} />
      </div>

      {/* 入力カード */}
      <section className="card relative">
        {/* 料理名 */}
        <label className="block">
          <span className="field-label">料理名</span>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="例：肉じゃが"
            className="field"
          />
        </label>

        {/* 写真アップロード */}
        <div className="mt-4">
          <span className="field-label">写真</span>
          <label className="mt-1 flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/15 bg-cream text-ink-soft transition hover:border-brand hover:text-brand">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="料理の写真プレビュー"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">📷 写真を撮る / 選ぶ</span>
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
          className="btn-accent mt-5 w-full py-3 text-base"
        >
          記録して +{XP_REWARDS.cookPhoto} XP
        </button>

        {/* XP獲得アニメーション（ふわっと上に浮かびながらフェードアウト） */}
        {showXP && (
          <div
            key={logs.length /* 記録ごとに再マウントして再生 */}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex justify-center"
          >
            <span className="animate-xp-pop text-3xl font-bold text-accent drop-shadow">
              +{XP_REWARDS.cookPhoto} XP!
            </span>
          </div>
        )}
      </section>

      {/* 過去の記録（新しい順） */}
      <section className="mt-8">
        <h2 className="section-title">これまでの料理</h2>
        {logs.length === 0 ? (
          <p className="card-soft text-sm text-ink-soft">
            まだ記録がありません。最初の一品を記録しよう！
          </p>
        ) : (
          <ul className="space-y-2.5">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-card"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream">
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
                  <p className="truncate font-bold text-ink">{log.dishName}</p>
                  <p className="text-xs text-ink-soft">
                    {new Date(log.cookedAt).toLocaleString("ja-JP", {
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent">
                  +{log.xpEarned}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
