"use client";

import { X, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logos";
import { modelsByType, VOICES } from "@/lib/providers/models";
import { useFlowsStore } from "@/lib/store/flows-store";
import { useStudioStore } from "@/lib/store/studio-store";
import type { AspectRatio, GeneratedAsset } from "@/lib/types";

const ASPECTS: AspectRatio[] = ["1:1", "16:9", "9:16"];
const IMAGE_MODELS = modelsByType("image");
const VIDEO_MODELS = modelsByType("video");
const IMAGE_ITEMS = IMAGE_MODELS.map((m) => ({ label: m.label, value: m.id }));
const VIDEO_ITEMS = VIDEO_MODELS.map((m) => ({ label: m.label, value: m.id }));

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function NodeInspector() {
  const selectedId = useFlowsStore((s) => s.selectedId);
  const node = useFlowsStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const updateNodeData = useFlowsStore((s) => s.updateNodeData);
  const removeNode = useFlowsStore((s) => s.removeNode);
  const select = useFlowsStore((s) => s.select);

  if (!selectedId || !node) return null;
  const d = node.data;

  function set(patch: Parameters<typeof updateNodeData>[1]) {
    updateNodeData(selectedId as string, patch);
  }

  function saveToStudio() {
    if (!d.resultUrl) return;
    const asset: GeneratedAsset = {
      id: newId(),
      type: d.resultType ?? "image",
      url: d.resultUrl,
      prompt: "From flow",
      model: "flow",
      provider: d.resultProvider ?? "mock",
      mock: d.resultMock ?? false,
      createdAt: Date.now(),
      status: "done",
      meta: { aspectRatio: d.aspectRatio },
    };
    useStudioStore.getState().addAsset(asset);
    toast("Saved to Studio");
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card/30">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">{d.label}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            node
          </span>
        </div>
        <button
          onClick={() => select(null)}
          aria-label="Close inspector"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {d.kind === "prompt" && (
          <div className="space-y-2">
            <Label htmlFor="node-text">Prompt text</Label>
            <Textarea
              id="node-text"
              value={d.text ?? ""}
              onChange={(e) => set({ text: e.target.value })}
              placeholder="Describe what to create…"
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">Feeds connected Image / Video / Audio nodes.</p>
          </div>
        )}

        {(d.kind === "image" || d.kind === "video") && (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-model">Model</Label>
              <Select
                value={d.model}
                onValueChange={(v) => set({ model: String(v) })}
                items={d.kind === "image" ? IMAGE_ITEMS : VIDEO_ITEMS}
              >
                <SelectTrigger id="node-model" className="w-full">
                  {(() => {
                    const list = d.kind === "image" ? IMAGE_MODELS : VIDEO_MODELS;
                    const active = list.find((m) => m.id === d.model);
                    return active ? (
                      <span className="flex items-center gap-2">
                        {active.company && <BrandLogo company={active.company} className="size-3.5" />}
                        {active.label}
                      </span>
                    ) : (
                      <SelectValue placeholder="Model" />
                    );
                  })()}
                </SelectTrigger>
                <SelectContent>
                  {(d.kind === "image" ? IMAGE_MODELS : VIDEO_MODELS).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        {m.company && <BrandLogo company={m.company} className="size-3.5" />}
                        {m.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aspect ratio</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set({ aspectRatio: a })}
                    className={cn(
                      "rounded-md border px-1 py-1.5 font-mono text-xs transition-colors",
                      d.aspectRatio === a
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Prompt comes from a connected Prompt node.
            </p>
          </>
        )}

        {d.kind === "audio" && (
          <div className="space-y-2">
            <Label htmlFor="node-voice">Voice</Label>
            <Select value={d.voice} onValueChange={(v) => set({ voice: String(v) })} items={VOICES}>
              <SelectTrigger id="node-voice" className="w-full">
                <SelectValue placeholder="Voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Text comes from a connected Prompt node.</p>
          </div>
        )}

        {d.kind === "output" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Shows the final result of the connected branch.
            </p>
            <Button
              onClick={saveToStudio}
              disabled={!d.resultUrl}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Save className="size-3.5" /> Save to Studio
            </Button>
            {!d.resultUrl && (
              <p className="text-xs text-muted-foreground/70">Run the flow to produce a result.</p>
            )}
          </div>
        )}

        {d.status === "error" && d.error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {d.error}
          </p>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button
          onClick={() => removeNode(selectedId)}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Delete node
        </Button>
      </div>
    </aside>
  );
}
