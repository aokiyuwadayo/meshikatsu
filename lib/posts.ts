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

// ============================================================
// いいね（永続・共有）
// post_likes テーブル：誰（client名）がどの投稿にいいねしたかの1行。
// いいね数 = posts.likes（シード値）+ post_likes の件数。
// テーブル未作成時は空を返し、画面側はローカルいいねのまま動く。
// ============================================================

export interface LikesState {
  counts: Record<string, number>; // postId → 追加いいね数
  mine: Set<string>; // 自分がいいね済みの postId
}

/** 表示中の投稿ぶんのいいねをまとめて取得 */
export async function fetchRemoteLikes(
  postIds: string[],
  client: string
): Promise<LikesState> {
  const empty: LikesState = { counts: {}, mine: new Set() };
  if (!FEED_REMOTE || postIds.length === 0) return empty;
  try {
    const ids = postIds.join(",");
    const res = await fetch(
      `${SB_URL}/rest/v1/post_likes?post_id=in.(${ids})&select=post_id,client&limit=2000`,
      { headers: headers(), cache: "no-store" }
    );
    if (!res.ok) return empty;
    const rows = (await res.json()) as { post_id: string; client: string }[];
    const counts: Record<string, number> = {};
    const mine = new Set<string>();
    for (const r of rows) {
      counts[r.post_id] = (counts[r.post_id] ?? 0) + 1;
      if (r.client === client) mine.add(r.post_id);
    }
    return { counts, mine };
  } catch {
    return empty;
  }
}

/** いいねを付ける/外す（on=true で付与）。成功で true */
export async function toggleRemoteLike(
  postId: string,
  client: string,
  on: boolean
): Promise<boolean> {
  if (!FEED_REMOTE) return false;
  try {
    if (on) {
      const res = await fetch(`${SB_URL}/rest/v1/post_likes`, {
        method: "POST",
        headers: {
          ...headers(),
          "Content-Type": "application/json",
          // 二重いいね（unique 制約違反）は無視して成功扱いにする
          Prefer: "return=minimal,resolution=ignore-duplicates",
        },
        body: JSON.stringify({ post_id: postId, client }),
      });
      return res.ok;
    }
    const params = new URLSearchParams({
      post_id: `eq.${postId}`,
      client: `eq.${client}`,
    });
    const res = await fetch(`${SB_URL}/rest/v1/post_likes?${params}`, {
      method: "DELETE",
      headers: headers(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
