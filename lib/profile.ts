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
