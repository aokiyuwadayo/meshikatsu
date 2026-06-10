-- ============================================================
-- メシ活: 共有フィード（みんなの投稿）
-- Supabase の SQL Editor に貼り付けて「Run」してください。
-- ログイン無しの MVP：匿名で誰でも閲覧・投稿できます（RLS で SELECT/INSERT のみ許可）。
-- ============================================================

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_name   text not null default 'ゲスト',
  avatar      text not null default '😋',
  kind        text not null default 'cook',   -- cook | rescue | levelup | plan | zeroloss
  text        text not null,
  photo_url   text,
  likes       int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

-- 誰でも閲覧できる
drop policy if exists "posts readable by everyone" on public.posts;
create policy "posts readable by everyone"
  on public.posts for select
  using (true);

-- 誰でも投稿できる（匿名 MVP）。荒らし対策が必要になったら認証＋所有者チェックに差し替える。
drop policy if exists "anyone can insert posts" on public.posts;
create policy "anyone can insert posts"
  on public.posts for insert
  with check (true);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- ============================================================
-- コメント（投稿への返信）
-- ============================================================

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_name   text not null default 'ゲスト',
  text        text not null,
  created_at  timestamptz not null default now()
);

alter table public.comments enable row level security;

drop policy if exists "comments readable by everyone" on public.comments;
create policy "comments readable by everyone"
  on public.comments for select
  using (true);

drop policy if exists "anyone can insert comments" on public.comments;
create policy "anyone can insert comments"
  on public.comments for insert
  with check (true);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

-- ============================================================
-- いいね（永続・共有）
-- ============================================================

create table if not exists public.post_likes (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  client      text not null,            -- 端末の表示名（匿名 MVP の識別子）
  created_at  timestamptz not null default now(),
  unique (post_id, client)              -- 同じ人の二重いいねを防ぐ
);

alter table public.post_likes enable row level security;

drop policy if exists "likes readable by everyone" on public.post_likes;
create policy "likes readable by everyone"
  on public.post_likes for select
  using (true);

drop policy if exists "anyone can like" on public.post_likes;
create policy "anyone can like"
  on public.post_likes for insert
  with check (true);

drop policy if exists "anyone can unlike" on public.post_likes;
create policy "anyone can unlike"
  on public.post_likes for delete
  using (true);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
