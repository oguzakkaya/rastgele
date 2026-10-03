import { CATEGORY_LABELS } from "@/lib/copy";
import type { Topic } from "@/lib/types";
import { Eyebrow } from "@/components/ui/eyebrow";

export function TopicMeta({ topic, prefix }: { topic: Topic; prefix?: string }) {
  return (
    <Eyebrow>
      {prefix ? `${prefix} · ` : ""}
      {CATEGORY_LABELS[topic.category]}
    </Eyebrow>
  );
}
