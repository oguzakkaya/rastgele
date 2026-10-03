import type { FallbackTopicSeed } from "./types";

/**
 * Temporary sample pool: one topic per category.
 * Add new topics to this array in the same shape.
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
