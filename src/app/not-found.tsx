import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <h1 className="font-display text-5xl">Burası boş çıktı.</h1>
      <p className="text-ink-2">Rastgele gezinirken bazen olur.</p>
      <div>
        <ButtonLink href="/" variant="primary" size="lg">
          Ana sayfaya dön
        </ButtonLink>
      </div>
    </div>
  );
}
