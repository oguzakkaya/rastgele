import type { CategoryChoice, TopicCategory } from "./types";

export const BRAND = {
  name: "Rastgele",
  description:
    "Rastgele bir konu öğren, 10 saniye araştır ve sonra kendi cümlelerinle anlat.",
  seoTitle: "Rastgele — Öğren, düşün, anlat",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  "genel-kultur": "Genel Kültür",
  bilim: "Bilim",
  teknoloji: "Teknoloji",
  tarih: "Tarih",
  cografya: "Coğrafya",
  sanat: "Sanat",
  ekonomi: "Ekonomi",
  psikoloji: "Psikoloji",
  doga: "Doğa",
  mitoloji: "Mitoloji",
};

export const CATEGORY_CHOICE_LABELS: Record<CategoryChoice, string> = {
  ...CATEGORY_LABELS,
  rastgele: "Tümü",
};

export const LOADING_COPY = {
  topic: "Rastgele seçiliyor...",
  research: "Konu hazırlanıyor...",
  evaluation: "Anlatımına bakıyoruz...",
} as const;

export const ERROR_COPY = {
  topic: { title: "Bu sefer konu gelmedi.", cta: "Bir daha dene" },
  evaluation: { title: "Anlatımını değerlendiremedik.", cta: "Tekrar dene" },
  offline: { title: "İnternet bağlantısı yok." },
  emptyExplanation: "Önce biraz anlatman lazım.",
} as const;

export const EXPLANATION_LIMITS = {
  minWords: 5,
  maxChars: 4000,
} as const;
