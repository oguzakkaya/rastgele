import type { Metadata } from "next";
import { HistoryList } from "@/components/history/history-list";

export const metadata: Metadata = {
  title: "Geçmiş",
  alternates: { canonical: "/gecmis" },
  robots: { index: false, follow: true },
};

export default function HistoryPage() {
  return (
    <div className="animate-rise pt-12 sm:pt-20">
      <h1 className="font-display text-4xl sm:text-5xl">Geçmiş</h1>
      <p className="mt-3 text-ink-2">Anlattığın konular. Bu cihazda saklanıyor.</p>
      <div className="mt-10">
        <HistoryList />
      </div>
    </div>
  );
}
