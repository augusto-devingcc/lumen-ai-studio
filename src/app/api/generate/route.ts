import { NextResponse } from "next/server";
import { generate } from "@/lib/providers";
import type { GenerationRequest } from "@/lib/providers/types";
import type { AspectRatio, AssetType } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const ASSET_TYPES: AssetType[] = ["image", "video", "audio"];
const ASPECTS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

function parse(body: unknown): GenerationRequest | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body." };
  const b = body as Record<string, unknown>;

  const type = b.type;
  if (typeof type !== "string" || !ASSET_TYPES.includes(type as AssetType)) {
    return { error: "Field 'type' must be image | video | audio." };
  }
  if (typeof b.model !== "string" || !b.model) return { error: "Field 'model' is required." };
  if (typeof b.prompt !== "string" || !b.prompt.trim()) return { error: "Field 'prompt' is required." };

  const req: GenerationRequest = {
    type: type as AssetType,
    model: b.model,
    prompt: b.prompt.trim(),
  };
  if (typeof b.aspectRatio === "string" && ASPECTS.includes(b.aspectRatio as AspectRatio)) {
    req.aspectRatio = b.aspectRatio as AspectRatio;
  }
  if (typeof b.seed === "number" && Number.isFinite(b.seed)) req.seed = b.seed;
  if (typeof b.imageUrl === "string") req.imageUrl = b.imageUrl;
  if (typeof b.voice === "string") req.voice = b.voice;
  if (typeof b.durationSec === "number") req.durationSec = b.durationSec;
  return req;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed JSON." }, { status: 400 });
  }

  const parsed = parse(body);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const result = await generate(parsed);
  // generate() never throws; non-ok results are returned with 200 so the
  // client can render a designed error state rather than catch a network error.
  return NextResponse.json(result);
}
