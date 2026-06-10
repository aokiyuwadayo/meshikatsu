"use client";

// 自作レシピを作って共有（/recipe/new）
// localStorage に保存し、共有リンク（/recipe?d=...）で友だちに渡せる。

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyRecipes,
  addMyRecipe,
  removeMyRecipe,
  genId,
} from "@/lib/storage";
import { encodeRecipe, type SharedRecipe } from "@/lib/recipeShare";
import RecipeShareButton from "@/components/RecipeShareButton";
import Toast from "@/components/Toast";
import type { MyRecipe } from "@/types";

/** 改行/カンマ区切りを配列に */
function toLines(s: string): string[] {
  return s
    .split(/[\n,、]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function NewRecipePage() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [description, setDescription] = useState("");
  const [mine, setMine] = useState<MyRecipe[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMine(getMyRecipes());
  }, []);

  const draft: SharedRecipe = {
    name: name.trim(),
    ingredients: toLines(ingredients),
    steps: toLines(steps),
    description: description.trim() || undefined,
  };
  const canSave = draft.name.length > 0 && draft.ingredients.length > 0;

  function handleSave() {
    if (!canSave) return;
    const recipe: MyRecipe = {
      id: genId(),
      name: draft.name,
      ingredients: draft.ingredients,
      steps: draft.steps,
      description: draft.description,
      createdAt: new Date().toISOString(),
    };
    setMine(addMyRecipe(recipe));
    setName("");
    setIngredients("");
    setSteps("");
    setDescription("");
    setToast("レシピを保存しました");
  }

  function handleDelete(id: string) {
    setMine(removeMyRecipe(id));
  }

  return (
    <main className="page">
      <Toast message={toast} onDone={() => setToast(null)} />

      <header className="mb-5">
        <h1 className="page-title">✍️ レシピを作って共有</h1>
        <p className="page-sub">作ったレシピはリンクで友だちに渡せます。</p>
      </header>

      {/* 入力フォーム */}
      <section className="card space-y-3">
        <div>
          <label className="field-label">レシピ名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 余り野菜のチャーハン"
            className="field"
          />
        </div>
        <div>
          <label className="field-label">材料（1行に1つ・カンマ区切りも可）</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"ごはん\n卵\nねぎ\nハム"}
            rows={4}
            className="field"
          />
        </div>
        <div>
          <label className="field-label">作り方（1行に1ステップ・任意）</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={"具材を切る\n卵とごはんを炒める\n味付けする"}
            rows={4}
            className="field"
          />
        </div>
        <div>
          <label className="field-label">ひとこと（任意）</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="冷蔵庫の余りで作れる！"
            className="field"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary flex-1"
          >
            保存
          </button>
          {canSave && <RecipeShareButton recipe={draft} variant="ghost" label="共有" />}
        </div>
      </section>

      {/* 保存済みの自作レシピ */}
      <section className="mt-6">
        <h2 className="section-title">📒 あなたのレシピ</h2>
        {mine.length === 0 ? (
          <p className="card-soft text-sm text-ink-soft">
            まだありません。上のフォームから作ってみよう！
          </p>
        ) : (
          <ul className="space-y-2.5">
            {mine.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/recipe?d=${encodeRecipe(r)}`}
                      className="truncate text-sm font-bold text-ink"
                    >
                      {r.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">
                      {r.ingredients.join("・")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="shrink-0 text-xs font-bold text-ink-soft hover:text-urgent"
                  >
                    削除
                  </button>
                </div>
                <div className="mt-2">
                  <RecipeShareButton recipe={r} variant="chip" label="共有" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
