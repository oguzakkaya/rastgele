import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-ink-3", className)}
      {...props}
    />
  );
}
