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
