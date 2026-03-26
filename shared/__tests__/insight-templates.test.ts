import { describe, it, expect } from 'vitest';
import { getElement, getScoreRange, selectInsight } from '../insight-templates';

describe('getElement', () => {
  it('months 1-3 → water', () => {
    expect(getElement(1)).toBe('water');
    expect(getElement(2)).toBe('water');
    expect(getElement(3)).toBe('water');
  });

  it('months 4-6 → fire', () => {
    expect(getElement(4)).toBe('fire');
    expect(getElement(5)).toBe('fire');
    expect(getElement(6)).toBe('fire');
  });

  it('months 7-9 → earth', () => {
    expect(getElement(7)).toBe('earth');
    expect(getElement(8)).toBe('earth');
    expect(getElement(9)).toBe('earth');
  });

  it('months 10-12 → air', () => {
    expect(getElement(10)).toBe('air');
    expect(getElement(11)).toBe('air');
    expect(getElement(12)).toBe('air');
  });
});

describe('getScoreRange', () => {
  it('score >= 70 → high', () => {
    expect(getScoreRange(70)).toBe('high');
    expect(getScoreRange(100)).toBe('high');
  });

  it('score 40-69 → medium', () => {
    expect(getScoreRange(40)).toBe('medium');
    expect(getScoreRange(69)).toBe('medium');
  });

  it('score < 40 → low', () => {
    expect(getScoreRange(39)).toBe('low');
    expect(getScoreRange(0)).toBe('low');
  });

  it('boundary values are correct', () => {
    expect(getScoreRange(70)).toBe('high');
    expect(getScoreRange(69)).toBe('medium');
    expect(getScoreRange(40)).toBe('medium');
    expect(getScoreRange(39)).toBe('low');
  });
});

describe('selectInsight', () => {
  it('returns an object with en and th strings', () => {
    const result = selectInsight(75, 6, 42);
    expect(typeof result.en).toBe('string');
    expect(typeof result.th).toBe('string');
    expect(result.en.length).toBeGreaterThan(0);
    expect(result.th.length).toBeGreaterThan(0);
  });

  it('is deterministic for same inputs', () => {
    const a = selectInsight(80, 3, 123);
    const b = selectInsight(80, 3, 123);
    expect(a).toEqual(b);
  });

  it('different seeds can select different insights', () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => selectInsight(80, 6, i).en)
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it('different score ranges select from different pools', () => {
    const high = selectInsight(90, 6, 0);
    const low = selectInsight(10, 6, 0);
    // High and low pools have different tones — at seed 0 they should differ
    expect(high.en).not.toBe(low.en);
  });

  it('different elements select from different pools', () => {
    const water = selectInsight(80, 1, 0); // month 1 = water
    const fire = selectInsight(80, 5, 0);  // month 5 = fire
    expect(water.en).not.toBe(fire.en);
  });

  it('works for all element/range combinations', () => {
    const months = [1, 4, 7, 10]; // water, fire, earth, air
    const scores = [10, 50, 90];  // low, medium, high
    for (const month of months) {
      for (const score of scores) {
        const result = selectInsight(score, month, 0);
        expect(result.en.length).toBeGreaterThan(0);
        expect(result.th.length).toBeGreaterThan(0);
      }
    }
  });
});
