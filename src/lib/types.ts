export const TOPIC_CATEGORIES = [
  "genel-kultur",
  "bilim",
  "teknoloji",
  "tarih",
  "cografya",
  "sanat",
  "ekonomi",
  "psikoloji",
  "doga",
  "mitoloji",
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

/** User-facing category selection also allows "rastgele" (= any). */
export type CategoryChoice = TopicCategory | "rastgele";

/** Every challenge uses the same research window. */
export const RESEARCH_DURATION_SECONDS = 15 * 60;

/** Spoken explanation is a fixed one-minute countdown. */
export const EXPLAIN_DURATION_SECONDS = 60;

export type TopicSource = "ai" | "fallback";

export type Topic = {
  id: string;
  title: string;
  category: TopicCategory;
  source: TopicSource;
};

export type ResearchBrief = {
  topicId: string;
  summary: string;
  sections: ResearchSection[];
  keyPoints: string[];
  source: TopicSource;
};

export type ResearchSection = {
  heading: string;
  content: string;
};

export type ChallengePreferences = {
  /** Empty means every category. */
  categories: TopicCategory[];
};

/** The explanation can come from different input modalities. */
export type TextExplanation = {
  kind: "text";
  text: string;
  durationSeconds: number;
};

export type VoiceExplanation = {
  kind: "voice";
  transcript: string;
  durationSeconds: number;
  audioUrl?: string;
};

export type ExplanationInput = TextExplanation | VoiceExplanation;

export type Explanation = ExplanationInput & {
  wordCount: number;
  submittedAt: string;
};

export type Evaluation = {
  overallScore: number;
  understanding: number;
  accuracy: number;
  clarity: number;
  coverage: number;
  strengths: string[];
  missingPoints: string[];
  incorrectClaims: string[];
  feedback: string;
  exampleExplanation: string;
  source: TopicSource;
};

export type Challenge = {
  id: string;
  topic: Topic;
  preferences: ChallengePreferences;
  createdAt: string;
};

export type ChallengeResult = {
  id: string;
  challenge: Challenge;
  /** Present only for older rounds that were scored from a written explanation. */
  explanation?: Explanation;
  evaluation?: Evaluation;
  researchSeconds: number;
  completedAt: string;
};

export type UserStats = {
  completedCount: number;
  currentStreak: number;
  longestStreak: number;
  topCategory: TopicCategory | null;
  totalResearchSeconds: number;
  categoryCounts: Partial<Record<TopicCategory, number>>;
};

export type RecentTopicEntry = {
  topicId: string;
  title: string;
  category: TopicCategory;
  shownAt: string;
};
