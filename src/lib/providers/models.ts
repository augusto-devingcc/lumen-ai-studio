import type { AspectRatio, AssetType, ChatModel, ModelOption } from "@/lib/types";

// ---- Chat models (routed through the Vercel AI Gateway) ----
// Slugs verified against https://ai-gateway.vercel.sh/v1/models
export const CHAT_MODELS: ChatModel[] = [
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6", company: "anthropic", slug: "anthropic/claude-sonnet-4.6" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", company: "google", slug: "google/gemini-3.5-flash" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", company: "openai", slug: "openai/gpt-5.4-mini" },
];
export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].id;

export function chatModelById(id: string | undefined): ChatModel {
  return CHAT_MODELS.find((m) => m.id === id) ?? CHAT_MODELS[0];
}

// ---- Media models (all served by Fal.ai) ----
// Slugs + input shapes verified against each model's Fal OpenAPI schema.
export const MODELS: ModelOption[] = [
  // Image
  { id: "nano-banana-2", label: "Nano Banana 2", type: "image", provider: "fal", company: "google", slug: "fal-ai/nano-banana-2", aspectMode: "aspect_ratio", description: "Google's latest. Crisp and fast." },
  { id: "nano-banana-pro", label: "Nano Banana Pro", type: "image", provider: "fal", company: "google", slug: "fal-ai/nano-banana-pro", aspectMode: "aspect_ratio", description: "Highest quality, up to 4K." },
  { id: "gpt-image-2", label: "GPT Image 2", type: "image", provider: "fal", company: "openai", slug: "openai/gpt-image-2", aspectMode: "none", description: "OpenAI image model." },
  { id: "seedream-5", label: "Seedream 5", type: "image", provider: "fal", company: "bytedance", slug: "fal-ai/bytedance/seedream/v5/lite/text-to-image", aspectMode: "image_size", description: "ByteDance Seedream v5." },
  // Video
  { id: "seedance-2", label: "Seedance 2.0", type: "video", provider: "fal", company: "bytedance", slug: "bytedance/seedance-2.0/text-to-video", i2vSlug: "bytedance/seedance-2.0/image-to-video", aspectMode: "aspect_ratio", description: "ByteDance. Text or image → video." },
  { id: "kling-3", label: "Kling 3.0 Pro", type: "video", provider: "fal", company: "kuaishou", slug: "fal-ai/kling-video/v3/pro/text-to-video", i2vSlug: "fal-ai/kling-video/v3/pro/image-to-video", aspectMode: "aspect_ratio", description: "Kuaishou. Strong motion." },
  { id: "veo-3.1", label: "Veo 3.1", type: "video", provider: "fal", company: "google", slug: "fal-ai/veo3.1", aspectMode: "aspect_ratio", description: "Google. Cinematic, with audio." },
  // Audio
  { id: "elevenlabs-turbo", label: "ElevenLabs Turbo v2.5", type: "audio", provider: "elevenlabs", company: "elevenlabs", slug: "fal-ai/elevenlabs/tts/turbo-v2.5", aspectMode: "none", description: "Natural multilingual TTS." },
];

// Per-model allowed aspect ratios (only when narrower than the global set).
const MODEL_ASPECTS: Record<string, AspectRatio[]> = {
  "veo-3.1": ["16:9", "9:16"],
};

/** ElevenLabs (via Fal) accepts voice names, not IDs. */
export const VOICES: { label: string; value: string }[] = [
  { label: "Rachel", value: "Rachel" },
  { label: "Sarah", value: "Sarah" },
  { label: "Charlie", value: "Charlie" },
  { label: "George", value: "George" },
  { label: "River", value: "River" },
];

/** Aspect ratio → Fal `image_size` enum (for image_size-mode models + mock). */
export const FAL_IMAGE_SIZE: Record<AspectRatio, string> = {
  "1:1": "square_hd",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
};

/** Pixel dimensions per aspect ratio (used by mock + metadata). */
export const ASPECT_DIMENSIONS: Record<AspectRatio, { w: number; h: number }> = {
  "1:1": { w: 1024, h: 1024 },
  "16:9": { w: 1280, h: 720 },
  "9:16": { w: 720, h: 1280 },
  "4:3": { w: 1024, h: 768 },
  "3:4": { w: 768, h: 1024 },
};

export function modelById(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}

export function modelsByType(type: AssetType): ModelOption[] {
  return MODELS.filter((m) => m.type === type);
}

export function defaultModelFor(type: AssetType): string {
  return modelsByType(type)[0]?.id ?? "";
}

function clampAspect(modelId: string, ar: AspectRatio | undefined): AspectRatio | undefined {
  if (!ar) return undefined;
  const allowed = MODEL_ASPECTS[modelId];
  if (allowed && !allowed.includes(ar)) return allowed[0];
  return ar;
}

export interface FalCall {
  slug: string;
  input: Record<string, unknown>;
}

/** Build the exact Fal endpoint slug + input body for a model, per its schema. */
export function buildFalCall(
  model: ModelOption,
  req: { prompt: string; aspectRatio?: AspectRatio; imageUrl?: string; voice?: string },
): FalCall {
  if (model.type === "audio") {
    const input: Record<string, unknown> = { text: req.prompt };
    if (req.voice) input.voice = req.voice;
    return { slug: model.slug as string, input };
  }

  if (model.type === "video") {
    const useI2V = Boolean(req.imageUrl && model.i2vSlug);
    const slug = useI2V ? (model.i2vSlug as string) : (model.slug as string);
    const input: Record<string, unknown> = { prompt: req.prompt };
    const ar = clampAspect(model.id, req.aspectRatio);
    if (model.aspectMode === "aspect_ratio" && ar) input.aspect_ratio = ar;
    if (useI2V) input.image_url = req.imageUrl;
    return { slug, input };
  }

  // image
  const input: Record<string, unknown> = { prompt: req.prompt };
  const ar = req.aspectRatio;
  if (model.aspectMode === "aspect_ratio" && ar) input.aspect_ratio = ar;
  if (model.aspectMode === "image_size" && ar) input.image_size = FAL_IMAGE_SIZE[ar];
  return { slug: model.slug as string, input };
}
