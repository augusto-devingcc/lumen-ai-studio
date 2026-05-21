"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ImageIcon, Workflow, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/studio", label: "Studio", icon: ImageIcon, hint: "Generate" },
  { href: "/flows", label: "Flows", icon: Workflow, hint: "Compose" },
  { href: "/chat", label: "Chat", icon: MessagesSquare, hint: "Direct" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card/30">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Lumen</span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV.map(({ href, label, icon: Icon, hint }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="font-medium">{label}</span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {hint}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-5 py-4">
          <p className="text-xs leading-relaxed text-muted-foreground/70">
            AI media studio.
            <br />
            Image · Video · Audio.
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
