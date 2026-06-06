# 担当C：料理記録 `/cook`

> 作った料理を写真付きで記録し、XP を獲得してキャラクターを育てる画面。
> 事業計画 §10 の **2番目の優先機能**。ゲーム性（RPG育成）の核。

実装ファイル：`app/cook/page.tsx`

---

## やること（受け入れ条件）

1. **料理名の入力**（テキスト）
2. **写真アップロード**：`<input type="file" accept="image/*" capture="environment">`。
   選んだ画像は `FileReader.readAsDataURL` で base64 にして `photoUrl` に保存（localStorage に入る）
3. **記録ボタン**で `addLog()` し、同時に XP を加算：
   - `applyXP(getProgress(), XP_REWARDS.cookPhoto, true)` （`incrementCooking=true` で料理回数+1 → スタンプ再計算）
   - 結果を `saveProgress()` で保存
4. **XP獲得アニメーション**：「+50 XP!」をふわっと表示（CSS transition / keyframes でOK）
5. 過去の記録を新しい順に下に一覧（任意。`/character` でも出すので簡易で可）

---

## 使う契約

```ts
import { getProgress, saveProgress, addLog, getLogs, genId } from "@/lib/storage";
import { applyXP, XP_REWARDS } from "@/lib/xp";
import type { CookingLog } from "@/types";
```

```ts
function handleSave() {
  const log: CookingLog = {
    id: genId(),
    dishName,
    photoUrl,                          // base64 data URL
    xpEarned: XP_REWARDS.cookPhoto,    // 50
    cookedAt: new Date().toISOString(),
  };
  addLog(log);
  const next = applyXP(getProgress(), XP_REWARDS.cookPhoto, true);
  saveProgress(next);
  // ここで「+50 XP!」アニメを発火
}
```

## 注意
- 写真の base64 は大きいので、保存前に縮小すると localStorage 容量に優しい（任意）。
  MVP は無加工でも可。1〜2枚なら問題なし。
- `"use client";` を先頭に。`getProgress()` の読み出しは `useEffect` 内で。

## 完了の確認
- 記録すると XP が増え、リロード後も保持される
- 料理5回でスタンプが1個増える（`/character` で確認できる）
- `npm run build` 通過 → `feat: implement /cook` で PR
