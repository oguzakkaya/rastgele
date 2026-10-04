"use client";

import { useSearchParams } from "next/navigation";
import { ChallengeFlow } from "@/components/challenge/challenge-flow";
import { researchClockSpeed } from "@/lib/utils/time";

/** The id lives in the query so one static page can open any challenge. */
export function TopicRoute() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  return (
    <ChallengeFlow
      key={id || "bos"}
      options={{ routeId: id, clockSpeed: researchClockSpeed(params.get("speed")) }}
    />
  );
}
