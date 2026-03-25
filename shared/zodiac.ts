// shared/zodiac.ts

const WESTERN_SIGNS = [
  { sign: 'capricorn',   startMonth: 1,  startDay: 1,  endMonth: 1,  endDay: 19 },
  { sign: 'aquarius',    startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18 },
  { sign: 'pisces',      startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20 },
  { sign: 'aries',       startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19 },
  { sign: 'taurus',      startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20 },
  { sign: 'gemini',      startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 20 },
  { sign: 'cancer',      startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 22 },
  { sign: 'leo',         startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22 },
  { sign: 'virgo',       startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22 },
  { sign: 'libra',       startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22 },
  { sign: 'scorpio',     startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { sign: 'sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { sign: 'capricorn',   startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 },
] as const;

export function getWesternZodiacSign(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const [, monthStr, dayStr] = datePart.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  for (const entry of WESTERN_SIGNS) {
    const afterStart = month > entry.startMonth ||
                       (month === entry.startMonth && day >= entry.startDay);
    const beforeEnd = month < entry.endMonth ||
                      (month === entry.endMonth && day <= entry.endDay);
    if (afterStart && beforeEnd) {
      return entry.sign;
    }
  }
  return 'capricorn'; // fallback (should not happen)
}

const CHINESE_ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
] as const;

export function getChineseZodiacAnimal(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const year = parseInt(datePart.split('-')[0], 10);
  // 1900 was Year of the Rat
  const index = ((year - 1900) % 12 + 12) % 12;
  return CHINESE_ANIMALS[index];
}

const HEAVENLY_ELEMENTS = ['metal', 'metal', 'water', 'water', 'wood', 'wood', 'fire', 'fire', 'earth', 'earth'] as const;

export function getChineseElement(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const year = parseInt(datePart.split('-')[0], 10);
  return HEAVENLY_ELEMENTS[year % 10];
}
