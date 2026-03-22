import type { DailyPulseReading, DailyPulseResponse } from '@shared/types';

type Lang = 'en' | 'th';

export function validateLang(lang: string | null): Lang {
  if (lang === 'th') return 'th';
  return 'en';
}

export function localizePulseReading(reading: DailyPulseReading, lang: Lang): DailyPulseResponse {
  return {
    date: reading.date,
    energyScore: reading.energyScore,
    insight: lang === 'th' ? reading.insightTh : reading.insightEn,
    luckyColor: {
      name: lang === 'th' ? reading.luckyColor.nameTh : reading.luckyColor.name,
      hex: reading.luckyColor.hex,
    },
    luckyNumber: reading.luckyNumber,
    luckyDirection: lang === 'th' ? reading.luckyDirectionTh : reading.luckyDirection,
    subScores: reading.subScores,
  };
}
