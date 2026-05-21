"use client";

import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { Type, ImageIcon, Clapperboard, Music4, Download, Loader2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowNode } from "@/lib/store/flows-store";
import type { FlowNodeKind } from "@/lib/types";

const ICONS: Record<FlowNodeKind, React.ComponentType<{ className?: string }>> = {
  prompt: Type,
  image: ImageIcon,
  video: Clapperboard,
  audio: Music4,
  output: Download,
};

const handleClass =
  "!size-2.5 !rounded-full !border-2 !border-background !bg-muted-foreground";

function StatusDot({ status }: { status: FlowNode["data"]["status"] }) {
  if (status === "running")
    return <Loader2 className="size-3 animate-spin text-running" />;
  return (
    <CircleDot
      className={cn(
        "size-3",
        status === "done" && "text-success",
        status === "error" && "text-destructive",
        status === "idle" && "text-muted-foreground/50",
      )}
    />
  );
}

function LumenNode({ data, selected }: NodeProps<FlowNode>) {
  const Icon = ICONS[data.kind];
  const hasTarget = data.kind !== "prompt";
  const hasSource = data.kind !== "output";

  return (
    <div
      className={cn(
        "w-44 overflow-hidden rounded-lg border bg-card text-foreground shadow-sm transition-colors",
        selected ? "border-primary ring-1 ring-primary/40" : "border-border",
        data.status === "error" && "border-destructive/60",
      )}
    >
      {hasTarget && <Handle type="target" position={Position.Left} className={handleClass} />}

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Icon className="size-3.5 text-primary" />
        <span className="text-xs font-medium">{data.label}</span>
        <span className="ml-auto">
          <StatusDot status={data.status} />
        </span>
      </div>

      <div className="px-3 py-2">
        {data.kind === "prompt" && (
          <p className="line-clamp-3 font-mono text-[10px] text-muted-foreground">
            {data.text?.trim() || "empty prompt"}
          </p>
        )}

        {(data.kind === "image" || data.kind === "video") && (
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground">
              {data.model} · {data.aspectRatio}
            </p>
            {data.status === "done" && data.resultUrl && (
              <Preview url={data.resultUrl} kind={data.resultType ?? data.kind} />
            )}
          </div>
        )}

        {data.kind === "audio" && (
          <div className="space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground">tts · voice</p>
            {data.status === "done" && data.resultUrl && (
              <audio src={data.resultUrl} controls className="h-7 w-full" />
            )}
          </div>
        )}

        {data.kind === "output" && (
          <div>
            {data.status === "done" && data.resultUrl ? (
              <Preview url={data.resultUrl} kind={data.resultType ?? "image"} />
            ) : (
              <p className="font-mono text-[10px] text-muted-foreground">final result</p>
            )}
          </div>
        )}

        {data.status === "error" && data.error && (
          <p className="mt-1 text-[10px] text-destructive">{data.error}</p>
        )}
      </div>

      {hasSource && <Handle type="source" position={Position.Right} className={handleClass} />}
    </div>
  );
}

function Preview({ url, kind }: { url: string; kind: string }) {
  if (kind === "video") {
    return <video src={url} muted className="aspect-video w-full rounded object-cover" />;
  }
  if (kind === "audio") {
    return <audio src={url} controls className="h-7 w-full" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="result" className="aspect-square w-full rounded object-cover" />;
}

export const nodeTypes: NodeTypes = { lumen: LumenNode };
