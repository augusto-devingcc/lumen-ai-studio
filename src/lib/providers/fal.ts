import { createFalClient } from "@fal-ai/client";
import type { GenerationRequest, GenerationResult } from "./types";
import { buildFalCall, modelById, ASPECT_DIMENSIONS } from "./models";
import { withRetry, withTimeout, TimeoutError } from "./fetch-utils";

// All media (image / video / audio) is served by Fal.ai with a per-request,
// user-provided (BYOK) key. No keys are read from the environment.

interface FalImageOut {
  images?: { url: string; width?: number; height?: number }[];
  seed?: number;
}
interface FalVideoOut {
  video?: { url: string };
}
interface FalAudioOut {
  audio?: { url: string };
}

export async function falGenerate(
  req: GenerationRequest,
  apiKey: string,
): Promise<GenerationResult> {
  const model = modelById(req.model);
  if (!model || !model.slug) {
    return { ok: false, provider: "fal", error: `Unknown model "${req.model}".`, code: "model_unavailable" };
  }

  const { slug, input } = buildFalCall(model, {
    prompt: req.prompt,
    aspectRatio: req.aspectRatio,
    imageUrl: req.imageUrl,
    voice: req.voice,
  });

  const client = createFalClient({ credentials: apiKey });
  const timeoutMs = req.type === "video" ? 240_000 : req.type === "audio" ? 60_000 : 90_000;

  try {
    const result = await withRetry(
      () => withTimeout(() => client.subscribe(slug, { input }), timeoutMs),
      { retries: req.type === "video" ? 0 : 1 },
    );
    const data = result.data as FalImageOut & FalVideoOut & FalAudioOut;

    if (req.type === "image") {
      const img = data.images?.[0];
      if (!img?.url) return { ok: false, provider: "fal", error: "Fal returned no image.", code: "provider_error" };
      const dims = ASPECT_DIMENSIONS[req.aspectRatio ?? "1:1"];
      return {
        ok: true,
        url: img.url,
        provider: "fal",
        mock: false,
        meta: { width: img.width ?? dims.w, height: img.height ?? dims.h, aspectRatio: req.aspectRatio, seed: data.seed },
      };
    }

    if (req.type === "video") {
      if (!data.video?.url) return { ok: false, provider: "fal", error: "Fal returned no video.", code: "provider_error" };
      return { ok: true, url: data.video.url, provider: "fal", mock: false, meta: { aspectRatio: req.aspectRatio } };
    }

    if (!data.audio?.url) return { ok: false, provider: "fal", error: "Fal returned no audio.", code: "provider_error" };
    return { ok: true, url: data.audio.url, provider: "fal", mock: false, meta: { voice: req.voice } };
  } catch (err) {
    if (err instanceof TimeoutError) {
      return { ok: false, provider: "fal", error: "Fal request timed out.", code: "timeout" };
    }
    return { ok: false, provider: "fal", error: "Fal request failed — check your Fal key and try again.", code: "provider_error" };
  }
}
