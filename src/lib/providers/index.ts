import type { GenerationRequest, GenerationResult } from "./types";
import { falGenerate } from "./fal";
import { mockProvider } from "./mock";

export type { GenerationRequest, GenerationResult } from "./types";

export interface GenerateOptions {
  /** User-provided Fal key (BYOK). Without it, generation falls back to mock. */
  falKey?: string;
}

function forceMock() {
  return process.env.LUMEN_FORCE_MOCK === "1";
}

/**
 * Unified generation entry point. With a Fal key, all media (image/video/audio)
 * is served by Fal; without a key (or when forced) it returns mock placeholders
 * so the app is fully usable as a demo. Never throws.
 */
export async function generate(
  req: GenerationRequest,
  opts: GenerateOptions = {},
): Promise<GenerationResult> {
  if (forceMock() || !opts.falKey) {
    return mockProvider.generate(req);
  }
  return falGenerate(req, opts.falKey);
}
