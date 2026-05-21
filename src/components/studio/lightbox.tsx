"use client";

import { useRouter } from "next/navigation";
import { Copy, Download, Workflow } from "lucide-react";
import { toast } from "sonner";
import { useFlowsStore } from "@/lib/store/flows-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GeneratedAsset } from "@/lib/types";

function Meta({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

export function Lightbox({
  asset,
  onOpenChange,
}: {
  asset: GeneratedAsset | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const startFromAsset = useFlowsStore((s) => s.startFromAsset);

  return (
    <Dialog open={Boolean(asset)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {asset && (
          <div className="grid md:grid-cols-[1fr_280px]">
            <div className="grid place-items-center bg-background p-4">
              {asset.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.prompt}
                  className="max-h-[70vh] w-full rounded-md object-contain"
                />
              )}
              {asset.type === "video" && (
                <video src={asset.url} controls autoPlay loop className="max-h-[70vh] w-full rounded-md" />
              )}
              {asset.type === "audio" && (
                <div className="w-full px-2 py-8">
                  <audio src={asset.url} controls className="w-full" />
                </div>
              )}
            </div>

            <div className="flex flex-col border-t border-border md:border-l md:border-t-0">
              <DialogHeader className="p-4 text-left">
                <DialogTitle className="line-clamp-3 text-sm font-medium leading-snug">
                  {asset.prompt}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {asset.model} · {asset.provider}
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="flex-1 overflow-y-auto p-4">
                <Meta label="Type" value={asset.type} />
                <Meta label="Provider" value={asset.provider} />
                <Meta label="Model" value={asset.model} />
                <Meta label="Seed" value={asset.meta.seed} />
                <Meta
                  label="Dimensions"
                  value={
                    asset.meta.width && asset.meta.height
                      ? `${asset.meta.width}×${asset.meta.height}`
                      : undefined
                  }
                />
                <Meta label="Aspect" value={asset.meta.aspectRatio} />
                <Meta label="Duration" value={asset.meta.durationSec ? `${asset.meta.durationSec}s` : undefined} />
                <Meta label="Voice" value={asset.meta.voice} />
                <Meta
                  label="Cost"
                  value={asset.meta.estCostUsd !== undefined ? `$${asset.meta.estCostUsd.toFixed(3)}` : undefined}
                />
                <Meta label="Mock" value={asset.mock ? "yes" : "no"} />
                <Meta label="Created" value={new Date(asset.createdAt).toLocaleString()} />
              </div>
              <Separator />
              <div className="flex flex-col gap-2 p-4">
                {asset.type !== "audio" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      startFromAsset(asset);
                      toast("Sent to Flows");
                      onOpenChange(false);
                      router.push("/flows");
                    }}
                  >
                    <Workflow className="size-3.5" /> Use in a Flow
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(asset.prompt);
                      toast("Prompt copied");
                    }}
                  >
                    <Copy className="size-3.5" /> Prompt
                  </Button>
                  <a
                    href={asset.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                  >
                    <Download className="size-3.5" /> Open
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
