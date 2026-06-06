// ============================================================
// 旬の料理提案ロジック（冷蔵庫の食材 × 季節 → おすすめレシピ）
// MVP: ローカルの簡易レシピDBとマッチング（バックエンド不要）
// ============================================================

import type { FoodItem } from "@/types";

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface Recipe {
  id?: string; // カタログレシピの安定ID（自作レシピは未設定）
  name: string;
  /** 主要食材（食材名の部分一致でマッチ） */
  ingredients: string[];
  seasons: Season[];
  description: string;
  /** 作り方の手順（任意） */
  steps?: string[];
}

/** 月から季節を判定（日本の四季ざっくり） */
export function seasonFromMonth(month1to12: number): Season {
  if (month1to12 >= 3 && month1to12 <= 5) return "spring";
  if (month1to12 >= 6 && month1to12 <= 8) return "summer";
  if (month1to12 >= 9 && month1to12 <= 11) return "autumn";
  return "winter";
}

/** 簡易レシピDB（MVP・拡張歓迎） */
export const RECIPES: Recipe[] = [
  {
    id: "ratatouille",
    name: "ラタトゥイユ",
    ingredients: ["ナス", "なす", "トマト", "ズッキーニ", "玉ねぎ"],
    seasons: ["summer"],
    description: "余っているナスと旬のトマトで作れる夏野菜の煮込み。",
    steps: [
      "野菜を一口大に切る",
      "玉ねぎ→ナス→トマトの順に炒める",
      "塩・コンソメで味付けし10分煮込む",
    ],
  },
  {
    id: "misoshiru",
    name: "野菜たっぷり味噌汁",
    ingredients: ["キャベツ", "大根", "人参", "にんじん", "玉ねぎ", "豆腐"],
    seasons: ["spring", "summer", "autumn", "winter"],
    description: "余り野菜を何でも入れて使い切れる万能おかず。",
    steps: ["だしを沸かす", "固い野菜から入れて煮る", "火を止めて味噌を溶く"],
  },
  {
    id: "hoikoro",
    name: "回鍋肉（ホイコーロー）",
    ingredients: ["キャベツ", "豚肉", "ピーマン"],
    seasons: ["spring", "summer"],
    description: "キャベツと豚肉でガッツリ。ご飯が進む定番。",
    steps: ["豚肉を炒める", "キャベツ・ピーマンを加える", "甜麺醤・醤油で味付け"],
  },
  {
    id: "nikujaga",
    name: "肉じゃが",
    ingredients: ["じゃがいも", "玉ねぎ", "人参", "にんじん", "牛肉", "豚肉"],
    seasons: ["autumn", "winter"],
    description: "根菜が余りがちな季節にぴったりの煮物。",
    steps: ["具材を切る", "肉と野菜を炒める", "だし・醤油・みりんで15分煮る"],
  },
  {
    id: "hiyashichuka",
    name: "冷やし中華",
    ingredients: ["きゅうり", "トマト", "ハム", "卵"],
    seasons: ["summer"],
    description: "暑い日にさっぱり。彩り野菜を使い切れる。",
    steps: ["麺を茹でて冷水でしめる", "具材を細切り", "タレをかけて盛り付け"],
  },
  {
    id: "kinoko-gohan",
    name: "きのこの炊き込みご飯",
    ingredients: ["しめじ", "まいたけ", "えのき", "人参", "にんじん"],
    seasons: ["autumn"],
    description: "秋が旬のきのこをまとめて消費できる。",
    steps: ["米を研ぐ", "きのこ・人参・調味料を入れて炊く", "炊き上がりを混ぜる"],
  },
  {
    name: "キャベツと卵のふんわり炒め",
    ingredients: ["キャベツ", "卵"],
    seasons: ["spring", "summer", "autumn", "winter"],
    description: "余りがちなキャベツと卵だけで一品。火が通れば完成。",
  },
  {
    name: "ツナと玉ねぎのトマトパスタ",
    ingredients: ["玉ねぎ", "トマト", "ツナ", "パスタ"],
    seasons: ["spring", "summer"],
    description: "缶詰と余り野菜でOK。失敗しにくい定番。",
  },
  {
    name: "豚バラ大根の煮物",
    ingredients: ["大根", "豚肉", "豚バラ"],
    seasons: ["autumn", "winter"],
    description: "大根を1本使い切れる、染みうま煮物。",
  },
  {
    name: "ナスとピーマンの味噌炒め",
    ingredients: ["ナス", "なす", "ピーマン", "豚肉"],
    seasons: ["summer", "autumn"],
    description: "ご飯が進む。夏野菜をまとめて消費。",
  },
];

export interface RecipeSuggestion extends Recipe {
  /** マッチした手持ち食材名 */
  matched: string[];
  /** マッチ数（並べ替え用スコア） */
  score: number;
}

/**
 * 冷蔵庫の食材と季節からおすすめレシピを返す。
 * 手持ち食材とのマッチ数が多い順。季節の旬を優先。
 */
export function suggestRecipes(
  fridge: FoodItem[],
  season: Season,
  limit = 3
): RecipeSuggestion[] {
  const names = fridge.map((f) => f.name);

  const scored = RECIPES.map((recipe) => {
    const matched = recipe.ingredients.filter((ing) =>
      names.some((n) => n.includes(ing) || ing.includes(n))
    );
    // 重複食材名を排除
    const uniqueMatched = Array.from(new Set(matched));
    const seasonBonus = recipe.seasons.includes(season) ? 1 : 0;
    return {
      ...recipe,
      matched: uniqueMatched,
      score: uniqueMatched.length * 2 + seasonBonus,
    };
  });

  return scored
    .filter((r) => r.matched.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
