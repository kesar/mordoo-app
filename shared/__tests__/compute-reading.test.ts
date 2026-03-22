import { describe, it, expect } from 'vitest';
import { computeReading, profileWeights, subtractDays, momentum } from '../compute-reading';

const BASE_INPUT = {
  userId: 'test-user-1',
  dateOfBirth: '1990-06-15',
  fullName: 'John Smith',
  currentDate: '2026-03-22',
};

describe('computeReading', () => {
  it('returns deterministic results for the same input', () => {
    const a = computeReading(BASE_INPUT);
    const b = computeReading(BASE_INPUT);
    expect(a).toEqual(b);
  });

  it('energyScore is between 0 and 100', () => {
    const result = computeReading(BASE_INPUT);
    expect(result.energyScore).toBeGreaterThanOrEqual(0);
    expect(result.energyScore).toBeLessThanOrEqual(100);
  });
});

describe('profileWeights', () => {
  it('weights average to 1.0', () => {
    const w = profileWeights(4, 8, 23, 3);
    const avg = (w.business + w.heart + w.body) / 3;
    expect(avg).toBeCloseTo(1.0, 5);
  });

  it('all weights are between 0.63 and 1.45', () => {
    // Theoretical extremes: one weight at 1.3, others at 0.7 → 1.3/0.9=1.444, 0.7/1.1=0.636
    const cases = [
      [1, 1, 1, 1], [9, 9, 31, 12], [5, 5, 15, 6],
      [1, 9, 28, 11], [9, 1, 1, 1], [4, 8, 23, 3],
    ] as const;
    for (const [lp, nn, bd, bm] of cases) {
      const w = profileWeights(lp, nn, bd, bm);
      expect(w.business).toBeGreaterThanOrEqual(0.63);
      expect(w.business).toBeLessThanOrEqual(1.45);
      expect(w.heart).toBeGreaterThanOrEqual(0.63);
      expect(w.heart).toBeLessThanOrEqual(1.45);
      expect(w.body).toBeGreaterThanOrEqual(0.63);
      expect(w.body).toBeLessThanOrEqual(1.45);
    }
  });

  it('different birth data produces different shapes', () => {
    const a = profileWeights(4, 8, 23, 3);
    const b = profileWeights(1, 6, 7, 11);
    // At least one weight should differ by > 0.1
    const diffs = [
      Math.abs(a.business - b.business),
      Math.abs(a.heart - b.heart),
      Math.abs(a.body - b.body),
    ];
    expect(Math.max(...diffs)).toBeGreaterThan(0.1);
  });

  it('reduces master numbers (11→2, 22→4)', () => {
    const w11 = profileWeights(11, 5, 15, 6);
    const w2 = profileWeights(2, 5, 15, 6);
    // Master number 11 reduces to 2 (standard numerological reduction)
    expect(w11).toEqual(w2);

    const w22 = profileWeights(22, 5, 15, 6);
    const w4 = profileWeights(4, 5, 15, 6);
    expect(w22).toEqual(w4);
  });
});

describe('subtractDays', () => {
  it('subtracts days within a month', () => {
    expect(subtractDays('2026-03-22', 1)).toBe('2026-03-21');
    expect(subtractDays('2026-03-22', 3)).toBe('2026-03-19');
  });

  it('handles month boundary', () => {
    expect(subtractDays('2026-03-01', 1)).toBe('2026-02-28');
  });

  it('handles year boundary', () => {
    expect(subtractDays('2026-01-01', 1)).toBe('2025-12-31');
  });

  it('handles leap year', () => {
    expect(subtractDays('2024-03-01', 1)).toBe('2024-02-29');
  });
});

describe('momentum', () => {
  it('returns 0 for flat scores', () => {
    expect(momentum(50, 50, 50, 50)).toBe(0);
  });

  it('returns positive for rising scores', () => {
    const result = momentum(70, 60, 50, 40);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('returns negative for falling scores', () => {
    const result = momentum(40, 50, 60, 70);
    expect(result).toBeLessThan(0);
    expect(result).toBeGreaterThanOrEqual(-1);
  });

  it('computes correct value for known inputs', () => {
    // diff1=10, diff2=5, diff3=0 → weighted = (30+10+0)/6 = 6.67 → /15 = 0.444
    expect(momentum(60, 50, 45, 45)).toBeCloseTo(0.444, 2);
  });

  it('clamps to -1..1 range', () => {
    expect(momentum(100, 0, 0, 0)).toBeLessThanOrEqual(1);
    expect(momentum(0, 100, 100, 100)).toBeGreaterThanOrEqual(-1);
  });
});

describe('computeReading sub-scores', () => {
  it('sub-scores are between 0 and 100', () => {
    const users = ['user-a', 'user-b', 'user-c'];
    const dates = ['2026-01-01', '2026-06-15', '2026-12-31'];
    for (const userId of users) {
      for (const currentDate of dates) {
        const result = computeReading({
          userId,
          dateOfBirth: '1990-06-15',
          fullName: 'Test User',
          currentDate,
        });
        expect(result.subScores.business).toBeGreaterThanOrEqual(0);
        expect(result.subScores.business).toBeLessThanOrEqual(100);
        expect(result.subScores.heart).toBeGreaterThanOrEqual(0);
        expect(result.subScores.heart).toBeLessThanOrEqual(100);
        expect(result.subScores.body).toBeGreaterThanOrEqual(0);
        expect(result.subScores.body).toBeLessThanOrEqual(100);
      }
    }
  });

  it('different users get different profile shapes', () => {
    const userA = computeReading({
      userId: 'user-a',
      dateOfBirth: '1990-03-23',
      fullName: 'Alice Johnson',
      currentDate: '2026-03-22',
    });
    const userB = computeReading({
      userId: 'user-b',
      dateOfBirth: '1985-11-07',
      fullName: 'Bob Williams',
      currentDate: '2026-03-22',
    });
    const ratioA = userA.subScores.business / (userA.subScores.heart || 1);
    const ratioB = userB.subScores.business / (userB.subScores.heart || 1);
    expect(ratioA).not.toBeCloseTo(ratioB, 1);
  });

  it('sub-scores vary across days for the same user', () => {
    const days = ['2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23', '2026-03-24'];
    const scores = days.map(d => computeReading({
      userId: 'test-user-1',
      dateOfBirth: '1990-06-15',
      fullName: 'John Smith',
      currentDate: d,
    }).subScores.business);
    const unique = new Set(scores);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('user without fullName still gets varied sub-scores', () => {
    const result = computeReading({
      userId: 'test-user-no-name',
      dateOfBirth: '1995-08-20',
      currentDate: '2026-03-22',
    });
    expect(result.subScores.business).toBeGreaterThanOrEqual(0);
    expect(result.subScores.heart).toBeGreaterThanOrEqual(0);
    expect(result.subScores.body).toBeGreaterThanOrEqual(0);
    const { business, heart, body } = result.subScores;
    const allSame = business === heart && heart === body;
    expect(allSame).toBe(false);
  });

  it('remains deterministic', () => {
    const input = {
      userId: 'test-user-1',
      dateOfBirth: '1990-06-15',
      fullName: 'John Smith',
      currentDate: '2026-03-22',
    };
    const a = computeReading(input);
    const b = computeReading(input);
    expect(a.subScores).toEqual(b.subScores);
  });
});
