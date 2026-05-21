import Replicate from "replicate";
import type { Provider, GenerationRequest, GenerationResult } from "./types";
import type { AssetType } from "@/lib/types";
import { ASPECT_DIMENSIONS } from "./models";
import { withTimeout, TimeoutError } from "./fetch-utils";

// Fallback provider. Best-effort: serves image when Fal is unavailable.
// Output coercion is defensive because Replicate output shapes vary by model/version.

function isConfigured() {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

function supports(type: AssetType) {
  return type === "image";
}

const REPLICATE_MODELS: Record<string, `${string}/${string}`> = {
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-dev": "black-forest-labs/flux-dev",
  sdxl: "stability-ai/sdxl",
};

function coerceUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const u = coerceUrl(item);
      if (u) return u;
    }
    return null;
  }
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;
    if (typeof obj.url === "function") {
      try {
        return String((obj.url as () => unknown)());
      } catch {
        return null;
      }
    }
    if (typeof obj.url === "string") return obj.url;
  }
  return null;
}

async function generate(req: GenerationRequest): Promise<GenerationResult> {
  if (!isConfigured()) {
    return { ok: false, provider: "replicate", error: "REPLICATE_API_TOKEN missing", code: "missing_key" };
  }
  if (req.type !== "image") {
    return { ok: false, provider: "replicate", error: "Type unsupported on Replicate.", code: "model_unavailable" };
  }
  const model = REPLICATE_MODELS[req.model] ?? REPLICATE_MODELS["flux-schnell"];
  const ar = req.aspectRatio ?? "1:1";

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await withTimeout(
      () =>
        replicate.run(model, {
          input: {
            prompt: req.prompt,
            aspect_ratio: ar,
            ...(typeof req.seed === "number" ? { seed: req.seed } : {}),
          },
        }),
      90_000,
    );
    const url = coerceUrl(output);
    if (!url) {
      return { ok: false, provider: "replicate", error: "Replicate returned no image.", code: "provider_error" };
    }
    const dims = ASPECT_DIMENSIONS[ar];
    return {
      ok: true,
      url,
      provider: "replicate",
      mock: false,
      meta: { width: dims.w, height: dims.h, aspectRatio: ar, seed: req.seed },
    };
  } catch (err) {
    if (err instanceof TimeoutError) {
      return { ok: false, provider: "replicate", error: "Replicate timed out.", code: "timeout" };
    }
    return { ok: false, provider: "replicate", error: "Replicate request failed.", code: "provider_error" };
  }
}

export const replicateProvider: Provider = {
  name: "replicate",
  supports,
  isConfigured,
  generate,
};
