"use client";

// ============================================================
// キャラクターアート（5段階・高解像度版）
// 人気育成ゲームの文法に寄せる：
//  - 大きな瞳＋二重ハイライト＋まばたき（SMIL）
//  - グラデーション/陰影で立体感
//  - ステージごとに明確に違うシルエット（卵→ひよこ→一人前→マスター→神様）
//  - ふわふわのアイドルアニメ（生きている感）
// 配色は新パレット（ティール #0F857B / テラコッタ #C2693E）に準拠。
// ============================================================

const C = {
  ink: "#2B2B33",
  cream1: "#FFFAF0",
  cream2: "#F6E3C4",
  chick1: "#FFE9B3",
  chick2: "#F8CD7E",
  shellEdge: "#E8D5B8",
  white1: "#FFFFFF",
  white2: "#EFEFEA",
  teal: "#0F857B",
  tealDark: "#0B6B62",
  terra: "#C2693E",
  terraLight: "#E08A4E",
  gold: "#E8B83A",
  goldDeep: "#D49E1E",
  blush: "#F5A37C",
  panBody: "#4A4F55",
  panDark: "#33373C",
};

interface StageArtProps {
  stage: number; // 1〜5
  /** 表示サイズ(px) */
  size?: number;
  className?: string;
}

/** 大きな瞳（二重ハイライト＋まばたき）。cx, cy は目の中心 */
function Eye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="4" ry="4.6" fill={C.ink}>
        <animate
          attributeName="ry"
          values="4.6;4.6;0.5;4.6"
          keyTimes="0;0.92;0.96;1"
          dur="4.2s"
          repeatCount="indefinite"
        />
      </ellipse>
      <circle cx={cx - 1.3} cy={cy - 1.5} r="1.5" fill="#fff" opacity="0.95" />
      <circle cx={cx + 1.4} cy={cy + 1.6} r="0.8" fill="#fff" opacity="0.8" />
    </g>
  );
}

