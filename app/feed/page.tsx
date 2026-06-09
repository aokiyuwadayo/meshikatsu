"use client";

// コミュニティフィード（みんなの食ログ）
// Supabase 設定時は「本物の共有フィード」（全ユーザーの投稿がリアルに流れる）。
// 未設定時はサンプル投稿＋自分のローカル記録にフォールバックする。

import { useEffect, useState } from "react";
import { loadFeed, timeAgo, KIND_BADGE, type FeedPost } from "@/lib/feed";
import { getNickname, setNickname } from "@/lib/profile";
import { FEED_REMOTE, createRemotePost } from "@/lib/posts";

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  // 表示名（共有フィードで「誰の投稿か」を出すため）
  const [name, setName] = useState("");
  const [draft, setDraft] = useState(""); // 新規投稿の本文
  const [posting, setPosting] = useState(false);

  async function refresh() {
    const res = await loadFeed();
    setPosts(res.posts);
    setRemote(res.remote);
    setLoading(false);
  }

  useEffect(() => {
    setName(getNickname());
    refresh();
  }, []);

  function toggleLike(id: string) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function saveName(v: string) {
    setName(v);
    setNickname(v);
  }

  async function submitPost() {
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    const ok = await createRemotePost({
      userName: name.trim() || "ゲスト",
      text,
      kind: "cook",
    });
    setPosting(false);
    if (ok) {
      setDraft("");
      refresh(); // 投稿後に再読込してフィード先頭に反映
    }
  }

  return (
    <main className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800">フィード 👥</h1>
      <p className="mt-1 text-sm text-slate-500">
        みんなの食ログ。今日もどこかで誰かがロスを減らしてる。
      </p>

      {/* 共有フィードが有効なときだけ「表示名＋投稿」UIを出す */}
      {FEED_REMOTE && (
        <section className="mt-4 rounded-2xl border border-brand/20 bg-brand/5 p-3">
          <label className="block">
            <span className="text-[11px] font-bold text-brand">あなたの表示名</span>
            <input
              type="text"
              value={name}
              onChange={(e) => saveName(e.target.value)}
              placeholder="例：ゆうわ"
              maxLength={20}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="いま作ったもの・救った食材をシェア…"
            rows={2}
            maxLength={140}
            className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submitPost}
            disabled={!draft.trim() || posting}
            className="mt-2 w-full rounded-xl bg-brand py-2 text-sm font-black text-white transition active:scale-95 disabled:opacity-40"
          >
            {posting ? "投稿中…" : "みんなに投稿する"}
          </button>
        </section>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-slate-400">読み込み中…</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {posts.map((p) => {
            const isLiked = liked[p.id];
            const likeCount = p.likes + (isLiked ? 1 : 0);
            return (
              <li
                key={p.id}
                className={`rounded-2xl border p-4 ${
                  p.isSelf
                    ? "border-brand/30 bg-brand/5"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* ヘッダー: アバター + 名前 + 時刻 */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {p.avatar}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {p.userName}
                      {p.isSelf && (
                        <span className="ml-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                          あなた
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {timeAgo(p.createdAt)}
                    </p>
                  </div>
                  <span className="text-lg" aria-hidden title={p.kind}>
                    {KIND_BADGE[p.kind]}
                  </span>
                </div>

                {/* 本文 */}
                <p className="mt-2 text-sm text-slate-700">{p.text}</p>

                {/* 写真（あれば） */}
                {p.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt=""
                    className="mt-3 max-h-56 w-full rounded-lg object-cover"
                  />
                )}

                {/* いいね */}
                <button
                  type="button"
                  onClick={() => toggleLike(p.id)}
                  className={`mt-3 flex items-center gap-1 text-sm font-semibold transition-colors ${
                    isLiked ? "text-urgent" : "text-slate-400 hover:text-slate-600"
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

      {/* 状態の但し書き */}
      <p className="mt-6 text-center text-[11px] text-slate-300">
        {remote
          ? "✓ みんなの投稿がリアルタイムで共有されています"
          : "※ サンプルのコミュニティ投稿を表示中（共有DB未接続）"}
      </p>
    </main>
  );
}
