"use client";

import Link from "next/link";
import { ImageIcon, Clapperboard, Music4, Workflow, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/lib/types";

export interface ToolPart {
  type: string; // e.g. "tool-generate_image"
  toolCallId: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error" | string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

interface ToolOutput {
  ok: boolean;
  type?: AssetType;
  url?: string;
  provider?: string;
  mock?: boolean;
  error?: string;
  kind?: string;
  summary?: string;
}

const META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  "tool-generate_image": { label: "Image", icon: ImageIcon },
  "tool-generate_video": { label: "Video", icon: Clapperboard },
  "tool-generate_audio": { label: "Audio", icon: Music4 },
  "tool-create_flow": { label: "Flow", icon: Workflow },
};

function getPrompt(input: unknown): string | undefined {
  if (input && typeof input === "object") {
    const o = input as Record<string, unknown>;
    if (typeof o.prompt === "string") return o.prompt;
    if (typeof o.text === "string") return o.text;
  }
  return undefined;
}

export function ToolCallCard({ part }: { part: ToolPart }) {
  const meta = META[part.type] ?? { label: "Tool", icon: ImageIcon };
  const Icon = meta.icon;
  const prompt = getPrompt(part.input);
  const output = part.output as ToolOutput | undefined;
  const running = part.state === "input-streaming" || part.state === "input-available";
  const errored = part.state === "output-error" || (output && output.ok === false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/60">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="size-3.5 text-primary" />
        <span className="text-xs font-medium">{meta.label}</span>
        {output?.mock && (
          <Badge variant="secondary" className="h-4 px-1.5 font-mono text-[9px]">
            mock
          </Badge>
        )}
        <span className="ml-auto">
          {running && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          {!running && !errored && <CheckCircle2 className="size-3.5 text-success" />}
          {errored && <AlertTriangle className="size-3.5 text-destructive" />}
        </span>
      </div>

      {prompt && (
        <p className="line-clamp-2 px-3 pb-2 font-mono text-[11px] text-muted-foreground">
          {prompt}
        </p>
      )}

      {running && (
        <div className="px-3 pb-3">
          <div className="aspect-video w-full animate-pulse rounded-md bg-muted" />
        </div>
      )}

      {!running && part.type === "tool-create_flow" && output?.ok && (
        <div className="px-3 pb-3">
          <p className="mb-2 font-mono text-[11px] text-foreground">{output.summary}</p>
          <Link
            href="/flows"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Open in Flows <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      {!running && output?.ok && output.url && (
        <div className="px-3 pb-3">
          {output.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={output.url}
              alt={prompt ?? "generated"}
              className="max-h-72 w-full rounded-md object-contain"
            />
          )}
          {output.type === "video" && (
            <video src={output.url} controls className="max-h-72 w-full rounded-md" />
          )}
          {output.type === "audio" && (
            <audio src={output.url} controls className="w-full" />
          )}
        </div>
      )}

      {errored && (
        <p className={cn("px-3 pb-3 text-[11px] text-destructive")}>
          {output?.error ?? part.errorText ?? "Generation failed."}
        </p>
      )}
    </div>
  );
}
