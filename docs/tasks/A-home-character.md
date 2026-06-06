# 担当A：ホーム `/` ＋ キャラクター詳細 `/character`

> アプリの顔。キャラクター育成の見える化と、期限アラートで「今日やること」を提示。
> 2画面とも共通コンポーネントを並べる構成なので、土台が一番効く担当。

実装ファイル：`app/page.tsx` と `app/character/page.tsx`

---

## ホーム `/` の受け入れ条件

1. **キャラクター + XPバー**：`<CharacterDisplay level={p.level} />` と `<XPBar totalXP={p.totalXP} />`
2. **期限アラート**：`sortByExpiry(getFridge())` の上位3件を表示。`statusLabel()` と `statusClasses()` で「あと3日でキャベツが期限切れ」を可視化
3. **クイックアクション**：`/cook`（料理記録）と `/receipt`（レシート読み取り）への大きめボタン（`next/link` の `<Link>`）

## キャラクター詳細 `/character` の受け入れ条件

1. **レベルと次までのXP**：`<CharacterDisplay size="lg" />` + `<XPBar />` + `xpToNextLevel()` の表示
2. **スタンプカード**：`p.stamps` 個のスタンプを丸で表示。`STAMPS_PER_REWARD`(=10) たまったら「特典と交換できます！」
3. **過去の料理記録一覧**：`getLogs()` を新しい順に写真サムネ付きで表示

---

## 使う契約

```ts
import { getProgress, getFridge, getLogs } from "@/lib/storage";
import { xpToNextLevel, STAMPS_PER_REWARD } from "@/lib/xp";
import { sortByExpiry, statusLabel, statusClasses, expiryStatus } from "@/lib/expiry";
import CharacterDisplay from "@/components/CharacterDisplay";
import XPBar from "@/components/XPBar";
import Link from "next/link";
```

## スケルトン（ホーム）

```tsx
"use client";
import { useEffect, useState } from "react";
// ... imports
export default function HomePage() {
  const [progress, setProgress] = useState(/* DEFAULT */);
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    setProgress(getProgress());
    setAlerts(sortByExpiry(getFridge()).slice(0, 3));
  }, []);
  return (/* キャラ + XPBar + アラート + クイックアクション */);
}
```

## 完了の確認
- 料理記録（C）や食材追加（B）の結果がホームに反映される
- スタンプが10個でメッセージが変わる
- `npm run build` 通過 → `feat: implement home and character pages` で PR
