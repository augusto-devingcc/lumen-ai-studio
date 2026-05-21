"use client";

import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { ToolCallCard, type ToolPart } from "./tool-call-card";

export function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (!part.text) return null;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground",
                )}
              >
                {part.text}
              </div>
            );
          }
          if (typeof part.type === "string" && part.type.startsWith("tool-")) {
            return <ToolCallCard key={i} part={part as unknown as ToolPart} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
