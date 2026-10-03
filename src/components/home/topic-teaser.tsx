"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function TopicTeaser({ titles }: { titles: string[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || titles.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % titles.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, titles.length]);

  return (
    <div className="border-l-2 border-accent pl-4">
      <p className="text-sm text-ink-3">Şu an karşına ne çıkabilir?</p>
      <p
        key={index}
        className="mt-1 animate-rise font-display text-[clamp(1.05rem,2.6dvh,1.5rem)] leading-snug text-ink-2"
        aria-live="off"
      >
        {titles[index]}
      </p>
    </div>
  );
}
