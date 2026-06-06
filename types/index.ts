// ============================================================
// メシ活アプリ 共通型定義（全画面が依存する契約）
// ここを変更する場合は土台担当に相談すること
// ============================================================

/** 食材カテゴリ */
export type FoodCategory =
  | "vegetable" // 野菜
  | "meat" // 肉・魚
  | "dairy" // 乳製品・卵
  | "seasoning" // 調味料
  | "other"; // その他

/** 食材アイテム（冷蔵庫の在庫1件） */
export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // "個", "g", "ml" など
  expiryDate: string; // ISO 8601 形式 (例: "2026-06-10")
  category: FoodCategory;
  addedAt: string; // ISO 8601 形式
}

/** 料理記録（1回の自炊） */
export interface CookingLog {
  id: string;
  dishName: string;
  photoUrl: string; // base64 もしくは blob URL
  xpEarned: number;
  cookedAt: string; // ISO 8601 形式
}

/** ユーザー進捗（キャラクター・スタンプ） */
export interface UserProgress {
  level: number;
  totalXP: number;
  stamps: number;
  cookingCount: number; // 料理した回数（5回ごとにスタンプ1枚）
}

/** キャラクター成長ステージ */
export interface CharacterStage {
  stage: number; // 1〜5
  minLevel: number;
  emoji: string;
  name: string;
}

/** レシートAI解析の結果1件（/api/receipt が返す要素） */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category: FoodCategory;
}

/** 消費期限の緊急度（色分け用） */
export type ExpiryStatus = "urgent" | "warn" | "safe" | "expired";
