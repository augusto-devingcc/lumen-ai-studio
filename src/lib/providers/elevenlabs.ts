import type { Provider, GenerationRequest, GenerationResult } from "./types";
import type { AssetType } from "@/lib/types";
import { fetchWithTimeout, withRetry } from "./fetch-utils";

// ElevenLabs text-to-speech. Returns audio as a base64 data URI so the
// client can play it directly without object storage.

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // "Rachel"
const TTS_MODEL = "eleven_multilingual_v2";

function isConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

function supports(type: AssetType) {
  return type === "audio";
}

async function generate(req: GenerationRequest): Promise<GenerationResult> {
  if (!isConfigured()) {
    return { ok: false, provider: "elevenlabs", error: "ELEVENLABS_API_KEY missing", code: "missing_key" };
  }
  const voice = req.voice || DEFAULT_VOICE;
  try {
    const res = await withRetry(
      () =>
        fetchWithTimeout(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({ text: req.prompt, model_id: TTS_MODEL }),
          },
          45_000,
        ),
      { retries: 1 },
    );

    if (!res.ok) {
      const code = res.status === 429 ? "rate_limited" : "provider_error";
      return { ok: false, provider: "elevenlabs", error: `ElevenLabs error (${res.status}).`, code };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const url = `data:audio/mpeg;base64,${buf.toString("base64")}`;
    return {
      ok: true,
      url,
      provider: "elevenlabs",
      mock: false,
      meta: { voice },
    };
  } catch {
    return { ok: false, provider: "elevenlabs", error: "ElevenLabs request failed.", code: "provider_error" };
  }
}

export const elevenlabsProvider: Provider = {
  name: "elevenlabs",
  supports,
  isConfigured,
  generate,
};
