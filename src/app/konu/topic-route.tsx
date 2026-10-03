"use client";

import { useSearchParams } from "next/navigation";
import { ChallengeFlow } from "@/components/challenge/challenge-flow";

/** The id lives in the query so one static page can open any challenge. */
export function TopicRoute() {
  const id = useSearchParams().get("id") ?? "";
  return <ChallengeFlow key={id || "bos"} options={{ routeId: id }} />;
}
