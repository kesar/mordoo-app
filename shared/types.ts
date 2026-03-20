export interface BirthDataInput {
  userId: string;
  dateOfBirth: string;   // ISO date YYYY-MM-DD
  fullName?: string;
  currentDate: string;   // ISO date YYYY-MM-DD (user's local "today")
}

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
