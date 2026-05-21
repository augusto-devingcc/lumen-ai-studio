import type { AspectRatio, ModelOption } from "@/lib/types";

// Catalog the Studio model picker offers. Slugs verified against Fal model ids.
export const MODELS: ModelOption[] = [
  // Image
  {
    id: "flux-schnell",
    label: "FLUX schnell",
    type: "image",
    provider: "fal",
    description: "Fastest. Great for drafts.",
  },
  {
    id: "flux-dev",
    label: "FLUX dev",
    type: "image",
    provider: "fal",
    description: "Higher quality, slower.",
  },
  {
    id: "sdxl",
    label: "Fast SDXL",
    type: "image",
    provider: "fal",
    description: "Classic SDXL, versatile.",
  },
  // Video
  {
    id: "ltx-video",
    label: "LTX Video",
    type: "video",
    provider: "fal",
    description: "Text → short video.",
  },
  {
    id: "kling-video",
    label: "Kling 1.0",
    type: "video",
    provider: "fal",
    description: "Image → video motion.",
  },
  // Audio
  {
    id: "elevenlabs-tts",
    label: "ElevenLabs TTS",
    type: "audio",
    provider: "elevenlabs",
    description: "Natural text-to-speech.",
  },
];

/** Map our model id → Fal model slug. */
export const FAL_MODEL_SLUGS: Record<string, string> = {
  "flux-schnell": "fal-ai/flux/schnell",
  "flux-dev": "fal-ai/flux/dev",
  sdxl: "fal-ai/fast-sdxl",
  "ltx-video": "fal-ai/ltx-video",
  "kling-video": "fal-ai/kling-video/v1/standard/image-to-video",
};

/** Map aspect ratio → Fal image_size enum. */
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

export const VOICES: { label: string; value: string }[] = [
  { label: "Rachel", value: "21m00Tcm4TlvDq8ikWAM" },
  { label: "Adam", value: "pNInz6obpgDQGcFmaJgB" },
  { label: "Antoni", value: "ErXwobaYiN019PkySvjV" },
  { label: "Bella", value: "EXAVITQu4vr4xnSDxMaL" },
  { label: "Domi", value: "AZnzlk1XvdvUeBnXmlld" },
];

export function modelById(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}

export function modelsByType(type: ModelOption["type"]): ModelOption[] {
  return MODELS.filter((m) => m.type === type);
}
