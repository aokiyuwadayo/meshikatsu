"use client";

// コミュニティフィード（みんなの食ログ）— 閲覧専用。
// 投稿は中央の「投稿」タブ（/cook）から行い、ここに流れてくる。
// Supabase 設定時は本物の共有フィード、未設定時はサンプルにフォールバック。

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadFeed, timeAgo, KIND_BADGE, type FeedPost } from "@/lib/feed";

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFeed().then((res) => {
      setPosts(res.posts);
      setRemote(res.remote);
      setLoading(false);
    });
  }, []);

  function toggleLike(id: string) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <main className="page">
      <header className="mb-4">
        <p className="text-xs font-semibold tracking-widest text-brand">FEED</p>
        <h1 className="page-title">フィード</h1>
        <p className="page-sub">みんなの食ログ。今日もどこかで誰かがロスを減らしてる。</p>
      </header>

      {loading ? (
        <p className="mt-10 text-center text-sm text-ink-soft">読み込み中…</p>
      ) : (
        <ul className="space-y-2.5">
          {posts.map((p) => {
            const isLiked = liked[p.id];
            const likeCount = p.likes + (isLiked ? 1 : 0);
            return (
              <li
                key={p.id}
                className={`rounded-2xl border bg-white p-4 ${
                  p.isSelf ? "border-brand/30 bg-brand-light/40" : "border-ink/[0.08]"
                }`}
              >
                {/* ヘッダー: アバター + 名前 + 時刻 */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" aria-hidden>
                    {p.avatar}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {p.userName}
                      {p.isSelf && (
                        <span className="ml-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                          あなた
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-ink-soft/70">
                      {timeAgo(p.createdAt)}
                    </p>
                  </div>
                  <span className="text-base opacity-70" aria-hidden title={p.kind}>
                    {KIND_BADGE[p.kind]}
                  </span>
                </div>

                {/* 本文 */}
                <p className="mt-2 text-sm leading-relaxed text-ink">{p.text}</p>

                {/* 写真（あれば） */}
                {p.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt=""
                    className="mt-3 max-h-56 w-full rounded-xl object-cover"
                  />
                )}

                {/* いいね */}
                <button
                  type="button"
                  onClick={() => toggleLike(p.id)}
                  className={`mt-3 flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isLiked ? "text-accent" : "text-ink-soft/60 hover:text-ink-soft"
                  }`}
                  aria-pressed={isLiked}
                >
                  <span>{isLiked ? "❤️" : "🤍"}</span>
                  {likeCount}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 投稿導線（中央の投稿タブへ） */}
      <Link
        href="/cook"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand-light/40 p-3.5 text-sm font-semibold text-brand"
      >
        ＋ 料理を投稿する
      </Link>

      {/* 状態の但し書き */}
      <p className="mt-4 text-center text-[11px] text-ink-soft/50">
        {remote
          ? "みんなの投稿がリアルタイムで共有されています"
          : "サンプルのコミュニティ投稿を表示中（共有DB未接続）"}
      </p>
    </main>
  );
}
