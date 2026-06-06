# 担当D：レシート読み取り `/receipt`

> レシートを撮影 → GPT-4o Vision が食材を解析 → 確認して冷蔵庫に追加。
> 差別化ポイントの一つ。**API ルートは実装済み**なので、あなたは UI と繋ぎ込みだけ。
> 事業計画 §10 では「余裕があれば」枠。B/C/A が動いてから着手でもOK。

実装ファイル：`app/receipt/page.tsx`（API `app/api/receipt/route.ts` は完成済み・変更不要）

---

## やること（受け入れ条件）

1. **画像選択**：`<input type="file" accept="image/*" capture="environment">`。
   選んだ画像を `FileReader.readAsDataURL` で base64 data URL に変換
2. **AI解析**：`POST /api/receipt` に `{ image: dataUrl }` を投げ、`{ items: ReceiptItem[] }` を受け取る
3. **プレビュー**：返ってきた食材リストを表示し、各行で消費期限を入力できるようにする
   （レシートに期限は無いので、ユーザーが「+3日」等で決める。デフォルト3日後など）
4. **冷蔵庫に追加**：確認ボタンで各 `ReceiptItem` を `FoodItem` に変換して `addFoodItem()`、
   さらに登録ごとに XP：`applyXP(getProgress(), XP_REWARDS.receipt)` → `saveProgress()`
5. ローディング表示（解析は数秒かかる）とエラー表示

---

## 使う契約

```ts
import { addFoodItem, getProgress, saveProgress, genId } from "@/lib/storage";
import { applyXP, XP_REWARDS } from "@/lib/xp";
import type { ReceiptItem, FoodItem } from "@/types";
```

### API 呼び出し

```ts
const res = await fetch("/api/receipt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ image: dataUrl }),
});
const { items, mock } = await res.json();   // items: ReceiptItem[]
// mock===true のときは「デモモード（APIキー未設定）」と画面に出すと親切
```

### ReceiptItem → FoodItem 変換

```ts
const food: FoodItem = {
  id: genId(),
  name: item.name,
  quantity: item.quantity,
  unit: item.unit,
  expiryDate,                            // ユーザーが選んだ期限 (YYYY-MM-DD)
  category: item.category,
  addedAt: new Date().toISOString(),
};
addFoodItem(food);
```

## 環境変数（このタスクのみ）
- `.env.local` に `OPENAI_API_KEY=sk-...` を設定すると本物の解析になる
- **未設定でもモックの食材リストが返る**ので、鍵が無くても UI 開発・デモは可能

## 完了の確認
- 画像を選ぶ → 数秒で食材リストが出る → 追加すると `/fridge` に反映
- 鍵なし（モック）でも一連の流れが動く
- `npm run build` 通過 → `feat: implement /receipt` で PR
