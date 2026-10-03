# Rastgele

Rastgele, Türkçe bir öğrenme ve anlatma oyunu. Kullanıcıya rastgele bir konu gelir, 15 dakika araştırır, notlar kapanır ve konuyu 1 dakika kendi cümleleriyle anlatır.

## Ürün akışı

1. **Ana sayfa**: başla butonu ve sağında çoklu kategori listesi (varsayılan Tümü). Araştırma süresi her konuda 15 dakikadır.
2. **Konu açılışı** (`/konu/[id]`): kısa bir açılış animasyonu, ardından konu ve 15 dakikalık süre.
3. **Araştırma**: konu, geri sayım ve varsa yapay zekânın hazırladığı notlar.
4. **Geçiş**: notlar kapanır. Aynı denemede notlar bir daha açılamaz (sayfa yenilense bile).
5. **Anlatım**: 1 dakikalık geri sayım ortada başlar. Yazı alanı ve buton yoktur.
6. **Geçmiş** (`/gecmis`): daha önce kaydedilmiş sonuçlar ve küçük istatistikler.

## Teknoloji

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, Lucide ikonları, `class-variance-authority`
- OpenAI Responses API + Zod ile yapılandırılmış çıktı
- Vitest (birim), Playwright (uçtan uca)
- Kalıcılık: MVP için `localStorage` (soyutlama katmanı ile)

## Mimari

```
src/
  app/                      Rotalar (Server Components) ve API route'ları
    api/topic|research|evaluate/route.ts
  components/
    ui/                     Button, Eyebrow
    layout/ brand/          Header, footer, tema, logo
    home/ challenge/ result/ history/ stats/
    challenge/stages/       Akışın her durumu için ayrı ekran
  hooks/                    use-challenge-flow (yan etkiler), saat, çevrimiçi durumu
  lib/
    types.ts                Topic, Challenge, ResearchBrief, Explanation, Evaluation...
    schemas.ts              Zod: API istekleri + AI çıktıları
    challenge/machine.ts    Açık durum makinesi (saf reducer)
    challenge/persistence.ts Yarım kalan denemeyi kaydet / geri yükle
    challenge/api.ts        İstemci → API çağrıları, çevrimdışı yedekler
    topics/selection.ts     Rastgele seçim, tekrar önleme, kategori dengesi
    topics/fallback/        Hazır konu havuzu
    evaluation/             AI çıktısı ayrıştırıcı + çevrimdışı değerlendirici
    storage/                KeyValueStore + challengeStorage
    analytics.ts            Sağlayıcıdan bağımsız olay katmanı
    stats.ts                İstatistik ve seri hesapları
  server/
    ai/client.ts            OpenAI istemcisi, hata sınıflandırma
    ai/prompts.ts           Sistem talimatları (yalnızca sunucuda)
    ai/services.ts          generateTopic, generateResearchBrief, evaluateExplanation
    http.ts rate-limit.ts   Gövde boyutu sınırı, doğrulama, hız sınırı
```

### Önemli kararlar

- **Durum makinesi**: `idle → generating_topic → topic_reveal → researching → transitioning → explaining → evaluating → result`, ayrıca `skipped` ve `error`. Geçersiz olaylar yok sayılır; çift tıklama ve geç gelen yanıtlar zarar vermez.
- **AI hiçbir zaman uygulamayı çökertmez**: her servis anahtar yoksa, zaman aşımında, rate limit'te veya geçersiz JSON'da yedek içeriğe döner.
- **Puanlar sunucuda üretilir**: istemciden gelen puanlar şemada yoktur, yok sayılır. AI puanları 0–100 tam sayıya sıkıştırılır.
- **Rastgelelik**: son 20 konu tekrar edilmez (havuz biterse en eski görülen seçilir). "Tümü"nde önce kategori seçilir; aynı kategoriden üçüncü konu üst üste gelmez.
- **Sesli anlatım için hazır**: `ExplanationInput = TextExplanation | VoiceExplanation`; API ve değerlendirici ikisini de kabul eder.

## Kurulum

```bash
npm install
cp .env.example .env.local   # isteğe bağlı
npm run dev                  # http://localhost:3000
```

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `OPENAI_API_KEY` | Boşsa uygulama yedek modda çalışır. |
| `OPENAI_MODEL` | Varsayılan `gpt-4.1-mini`. Structured Outputs destekleyen bir model olmalı. |
| `OPENAI_TIMEOUT_MS` | İstek zaman aşımı, varsayılan `20000`. |
| `RASTGELE_DISABLE_AI` | `1` ise anahtar olsa bile AI kapalıdır (testlerde kullanılır). |
| `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap ve Open Graph adresi. |

## OpenAI yapılandırması

Tüm çağrılar `src/server/ai/client.ts` içinde `responses.parse` + `zodTextFormat` ile yapılır ve dönen veri tekrar Zod ile doğrulanır. Talimatlar `src/server/ai/prompts.ts` içindedir ve istemciye gönderilmez. Kullanıcı metni değerlendirme isteminde etiketlerle ayrılır, metindeki talimatların yok sayılması istenir.

## Yedek (fallback) modu

Anahtar yoksa:

- Konular `src/lib/topics/fallback/seeds.ts` havuzundan gelir. Her kayıt yalnızca `title` ve `category` taşır.
- Anahtar yokken hazır araştırma notu yoktur. Notlar yalnızca yapay zekâ açıksa üretilir.
- Değerlendirme, anlatımın notlarla veya başlıkla örtüşmesine bakan basit bir tahmindir. Sonuç sayfasında bu açıkça belirtilir.
- Çevrimdışıyken konu seçimi ve değerlendirme tarayıcıda yapılır.

**Yeni konu eklemek** için `seeds.ts` dizisine `{ title, category }` ekle. `id` başlıktan otomatik üretilir.

## Komutlar

```bash
npm run dev         # geliştirme
npm run lint        # ESLint
npm run typecheck   # route tipleri + tsc
npm test            # Vitest birim testleri
npm run test:e2e    # Playwright (üretim derlemesi alır, AI kapalı çalışır)
npm run build       # üretim derlemesi
npm start           # üretim sunucusu
npm run format      # Prettier
```

İlk E2E çalıştırmasından önce: `npx playwright install chromium`.
Görsel inceleme için ekran görüntüleri: `SCREENS=1 npx playwright test tests/e2e/screens.spec.ts`.

## Yayına alma

Herhangi bir Node.js barındırıcısında (Vercel, Render, Fly, kendi sunucun) `npm run build && npm start` yeterli. Ortam değişkenlerini barındırıcıda tanımla.

Hız sınırlayıcı şu an bellek içidir; birden fazla örnekte çalıştırırken `src/server/rate-limit.ts` içindeki `RateLimiter` arayüzünü Redis/Upstash ile uygula.

## Gelecek mimarisi

- **Hesaplar ve bulut geçmişi**: `KeyValueStore` / `challengeStorage` arayüzünü API tabanlı bir uygulamayla değiştir (Prisma + PostgreSQL).
- **Sesli anlatım**: mikrofon → konuşmadan metne → `VoiceExplanation` → mevcut `/api/evaluate`.
- **Analitik**: `registerAnalyticsProvider` ile PostHog / Plausible / GA4 bağla.
- **Paylaşılabilir sonuç kartları**, yer imleri, koleksiyonlar, aralıklı tekrar, PWA.