/** 閉じた幸せ目（ステージ5用）∩ の形 */
function ClosedEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M${cx - 4} ${cy + 1} q4 -5 8 0`}
      fill="none"
      stroke={C.ink}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  );
}

/** ほっぺ */
function Cheeks({ y, spread = 14 }: { y: number; spread?: number }) {
  return (
    <g fill={C.blush} opacity="0.55">
      <ellipse cx={50 - spread} cy={y} rx="3.4" ry="2.2" />
      <ellipse cx={50 + spread} cy={y} rx="3.4" ry="2.2" />
    </g>
  );
}

/** コック帽（puffy トック）。y はベースの上端、scale で大きさ */
function Toque({
  y,
  scale = 1,
  band = C.teal,
  star = false,
}: {
  y: number;
  scale?: number;
  band?: string;
  star?: boolean;
}) {
  const s = scale;
  return (
    <g>
      {/* ふくらみ（雲型3連） */}
      <circle cx={50 - 9 * s} cy={y - 7 * s} r={7.5 * s} fill="url(#mkHat)" stroke={C.shellEdge} strokeWidth="1.2" />
      <circle cx={50 + 9 * s} cy={y - 7 * s} r={7.5 * s} fill="url(#mkHat)" stroke={C.shellEdge} strokeWidth="1.2" />
      <circle cx={50} cy={y - 11 * s} r={9 * s} fill="url(#mkHat)" stroke={C.shellEdge} strokeWidth="1.2" />
      {/* 胴 */}
      <rect x={50 - 13 * s} y={y - 6 * s} width={26 * s} height={9 * s} rx={3} fill="url(#mkHat)" stroke={C.shellEdge} strokeWidth="1.2" />
      {/* バンド */}
      <rect x={50 - 13 * s} y={y - 0.5} width={26 * s} height={3.2} rx={1.6} fill={band} />
      {/* 金の星バッジ */}
      {star && (
        <path
          d="M50 0 l1.7 3.4 l3.8 .5 l-2.7 2.6 l.6 3.8 l-3.4 -1.8 l-3.4 1.8 l.6 -3.8 l-2.7 -2.6 l3.8 -.5 z"
          transform={`translate(0 ${y - 16 * s})`}
          fill={C.gold}
          stroke={C.goldDeep}
          strokeWidth="0.6"
        />
      )}
    </g>
  );
}

/** 接地の影 */
function Ground({ small = false }: { small?: boolean }) {
  return (
    <ellipse
      cx="50"
      cy="92"
      rx={small ? 14 : 22}
      ry={small ? 2.6 : 4}
      fill="#17211F"
      opacity="0.10"
    />
  );
}

/* ============ ステージ別 ============ */

/** ステージ1: 見習いシェフの卵（芽が出た卵） */
function Stage1() {
  return (
    <g className="animate-float-slow">
      {/* 芽 */}
      <g>
        <path d="M50 30 v-7" stroke={C.teal} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M50 24 q-8 -2 -8 -9 q8 0 8 9" fill={C.teal} />
        <path d="M50 26 q8 -2 8 -9 q-8 0 -8 9" fill="#15A192" />
      </g>
      {/* 卵 */}
      <path
        d="M50 30 C 33 30 26 47 26 60 C 26 76 36 86 50 86 C 64 86 74 76 74 60 C 74 47 67 30 50 30 Z"
        fill="url(#mkBody)"
        stroke={C.shellEdge}
        strokeWidth="1.6"
      />
      {/* 殻の斑点 */}
      <g fill={C.cream2} opacity="0.8">
        <circle cx="34" cy="50" r="1.6" />
        <circle cx="68" cy="56" r="1.9" />
        <circle cx="62" cy="42" r="1.3" />
        <circle cx="40" cy="76" r="1.6" />
      </g>
      {/* ツヤ */}
      <ellipse cx="40" cy="42" rx="6" ry="9" fill="#fff" opacity="0.5" transform="rotate(-18 40 42)" />
      {/* 顔 */}
      <Eye cx={42} cy={58} />
      <Eye cx={58} cy={58} />
      <path d="M46.5 66 q3.5 3.4 7 0" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      <Cheeks y={64} />
    </g>
  );
}

/** ステージ2: 料理人見習い（殻パンツのひよこ＋ミニ帽子） */
function Stage2() {
  return (
    <g className="animate-float-slow">
      {/* ミニ帽子（少し傾き） */}
      <g transform="rotate(-8 50 30)">
        <Toque y={32} scale={0.62} />
      </g>
      {/* ひよこボディ */}
      <circle cx="50" cy="52" r="21" fill="url(#mkChick)" stroke="#E8BC74" strokeWidth="1.4" />
      {/* 羽 */}
      <ellipse cx="29" cy="56" rx="5" ry="8" fill="url(#mkChick)" stroke="#E8BC74" strokeWidth="1.2" transform="rotate(14 29 56)" />
      <ellipse cx="71" cy="56" rx="5" ry="8" fill="url(#mkChick)" stroke="#E8BC74" strokeWidth="1.2" transform="rotate(-14 71 56)" />
      {/* ツヤ */}
      <ellipse cx="42" cy="42" rx="6" ry="4.5" fill="#fff" opacity="0.45" transform="rotate(-15 42 42)" />
      {/* 顔 */}
      <Eye cx={43} cy={50} />
      <Eye cx={57} cy={50} />
      {/* くちばし */}
      <path d="M47 56 l3 3.6 l3 -3.6 q-3 -2 -6 0" fill={C.terraLight} stroke={C.terra} strokeWidth="0.8" />
      <Cheeks y={57} spread={13} />
      {/* 殻パンツ */}
      <path
        d="M31 66 l4.6 -4.6 l4.6 4.6 l4.6 -4.6 l4.6 4.6 l4.6 -4.6 l4.6 4.6 l4.6 -4.6 l4.6 4.6 a19 17 0 0 1 -38 0 z"
        fill="url(#mkHat)"
        stroke={C.shellEdge}
        strokeWidth="1.4"
      />
      {/* あんよ */}
      <g stroke={C.terraLight} strokeWidth="2.4" strokeLinecap="round">
        <path d="M44 86 v3" />
        <path d="M56 86 v3" />
      </g>
    </g>
  );
}

/** ステージ3: 一人前の料理人（帽子＋スカーフ＋フライパン） */
function Stage3() {
  return (
    <g className="animate-float-slow">
      <Toque y={30} scale={0.95} />
      {/* 体 */}
      <path
        d="M50 30 C 32 30 27 46 27 60 C 27 76 37 87 50 87 C 63 87 73 76 73 60 C 73 46 68 30 50 30 Z"
        fill="url(#mkBody)"
        stroke={C.shellEdge}
        strokeWidth="1.6"
      />
      {/* エプロン */}
      <path
        d="M36 62 q14 -7 28 0 l-2 16 q-12 7 -24 0 z"
        fill="url(#mkHat)"
        stroke={C.shellEdge}
        strokeWidth="1.2"
      />
      {/* スカーフ（ティール） */}
      <path d="M37 56 q13 7 26 0 l-3 5 q-10 5 -20 0 z" fill={C.teal} />
      <path d="M48 60 l4 7 l-5 1 z" fill={C.tealDark} />
      {/* 左腕：フライパンを掲げる */}
      <g>
        <path d="M30 56 q-8 -4 -10 -12" stroke="url(#mkBody)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="19" cy="38" r="7.5" fill={C.panBody} stroke={C.panDark} strokeWidth="1.4" />
        <circle cx="19" cy="38" r="4.5" fill={C.panDark} />
        <rect x="23" y="42" width="3" height="9" rx="1.5" fill={C.panDark} transform="rotate(-38 24 46)" />
        {/* 目玉焼き */}
        <circle cx="19" cy="37" r="3.4" fill="#fff" />
        <circle cx="19" cy="37" r="1.5" fill={C.gold} />
      </g>
      {/* 右腕 */}
      <path d="M70 58 q7 4 8 10" stroke="url(#mkBody)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* 顔 */}
      <Eye cx={42} cy={48} />
      <Eye cx={58} cy={48} />
      <path d="M44 55 q6 6.5 12 0" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
      <Cheeks y={54} />
    </g>
  );
}

/** ステージ4: 料理マスター（コックコート＋金の泡立て器＋星バッジ） */
function Stage4() {
  return (
    <g className="animate-float-slow">
      <Toque y={26} scale={1.1} band={C.terra} star />
      {/* 体（少し背が高い） */}
      <path
        d="M50 26 C 31 26 26 44 26 60 C 26 78 36 88 50 88 C 64 88 74 78 74 60 C 74 44 69 26 50 26 Z"
        fill="url(#mkHat)"
        stroke={C.shellEdge}
        strokeWidth="1.6"
      />
      {/* コートの打ち合わせ線 */}
      <path d="M50 54 v32" stroke={C.shellEdge} strokeWidth="1.2" />
      {/* ダブルボタン（ティール） */}
      <g fill={C.teal}>
        <circle cx="43" cy="60" r="1.9" />
        <circle cx="57" cy="60" r="1.9" />
        <circle cx="43" cy="69" r="1.9" />
        <circle cx="57" cy="69" r="1.9" />
        <circle cx="43" cy="78" r="1.9" />
        <circle cx="57" cy="78" r="1.9" />
      </g>
      {/* スカーフ（テラコッタ） */}
      <path d="M36 50 q14 8 28 0 l-3 6 q-11 5 -22 0 z" fill={C.terra} />
      <path d="M48 55 l4 8 l-5.5 1 z" fill="#A8552F" />
      {/* 右腕：金の泡立て器 */}
      <g>
        <path d="M71 56 q9 -2 11 -12" stroke="url(#mkHat)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="80.5" y="34" width="3" height="10" rx="1.5" fill={C.goldDeep} />
        <path d="M82 34 q-6 -10 0 -16 q6 6 0 16" fill="none" stroke={C.gold} strokeWidth="1.8" />
        <path d="M82 34 q-2.5 -9 0 -16 M82 34 q2.5 -9 0 -16" fill="none" stroke={C.gold} strokeWidth="1.4" />
      </g>
      {/* 左腕（腰に） */}
      <path d="M29 58 q-7 4 -6 11" stroke="url(#mkHat)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* 顔 */}
      <Eye cx={42} cy={44} />
      <Eye cx={58} cy={44} />
      {/* 口ひげ＋自信の笑み */}
      <path d="M43 52 q3.5 -2.6 7 0 q3.5 -2.6 7 0" fill="none" stroke="#8A5A3B" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 55.5 q4 4.5 8 0" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      <Cheeks y={50} />
    </g>
  );
}

/** ステージ5: 料理の神様（後光＋浮遊＋王冠トック＋雲） */
function Stage5() {
  return (
    <g>
      {/* 後光 */}
      <circle cx="50" cy="50" r="44" fill="url(#mkAura)" />
      <circle cx="50" cy="46" r="27" fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
      <g className="animate-float-slow">
        {/* 王冠つきトック */}
        <Toque y={26} scale={1.05} band={C.gold} />
        <path
          d="M40 24 l3.4 -5 l3.3 5 l3.3 -5 l3.3 5 l3.4 -5 l3.3 5"
          fill="none"
          stroke={C.goldDeep}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="50" cy="14" r="2" fill={C.teal} stroke={C.tealDark} strokeWidth="0.8" />
        {/* ローブの体 */}
        <path
          d="M50 26 C 32 26 27 44 27 58 C 27 74 36 84 50 84 C 64 84 73 74 73 58 C 73 44 68 26 50 26 Z"
          fill="url(#mkRobe)"
          stroke={C.gold}
          strokeWidth="1.6"
        />
        {/* 金の襟ライン */}
        <path d="M38 50 q12 7 24 0" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
        {/* 腕を広げる */}
        <path d="M29 54 q-9 0 -12 -7" stroke="url(#mkRobe)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M71 54 q9 0 12 -7" stroke="url(#mkRobe)" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* 幸せの閉じ目＋穏やかな笑み */}
        <ClosedEye cx={42} cy={45} />
        <ClosedEye cx={58} cy={45} />
        <path d="M45 53 q5 5 10 0" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
        <Cheeks y={51} />
        {/* 浮遊の雲 */}
        <g fill="#fff" stroke={C.shellEdge} strokeWidth="1">
          <ellipse cx="40" cy="88" rx="10" ry="4.5" />
          <ellipse cx="58" cy="89" rx="12" ry="5" />
          <ellipse cx="49" cy="85" rx="9" ry="4.4" />
        </g>
      </g>
      {/* きらめき（明滅） */}
      <g fill={C.gold}>
        <path d="M18 28 l1.6 3.4 l3.6 .5 l-2.6 2.5 l.6 3.6 l-3.2 -1.7 l-3.2 1.7 l.6 -3.6 l-2.6 -2.5 l3.6 -.5 z" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite" />
        </path>
        <path d="M82 22 l1.3 2.8 l3 .4 l-2.2 2.1 l.5 3 l-2.6 -1.4 l-2.6 1.4 l.5 -3 l-2.2 -2.1 l3 -.4 z" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3.1s" repeatCount="indefinite" />
        </path>
        <circle cx="84" cy="62" r="1.8">
          <animate attributeName="opacity" values="1;0.2;1" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="15" cy="58" r="1.5">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  );
}

/** ステージ番号に応じたキャラSVGを返す（1〜5、範囲外はクランプ） */
export default function StageArt({ stage, size = 120, className }: StageArtProps) {
  const s = Math.min(5, Math.max(1, Math.round(stage)));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`キャラクター ステージ${s}`}
    >
      <defs>
        {/* 体（クリーム） */}
        <linearGradient id="mkBody" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={C.cream1} />
          <stop offset="100%" stopColor={C.cream2} />
        </linearGradient>
        {/* ひよこ（あたたかい黄） */}
        <linearGradient id="mkChick" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={C.chick1} />
          <stop offset="100%" stopColor={C.chick2} />
        </linearGradient>
        {/* 白（帽子・コート） */}
        <linearGradient id="mkHat" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={C.white1} />
          <stop offset="100%" stopColor={C.white2} />
        </linearGradient>
        {/* ローブ（白→金味） */}
        <linearGradient id="mkRobe" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="100%" stopColor="#F4E3BC" />
        </linearGradient>
        {/* 後光 */}
        <radialGradient id="mkAura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={C.gold} stopOpacity="0.45" />
          <stop offset="70%" stopColor={C.gold} stopOpacity="0.12" />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      {s < 5 && <Ground />}
      {s === 1 && <Stage1 />}
      {s === 2 && <Stage2 />}
      {s === 3 && <Stage3 />}
      {s === 4 && <Stage4 />}
      {s === 5 && <Stage5 />}
    </svg>
  );
}
