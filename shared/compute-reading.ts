import type { BirthDataInput, DailyPulseReading } from './types';
import { selectInsight } from './insight-templates';
import { hashCode } from './hash';

// Seeded pseudo-random: returns 0..max-1
function seededRandom(seed: number, offset: number, max: number): number {
  const combined = hashCode(`${seed}-${offset}`);
  return combined % max;
}

// Life path number: sum digits of birth date recursively to single digit
function lifePathNumber(dateOfBirth: string): number {
  // Handle full ISO strings like "2000-01-15T00:00:00.000Z" — extract date part only
  const datePart = dateOfBirth.split('T')[0];
  const digits = datePart.replace(/-/g, '');
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
  { name: 'Gold', nameTh: 'ทอง', hex: '#c9a84c' },
  { name: 'Crimson', nameTh: 'แดงเข้ม', hex: '#dc2626' },
  { name: 'Sapphire', nameTh: 'ไพลิน', hex: '#2563eb' },
  { name: 'Emerald', nameTh: 'มรกต', hex: '#16a34a' },
  { name: 'Amethyst', nameTh: 'อเมทิสต์', hex: '#9333ea' },
  { name: 'Ivory', nameTh: 'งาช้าง', hex: '#fefce8' },
  { name: 'Coral', nameTh: 'ปะการัง', hex: '#fb7185' },
  { name: 'Jade', nameTh: 'หยก', hex: '#059669' },
  { name: 'Silver', nameTh: 'เงิน', hex: '#94a3b8' },
  { name: 'Amber', nameTh: 'อำพัน', hex: '#d97706' },
  { name: 'Rose', nameTh: 'กุหลาบ', hex: '#e11d48' },
  { name: 'Indigo', nameTh: 'คราม', hex: '#4f46e5' },
  { name: 'Pearl', nameTh: 'ไข่มุก', hex: '#e2e8f0' },
  { name: 'Garnet', nameTh: 'โกเมน', hex: '#991b1b' },
  { name: 'Turquoise', nameTh: 'เทอร์ควอยซ์', hex: '#14b8a6' },
  { name: 'Obsidian', nameTh: 'ออบซิเดียน', hex: '#1e1b4b' },
  { name: 'Peridot', nameTh: 'เพอริดอต', hex: '#84cc16' },
  { name: 'Copper', nameTh: 'ทองแดง', hex: '#b45309' },
  { name: 'Lavender', nameTh: 'ลาเวนเดอร์', hex: '#a78bfa' },
  { name: 'Topaz', nameTh: 'โทแพซ', hex: '#f59e0b' },
  { name: 'Opal', nameTh: 'โอปอล', hex: '#c4b5fd' },
  { name: 'Onyx', nameTh: 'นิล', hex: '#18181b' },
  { name: 'Citrine', nameTh: 'ซิทริน', hex: '#eab308' },
  { name: 'Teal', nameTh: 'เขียวน้ำทะเล', hex: '#0d9488' },
] as const;

const DIRECTIONS = [
  { en: 'North', th: 'ทิศเหนือ' },
  { en: 'Northeast', th: 'ทิศตะวันออกเฉียงเหนือ' },
  { en: 'East', th: 'ทิศตะวันออก' },
  { en: 'Southeast', th: 'ทิศตะวันออกเฉียงใต้' },
  { en: 'South', th: 'ทิศใต้' },
  { en: 'Southwest', th: 'ทิศตะวันตกเฉียงใต้' },
  { en: 'West', th: 'ทิศตะวันตก' },
  { en: 'Northwest', th: 'ทิศตะวันตกเฉียงเหนือ' },
] as const;

function computeEnergyScore(lifePath: number, namNum: number, dailySeed: number): number {
  const baseScore = ((lifePath * 7 + dailySeed) % 41) + 40;
  const nameModifier = ((namNum * 3 + dailySeed) % 21) - 10;
  return Math.max(0, Math.min(100, baseScore + nameModifier));
}

export function profileWeights(
  lifePath: number, namNum: number, birthDay: number, birthMonth: number,
): { business: number; heart: number; body: number } {
  const lp = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath;

  const rawBusiness = namNum + (birthDay % 10);
  const rawHeart    = birthMonth + (namNum * 2 % 7);
  const rawBody     = lp + (birthMonth % 5) + (birthDay % 4);

  const normalize = (raw: number) => 0.7 + ((raw - 1) / 17) * 0.6;

  const weights = [normalize(rawBusiness), normalize(rawHeart), normalize(rawBody)];
  const avg = (weights[0] + weights[1] + weights[2]) / 3;
  return {
    business: weights[0] / avg,
    heart:    weights[1] / avg,
    body:     weights[2] / avg,
  };
}

export function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function momentum(today: number, day1: number, day2: number, day3: number): number {
  const diff1 = today - day1;
  const diff2 = day1 - day2;
  const diff3 = day2 - day3;
  const weightedTrend = (diff1 * 3 + diff2 * 2 + diff3 * 1) / 6;
  return Math.max(-1, Math.min(1, weightedTrend / 15));
}

export function computeReading(input: BirthDataInput): DailyPulseReading {
  const lifePath = lifePathNumber(input.dateOfBirth);
  const namNum = input.fullName ? nameNumber(input.fullName) : 5;
  const dailySeed = hashCode(`${input.userId}:${input.currentDate}`);

  // Energy score: base from life path, modulated by daily seed and name number
  const energyScore = computeEnergyScore(lifePath, namNum, dailySeed);

  // Sub-scores: vary ±15 around energy score
  const business = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 1, 31) - 15));
  const heart = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 2, 31) - 15));
  const body = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 3, 31) - 15));

  // Lucky color: based on birth month element + daily offset
  const birthMonth = parseInt(input.dateOfBirth.split('-')[1], 10);
  const colorIndex = (birthMonth + seededRandom(dailySeed, 4, LUCKY_COLORS.length)) % LUCKY_COLORS.length;
  const luckyColor = {
    name: LUCKY_COLORS[colorIndex].name,
    nameTh: LUCKY_COLORS[colorIndex].nameTh,
    hex: LUCKY_COLORS[colorIndex].hex,
  };

  // Lucky number: life path + daily offset, 1-9
  const luckyNumber = ((lifePath + seededRandom(dailySeed, 5, 9)) % 9) + 1;

  // Lucky direction: element-based + daily offset
  const dirIndex = (birthMonth + seededRandom(dailySeed, 6, 8)) % DIRECTIONS.length;
  const direction = DIRECTIONS[dirIndex];
  const insight = selectInsight(energyScore, birthMonth, seededRandom(dailySeed, 7, 100));

  return {
    date: input.currentDate,
    energyScore,
    insightEn: insight.en,
    insightTh: insight.th,
    luckyColor,
    luckyNumber,
    luckyDirection: direction.en,
    luckyDirectionTh: direction.th,
    subScores: { business, heart, body },
  };
}
