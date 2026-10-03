import type { TopicCategory } from "@/lib/types";

/** A fallback topic is only a title in a category. Notes are not stored on the seed. */
export type FallbackTopicSeed = {
  title: string;
  category: TopicCategory;
};
