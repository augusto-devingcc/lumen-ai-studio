"use client";

import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetCard } from "./asset-card";
import { EmptyState } from "./empty-state";
import type { GeneratedAsset } from "@/lib/types";

export function ResultGrid({
  assets,
  isGenerating,
  onSelect,
}: {
  assets: GeneratedAsset[];
  isGenerating: boolean;
  onSelect: (asset: GeneratedAsset) => void;
}) {
  if (assets.length === 0 && !isGenerating) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState
          icon={ImageIcon}
          title="Nothing generated yet"
          description="Write a prompt and hit Generate. Results land here and persist across reloads."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {isGenerating && (
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
          <Skeleton className="size-full" />
          <span className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] text-muted-foreground">
            generating…
          </span>
        </div>
      )}
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onSelect={onSelect} />
      ))}
    </div>
  );
}
