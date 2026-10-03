import type { FallbackTopicSeed } from "./types";

/**
 * Prepared topics. Open the site with `?id=` set to one of these ids, then press start to get that topic.
 */
export const FALLBACK_SEEDS: FallbackTopicSeed[] = [
  { id: "fermi-paradoksu", title: "Fermi Paradoksu", category: "bilim" },
  { id: "gps-nasil-calisir", title: "GPS nasıl çalışır?", category: "teknoloji" },
  { id: "pompeii-neden-bu-kadar-iyi-korunmus-durumda", title: "Pompeii neden bu kadar iyi korunmuş durumda?", category: "tarih" },
  { id: "matbaa-dunyayi-nasil-degistirdi", title: "Matbaa dünyayı nasıl değiştirdi?", category: "genel-kultur" },
  { id: "lindy-etkisi", title: "Lindy etkisi", category: "genel-kultur" },
  { id: "diderot-etkisi", title: "Diderot etkisi", category: "psikoloji" },
  { id: "coller-neden-cogunlukla-belirli-enlemlerde", title: "Çöller neden çoğunlukla belirli enlemlerde?", category: "cografya" },
  { id: "perspektif-resmi-nasil-degistirdi", title: "Perspektif resmi nasıl değiştirdi?", category: "sanat" },
  { id: "bir-ulkenin-para-birimi-neden-deger-kaybeder", title: "Bir ülkenin para birimi neden değer kaybeder?", category: "ekonomi" },
  { id: "plasebo-etkisi-nasil-calisir", title: "Plasebo etkisi nasıl çalışır?", category: "psikoloji" },
  { id: "ahtapotlarin-neden-uc-kalbi-vardir", title: "Ahtapotların neden üç kalbi vardır?", category: "doga" },
  { id: "prometheus-neden-insanlara-atesi-verdi", title: "Prometheus neden insanlara ateşi verdi?", category: "mitoloji" },
];
