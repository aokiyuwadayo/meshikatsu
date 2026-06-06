# 担当B：冷蔵庫管理 `/fridge`

> 食材の在庫を一覧し、消費期限を色分け表示。手動で追加・削除できる画面。
> **最優先機能**（事業計画 §10）。まずここが動けばデモの軸になる。

実装ファイル：`app/fridge/page.tsx`（今はプレースホルダー。丸ごと置き換える）

---

## やること（受け入れ条件）

1. **食材一覧**：`getFridge()` で取得し、`sortByExpiry()` で期限が近い順に並べて表示
2. **色分け表示**：各食材に `expiryStatus()` → `statusClasses()` のバッジ、`statusLabel()` の残日数（赤=緊急 / 黄=注意 / 緑=安全 / 灰=期限切れ）
3. **手動追加**：名前・数量・単位・カテゴリ・消費期限を入力するフォーム → `addFoodItem()`
4. **削除**：各食材に削除ボタン → `removeFoodItem(id)`
5. 一覧が空のときは「冷蔵庫は空です」の空状態を出す

---

## 使う契約

```ts
import { getFridge, addFoodItem, removeFoodItem, genId } from "@/lib/storage";
import { expiryStatus, statusClasses, statusLabel, sortByExpiry } from "@/lib/expiry";
import type { FoodItem, FoodCategory } from "@/types";
```

新規追加は `genId()` で id を採番し、`addedAt: new Date().toISOString()` を入れる：

```ts
const item: FoodItem = {
  id: genId(),
  name, quantity, unit,
  expiryDate,                 // <input type="date"> の値そのまま (YYYY-MM-DD)
  category,
  addedAt: new Date().toISOString(),
};
setItems(addFoodItem(item));
```

## 実装スケルトン

```tsx
"use client";
import { useEffect, useState } from "react";
import { getFridge, addFoodItem, removeFoodItem, genId } from "@/lib/storage";
import { expiryStatus, statusClasses, statusLabel, sortByExpiry } from "@/lib/expiry";
import type { FoodItem, FoodCategory } from "@/types";

export default function FridgePage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  useEffect(() => { setItems(getFridge()); }, []);   // ← localStorage 読み出しは useEffect 内
  // ... フォーム state と handleAdd / handleRemove
  const sorted = sortByExpiry(items);
  return (/* 一覧 + 追加フォーム */);
}
```

## 完了の確認
- 追加 → リロードしても残る（localStorage 永続化）
- 期限が近い食材が上に来て、赤バッジになっている
- `npm run build` が通る → `feat: implement /fridge` で PR
