# ② 永続化＆AI本番化：設計叩き台

> 担当レーン: バックエンド / 対象: Next.js版（feat/nextjs-app）
> ゴール: (1) localStorage → DB化の設計叩き台、(2) OpenAI APIキー管理の方針、(3) 実レシートでのAI解析検証手順。
> ⚠️ **APIキーの実設定・課金実行・実レシート画像での本番解析は、鍵を持つ人（青木 or 別環境）が行う**。このドキュメントは設計と手順まで。

---

## A. 現状（実装済み・確認済み）

- データは **localStorage** に保存（`lib/storage.ts`）。キーは `meshikatsu:fridge` / `meshikatsu:logs` / `meshikatsu:progress`。
- レシート解析は **`POST /api/receipt`** が担当（`app/api/receipt/route.ts`）。
  - リクエスト: `{ image: "<base64 data URL>" }`
  - レスポンス: `{ items: ReceiptItem[], mock?: true }`
  - **`OPENAI_API_KEY` が未設定ならモック4品を返す**（デモが止まらない設計）。鍵があれば GPT-4o Vision を実呼び出し。
- つまり「AIの配線」はもう通っている。**残りは鍵を入れて実レシートで精度を見るだけ**。

---

## B. localStorage → DB 化（設計叩き台）

### B-1. いつやるか
- **MVP/ビジコン段階は localStorage のままで十分**（バックエンド不要・即デモ）。
- DB化が要るのは「複数端末で同じ冷蔵庫を見たい」「ユーザー間ランキング」「データ消えると困る本運用」になってから。**今週末は不要**。

### B-2. 移行しやすい形（今のうちに守ること）
- 既に `lib/storage.ts` が**全データアクセスを1ファイルに集約**している。DB化＝この関数群の中身を差し替えるだけで画面側は無修正。これは維持する。
- 関数シグネチャ（`getFridge()` / `addFoodItem()` / `getProgress()` 等）は**変えない**。DB化時は中身を fetch に置換。

### B-3. DB化する場合の推奨スタック（叩き台）
| 候補 | 向き | 備考 |
|---|---|---|
| **Supabase**（推奨） | 無料枠・Postgres・認証付き | Vercelと相性◎。`storage.ts`をSupabaseクライアントに差し替え。 |
| Vercel KV / Postgres | Vercel完結 | デプロイ先と同じで楽。 |
| Firebase | リアルタイム同期が要るなら | 認証も込み。 |

### B-4. 最小テーブル設計（Supabase想定・叩き台）
```sql
-- 食材在庫（FoodItem に対応）
create table food_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  quantity numeric not null,
  unit text not null,
  expiry_date date not null,
  category text not null check (category in ('vegetable','meat','dairy','seasoning','other')),
  added_at timestamptz not null default now()
);
-- 料理記録（CookingLog に対応）
create table cooking_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  dish_name text not null,
  photo_url text,           -- 本番は Supabase Storage の URL
  xp_earned int not null,
  cooked_at timestamptz not null default now()
);
-- ユーザー進捗（UserProgress に対応）
create table user_progress (
  user_id uuid primary key references auth.users,
  level int not null default 1,
  total_xp int not null default 0,
  stamps int not null default 0,
  cooking_count int not null default 0
);
```
※ カラムは `types/index.ts` の型と1対1。型を正とし、ここを合わせる。

### B-5. 写真の扱い（注意点）
- 今は料理写真を base64 で localStorage に入れている。**DB化時は localStorage 容量上限（~5MB）を超えるので、写真は Supabase Storage 等に上げて URL を保存**に切り替える。`CookingLog.photoUrl` はそのまま URL を入れられる設計なので型変更は不要。

---

## C. OpenAI APIキー管理（方針）

- 置き場所: ルートに **`.env.local`**（`.gitignore` 済み・**絶対にコミットしない**）。雛形は `.env.local.example`。
  ```
  OPENAI_API_KEY=sk-xxxxxxxxxx
  ```
- 本番（Vercel）: **Vercel の Project Settings → Environment Variables** に `OPENAI_API_KEY` を登録（コードには書かない）。
- キーの取得: https://platform.openai.com/api-keys
- **コスト注意**: GPT-4o Vision は画像1枚あたり課金。検証は数枚に絞る。レート/上限はダッシュボードで Usage limit を設定しておく。
- ⚠️ **鍵の発行・課金は会社PCではやらない方針**。青木が別環境で設定 → Vercel に登録、までを人手で行う。

---

## D. 実レシートでのAI解析検証（手順書）

### D-1. モック経路の動作確認（鍵なしで今すぐできる）
鍵が無くてもAPIの配線確認はできる。dev サーバを立てて:
```bash
npm run dev
# 別ターミナルで:
curl -s -X POST http://localhost:3000/api/receipt \
  -H 'Content-Type: application/json' \
  -d '{"image":"data:image/png;base64,iVBORw0KGgo="}' | head
# 期待: {"items":[{"name":"キャベツ",...}], "mock":true}
```
`"mock":true` が返れば配線OK。`/receipt` 画面の「画像アップロード→プレビュー→冷蔵庫に追加」もこのモックで通しでデモできる。

### D-2. 本番（鍵あり）の検証手順 ※鍵保有者が実施
1. `.env.local` に `OPENAI_API_KEY` を設定。
2. `npm run dev` を再起動（環境変数を読み直すため）。
3. **実レシート3枚**（コンビニ・スーパー・ドラッグストア等タイプ違い）を `/receipt` で撮影/アップロード。
4. 観点でチェック:
   - 食材名が正しく取れているか（誤字・商品名→食材名の丸めは許容範囲か）
   - 数量・単位・価格の取りこぼし
   - **食材以外（袋代・割引・合計）が混ざっていないか**（SYSTEM_PROMPT で除外指示済み・効いているか確認）
   - category の振り分け妥当性
5. ズレが多い品目は `app/api/receipt/route.ts` の `SYSTEM_PROMPT` に例を追記して再試行。
6. 結果（3枚の正答率の体感・崩れたケース）をこのファイル末尾に追記して共有。

### D-3. 検証ログ（記入欄）
| レシート | 店種 | 取得品数/実品数 | 誤抽出 | メモ |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

---

## E. このレーンの完了条件
- [ ] D-1 のモック経路が通ることを確認（鍵不要・今すぐ）
- [ ] `.env.local` 運用と Vercel 環境変数の方針をチームに共有
- [ ] （鍵あり）実レシート3枚で D-2 を実施し D-3 に記入
- [ ] （DB化を選ぶ場合のみ）B-4 のテーブルで Supabase を1つ立て、`storage.ts` の中身だけ差し替え
