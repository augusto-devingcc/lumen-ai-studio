"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratorPanel } from "./generator-panel";
import { ResultGrid } from "./result-grid";
import { Lightbox } from "./lightbox";
import { useStudioStore } from "@/lib/store/studio-store";
import type { GeneratedAsset } from "@/lib/types";

export function StudioView() {
  const assets = useStudioStore((s) => s.assets);
  const isGenerating = useStudioStore((s) => s.isGenerating);
  const clear = useStudioStore((s) => s.clear);
  const [selected, setSelected] = useState<GeneratedAsset | null>(null);

  return (
    <div className="flex h-full min-h-0">
      <GeneratorPanel />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-semibold tracking-tight">Gallery</h1>
            <span className="font-mono text-xs text-muted-foreground">
              {assets.length} {assets.length === 1 ? "asset" : "assets"}
            </span>
          </div>
          {assets.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => clear()}
            >
              <Trash2 className="size-3.5" /> Clear
            </Button>
          )}
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <ResultGrid assets={assets} isGenerating={isGenerating} onSelect={setSelected} />
        </ScrollArea>
      </section>

      <Lightbox asset={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
