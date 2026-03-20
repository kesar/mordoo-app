import type { BirthDataInput, DailyPulseResponse } from './types';
import { selectInsight } from './insight-templates';

// Simple string hash → unsigned 32-bit integer
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// Seeded pseudo-random: returns 0..max-1
function seededRandom(seed: number, offset: number, max: number): number {
  const combined = hashCode(`${seed}-${offset}`);
  return combined % max;
}

// Life path number: sum digits of birth date recursively to single digit
function lifePathNumber(dateOfBirth: string): number {
  const digits = dateOfBirth.replace(/-/g, '');
  let sum = 0;
  for (const d of digits) {
    sum += parseInt(d, 10);
  }
  while (sum > 9 && sum !== 11 && sum !== 22) {
    let newSum = 0;
    for (const d of String(sum)) {
      newSum += parseInt(d, 10);
    }
    sum = newSum;
  }
  return sum;
}

// Name number: Pythagorean system (A=1..I=9, J=1..R=9, S=1..Z=8)
function nameNumber(fullName: string): number {
  const map: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  let sum = 0;
  for (const ch of fullName.toLowerCase()) {
    if (map[ch]) sum += map[ch];
  }
  while (sum > 9) {
    let newSum = 0;
    for (const d of String(sum)) {
      newSum += parseInt(d, 10);
    }
    sum = newSum;
  }
  return sum;
}

const LUCKY_COLORS = [
  { name: 'Gold', hex: '#c9a84c' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Sapphire', hex: '#2563eb' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Amethyst', hex: '#9333ea' },
  { name: 'Ivory', hex: '#fefce8' },
  { name: 'Coral', hex: '#fb7185' },
  { name: 'Jade', hex: '#059669' },
  { name: 'Silver', hex: '#94a3b8' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Indigo', hex: '#4f46e5' },
] as const;

const DIRECTIONS = [
  'North', 'Northeast', 'East', 'Southeast',
  'South', 'Southwest', 'West', 'Northwest',
] as const;

export function computeReading(input: BirthDataInput): DailyPulseResponse {
  const lifePath = lifePathNumber(input.dateOfBirth);
  const namNum = input.fullName ? nameNumber(input.fullName) : 5;
  const dailySeed = hashCode(`${input.userId}:${input.currentDate}`);

  // Energy score: base from life path, modulated by daily seed and name number
  const baseScore = ((lifePath * 7 + dailySeed) % 41) + 40; // 40-80
  const nameModifier = ((namNum * 3 + dailySeed) % 21) - 10; // -10 to +10
  const energyScore = Math.max(0, Math.min(100, baseScore + nameModifier));

  // Sub-scores: vary ±15 around energy score
  const business = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 1, 31) - 15));
  const heart = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 2, 31) - 15));
  const body = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 3, 31) - 15));

  // Lucky color: based on birth month element + daily offset
  const birthMonth = parseInt(input.dateOfBirth.split('-')[1], 10);
  const colorIndex = (birthMonth + seededRandom(dailySeed, 4, 12)) % LUCKY_COLORS.length;
  const luckyColor = { name: LUCKY_COLORS[colorIndex].name, hex: LUCKY_COLORS[colorIndex].hex };

  // Lucky number: life path + daily offset, 1-9
  const luckyNumber = ((lifePath + seededRandom(dailySeed, 5, 9)) % 9) + 1;

  // Lucky direction: element-based + daily offset
  const dirIndex = (birthMonth + seededRandom(dailySeed, 6, 8)) % DIRECTIONS.length;
  const luckyDirection = DIRECTIONS[dirIndex];

  // Insight text
  const insight = selectInsight(energyScore, birthMonth, seededRandom(dailySeed, 7, 100));

  return {
    date: input.currentDate,
    energyScore,
    insight,
    luckyColor,
    luckyNumber,
    luckyDirection,
    subScores: { business, heart, body },
  };
}
