// ============================================================
// 共有フィードのバックエンド（Supabase / PostgREST をブラウザから直接叩く）
// 静的ホスティング（GitHub Pages）でも動くよう、サーバを介さず REST を fetch する。
// anon キーは公開前提（RLS で保護）。env が無ければ remote 無効＝サンプルにフォールバック。
//   設定方法: docs/db/FEED-DB-SETUP.md
// ============================================================

import type { FeedPost, FeedKind } from "@/lib/feed";

// ビルド時に inline される公開用 env（NEXT_PUBLIC_*）
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase が設定済みか（＝本物の共有フィードが使えるか） */
export const FEED_REMOTE = Boolean(SB_URL && SB_KEY);

const KINDS: FeedKind[] = ["cook", "rescue", "levelup", "plan", "zeroloss"];

function headers(): Record<string, string> {
  return {
    apikey: SB_KEY as string,
    Authorization: `Bearer ${SB_KEY}`,
  };
}

/** Supabase の行（snake_case）→ FeedPost（camelCase） */
function mapRow(r: Record<string, unknown>): FeedPost {
  const kind = String(r.kind ?? "cook");
  return {
    id: String(r.id ?? ""),
    userName: String(r.user_name ?? "ゲスト"),
    avatar: String(r.avatar ?? "😋"),
    kind: (KINDS as string[]).includes(kind) ? (kind as FeedKind) : "cook",
    text: String(r.text ?? ""),
    photoUrl: r.photo_url ? String(r.photo_url) : undefined,
    createdAt: String(r.created_at ?? new Date().toISOString()),
    likes: Number(r.likes ?? 0),
  };
}

/** 新しい順に投稿を取得（remote 未設定なら空配列） */
export async function fetchRemotePosts(): Promise<FeedPost[]> {
  if (!FEED_REMOTE) return [];
  const res = await fetch(
    `${SB_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=100`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`feed fetch failed: ${res.status}`);
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export interface NewPost {
  userName: string;
  avatar?: string;
  kind?: FeedKind;
  text: string;
  photoUrl?: string; // 縮小済み data URL または http URL
}

/** 投稿を作成（remote 未設定なら false を返すだけ＝ローカルは別途保存済み） */
export async function createRemotePost(p: NewPost): Promise<boolean> {
  if (!FEED_REMOTE) return false;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/posts`, {
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_name: p.userName || "ゲスト",
        avatar: p.avatar || "😋",
        kind: p.kind || "cook",
        text: p.text,
        photo_url: p.photoUrl || null,
        likes: 0,
      }),
    });
    return res.ok;
  } catch {
    return false; // 共有に失敗してもアプリは止めない
  }
}

// ============================================================
// コメント
// ============================================================

export interface PostComment {
  id: string;
  postId: string;
  userName: string;
  text: string;
  createdAt: string;
}

function mapCommentRow(r: Record<string, unknown>): PostComment {
  return {
    id: String(r.id ?? ""),
    postId: String(r.post_id ?? ""),
    userName: String(r.user_name ?? "ゲスト"),
    text: String(r.text ?? ""),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

/**
 * 表示中の投稿ぶんのコメントをまとめて取得（postId → コメント配列）。
 * comments テーブル未作成・通信失敗時は空オブジェクト（コメント0件扱い）。
 */
export async function fetchRemoteComments(
  postIds: string[]
): Promise<Record<string, PostComment[]>> {
  if (!FEED_REMOTE || postIds.length === 0) return {};
  try {
    const ids = postIds.join(",");
    const res = await fetch(
      `${SB_URL}/rest/v1/comments?post_id=in.(${ids})&order=created_at.asc&limit=500`,
      { headers: headers(), cache: "no-store" }
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as Record<string, unknown>[];
    const byPost: Record<string, PostComment[]> = {};
    for (const row of rows) {
      const c = mapCommentRow(row);
      (byPost[c.postId] ??= []).push(c);
    }
    return byPost;
  } catch {
    return {};
  }
}

/** コメントを作成 */
export async function createRemoteComment(p: {
  postId: string;
  userName: string;
  text: string;
}): Promise<boolean> {
  if (!FEED_REMOTE) return false;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/comments`, {
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        post_id: p.postId,
        user_name: p.userName || "ゲスト",
        text: p.text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
