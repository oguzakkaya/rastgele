"use client";

import { ChevronDown, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { CATEGORY_CHOICE_LABELS, CATEGORY_LABELS } from "@/lib/copy";
import { primeTopicSpin } from "@/lib/sound/topic-spin";
import { DEFAULT_PREFERENCES, getChallengeStorage, normalizeCategories } from "@/lib/storage/challenge-storage";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

function summary(categories: readonly TopicCategory[]): string {
  const value =
    categories.length === 0
      ? CATEGORY_CHOICE_LABELS.rastgele
      : TOPIC_CATEGORIES.filter((category) => categories.includes(category))
          .map((category) => CATEGORY_LABELS[category])
          .join(", ");
  return `Kategoriler: ${value}`;
}

export function StartControls() {
  const hydrated = useHydrated();
  const stored = hydrated ? getChallengeStorage().getPreferences().categories : DEFAULT_PREFERENCES.categories;
  const initial = normalizeCategories(stored);

  return <StartControlsInner key={initial.join(",") || "all"} initial={initial} />;
}

function StartControlsInner({ initial }: { initial: TopicCategory[] }) {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const allSelected = categories.length === 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleCategory = (category: TopicCategory) => {
    setCategories((current) => {
      if (current.length === 0) return [category];
      const next = current.includes(category) ? current.filter((item) => item !== category) : [...current, category];
      return next.length === TOPIC_CATEGORIES.length ? [] : next;
    });
  };

  const start = (event: FormEvent) => {
    event.preventDefault();
    getChallengeStorage().savePreferences({ categories });
    primeTopicSpin();
    router.push("/konu?id=yeni");
  };

  return (
    <form onSubmit={start} className="flex items-center gap-3">
      <Button type="submit" variant="accent" size="lg" className="h-12 shrink-0 px-6 sm:h-14 sm:px-7">
        <Shuffle className="size-5" aria-hidden /> Rastgele Başla
      </Button>

      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          title={summary(categories)}
          className="inline-flex h-12 max-w-72 min-w-36 items-center justify-between gap-3 overflow-hidden rounded-full border border-line bg-paper py-0 pr-4 pl-5 text-base text-ink sm:h-14"
        >
          <span className="truncate">{summary(categories)}</span>
          <ChevronDown className={cn("size-4 text-ink-3 transition-transform", open && "rotate-180")} aria-hidden />
        </button>

        {open && (
          <div
            id={panelId}
            className="absolute top-[calc(100%+0.4rem)] right-0 z-30 w-[19rem] rounded-2xl border border-line bg-paper p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
          >
            <CategoryOption
              label={CATEGORY_CHOICE_LABELS.rastgele}
              checked={allSelected}
              onChange={() => setCategories([])}
            />
            <div className="mt-1 grid grid-cols-2 border-t border-line pt-1">
              {TOPIC_CATEGORIES.map((category) => (
                <CategoryOption
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  checked={!allSelected && categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function CategoryOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap hover:bg-paper-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-accent"
      />
      {label}
    </label>
  );
}
