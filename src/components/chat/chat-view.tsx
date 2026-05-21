"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import Link from "next/link";
import { ArrowUp, MessagesSquare, Loader2, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Message } from "./message";
import { BrandLogo } from "@/components/brand-logos";
import { useStudioStore } from "@/lib/store/studio-store";
import type { RunOutcome } from "@/lib/store/studio-store";
import { useFlowsStore } from "@/lib/store/flows-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { CHAT_MODELS, chatModelById, defaultModelFor } from "@/lib/providers/models";
import type { AspectRatio, AssetType } from "@/lib/types";

const CHAT_MODEL_ITEMS = CHAT_MODELS.map((m) => ({ label: m.label, value: m.id }));

const STORAGE_KEY = "lumen-chat";

const SUGGESTIONS = [
  "Generate a neon fox prowling a rain-slicked Tokyo alley",
  "Make a short cinematic clip of waves at dawn",
  "Read aloud: Welcome to Lumen, your AI media studio",
];

function toOutput(outcome: RunOutcome, type: AssetType) {
  return outcome.ok
    ? { ok: true as const, type, url: outcome.asset.url, provider: outcome.asset.provider, mock: outcome.asset.mock }
    : { ok: false as const, type, error: outcome.error };
}

export function ChatView() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // BYOK: inject the user's gateway key + selected model per request (read at send time).
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          headers: { "x-ai-gateway-key": useSettingsStore.getState().gatewayKey },
          body: { messages, model: useSettingsStore.getState().chatModel },
        }),
      }),
  );

  const { messages, sendMessage, addToolOutput, status, error, setMessages } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return;
      const run = useStudioStore.getState().runGeneration;
      const input = toolCall.input as {
        prompt?: string;
        text?: string;
        model?: string;
        aspectRatio?: AspectRatio;
      };
      try {
        if (toolCall.toolName === "generate_image") {
          const outcome = await run({
            type: "image",
            model: input.model ?? defaultModelFor("image"),
            prompt: input.prompt ?? "",
            aspectRatio: input.aspectRatio,
          });
          addToolOutput({ tool: "generate_image", toolCallId: toolCall.toolCallId, output: toOutput(outcome, "image") });
        } else if (toolCall.toolName === "generate_video") {
          const outcome = await run({
            type: "video",
            model: input.model ?? defaultModelFor("video"),
            prompt: input.prompt ?? "",
            aspectRatio: input.aspectRatio ?? "16:9",
          });
          addToolOutput({ tool: "generate_video", toolCallId: toolCall.toolCallId, output: toOutput(outcome, "video") });
        } else if (toolCall.toolName === "generate_audio") {
          const outcome = await run({ type: "audio", model: defaultModelFor("audio"), prompt: input.text ?? "" });
          addToolOutput({ tool: "generate_audio", toolCallId: toolCall.toolCallId, output: toOutput(outcome, "audio") });
        } else if (toolCall.toolName === "create_flow") {
          const spec = toolCall.input as { prompt: string; steps: AssetType[] };
          useFlowsStore.getState().createFlow(spec.prompt, spec.steps);
          addToolOutput({
            tool: "create_flow",
            toolCallId: toolCall.toolCallId,
            output: {
              ok: true,
              kind: "flow",
              summary: ["prompt", ...spec.steps, "output"].join(" → "),
            },
          });
        }
      } catch {
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { ok: false, error: "Generation failed." },
        });
      }
    },
  });

  // Load persisted history once.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      } catch {
        // ignore corrupt storage
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Autoscroll.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const chatModel = useSettingsStore((s) => s.chatModel);
  const setChatModel = useSettingsStore((s) => s.setChatModel);
  const hasGatewayKey = useSettingsStore((s) => s.gatewayKey.trim().length > 0);
  const currentModel = chatModelById(chatModel);

  const busy = status === "submitted" || status === "streaming";

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-tight">Chat</h1>
          <Select
            value={chatModel}
            onValueChange={(v) => setChatModel(String(v))}
            items={CHAT_MODEL_ITEMS}
          >
            <SelectTrigger aria-label="Model" className="h-8 gap-2">
              <BrandLogo company={currentModel.company} className="size-3.5" />
              <span className="text-xs">{currentModel.label}</span>
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    <BrandLogo company={m.company} className="size-3.5" />
                    {m.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          {!hasGatewayKey && (
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-warning hover:bg-accent/50"
            >
              <KeyRound className="size-3.5" /> Add key
            </Link>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMessages([]);
                localStorage.removeItem(STORAGE_KEY);
              }}
            >
              New chat
            </Button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-5 pt-16 text-center">
              <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-primary">
                <MessagesSquare className="size-5" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ask Lumen to make something</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  It calls tools to generate images, video, and audio — saved straight to your Studio gallery.
                </p>
              </div>
              <div className="flex w-full max-w-md flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-lg border border-border bg-card/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <Message key={m.id} message={m} />)
          )}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Thinking…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-4">
        {error && (
          <div className="mx-auto mb-3 flex max-w-2xl items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Couldn’t reach the model. Add your Vercel AI Gateway key in{" "}
              <Link href="/settings" className="font-medium underline">
                Settings
              </Link>{" "}
              to enable Chat. (Studio works without it.)
            </span>
          </div>
        )}
        <form
          className="mx-auto flex max-w-2xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for an image, a clip, a voiceover…"
            className="max-h-40 min-h-11 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || busy} aria-label="Send">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
