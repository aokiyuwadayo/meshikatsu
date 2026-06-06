// ============================================================
// POST /api/receipt
// レシート画像（base64 data URL）を受け取り、GPT-4o Vision で
// 食材・数量・価格を解析して ReceiptItem[] を返す。
// OPENAI_API_KEY が未設定ならモックデータを返す（デモ用フォールバック）。
// ============================================================

import { NextResponse } from "next/server";
import type { ReceiptItem } from "@/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `あなたは日本のスーパーのレシート画像を解析するアシスタントです。
画像から食材だけを抽出し、次のJSON配列のみを出力してください（前後に説明文を付けない）。
[{"name":"食材名","quantity":1,"unit":"個","price":150,"category":"vegetable"}]
category は vegetable | meat | dairy | seasoning | other のいずれか。
食材以外（袋代・割引・合計など）は含めないでください。`;

const MOCK: ReceiptItem[] = [
  { name: "キャベツ", quantity: 1, unit: "個", price: 158, category: "vegetable" },
  { name: "トマト", quantity: 3, unit: "個", price: 198, category: "vegetable" },
  { name: "豚こま肉", quantity: 1, unit: "パック", price: 298, category: "meat" },
  { name: "卵", quantity: 1, unit: "パック", price: 218, category: "dairy" },
];

export async function POST(req: Request) {
  let imageDataUrl: string | undefined;
  try {
    const body = await req.json();
    imageDataUrl = body?.image;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return NextResponse.json(
      { error: "image (base64 data URL) is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // --- フォールバック: APIキーが無ければモックを返す（デモが止まらない） ---
  if (!apiKey) {
    return NextResponse.json({ items: MOCK, mock: true });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "このレシートの食材を抽出してください。" },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "OpenAI API error", detail },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "[]";
    const items = parseItems(content);
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json(
      { error: "request failed", detail: String(e) },
      { status: 500 }
    );
  }
}

/** モデル出力（```json ... ``` 付きのこともある）から配列を取り出す */
function parseItems(content: string): ReceiptItem[] {
  try {
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => ({
      name: String(x.name ?? ""),
      quantity: Number(x.quantity ?? 1),
      unit: String(x.unit ?? "個"),
      price: x.price != null ? Number(x.price) : undefined,
      category: ["vegetable", "meat", "dairy", "seasoning", "other"].includes(
        x.category
      )
        ? x.category
        : "other",
    }));
  } catch {
    return [];
  }
}
