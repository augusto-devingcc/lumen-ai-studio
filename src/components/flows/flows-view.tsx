"use client";

import { Play, Loader2, Trash2, Plus, Type, ImageIcon, Clapperboard, Music4, Download, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowCanvas } from "./flow-canvas";
import { NodeInspector } from "./node-inspector";
import { useFlowsStore } from "@/lib/store/flows-store";
import type { FlowNodeKind } from "@/lib/types";

const PALETTE: { kind: FlowNodeKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: "prompt", label: "Prompt", icon: Type },
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "video", label: "Video", icon: Clapperboard },
  { kind: "audio", label: "Audio", icon: Music4 },
  { kind: "output", label: "Output", icon: Download },
];

export function FlowsView() {
  const nodeCount = useFlowsStore((s) => s.nodes.length);
  const isRunning = useFlowsStore((s) => s.isRunning);
  const addNode = useFlowsStore((s) => s.addNode);
  const runFlow = useFlowsStore((s) => s.runFlow);
  const clear = useFlowsStore((s) => s.clear);
  const loadStarter = useFlowsStore((s) => s.loadStarter);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex items-center">
          <h1 className="text-sm font-semibold tracking-tight">Flows</h1>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Compose
          </span>
        </div>

        <div className="ml-2 flex items-center gap-1">
          {PALETTE.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => addNode(kind)}
              title={`Add ${label}`}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card/40 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
            >
              <Plus className="size-3" />
              <Icon className="size-3.5" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {nodeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => clear()}
            >
              <Trash2 className="size-3.5" /> Clear
            </Button>
          )}
          <Button size="sm" onClick={() => runFlow()} disabled={isRunning || nodeCount === 0}>
            {isRunning ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Running…
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Run flow
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <FlowCanvas />
          {nodeCount === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="pointer-events-auto flex flex-col items-center gap-4 text-center">
                <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-muted-foreground/70">
                  <Workflow className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Build a creative pipeline</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Add nodes and connect them, then Run. Or start from an example:
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadStarter()}>
                  Load starter flow
                </Button>
              </div>
            </div>
          )}
        </div>

        <NodeInspector />
      </div>
    </div>
  );
}
