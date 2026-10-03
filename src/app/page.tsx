import { Wordmark } from "@/components/brand/wordmark";
import { HowItWorks } from "@/components/home/how-it-works";
import { StartControls } from "@/components/home/start-controls";
import { TopicTeaser } from "@/components/home/topic-teaser";
import { StatsStrip } from "@/components/stats/stats-strip";
import { BRAND } from "@/lib/copy";
import { FALLBACK_TOPICS } from "@/lib/topics/fallback";
import { shuffle } from "@/lib/utils/random";

export default function HomePage() {
  const teaserTitles = shuffle(FALLBACK_TOPICS.map((t) => t.title)).slice(0, 6);

  return (
    <div
      data-screen="home"
      className="flex min-h-0 flex-1 flex-col py-[clamp(0.25rem,1.5dvh,1rem)]"
    >
      <section className="animate-rise flex flex-1 flex-col justify-center">
        <Wordmark
          as="h1"
          className="text-[clamp(2.75rem,min(16vw,12dvh),9rem)] leading-[0.9]"
        />
        <p className="mt-[clamp(0.75rem,1.6dvh,1.25rem)] max-w-lg text-[clamp(1rem,2.1dvh,1.125rem)] leading-snug text-ink-2">
          {BRAND.description}
        </p>

        <div className="mt-[clamp(2rem,5dvh,3.5rem)]">
          <StartControls />
        </div>

        <StatsStrip className="mt-[clamp(0.5rem,1.2dvh,1rem)]" />

        <div className="mt-[clamp(0.75rem,2dvh,2rem)]">
          <TopicTeaser titles={teaserTitles} />
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}
