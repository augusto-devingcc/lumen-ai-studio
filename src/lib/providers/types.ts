// Unified provider contract. Every external generation call conforms to this.
// Implemented by lib/providers/{fal,replicate,elevenlabs,mock}.ts and routed by index.ts.

import type {
  AspectRatio,
  AssetType,
  AssetMeta,
  ProviderName,
} from "@/lib/types";

export interface GenerationRequest {
  type: AssetType;
  model: string;
  prompt: string;
  aspectRatio?: AspectRatio;
  seed?: number;
  /** image-to-video / reference image, as a URL. */
  imageUrl?: string;
  /** audio (TTS) voice id/name. */
  voice?: string;
  /** requested duration for video/audio where supported. */
  durationSec?: number;
}

export type GenerationResult =
  | {
      ok: true;
      url: string;
      provider: ProviderName;
      mock: boolean;
      meta: AssetMeta;
    }
  | {
      ok: false;
      provider: ProviderName;
      /** User-facing, safe error message (never raw vendor error). */
      error: string;
      /** machine-readable cause for branching/telemetry. */
      code: GenerationErrorCode;
    };

export type GenerationErrorCode =
  | "missing_key"
  | "timeout"
  | "rate_limited"
  | "model_unavailable"
  | "provider_error"
  | "bad_request";

/** A provider implementation. Returns a typed result; never throws to the caller. */
export interface Provider {
  name: ProviderName;
  /** Which asset types this provider can serve. */
  supports: (type: AssetType) => boolean;
  /** True only when the required env key is present. */
  isConfigured: () => boolean;
  generate: (req: GenerationRequest) => Promise<GenerationResult>;
}
