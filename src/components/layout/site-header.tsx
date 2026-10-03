import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
      <Link href="/" className="rounded-md text-2xl leading-none" aria-label="Rastgele ana sayfa">
        <Wordmark />
      </Link>
      <nav aria-label="Ana menü" className="flex items-center gap-1">
        <Link
          href="/gecmis"
          className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          Geçmiş
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
