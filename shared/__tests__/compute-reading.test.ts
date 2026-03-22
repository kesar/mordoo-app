import { describe, it, expect } from 'vitest';
import { computeReading } from '../compute-reading';

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
