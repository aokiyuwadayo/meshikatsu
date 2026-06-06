# メシ活アプリ 🍳

一人暮らし大学生の食品ロスをゼロにする、ゲーム感覚で続けられる食品管理アプリ。
Startup Weekend 新宮町 2026年6月 / チーム「オレの食品ロスを助けてくれ」の MVP。

## 機能（MVP）
- 🧊 **食品管理 × 消費期限通知** — 在庫登録と期限の色分けアラート
- 🧾 **レシートAI読み取り** — GPT-4o Vision で食材を自動登録
- 🍳 **料理記録 × XP** — 作るたびにキャラが育つ（RPG育成）
- ⭐ **スタンプ → 特典** — 継続のモチベーション

## 技術構成
Next.js 15 (App Router) / TypeScript / Tailwind CSS / localStorage / OpenAI GPT-4o Vision / Vercel

## 開発をはじめる
```bash
npm install
cp .env.local.example .env.local   # レシート機能を使う場合のみ OPENAI_API_KEY を設定
npm run dev                        # http://localhost:3000
```

## エンジニア向け作業指示
担当画面ごとの指示書は **[docs/tasks/README.md](./docs/tasks/README.md)** を参照。

| 担当 | 画面 |
|------|------|
| A | `/`（ホーム）+ `/character` |
| B | `/fridge`（最優先） |
| C | `/cook` |
| D | `/receipt` |

## ディレクトリ
```
app/          各画面（page.tsx）+ api/receipt（レシート解析API）
components/    共通UI（Navigation, CharacterDisplay, XPBar）
lib/          storage(localStorage) / xp(レベル計算) / expiry(期限判定) / recommend(レシピ提案)
types/        共通型定義
docs/tasks/   エンジニア向け作業指示
```
