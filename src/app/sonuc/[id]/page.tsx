import type { Metadata } from "next";
import { ResultLoader } from "@/components/result/result-loader";

export const metadata: Metadata = {
  title: "Sonuç",
  robots: { index: false, follow: false },
};

export default async function ResultPage({ params }: PageProps<"/sonuc/[id]">) {
  const { id } = await params;
  return <ResultLoader key={id} id={id} />;
}
