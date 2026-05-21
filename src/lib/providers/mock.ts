import type { Provider, GenerationRequest, GenerationResult } from "./types";
import type { AspectRatio } from "@/lib/types";
import { ASPECT_DIMENSIONS } from "./models";

// Mock provider: makes Lumen fully usable without any API keys.
// Images are generated offline as SVG data URIs. Video/audio point to
// small public-domain samples so the players have something real to show.

const VIDEO_SAMPLES = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

const AUDIO_SAMPLE =
  "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function placeholderSvg(prompt: string, ar: AspectRatio): string {
  const { w, h } = ASPECT_DIMENSIONS[ar];
  const seed = hashString(prompt);
  const hue = seed % 360;
  const hue2 = (hue + 48) % 360;
  const label = (prompt || "untitled").slice(0, 64).replace(/[<>&]/g, " ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},65%,18%)"/>
      <stop offset="1" stop-color="hsl(${hue2},70%,42%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" text-anchor="middle">
    <text x="50%" y="46%" font-size="${Math.round(w / 24)}" opacity="0.95" font-weight="600">${label}</text>
    <text x="50%" y="54%" font-size="${Math.round(w / 42)}" opacity="0.6" font-family="ui-monospace,monospace">mock · ${w}×${h}</text>
  </g>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function generate(req: GenerationRequest): Promise<GenerationResult> {
  // Simulate latency so loading states are visible during a demo.
  await new Promise((r) => setTimeout(r, req.type === "video" ? 1400 : 700));

  if (req.type === "image") {
    const ar = req.aspectRatio ?? "1:1";
    const { w, h } = ASPECT_DIMENSIONS[ar];
    return {
      ok: true,
      url: placeholderSvg(req.prompt, ar),
      provider: "mock",
      mock: true,
      meta: {
        width: w,
        height: h,
        aspectRatio: ar,
        seed: req.seed ?? hashString(req.prompt) % 100000,
        estCostUsd: 0,
      },
    };
  }

  if (req.type === "video") {
    const url = VIDEO_SAMPLES[hashString(req.prompt) % VIDEO_SAMPLES.length];
    return {
      ok: true,
      url,
      provider: "mock",
      mock: true,
      meta: {
        aspectRatio: req.aspectRatio ?? "16:9",
        durationSec: req.durationSec ?? 5,
        estCostUsd: 0,
      },
    };
  }

  // audio
  return {
    ok: true,
    url: AUDIO_SAMPLE,
    provider: "mock",
    mock: true,
    meta: { voice: req.voice ?? "sample", durationSec: req.durationSec ?? 8, estCostUsd: 0 },
  };
}

export const mockProvider: Provider = {
  name: "mock",
  supports: () => true,
  isConfigured: () => true,
  generate,
};
