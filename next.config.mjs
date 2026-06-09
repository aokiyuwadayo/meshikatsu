/** @type {import('next').NextConfig} */
// GitHub Pages（プロジェクトサイト）向けの静的書き出し設定。
// 公開URL: https://aokiyuwadayo.github.io/meshikatsu/
const repo = "meshikatsu";

const nextConfig = {
  output: "export", // 静的HTMLとして書き出し（サーバ不要）
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: { unoptimized: true }, // next/image 最適化サーバを使わない
  trailingSlash: true, // /path/ 形式にして Pages のディレクトリ配信に合わせる
};

export default nextConfig;
