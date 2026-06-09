# 共有フィードを本番化する（Supabase 設定手順）

メシ活の「フィード」を、サンプル表示から **本物の共有フィード**（みんなの投稿が実際に流れる）へ切り替える手順です。所要 5〜10 分・無料。

> 仕組み: 静的サイト（GitHub Pages）のブラウザから Supabase の REST API を直接呼びます。
> `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されていれば本物の共有フィード、
> 無ければ従来のサンプル表示にフォールバックします（アプリは絶対に壊れません）。

## 1. Supabase プロジェクトを作る
1. https://supabase.com にアクセス → GitHub などでサインイン（無料）
2. **New project** → 名前（例: `meshikatsu`）とデータベースパスワードを設定 → 作成
3. プロビジョニング完了まで 1〜2 分待つ

## 2. テーブルを作る
1. 左メニュー **SQL Editor** → **New query**
2. リポジトリの [`supabase/schema.sql`](../../supabase/schema.sql) の中身を貼り付け → **Run**
3. `posts` テーブルと RLS ポリシーが作成されます

## 3. URL と anon キーを取得
左メニュー **Project Settings → API** で以下をコピー:
- **Project URL**（例: `https://abcdxyz.supabase.co`）
- **Project API keys → `anon` `public`**（`eyJ...` で始まる長い文字列）

> anon キーは「公開してよい」キーです（RLS で保護されるため）。ブラウザに埋め込んで問題ありません。

## 4. キーを渡す → 反映
取得した **URL と anon キー** をこのチャットに貼ってください。こちらで GitHub Actions の
リポジトリ変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）に設定し、再デプロイします。
デプロイ後、フィードに「✓ みんなの投稿がリアルタイムで共有されています」と表示されれば本番化完了です。

## ローカルで試す場合
プロジェクト直下に `.env.local` を作成:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`npm run dev` で本物の共有フィードを確認できます。
