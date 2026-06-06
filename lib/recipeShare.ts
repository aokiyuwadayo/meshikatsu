// ============================================================
// レシピ共有（バックエンド不要）。レシピを URL にエンコードして渡す。
// 友だちがリンクを開くと /recipe ビューアでそのまま見られる。
// ============================================================

/** 共有で受け渡すレシピの最小形（URL を短くするためキー名も短縮） */
export interface SharedRecipe {
  name: string;
  ingredients: string[];
  steps: string[];
  description?: string;
}

/** UTF-8 セーフな base64url エンコード */
function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** レシピを URL パラメータ用の文字列にエンコード */
export function encodeRecipe(r: SharedRecipe): string {
  // キーを短縮して URL を短く
  const compact = { n: r.name, i: r.ingredients, s: r.steps, d: r.description };
  return b64urlEncode(JSON.stringify(compact));
}

/** URL パラメータからレシピを復元（失敗時 null） */
export function decodeRecipe(param: string): SharedRecipe | null {
  try {
    const obj = JSON.parse(b64urlDecode(param));
    if (!obj || typeof obj.n !== "string" || !Array.isArray(obj.i)) return null;
    return {
      name: String(obj.n),
      ingredients: (obj.i as unknown[]).map(String),
      steps: Array.isArray(obj.s) ? (obj.s as unknown[]).map(String) : [],
      description: obj.d != null ? String(obj.d) : undefined,
    };
  } catch {
    return null;
  }
}

/** 共有リンクを組み立てる */
export function buildRecipeUrl(origin: string, r: SharedRecipe): string {
  return `${origin}/recipe?d=${encodeRecipe(r)}`;
}

/** 共有用テキスト */
export function recipeShareText(r: SharedRecipe): string {
  return `【メシ活レシピ】${r.name}\n材料: ${r.ingredients.join("・")}\n余り食材を使い切ろう！ #メシ活 #食品ロスゼロ`;
}

/**
 * レシピを共有する。Web Share 対応端末はそのまま、
 * 非対応ならリンク＋テキストをクリップボードにコピー。
 * 戻り値: "shared" | "copied" | "failed"
 */
export async function shareRecipe(
  r: SharedRecipe,
  origin: string
): Promise<"shared" | "copied" | "failed"> {
  const url = buildRecipeUrl(origin, r);
  const text = recipeShareText(r);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: `メシ活レシピ: ${r.name}`, text, url });
      return "shared";
    } catch {
      // キャンセル等 → コピーにフォールバック
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
