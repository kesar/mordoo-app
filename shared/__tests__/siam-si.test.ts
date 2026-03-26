import { describe, it, expect } from 'vitest';
import { drawSiamSi, SIAM_SI_STICKS } from '../siam-si';

describe('SIAM_SI_STICKS', () => {
  it('has exactly 28 sticks', () => {
    expect(SIAM_SI_STICKS).toHaveLength(28);
  });

  it('sticks are numbered 1-28', () => {
    const numbers = SIAM_SI_STICKS.map(s => s.number);
    expect(numbers).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it('every stick has all required fields', () => {
    const validFortunes = ['excellent', 'good', 'fair', 'caution'];
    for (const stick of SIAM_SI_STICKS) {
      expect(stick.number).toBeGreaterThanOrEqual(1);
      expect(validFortunes).toContain(stick.fortune);
      expect(stick.titleEn.length).toBeGreaterThan(0);
      expect(stick.titleTh.length).toBeGreaterThan(0);
      expect(stick.meaningEn.length).toBeGreaterThan(0);
      expect(stick.meaningTh.length).toBeGreaterThan(0);
    }
  });

  it('has a mix of fortune levels', () => {
    const fortunes = new Set(SIAM_SI_STICKS.map(s => s.fortune));
    expect(fortunes.size).toBe(4);
  });
});

describe('drawSiamSi', () => {
  it('returns a valid stick', () => {
    const stick = drawSiamSi('user-1', '2026-03', 0);
    expect(stick.number).toBeGreaterThanOrEqual(1);
    expect(stick.number).toBeLessThanOrEqual(28);
    expect(stick.titleEn).toBeTruthy();
  });

  it('is deterministic for same inputs', () => {
    const a = drawSiamSi('user-1', '2026-03', 0);
    const b = drawSiamSi('user-1', '2026-03', 0);
    expect(a).toEqual(b);
  });

  it('different users draw different sticks (usually)', () => {
    const results = new Set(
      Array.from({ length: 10 }, (_, i) =>
        drawSiamSi(`user-${i}`, '2026-03', 0).number
      )
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it('different draw indices produce different sticks (usually)', () => {
    const results = new Set(
      Array.from({ length: 10 }, (_, i) =>
        drawSiamSi('user-1', '2026-03', i).number
      )
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it('different months produce different sticks (usually)', () => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
    const results = new Set(
      months.map(m => drawSiamSi('user-1', m, 0).number)
    );
    expect(results.size).toBeGreaterThan(1);
  });
});
