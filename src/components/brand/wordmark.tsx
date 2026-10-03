import { cn } from "@/lib/utils/cn";

/** "Rastgele" with one tilted accent letter: the brand's small dose of chaos. */
export function Wordmark({ className, as: Tag = "span" }: { className?: string; as?: "span" | "h1" }) {
  return (
    <Tag className={cn("font-display font-semibold tracking-[-0.03em]", className)}>
      <span className="sr-only">Rastgele</span>
      <span aria-hidden="true">
        Rast
        <span className="inline-block -rotate-[8deg] text-accent">g</span>
        ele
      </span>
    </Tag>
  );
}
