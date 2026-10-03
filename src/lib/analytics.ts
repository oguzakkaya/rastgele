export type AnalyticsEvent =
  | "challenge_started"
  | "topic_generated"
  | "research_started"
  | "research_completed"
  | "explanation_started"
  | "explanation_submitted"
  | "challenge_completed"
  | "challenge_skipped";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

/** Implement this for PostHog, Plausible or GA4 and register it below. */
export type AnalyticsProvider = {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
};

const providers: AnalyticsProvider[] = [];

export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props ?? {});
  }
  for (const provider of providers) {
    try {
      provider.track(event, props);
    } catch {
      // Analytics must never break the product.
    }
  }
}
