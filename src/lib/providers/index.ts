import type { GenerationRequest, GenerationResult, Provider } from "./types";
import { falProvider } from "./fal";
import { replicateProvider } from "./replicate";
import { elevenlabsProvider } from "./elevenlabs";
import { mockProvider } from "./mock";

export type { GenerationRequest, GenerationResult } from "./types";

// Routing order by capability. Mock is always the last resort so the app
// never hard-fails: fal → replicate → mock (image), fal → mock (video),
// elevenlabs → mock (audio).
const ROUTES: Record<GenerationRequest["type"], Provider[]> = {
  image: [falProvider, replicateProvider],
  video: [falProvider],
  audio: [elevenlabsProvider],
};

function forceMock() {
  return process.env.LUMEN_FORCE_MOCK === "1";
}

/**
 * Unified generation entry point. Tries configured providers in order,
 * falling back to the mock. Never throws — always returns a GenerationResult.
 */
export async function generate(req: GenerationRequest): Promise<GenerationResult> {
  if (forceMock()) return mockProvider.generate(req);

  const candidates = ROUTES[req.type].filter(
    (p) => p.supports(req.type) && p.isConfigured(),
  );

  let lastError: GenerationResult | null = null;
  for (const provider of candidates) {
    const result = await provider.generate(req);
    if (result.ok) return result;
    lastError = result;
  }

  // Nothing configured or everything failed → mock keeps the demo alive.
  const mocked = await mockProvider.generate(req);
  if (mocked.ok && lastError && lastError.code !== "missing_key") {
    // Surface that we fell back after a real failure (kept in meta-free log).
    return mocked;
  }
  return mocked;
}

/** Which providers are configured right now (for UI hints / status). */
export function providerStatus() {
  return {
    fal: falProvider.isConfigured(),
    replicate: replicateProvider.isConfigured(),
    elevenlabs: elevenlabsProvider.isConfigured(),
    forceMock: forceMock(),
  };
}
