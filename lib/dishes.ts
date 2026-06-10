// ============================================================
// とくい料理（レベルで上がる料理のクオリティ）
// Lv.1 の卵焼きから、最後は誰が見ても「すごい」と伝わるホールケーキまで。
// キャラページの料理ショーケースと育成動機（次の料理の予告）に使う。
// ============================================================

export interface Dish {
  minLevel: number;
  name: string;
  emoji: string;
}

/** 下から順に並べる（minLevel 昇順） */
export const DISHES: Dish[] = [
  { minLevel: 1, name: "卵焼き", emoji: "🍳" },
  { minLevel: 5, name: "おにぎり", emoji: "🍙" },
  { minLevel: 10, name: "カレーライス", emoji: "🍛" },
  { minLevel: 15, name: "ラーメン", emoji: "🍜" },
  { minLevel: 20, name: "ステーキ", emoji: "🥩" },
  { minLevel: 25, name: "お寿司", emoji: "🍣" },
  { minLevel: 30, name: "パエリア", emoji: "🥘" },
  { minLevel: 40, name: "フレンチフルコース", emoji: "🍽️" },
  { minLevel: 50, name: "ホールケーキ", emoji: "🎂" },
];

/** 現在レベルで作れる一番すごい料理 */
export function dishForLevel(level: number): Dish {
  let current = DISHES[0];
  for (const d of DISHES) {
    if (level >= d.minLevel) current = d;
  }
  return current;
}

/** 次に解放される料理（最終なら undefined） */
export function nextDish(level: number): Dish | undefined {
  return DISHES.find((d) => d.minLevel > level);
}
