# Rastgele

**Preview:** https://rastgeleco.github.io/rastgele/

Rastgele is a Turkish learning and speaking game. A random topic appears, you research it for 15 minutes, the notes close, and you explain the topic in your own words for 1 minute.

## Product flow

1. **Home**: a start button with a multi-select category list to its right (default All). Every topic uses a 15-minute research window.
2. **Topic reveal** (`/konu?id=`): a short opening animation, then the topic and the 15-minute window.
3. **Research**: the topic, a countdown, and research notes when they exist. At 00:00 the screen stays on the time-up message until you press the button.
4. **Transition**: the notes close. They cannot be opened again in the same attempt, even after a reload.
5. **Speaking**: a 1-minute countdown starts in the center. There is no text field and no buttons.
6. **History** (`/gecmis`): saved rounds and a small set of stats.

## Technology

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, Lucide icons, `class-variance-authority`
- OpenAI Responses API + Zod structured output
- Vitest (unit), Playwright (end to end)
- Persistence: `localStorage` for the MVP, behind a storage interface

## Architecture

```
src/
  app/                      Routes (Server Components) and API routes
    api/topic|research|evaluate/route.ts
  components/
    ui/                     Button, Eyebrow
    layout/ brand/          Header, footer, theme, logo
    home/ challenge/ result/ history/ stats/
    challenge/stages/       One screen per flow state
  hooks/                    use-challenge-flow (side effects), clock, online status
  lib/
    types.ts                Topic, Challenge, ResearchBrief, Explanation, Evaluation...
    schemas.ts              Zod: API requests + AI output
    challenge/machine.ts    Explicit state machine (pure reducer)
    challenge/persistence.ts Save and resume an in-progress attempt
    challenge/api.ts        Client → API calls, offline fallbacks
    topics/selection.ts     Random pick, repeat avoidance, category balance
    topics/fallback/        Prepared topic pool
    evaluation/             AI output parser + offline evaluator
    storage/                KeyValueStore + challengeStorage
    analytics.ts            Provider-agnostic event layer
    stats.ts                Stats and streak math
  server/
    ai/client.ts            OpenAI client, error classification
    ai/prompts.ts           System instructions (server only)
    ai/services.ts          generateTopic, generateResearchBrief, evaluateExplanation
    http.ts rate-limit.ts   Body size limit, validation, rate limit
```

### Decisions

- **State machine**: `idle → generating_topic → topic_reveal → researching → transitioning → explaining → evaluating → result`, plus `skipped` and `error`. Invalid events are ignored, so double clicks and late responses are harmless.
- **AI never takes the app down**: each service falls back when the key is missing, the request times out, the rate limit is hit, or the JSON is invalid.
- **Scores are produced on the server**: client-supplied scores are not in the schema and are ignored. AI scores are clamped to integers from 0 to 100.
- **Randomness**: the last 20 topics are not repeated (when the pool runs out, the oldest seen topic is chosen). “All” picks a category first; a third topic in a row from the same category is avoided.
- **Ready for voice**: `ExplanationInput = TextExplanation | VoiceExplanation`. The API and the evaluator accept both.

## Setup

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | When empty, the app runs in fallback mode. |
| `OPENAI_MODEL` | Default `gpt-4.1-mini`. Must support Structured Outputs. |
| `OPENAI_TIMEOUT_MS` | Request timeout, default `20000`. |
| `RASTGELE_DISABLE_AI` | `1` turns AI off even if a key is set (used by tests). |
| `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap, and Open Graph URL. |

## OpenAI setup

Every call goes through `responses.parse` + `zodTextFormat` in `src/server/ai/client.ts`, and the result is validated with Zod again. Instructions live in `src/server/ai/prompts.ts` and are never sent to the client. User text is wrapped in tags in the evaluation prompt, and instructions inside that text are ignored.

## Fallback mode

When there is no key:

- Topics come from the pool in `src/lib/topics/fallback/seeds.ts`. Each entry has only `title` and `category`.
- There are no prepared research notes without a key. Notes are generated only when AI is on.
- Evaluation is a simple estimate of how the explanation overlaps the notes or the title.
- Offline, topic selection and evaluation run in the browser.

**To add a topic**, append `{ title, category }` to the `seeds.ts` array. The `id` is generated from the title.

## Scripts

```bash
npm run dev         # development
npm run lint        # ESLint
npm run typecheck   # route types + tsc
npm test            # Vitest unit tests
npm run test:e2e    # Playwright (production build, AI off)
npm run build       # production build
npm start           # production server
npm run format      # Prettier
```

Before the first E2E run: `npx playwright install chromium`.
Screenshots for visual review: `SCREENS=1 npx playwright test tests/e2e/screens.spec.ts`.

## Deployment

`npm run build && npm start` is enough on any Node.js host (Vercel, Render, Fly, your own server). Set the environment variables on the host.

The public site is GitHub Pages: https://rastgeleco.github.io/rastgele/. Pushes to `main` run tests and publish a static export. That export has no API, so it uses the prepared topics.

The rate limiter is in memory. To run more than one instance, implement the `RateLimiter` interface in `src/server/rate-limit.ts` with Redis or Upstash.

## Later

- **Accounts and cloud history**: replace the `KeyValueStore` / `challengeStorage` interface with an API-backed implementation (Prisma + PostgreSQL).
- **Voice explanations**: microphone → speech to text → `VoiceExplanation` → the existing `/api/evaluate`.
- **Analytics**: connect PostHog, Plausible, or GA4 through `registerAnalyticsProvider`.
- **Shareable result cards**, bookmarks, collections, spaced repetition, PWA.
