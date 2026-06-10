// ============================================================
// 画像の縮小（クライアント側）
// 共有フィードへ送る写真は DB の text カラムに data URL で保存するため、
// 長辺を抑えた JPEG に圧縮してサイズを小さくする。
// ============================================================

/**
 * data URL の画像を長辺 maxSize px・JPEG quality で縮小して返す。
 * 失敗時や圧縮後も大きすぎる場合は undefined（写真なしで投稿継続）。
 */
export function compressImage(
  dataUrl: string,
  maxSize = 800,
  quality = 0.72
): Promise<string | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(undefined);
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL("image/jpeg", quality);
        // 圧縮後も ~400KB 超なら写真は諦める（DB 肥大防止）
        resolve(out.length <= 400_000 ? out : undefined);
      } catch {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = dataUrl;
  });
}
