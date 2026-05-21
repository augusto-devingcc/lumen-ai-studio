"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GeneratedAsset, AssetType, AspectRatio } from "@/lib/types";
import type { GenerationResult } from "@/lib/providers/types";
import { useSettingsStore } from "./settings-store";

export interface RunGenerationInput {
  type: AssetType;
  model: string;
  prompt: string;
  aspectRatio?: AspectRatio;
  seed?: number;
  imageUrl?: string;
  voice?: string;
  durationSec?: number;
}

export type RunOutcome =
  | { ok: true; asset: GeneratedAsset }
  | { ok: false; error: string };

interface StudioState {
  assets: GeneratedAsset[];
  isGenerating: boolean;
  addAsset: (asset: GeneratedAsset) => void;
  removeAsset: (id: string) => void;
  clear: () => void;
  runGeneration: (input: RunGenerationInput) => Promise<RunOutcome>;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Shared generation routine. Used by Studio, Chat tools, and Flows. */
export async function callGenerate(input: RunGenerationInput): Promise<GenerationResult> {
  const falKey = useSettingsStore.getState().falKey;
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(falKey ? { "x-fal-key": falKey } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      provider: "mock",
      error: data?.error ?? `Request failed (${res.status}).`,
      code: "bad_request",
    };
  }
  return (await res.json()) as GenerationResult;
}

export function resultToAsset(input: RunGenerationInput, result: GenerationResult): GeneratedAsset {
  if (!result.ok) {
    return {
      id: newId(),
      type: input.type,
      url: "",
      prompt: input.prompt,
      model: input.model,
      provider: result.provider,
      mock: false,
      createdAt: Date.now(),
      status: "error",
      error: result.error,
      meta: {},
    };
  }
  return {
    id: newId(),
    type: input.type,
    url: result.url,
    prompt: input.prompt,
    model: input.model,
    provider: result.provider,
    mock: result.mock,
    createdAt: Date.now(),
    status: "done",
    meta: result.meta,
  };
}

const MAX_PERSISTED = 60;

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      assets: [],
      isGenerating: false,
      addAsset: (asset) => set({ assets: [asset, ...get().assets].slice(0, 200) }),
      removeAsset: (id) => set({ assets: get().assets.filter((a) => a.id !== id) }),
      clear: () => set({ assets: [] }),
      runGeneration: async (input) => {
        set({ isGenerating: true });
        try {
          const result = await callGenerate(input);
          const asset = resultToAsset(input, result);
          if (result.ok) {
            set({ assets: [asset, ...get().assets].slice(0, 200) });
            return { ok: true, asset };
          }
          return { ok: false, error: result.error };
        } catch {
          return { ok: false, error: "Network error. Please try again." };
        } finally {
          set({ isGenerating: false });
        }
      },
    }),
    {
      name: "lumen-studio",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist a capped slice; drop heavy base64 audio data URIs from storage.
        assets: state.assets
          .filter((a) => !(a.type === "audio" && a.url.startsWith("data:")))
          .slice(0, MAX_PERSISTED),
      }),
    },
  ),
);
