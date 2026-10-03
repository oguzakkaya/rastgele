import type { FallbackTopicSeed } from "./types";

/**
 * Geçici örnek havuz: her kategoriden bir konu.
 * Yeni konular bu diziye aynı şekle uygun olarak eklenebilir.
 */
export const FALLBACK_SEEDS: FallbackTopicSeed[] = [
  { title: "Fermi Paradoksu", category: "bilim" },
  { title: "GPS nasıl çalışır?", category: "teknoloji" },
  { title: "Pompeii neden bu kadar iyi korunmuş durumda?", category: "tarih" },
  { title: "Matbaa dünyayı nasıl değiştirdi?", category: "genel-kultur" },
  { title: "Çöller neden çoğunlukla belirli enlemlerde?", category: "cografya" },
  { title: "Perspektif resmi nasıl değiştirdi?", category: "sanat" },
  { title: "Bir ülkenin para birimi neden değer kaybeder?", category: "ekonomi" },
  { title: "Plasebo etkisi nasıl çalışır?", category: "psikoloji" },
  { title: "Ahtapotların neden üç kalbi vardır?", category: "doga" },
  { title: "Prometheus neden insanlara ateşi verdi?", category: "mitoloji" },
];
