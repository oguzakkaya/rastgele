"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <h1 className="font-display text-5xl">Bir şeyler ters gitti.</h1>
      <p className="text-ink-2">Sayfayı yeniden yüklemeyi deneyebilirsin.</p>
      <div>
        <Button variant="primary" size="lg" onClick={reset}>
          Bir daha dene
        </Button>
      </div>
    </div>
  );
}
