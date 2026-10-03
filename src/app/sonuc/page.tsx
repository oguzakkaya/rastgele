import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultRoute } from "./result-route";

export const metadata: Metadata = {
  title: "Sonuç",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ResultRoute />
    </Suspense>
  );
}
