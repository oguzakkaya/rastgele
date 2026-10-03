import type { Metadata } from "next";
import { Suspense } from "react";
import { TopicRoute } from "./topic-route";

export const metadata: Metadata = {
  title: "Konu",
  robots: { index: false, follow: false },
};

export default function TopicPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <TopicRoute />
    </Suspense>
  );
}
