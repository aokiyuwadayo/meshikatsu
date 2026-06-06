"use client";

import { useState } from "react";
import { shareRecipe, type SharedRecipe } from "@/lib/recipeShare";

interface RecipeShareButtonProps {
  recipe: SharedRecipe;
  /** 見た目のバリエーション */
  variant?: "primary" | "ghost" | "chip";
  label?: string;
}

/** レシピを共有するボタン（Web Share / リンクコピー） */
export default function RecipeShareButton({
  recipe,
  variant = "ghost",
  label = "共有",
}: RecipeShareButtonProps) {
  const [note, setNote] = useState<string | null>(null);

  async function handleShare() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const result = await shareRecipe(recipe, origin);
    const msg =
      result === "copied"
        ? "リンクをコピーしました📋"
        : result === "failed"
        ? "共有に失敗しました"
        : null;
    setNote(msg);
    if (msg) window.setTimeout(() => setNote(null), 2000);
  }

  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "chip"
      ? "rounded-full border border-brand/40 bg-white px-2.5 py-1 text-xs font-bold text-brand"
      : "btn-ghost";

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={handleShare} className={cls}>
        📤 {label}
      </button>
      {note && <span className="text-[11px] font-semibold text-brand">{note}</span>}
    </span>
  );
}
