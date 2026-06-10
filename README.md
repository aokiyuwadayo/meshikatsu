# メシ活 🍳 — ひとりの自炊を、みんなで続ける

一人暮らし大学生のための **料理意欲SNS**（Startup Weekend MVP）。
作った料理をシェアし、キャラクターを育てながら自炊を続ける。続くほど、食品ロスも自然と減る。

🔗 **ライブ**: https://aokiyuwadayo.github.io/meshikatsu/

## 主な機能
- 👥 **共有フィード** — みんなの食ログがリアルタイムで流れる（いいね・コメント・写真）
- 🍳 **料理の記録** — 写真つきで記録すると +50XP、フィードにも自動シェア
- ⏲️ **料理タイマー** — 煮込み中の放置で +1XP/分（最大+30）。アプリを閉じても進む
- ⭐ **キャラ育成** — 5段階進化（卵→ひよこ→一人前→マスター→神様）、Lv.99 カンスト
- 🍰 **とくい料理** — レベルで進化（Lv.1 卵焼き → Lv.50 ホールケーキ）
- 🧊 **冷蔵庫管理** — レシート撮影で食材登録（デモはモック解析）、期限アラート
- 📖 **レシピ発見** — スワイプで保存（左=保存 / 右=スキップ）

## 技術スタック
- **Next.js 15**（App Router・静的書き出し `output: export`）+ TypeScript + Tailwind CSS
- **Supabase**（PostgREST をブラウザから直接呼ぶ・RLSで保護）— 共有フィード/いいね/コメント
- **GitHub Pages** + GitHub Actions（main へ push で自動デプロイ）
- ローカルデータは localStorage（冷蔵庫・記録・XP）

## 開発
```bash
npm install
npm run dev   # http://localhost:3000
```

共有フィードをローカルで試す場合は `.env.local` を作成（`.env.local.example` 参照）。
DB スキーマは [`supabase/schema.sql`](supabase/schema.sql)、セットアップ手順は [`docs/db/FEED-DB-SETUP.md`](docs/db/FEED-DB-SETUP.md)。

## デプロイ
`main` に push すると GitHub Actions が自動でビルド & GitHub Pages へ公開する
（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）。

## チーム
Startup Weekend 発のプロジェクト 🍙
