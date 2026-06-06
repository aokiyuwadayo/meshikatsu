"use client";

// レシピビューア（/recipe?d=<encoded>）
// 共有リンクを開くとレシピを表示。手持ち食材とのマッチも見せる。

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeRecipe, type SharedRecipe } from "@/lib/recipeShare";
import { getFridge } from "@/lib/storage";
import RecipeShareButton from "@/components/RecipeShareButton";

export default function RecipeViewerPage() {
  const [recipe, setRecipe] = useState<SharedRecipe | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("d");
    const r = d ? decodeRecipe(d) : null;
    setRecipe(r);
    setLoaded(true);

    if (r) {
      // 手持ち食材とマッチする材料を判定
      const names = getFridge().map((f) => f.name);
      const have = new Set(
        r.ingredients.filter((ing) =>
          names.some((n) => n.includes(ing) || ing.includes(n))
        )
      );
      setOwned(have);
    }
  }, []);

  if (loaded && !recipe) {
    return (
      <main className="page">
        <div className="mt-16 text-center">
          <p className="text-5xl" aria-hidden>
            🍳
          </p>
          <p className="mt-3 text-sm font-bold text-ink">レシピが見つかりません</p>
          <p className="mt-1 text-xs text-ink-soft">リンクが正しくないようです。</p>
          <Link href="/" className="btn-primary mt-5 inline-flex">
            メシ活をひらく
          </Link>
        </div>
      </main>
    );
  }

  if (!recipe) return <main className="page" />;

  const missing = recipe.ingredients.filter((i) => !owned.has(i));

  return (
    <main className="page">
      <p className="text-xs font-bold tracking-widest text-accent">RECIPE</p>
      <h1 className="page-title">{recipe.name}</h1>
      {recipe.description && <p className="page-sub">{recipe.description}</p>}

      {/* 材料（手持ちは✓） */}
      <section className="mt-5">
        <h2 className="section-title">🥬 材料</h2>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ing) => {
            const have = owned.has(ing);
            return (
              <span
                key={ing}
                className={`chip ${
                  have
                    ? "border-brand/30 bg-brand-light text-brand"
                    : "border-ink/15 bg-white text-ink-soft"
                }`}
              >
                {have ? "✓ " : ""}
                {ing}
              </span>
            );
          })}
        </div>
        {missing.length > 0 && (
          <Link
            href="/shop"
            className="mt-3 flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent-light/50 p-3 text-sm font-bold text-ink"
          >
            <span aria-hidden>🛒</span>
            <span className="flex-1">
              足りない材料（{missing.length}）を390円で補充
            </span>
            <span className="text-accent">→</span>
          </Link>
        )}
      </section>

      {/* 手順 */}
      {recipe.steps.length > 0 && (
        <section className="mt-6">
          <h2 className="section-title">👨‍🍳 作り方</h2>
          <ol className="space-y-2">
            {recipe.steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3.5 shadow-card"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-ink">{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* アクション */}
      <div className="mt-7 flex flex-col items-stretch gap-2">
        <RecipeShareButton recipe={recipe} variant="primary" label="このレシピを共有" />
        <Link href="/" className="btn-outline">
          メシ活をひらく
        </Link>
      </div>
    </main>
  );
}
