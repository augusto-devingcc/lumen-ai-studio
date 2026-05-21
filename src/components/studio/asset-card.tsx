"use client";

import { Trash2, Play, Music4 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useStudioStore } from "@/lib/store/studio-store";
import type { GeneratedAsset } from "@/lib/types";

export function AssetCard({
  asset,
  onSelect,
}: {
  asset: GeneratedAsset;
  onSelect: (asset: GeneratedAsset) => void;
}) {
  const removeAsset = useStudioStore((s) => s.removeAsset);

  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border border-border bg-card text-left transition-all",
        "hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "animate-in fade-in zoom-in-95 duration-200",
      )}
    >
      {asset.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={asset.prompt}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
      {asset.type === "video" && (
        <>
          <video src={asset.url} muted playsInline className="size-full object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-10 place-items-center rounded-full bg-background/70 backdrop-blur-sm">
              <Play className="size-4 fill-foreground" />
            </span>
          </span>
        </>
      )}
      {asset.type === "audio" && (
        <div className="grid size-full place-items-center bg-gradient-to-br from-card to-surface-2">
          <Music4 className="size-8 text-muted-foreground" />
        </div>
      )}

      {/* top badges */}
      <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
        {asset.mock && (
          <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[10px]">
            mock
          </Badge>
        )}
      </div>

      {/* hover overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {asset.model}
        </span>
        <span
          role="button"
          tabIndex={-1}
          aria-label="Delete asset"
          onClick={(e) => {
            e.stopPropagation();
            removeAsset(asset.id);
            toast("Asset removed");
          }}
          className="pointer-events-auto grid size-6 place-items-center rounded-md bg-background/80 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </span>
      </div>
    </button>
  );
}
