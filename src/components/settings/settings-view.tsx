"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, KeyRound, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/settings-store";

function KeyField({
  id,
  label,
  value,
  onChange,
  placeholder,
  help,
  href,
  hrefLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  help: string;
  href: string;
  hrefLabel: string;
}) {
  const [show, setShow] = useState(false);
  const set = value.trim().length > 0;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          <KeyRound className="size-3.5 text-muted-foreground" />
          {label}
        </Label>
        {set && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="size-3.5" /> saved
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="pr-9 font-mono"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide key" : "Show key"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {help}{" "}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          {hrefLabel} <ExternalLink className="size-3" />
        </a>
      </p>
    </div>
  );
}

export function SettingsView() {
  const gatewayKey = useSettingsStore((s) => s.gatewayKey);
  const falKey = useSettingsStore((s) => s.falKey);
  const setGatewayKey = useSettingsStore((s) => s.setGatewayKey);
  const setFalKey = useSettingsStore((s) => s.setFalKey);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-5">
        <h1 className="text-sm font-semibold tracking-tight">Settings</h1>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Keys
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl space-y-6 px-5 py-8">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">Bring your own keys</h2>
            <p className="text-sm text-muted-foreground">
              Lumen never uses shared keys. Your keys are stored only in this browser and sent
              directly with each request. Without keys, generation runs in mock mode.
            </p>
          </div>

          <KeyField
            id="gateway-key"
            label="Vercel AI Gateway key — Chat"
            value={gatewayKey}
            onChange={setGatewayKey}
            placeholder="vck_..."
            help="Powers all chat models (Claude, Gemini, GPT) through one key. Create one in the Vercel dashboard:"
            href="https://vercel.com/dashboard/ai-gateway"
            hrefLabel="AI Gateway → API Keys"
          />

          <KeyField
            id="fal-key"
            label="Fal.ai key — Image / Video / Audio"
            value={falKey}
            onChange={setFalKey}
            placeholder="fal-..."
            help="Powers all media generation in Studio and Flows. Get one here:"
            href="https://fal.ai/dashboard/keys"
            hrefLabel="fal.ai/dashboard/keys"
          />

          <p className={cn("text-xs text-muted-foreground/70")}>
            Keys live in <span className="font-mono">localStorage</span> under{" "}
            <span className="font-mono">lumen-settings</span> and are sent as request headers only.
            Clear them any time by emptying the fields.
          </p>
        </div>
      </div>
    </div>
  );
}
