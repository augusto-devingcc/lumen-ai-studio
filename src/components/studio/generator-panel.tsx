"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Dice5, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { modelsByType, VOICES, defaultModelFor } from "@/lib/providers/models";
import { useStudioStore } from "@/lib/store/studio-store";
import type { AspectRatio, AssetType } from "@/lib/types";

const ASPECTS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const VIDEO_ASPECTS: AspectRatio[] = ["1:1", "16:9", "9:16"];

const IMAGE_MODELS = modelsByType("image");
const VIDEO_MODELS = modelsByType("video");

const IMAGE_MODEL_ITEMS = IMAGE_MODELS.map((m) => ({ label: m.label, value: m.id }));
const VIDEO_MODEL_ITEMS = VIDEO_MODELS.map((m) => ({ label: m.label, value: m.id }));
const VOICE_ITEMS = VOICES;

type TabType = AssetType;

const TABS: { label: string; value: TabType }[] = [
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Audio", value: "audio" },
];

export function GeneratorPanel() {
  const [activeType, setActiveType] = useState<TabType>("image");

  // Image state
  const [imageModel, setImageModel] = useState<string>(IMAGE_MODELS[0]?.id ?? defaultModelFor("image"));
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageAspect, setImageAspect] = useState<AspectRatio>("1:1");
  const [seed, setSeed] = useState("");

  // Video state
  const [videoModel, setVideoModel] = useState<string>(VIDEO_MODELS[0]?.id ?? defaultModelFor("video"));
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspect, setVideoAspect] = useState<AspectRatio>("16:9");

  // Audio state
  const [audioPrompt, setAudioPrompt] = useState("");
  const [voice, setVoice] = useState<string>(VOICES[0]?.value ?? "21m00Tcm4TlvDq8ikWAM");

  const isGenerating = useStudioStore((s) => s.isGenerating);
  const runGeneration = useStudioStore((s) => s.runGeneration);

  const activeImageModel = IMAGE_MODELS.find((m) => m.id === imageModel);
  const activeVideoModel = VIDEO_MODELS.find((m) => m.id === videoModel);

  async function onGenerate() {
    if (activeType === "image") {
      if (!imagePrompt.trim()) { toast.error("Write a prompt first."); return; }
      const parsedSeed = seed.trim() === "" ? undefined : Number(seed);
      if (parsedSeed !== undefined && !Number.isFinite(parsedSeed)) {
        toast.error("Seed must be a number."); return;
      }
      const outcome = await runGeneration({
        type: "image",
        model: imageModel,
        prompt: imagePrompt.trim(),
        aspectRatio: imageAspect,
        seed: parsedSeed,
      });
      if (!outcome.ok) { toast.error(outcome.error); }
      else if (outcome.asset.mock) {
        toast("Generated in mock mode", {
          description: "No FAL_KEY set — showing a placeholder. Add a key in .env.local for real output.",
        });
      }
    } else if (activeType === "video") {
      if (!videoPrompt.trim()) { toast.error("Write a prompt first."); return; }
      const outcome = await runGeneration({
        type: "video",
        model: videoModel,
        prompt: videoPrompt.trim(),
        aspectRatio: videoAspect,
      });
      if (!outcome.ok) { toast.error(outcome.error); }
      else if (outcome.asset.mock) {
        toast("Generated in mock mode", {
          description: "No FAL_KEY set — showing a placeholder. Add a key in .env.local for real output.",
        });
      }
    } else {
      if (!audioPrompt.trim()) { toast.error("Write text to speak first."); return; }
      const outcome = await runGeneration({
        type: "audio",
        model: defaultModelFor("audio"),
        prompt: audioPrompt.trim(),
        voice,
      });
      if (!outcome.ok) { toast.error(outcome.error); }
      else if (outcome.asset.mock) {
        toast("Generated in mock mode", {
          description: "No ELEVENLABS_API_KEY set — showing a placeholder. Add a key in .env.local for real output.",
        });
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onGenerate();
  }

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-card/20">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 px-5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Studio
        </span>
      </div>

      {/* Type switcher */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveType(tab.value)}
              className={cn(
                "rounded px-2 py-1.5 text-xs font-medium transition-colors",
                activeType === tab.value
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
        {/* IMAGE */}
        {activeType === "image" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="image-model">Model</Label>
              <Select value={imageModel} onValueChange={(v) => setImageModel(String(v))} items={IMAGE_MODEL_ITEMS}>
                <SelectTrigger id="image-model" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODEL_ITEMS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeImageModel?.description && (
                <p className="text-xs text-muted-foreground">{activeImageModel.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-prompt">Prompt</Label>
              <Textarea
                id="image-prompt"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="A neon fox prowling a rain-slicked Tokyo alley, cinematic lighting…"
                className="min-h-28 resize-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <Label>Aspect ratio</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setImageAspect(a)}
                    className={cn(
                      "rounded-md border px-1 py-1.5 font-mono text-xs transition-colors",
                      imageAspect === a
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seed">Seed (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="seed"
                  inputMode="numeric"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="random"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Randomize seed"
                  onClick={() => setSeed(String(Math.floor(Math.random() * 100000)))}
                >
                  <Dice5 className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* VIDEO */}
        {activeType === "video" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="video-model">Model</Label>
              <Select value={videoModel} onValueChange={(v) => setVideoModel(String(v))} items={VIDEO_MODEL_ITEMS}>
                <SelectTrigger id="video-model" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODEL_ITEMS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeVideoModel?.description && (
                <p className="text-xs text-muted-foreground">{activeVideoModel.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-prompt">Prompt</Label>
              <Textarea
                id="video-prompt"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="A slow drone shot over misty mountain peaks at dawn…"
                className="min-h-28 resize-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <Label>Aspect ratio</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {VIDEO_ASPECTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setVideoAspect(a)}
                    className={cn(
                      "rounded-md border px-1 py-1.5 font-mono text-xs transition-colors",
                      videoAspect === a
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-2.5">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
              <p className="text-xs text-muted-foreground">
                Video generation typically takes 30–120 seconds. Hang tight.
              </p>
            </div>
          </>
        )}

        {/* AUDIO */}
        {activeType === "audio" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="audio-voice">Voice</Label>
              <Select value={voice} onValueChange={(v) => setVoice(String(v))} items={VOICE_ITEMS}>
                <SelectTrigger id="audio-voice" className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_ITEMS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-prompt">Text to speak</Label>
              <Textarea
                id="audio-prompt"
                value={audioPrompt}
                onChange={(e) => setAudioPrompt(e.target.value)}
                placeholder="Hello! Welcome to Lumen, your AI-powered media studio…"
                className="min-h-28 resize-none"
                onKeyDown={handleKeyDown}
              />
            </div>
          </>
        )}
      </div>

      {/* Generate button */}
      <div className="border-t border-border p-4">
        <Button onClick={onGenerate} disabled={isGenerating} className="w-full active:scale-[0.99]">
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Generate
            </>
          )}
        </Button>
        <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground/60">
          ⌘/Ctrl + Enter
        </p>
      </div>
    </div>
  );
}
