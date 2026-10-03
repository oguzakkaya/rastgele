import type { TopicCategory } from "@/lib/types";

/** A fallback topic is an id plus a title in a category. Notes are not stored on the seed. */
export type FallbackTopicSeed = {
  id: string;
  title: string;
  category: TopicCategory;
};
