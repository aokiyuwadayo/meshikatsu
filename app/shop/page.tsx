"use client";

// /shop は廃止（方針転換: 食品販売・補充の要素は出さない）。
// 既存リンク/ブックマーク対策として、クライアント側でレシピへ誘導する。
// basePath（/meshikatsu）を保つため pathname を置換して遷移する。
import { useEffect } from "react";

export default function ShopPage() {
  useEffect(() => {
    const to = window.location.pathname.replace(/\/shop\/?$/, "/recipe");
    window.location.replace(to);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-500">
      レシピへ移動中…
    </main>
  );
}
