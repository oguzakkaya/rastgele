const STEPS = [
  { title: "Rastgele konu gelir", text: "Ne olacağını bilmiyorsun. Tarih de olabilir, ahtapotlar da." },
  { title: "AI kullanmadan araştır", text: "10 saniye zamanın var. Notları oku, kafanda toparla." },
  { title: "Kendi cümlelerinle anlat", text: "1 dakika zamanın var. Ne öğrendiğini örneklerle anlat." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="nasil-calisir" className="border-t border-line pt-[clamp(0.75rem,2dvh,1.5rem)]">
      <h2 id="nasil-calisir" className="sr-only">
        Nasıl çalışır?
      </h2>
      <ol className="grid grid-cols-3 gap-3 sm:gap-10">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span className="font-display text-[clamp(1.75rem,4.5dvh,2.5rem)] leading-none text-accent" aria-hidden>
              {i + 1}
            </span>
            <h3 className="mt-1 text-sm font-semibold leading-snug sm:mt-2 sm:text-lg">{step.title}</h3>
            <p className="mt-1 text-xs leading-snug text-ink-2 sm:text-base">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
