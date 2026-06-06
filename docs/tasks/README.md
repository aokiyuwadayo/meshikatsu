# メシ活アプリ — エンジニア向け作業指示（共通）

> 一人暮らし大学生の食品ロスをゼロにする、ゲーム感覚の食品管理アプリ。
> Startup Weekend 新宮町 2026年6月の MVP。

土台（共通基盤）は実装済みです。**あなたは担当画面の `page.tsx` を実装するだけ**で、
型・データ保存・XP計算・共通コンポーネントは全て用意されています。これらの契約は変更せず利用してください。

---

## 0. セットアップ（全員 最初に1回）

```bash
git clone https://github.com/soccershuya0925-cmyk/StartupWeekend
cd StartupWeekend
npm install
cp .env.local.example .env.local   # /receipt 担当のみ OPENAI_API_KEY を設定。他は不要
npm run dev                        # http://localhost:3000
```

> APIキーが無くても `/api/receipt` はモックデータを返すので、レシート以外の開発は鍵なしで進められます。

---

## 1. 担当割り（4人）

| 担当 | 画面 | 指示書 | 依存 |
|------|------|--------|------|
| **A** | `/`（ホーム）+ `/character`（キャラ詳細） | [A-home-character.md](./A-home-character.md) | storage, xp, expiry |
| **B** | `/fridge`（冷蔵庫管理） | [B-fridge.md](./B-fridge.md) | storage, expiry |
| **C** | `/cook`（料理記録） | [C-cook.md](./C-cook.md) | storage, xp |
| **D** | `/receipt`（レシート読み取り） | [D-receipt.md](./D-receipt.md) | storage, xp, `/api/receipt` |

**触っていいファイルは自分の `app/<route>/page.tsx` と、必要なら自分専用の `components/` だけ。**
`types/`・`lib/`・`components/Navigation,XPBar,CharacterDisplay` は共通なので、変更したい時は土台担当（青木）に必ず相談すること。

---

## 2. 共通の契約（API リファレンス）

### 型 `types/index.ts`

```ts
FoodItem   { id, name, quantity, unit, expiryDate(ISO), category, addedAt(ISO) }
CookingLog { id, dishName, photoUrl, xpEarned, cookedAt(ISO) }
UserProgress { level, totalXP, stamps, cookingCount }
ReceiptItem  { name, quantity, unit, price?, category }
FoodCategory = 'vegetable'|'meat'|'dairy'|'seasoning'|'other'
ExpiryStatus = 'urgent'|'warn'|'safe'|'expired'
```

### データ保存 `lib/storage.ts`（localStorage ラッパー）

```ts
genId(): string
// 冷蔵庫
getFridge(): FoodItem[]
addFoodItem(item: FoodItem): FoodItem[]
removeFoodItem(id: string): FoodItem[]
// 料理記録
getLogs(): CookingLog[]
addLog(log: CookingLog): CookingLog[]
// 進捗
getProgress(): UserProgress
saveProgress(p: UserProgress): void
resetAll(): void   // デモ用リセット
```

### XP・レベル `lib/xp.ts`

```ts
XP_REWARDS = { cookPhoto:50, receipt:10, useBeforeExpiry:100, zeroLossWeek:500 }
applyXP(progress, deltaXP, incrementCooking=false): UserProgress  // 純粋関数
levelFromXP(xp) / xpToNextLevel(xp) / levelProgressRatio(xp) / stageFromLevel(level)
STAGES         // キャラクター5段階
COOK_PER_STAMP = 5, STAMPS_PER_REWARD = 10
```

### 消費期限 `lib/expiry.ts`

```ts
daysUntilExpiry(expiryDate): number
expiryStatus(expiryDate): ExpiryStatus
statusClasses(status): string   // Tailwind バッジ用クラス
statusLabel(expiryDate): string // "あと3日" / "今日まで" / "2日超過"
sortByExpiry(items): FoodItem[] // 期限が近い順
```

### 共通コンポーネント

```tsx
<XPBar totalXP={p.totalXP} />
<CharacterDisplay level={p.level} size="lg" />
```

### レシート解析 API（D担当が使用）

```
POST /api/receipt
body: { image: "data:image/jpeg;base64,...." }
res : { items: ReceiptItem[], mock?: true }
```

---

## 3. ルール

- **`page.tsx` の先頭は `"use client";`**（localStorage を使うため。クライアントコンポーネント必須）
- localStorage 読み出しは `useEffect` 内で行う（SSR とハイドレーション不整合を避ける）
- XP/進捗を更新したら必ず `saveProgress(applyXP(...))` で保存する
- スタイルは Tailwind。レイアウトは `max-w-md` のスマホ幅前提（土台で設定済み）
- 完成したら `npm run build` が通ることを確認してから PR を出す
- **PRは画面ごとに1本**。`feat: implement /fridge` のように Conventional Commits で

---

## 4. デモ用シードデータ（任意・開発が楽になる）

ブラウザの DevTools コンソールに貼ると冷蔵庫にサンプルが入ります：

```js
localStorage.setItem('meshikatsu:fridge', JSON.stringify([
  {id:'1',name:'キャベツ',quantity:1,unit:'個',expiryDate:'2026-06-08',category:'vegetable',addedAt:'2026-06-06'},
  {id:'2',name:'トマト',quantity:3,unit:'個',expiryDate:'2026-06-10',category:'vegetable',addedAt:'2026-06-06'},
  {id:'3',name:'豚こま肉',quantity:1,unit:'パック',expiryDate:'2026-06-07',category:'meat',addedAt:'2026-06-06'},
]));
location.reload();
```
