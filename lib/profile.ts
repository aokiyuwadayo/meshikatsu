// ============================================================
// 表示名（ニックネーム）— 共有フィードに「誰の投稿か」を出すための最小プロフィール。
// ログイン無しの MVP なので localStorage に保持するだけ。
// ============================================================

const KEY = "meshikatsu:nickname";

export function getNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) ?? "";
}

export function setNickname(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, name.trim());
}
