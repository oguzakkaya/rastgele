"use client";

import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-clock";
import { playTimeUp } from "@/lib/sound/topic-spin";
import { RESEARCH_CLOCK_SPEED, RESEARCH_DURATION_SECONDS, type Challenge, type ResearchBrief } from "@/lib/types";
import { ResearchTimer } from "../research-timer";
import { StageHeading } from "../stage-heading";
import { TopicMeta } from "../topic-meta";

export function ResearchStage({
  challenge,
  brief,
  startedAt,
  onFinish,
}: {
  challenge: Challenge;
  brief: ResearchBrief;
  startedAt: number;
  onFinish: () => void;
}) {
  const left = useCountdown(startedAt, RESEARCH_DURATION_SECONDS, playTimeUp, RESEARCH_CLOCK_SPEED);
  const { topic } = challenge;
  const hasNotes = Boolean(brief.summary) || brief.sections.length > 0 || brief.keyPoints.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col py-6 sm:py-8">
      <header className="mx-auto w-full max-w-2xl text-center">
        <TopicMeta topic={topic} prefix="Araştırma" />
        <StageHeading className="mt-3 text-[clamp(1.35rem,3.4vw,2rem)] leading-snug tracking-[-0.02em]">
          {topic.title}
        </StageHeading>
      </header>

      {hasNotes && (
        <section
          aria-labelledby="notes"
          className="mx-auto mt-6 max-h-[22dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-paper-2 p-5"
        >
          <h2 id="notes" className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
            Araştırma Notları
          </h2>
          {brief.summary && <p className="mt-3 leading-relaxed">{brief.summary}</p>}
          {brief.sections.map((s) => (
            <div key={s.heading} className="mt-4">
              <h3 className="font-semibold">{s.heading}</h3>
              <p className="mt-1 leading-relaxed text-ink-2">{s.content}</p>
            </div>
          ))}
          {brief.keyPoints.length > 0 && (
            <ul className="mt-4 space-y-2">
              {brief.keyPoints.map((p) => (
                <li key={p} className="flex gap-3 leading-relaxed">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="flex flex-1 items-center justify-center py-4">
        <ResearchTimer seconds={left} total={RESEARCH_DURATION_SECONDS} />
      </div>

      <Button variant="primary" size="lg" block onClick={onFinish} className="h-auto flex-col gap-0 py-3.5">
        <span>Hazırım</span>
        <span className="text-xs font-normal opacity-70">Anlatmaya geç</span>
      </Button>
    </div>
  );
}
