import { describe, it, expect } from 'vitest';
import { getDateStringForTimezone, getBangkokDateString } from '../date';

describe('getDateStringForTimezone', () => {
  it('returns correct date for Asia/Bangkok', () => {
    // 2026-01-15 23:30 UTC = 2026-01-16 06:30 Bangkok (UTC+7)
    const now = new Date('2026-01-15T23:30:00Z');
    expect(getDateStringForTimezone('Asia/Bangkok', now)).toBe('2026-01-16');
  });

  it('returns correct date for America/New_York', () => {
    // 2026-01-15 03:00 UTC = 2026-01-14 22:00 New York (UTC-5 in Jan)
    const now = new Date('2026-01-15T03:00:00Z');
    expect(getDateStringForTimezone('America/New_York', now)).toBe('2026-01-14');
  });

  it('returns correct date for Europe/London', () => {
    // 2026-07-15 00:30 UTC = 2026-07-15 01:30 London (BST, UTC+1 in summer)
    const now = new Date('2026-07-15T00:30:00Z');
    expect(getDateStringForTimezone('Europe/London', now)).toBe('2026-07-15');
  });

  it('falls back to Bangkok for invalid timezone', () => {
    const now = new Date('2026-01-15T23:30:00Z');
    const result = getDateStringForTimezone('Invalid/Timezone', now);
    expect(result).toBe(getBangkokDateString(now));
  });

  it('returns YYYY-MM-DD format', () => {
    const now = new Date('2026-03-05T12:00:00Z');
    const result = getDateStringForTimezone('UTC', now);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
