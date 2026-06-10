// フィード内のネイティブ広告枠（投稿カードと同じ見た目で挟む）。
// 収益モデル: 提携カフェ・食品メーカーのスポンサー投稿を想定。
// 現在はプレースホルダー表示。実広告（Google AdSense 等）への差し替え手順は下記コメント参照。

export default function AdBanner() {
  return (
    <li
      aria-label="広告"
      className="rounded-2xl border border-dashed border-ink/15 bg-cream/60 p-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg" aria-hidden>
          🤝
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-soft">スポンサー枠</p>
          <p className="text-[11px] text-ink-soft/70">
            提携カフェ・食品メーカーの紹介がここに入ります
          </p>
        </div>
        {/* 「広告」ラベル（景表法・ユーザー誤認防止のため明示） */}
        <span className="shrink-0 rounded bg-ink/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ink-soft">
          広告
        </span>
      </div>

      {/*
        === 実際の広告に差し替える場合（Google AdSense の例）===
        1) app/layout.tsx に AdSense スクリプトを読み込む:
             import Script from "next/script";
             <Script async strategy="afterInteractive"
               src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
               crossOrigin="anonymous" />
        2) 上のプレースホルダーを次の <ins> に置き換え、"use client" + useEffect で push:
             <ins className="adsbygoogle" style={{ display: "block", width: "100%", height: 80 }}
               data-ad-client="ca-pub-XXXXXXXXXXXX" data-ad-slot="YYYYYYYYYY"
               data-ad-format="fluid" data-full-width-responsive="true" />
             // useEffect(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {} }, []);
      */}
    </li>
  );
}
