"use client";

import { useSearchParams } from "next/navigation";
import { ResultLoader } from "@/components/result/result-loader";

export function ResultRoute() {
  const id = useSearchParams().get("id") ?? "";
  return <ResultLoader id={id} />;
}
