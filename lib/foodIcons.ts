// ============================================================
// 食材カテゴリの表示用ラベル＆アイコン（FoodCategory に厳密対応）
// 冷蔵庫のセレクトと、各所の食材リスト表示で共通利用する。
// ============================================================

import type { FoodCategory } from "@/types";

export const CATEGORY_OPTIONS: {
  value: FoodCategory;
  label: string;
  icon: string;
}[] = [
  { value: "vegetable", label: "野菜", icon: "🥬" },
  { value: "meat", label: "肉・魚", icon: "🍖" },
  { value: "dairy", label: "乳製品・卵", icon: "🥚" },
  { value: "seasoning", label: "調味料", icon: "🧂" },
  { value: "other", label: "その他", icon: "🍱" },
];

export const CATEGORY_ICON: Record<FoodCategory, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.icon])
) as Record<FoodCategory, string>;
