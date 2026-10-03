import type { ResearchBrief, Topic } from "@/lib/types";
import { slugify } from "@/lib/utils/text";
import { FALLBACK_SEEDS } from "./seeds";

export const FALLBACK_TOPICS: Topic[] = FALLBACK_SEEDS.map((seed) => ({
  id: slugify(seed.title),
  title: seed.title,
  category: seed.category,
  source: "fallback",
}));

export function getFallbackTopic(id: string): Topic | undefined {
  return FALLBACK_TOPICS.find((topic) => topic.id === id);
}

export function getFallbackBrief(topic: Topic): ResearchBrief {
  return {
    topicId: topic.id,
    summary: "",
    sections: [],
    keyPoints: [],
    source: "fallback",
  };
}
