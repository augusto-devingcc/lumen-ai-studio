"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_CHAT_MODEL } from "@/lib/providers/models";

// Bring-your-own-key settings. Keys live only in the user's browser
// (localStorage) and are sent per-request as headers — never stored server-side.
interface SettingsState {
  /** Vercel AI Gateway key — powers Chat (all LLM models). */
  gatewayKey: string;
  /** Fal.ai key — powers all media generation (image / video / audio). */
  falKey: string;
  /** Selected chat model id (see CHAT_MODELS). */
  chatModel: string;
  setGatewayKey: (k: string) => void;
  setFalKey: (k: string) => void;
  setChatModel: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gatewayKey: "",
      falKey: "",
      chatModel: DEFAULT_CHAT_MODEL,
      setGatewayKey: (k) => set({ gatewayKey: k.trim() }),
      setFalKey: (k) => set({ falKey: k.trim() }),
      setChatModel: (id) => set({ chatModel: id }),
    }),
    {
      name: "lumen-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
