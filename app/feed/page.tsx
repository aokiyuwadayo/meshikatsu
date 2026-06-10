"use client";

// コミュニティフィード（みんなの食ログ）
// 投稿は中央の「投稿」タブ（/cook）から行い、ここに流れてくる。
// 各投稿にコメントを付けられる（共有DB接続時のみ）。
// Supabase 設定時は本物の共有フィード、未設定時はサンプルにフォールバック。

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import { loadFeed, timeAgo, KIND_BADGE, type FeedPost } from "@/lib/feed";
import {
  FEED_REMOTE,
  fetchRemoteComments,
  createRemoteComment,
  fetchRemoteLikes,
  toggleRemoteLike,
  type PostComment,
} from "@/lib/posts";
import { getClientName } from "@/lib/profile";

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  // 追加いいね数（DBの post_likes 由来。表示 = posts.likes + これ）
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // コメント: postId → コメント配列 / 開閉状態 / 入力中テキスト
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    const res = await loadFeed();
    setPosts(res.posts);
    setRemote(res.remote);
    setLoading(false);
    if (res.remote) {
      const ids = res.posts.map((p) => p.id);
      // コメントといいねをまとめて取得
      const [map, likes] = await Promise.all([
        fetchRemoteComments(ids),
        fetchRemoteLikes(ids, getClientName()),
      ]);
      setComments(map);
      setLikeCounts(likes.counts);
      const mine: Record<string, boolean> = {};
      likes.mine.forEach((id) => (mine[id] = true));
      setLiked(mine);
    }
    setRefreshing(false);
  }

  useEffect(() => {
    refresh();
    // タブに戻ってきたら新着を取りに行く
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleLike(id: string) {
    const next = !liked[id];
    setLiked((prev) => ({ ...prev, [id]: next }));
    if (remote) {
      // 楽観的にカウントを増減し、裏でDBへ反映（永続いいね）
      setLikeCounts((prev) => ({
        ...prev,
        [id]: Math.max(0, (prev[id] ?? 0) + (next ? 1 : -1)),
      }));
      void toggleRemoteLike(id, getClientName(), next);
    }
  }

  function toggleComments(id: string) {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function submitComment(postId: string) {
    const text = (drafts[postId] ?? "").trim();
    if (!text || sending[postId]) return;
    setSending((prev) => ({ ...prev, [postId]: true }));
    const me = getClientName();
    const ok = await createRemoteComment({ postId, userName: me, text });
    setSending((prev) => ({ ...prev, [postId]: false }));
    if (ok) {
      // 楽観的にローカルへ追加（再フェッチ不要でサクサク）
      const newComment: PostComment = {
        id: `local-${Date.now()}`,
        postId,
        userName: me,
        text,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), newComment],
      }));
      setDrafts((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  return (
    <main className="page">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand">FEED</p>
          <h1 className="page-title">フィード</h1>
          <p className="page-sub">みんなの食ログ。今日もどこかで誰かがロスを減らしてる。</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          aria-label="フィードを更新"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/[0.12] bg-white text-base text-ink-soft transition-colors hover:bg-cream disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""} aria-hidden>
            ↻
          </span>
        </button>
      </header>

      {loading ? (
        <p className="mt-10 text-center text-sm text-ink-soft">読み込み中…</p>
      ) : (
        <ul className="space-y-2.5">
          {posts.map((p, idx) => {
            const isLiked = liked[p.id];
            // remote: 永続いいね数（DB）/ フォールバック: ローカル+1 のみ
            const likeCount = remote
              ? p.likes + (likeCounts[p.id] ?? 0)
              : p.likes + (isLiked ? 1 : 0);
            const postComments = comments[p.id] ?? [];
            const isOpen = openComments[p.id];
            return (
              <Fragment key={p.id}>
              <li
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
                    className="mt-3 max-h-64 w-full rounded-xl object-cover"
                  />
                )}

                {/* アクション: いいね + コメント */}
                <div className="mt-3 flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => toggleLike(p.id)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      isLiked ? "text-accent" : "text-ink-soft/60 hover:text-ink-soft"
                    }`}
                    aria-pressed={isLiked}
                  >
                    <span>{isLiked ? "❤️" : "🤍"}</span>
                    {likeCount}
                  </button>
                  {remote && (
                    <button
                      type="button"
                      onClick={() => toggleComments(p.id)}
                      className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                        isOpen ? "text-brand" : "text-ink-soft/60 hover:text-ink-soft"
                      }`}
                      aria-expanded={isOpen}
                    >
                      <span aria-hidden>💬</span>
                      {postComments.length > 0 ? postComments.length : "コメント"}
                    </button>
                  )}
                </div>

                {/* コメント欄（開いたとき） */}
                {remote && isOpen && (
                  <div className="mt-3 border-t border-ink/[0.07] pt-3">
                    {postComments.length > 0 && (
                      <ul className="space-y-2">
                        {postComments.map((c) => (
                          <li key={c.id} className="rounded-xl bg-cream px-3 py-2">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-xs font-semibold text-ink">
                                {c.userName}
                              </p>
                              <p className="shrink-0 text-[10px] text-ink-soft/60">
                                {timeAgo(c.createdAt)}
                              </p>
                            </div>
                            <p className="mt-0.5 text-sm leading-relaxed text-ink">
                              {c.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* 入力欄 */}
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={drafts[p.id] ?? ""}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                            submitComment(p.id);
                          }
                        }}
                        placeholder="コメントする…"
                        maxLength={140}
                        className="min-w-0 flex-1 rounded-xl border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                      <button
                        type="button"
                        onClick={() => submitComment(p.id)}
                        disabled={!(drafts[p.id] ?? "").trim() || sending[p.id]}
                        className="shrink-0 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
                      >
                        送信
                      </button>
                    </div>
                  </div>
                )}
              </li>
              {/* 3投稿目の後にスポンサー枠（ネイティブ広告） */}
              {idx === 2 && <AdBanner />}
              </Fragment>
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
