export interface BirthDataInput {
  userId: string;
  dateOfBirth: string;   // ISO date YYYY-MM-DD
  fullName?: string;
  currentDate: string;   // ISO date YYYY-MM-DD (user's local "today")
}

// Internal bilingual type — used by computeReading() and cache storage
export interface DailyPulseReading {
  date: string;
  energyScore: number;
  insightEn: string;
  insightTh: string;
  luckyColor: { name: string; nameTh: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  luckyDirectionTh: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}

// Zodiac API response — monolingual, returned to app
export interface ZodiacSignsResponse {
  western: {
    sign: string;
    name: string;
    element: string;
    rulingPlanet: string;
    dateRange: string;
    traits: string;
    image: string;
  };
  chinese: {
    animal: string;
    name: string;
    element: string;
    traits: string;
    image: string;
  };
}

// API response type — monolingual, returned to app
export interface DailyPulseResponse {
  date: string;
  energyScore: number;
  insight: string;
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}
