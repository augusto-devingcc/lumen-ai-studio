import { fal } from "@fal-ai/client";
import type { Provider, GenerationRequest, GenerationResult } from "./types";
import type { AssetType } from "@/lib/types";
import { FAL_IMAGE_SIZE, FAL_MODEL_SLUGS, ASPECT_DIMENSIONS } from "./models";
import { withRetry, withTimeout, TimeoutError } from "./fetch-utils";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  fal.config({ credentials: process.env.FAL_KEY });
  configured = true;
}

function isConfigured() {
  return Boolean(process.env.FAL_KEY);
}

function supports(type: AssetType) {
  return type === "image" || type === "video";
}

interface FalImageOutput {
  images?: { url: string; width?: number; height?: number }[];
  seed?: number;
}
interface FalVideoOutput {
  video?: { url: string };
}

async function generate(req: GenerationRequest): Promise<GenerationResult> {
  if (!isConfigured()) {
    return { ok: false, provider: "fal", error: "FAL_KEY missing", code: "missing_key" };
  }
  const slug = FAL_MODEL_SLUGS[req.model];
  if (!slug) {
    return {
      ok: false,
      provider: "fal",
      error: `Model "${req.model}" is not available on Fal.`,
      code: "model_unavailable",
    };
  }
  ensureConfigured();

  try {
    if (req.type === "image") {
      const ar = req.aspectRatio ?? "1:1";
      const input: Record<string, unknown> = {
        prompt: req.prompt,
        image_size: FAL_IMAGE_SIZE[ar],
      };
      if (typeof req.seed === "number") input.seed = req.seed;

      const result = await withRetry(
        () => withTimeout(() => fal.subscribe(slug, { input }), 60_000),
        { retries: 1 },
      );
      const data = result.data as FalImageOutput;
      const img = data.images?.[0];
      if (!img?.url) {
        return { ok: false, provider: "fal", error: "Fal returned no image.", code: "provider_error" };
      }
      const dims = ASPECT_DIMENSIONS[ar];
      return {
        ok: true,
        url: img.url,
        provider: "fal",
        mock: false,
        meta: {
          width: img.width ?? dims.w,
          height: img.height ?? dims.h,
          aspectRatio: ar,
          seed: data.seed ?? req.seed,
        },
      };
    }

    // video
    const input: Record<string, unknown> = { prompt: req.prompt };
    if (req.imageUrl) input.image_url = req.imageUrl;
    const result = await withRetry(
      () => withTimeout(() => fal.subscribe(slug, { input }), 180_000),
      { retries: 0 },
    );
    const data = result.data as FalVideoOutput;
    if (!data.video?.url) {
      return { ok: false, provider: "fal", error: "Fal returned no video.", code: "provider_error" };
    }
    return {
      ok: true,
      url: data.video.url,
      provider: "fal",
      mock: false,
      meta: { aspectRatio: req.aspectRatio ?? "16:9", durationSec: req.durationSec },
    };
  } catch (err) {
    if (err instanceof TimeoutError) {
      return { ok: false, provider: "fal", error: "Fal request timed out.", code: "timeout" };
    }
    return {
      ok: false,
      provider: "fal",
      error: "Fal request failed.",
      code: "provider_error",
    };
  }
}

export const falProvider: Provider = {
  name: "fal",
  supports,
  isConfigured,
  generate,
};
