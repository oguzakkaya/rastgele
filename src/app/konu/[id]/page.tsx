import type { Metadata } from "next";
import { ChallengeFlow } from "@/components/challenge/challenge-flow";

export const metadata: Metadata = {
  title: "Konu",
  robots: { index: false, follow: false },
};

export default async function TopicPage({ params }: PageProps<"/konu/[id]">) {
  const { id } = await params;
  return <ChallengeFlow key={id} options={{ routeId: id }} />;
}
