// ============================================================
// 端末ごとの匿名ハンドル — 共有フィードで「自分の投稿」を識別するための最小ID。
// 表示名の入力は求めず、初回に "ゲスト####" を自動採番して localStorage に保持する。
// ============================================================

const NAME_KEY = "meshikatsu:clientName";

/** この端末の表示名（無ければ自動採番して永続化） */
export function getClientName(): string {
  if (typeof window === "undefined") return "ゲスト";
  let n = localStorage.getItem(NAME_KEY);
  if (!n) {
    n = "ゲスト" + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem(NAME_KEY, n);
  }
  return n;
}

/** 表示名を変更（以後の投稿・コメント・いいねに反映） */
export function setClientName(name: string): void {
  if (typeof window === "undefined") return;
  const v = name.trim().slice(0, 20);
  if (v) localStorage.setItem(NAME_KEY, v);
}
