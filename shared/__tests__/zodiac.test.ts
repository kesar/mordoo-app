import { describe, it, expect } from 'vitest';
import { getWesternZodiacSign, getChineseZodiacAnimal, getChineseElement } from '../zodiac';

describe('getWesternZodiacSign', () => {
  const cases: [string, string][] = [
    ['1990-01-01', 'capricorn'],
    ['1990-01-19', 'capricorn'],
    ['1990-01-20', 'aquarius'],
    ['1990-02-18', 'aquarius'],
    ['1990-02-19', 'pisces'],
    ['1990-03-20', 'pisces'],
    ['1990-03-21', 'aries'],
    ['1990-04-19', 'aries'],
    ['1990-04-20', 'taurus'],
    ['1990-05-20', 'taurus'],
    ['1990-05-21', 'gemini'],
    ['1990-06-20', 'gemini'],
    ['1990-06-21', 'cancer'],
    ['1990-07-22', 'cancer'],
    ['1990-07-23', 'leo'],
    ['1990-08-22', 'leo'],
    ['1990-08-23', 'virgo'],
    ['1990-09-22', 'virgo'],
    ['1990-09-23', 'libra'],
    ['1990-10-22', 'libra'],
    ['1990-10-23', 'scorpio'],
    ['1990-11-21', 'scorpio'],
    ['1990-11-22', 'sagittarius'],
    ['1990-12-21', 'sagittarius'],
    ['1990-12-22', 'capricorn'],
    ['1990-12-31', 'capricorn'],
  ];

  it.each(cases)('%s → %s', (dob, expected) => {
    expect(getWesternZodiacSign(dob)).toBe(expected);
  });

  it('handles ISO datetime string with T', () => {
    expect(getWesternZodiacSign('1990-06-15T00:00:00Z')).toBe('gemini');
  });
});

describe('getChineseZodiacAnimal', () => {
  const cases: [string, string][] = [
    ['1900-01-01', 'rat'],
    ['1901-06-15', 'ox'],
    ['1988-03-10', 'dragon'],
    ['1990-06-15', 'horse'],
    ['2000-01-01', 'dragon'],
    ['2024-05-01', 'dragon'],
    ['2023-01-01', 'rabbit'],
  ];

  it.each(cases)('%s → %s', (dob, expected) => {
    expect(getChineseZodiacAnimal(dob)).toBe(expected);
  });

  it('cycles every 12 years', () => {
    const base = getChineseZodiacAnimal('2000-01-01');
    expect(getChineseZodiacAnimal('2012-01-01')).toBe(base);
    expect(getChineseZodiacAnimal('2024-01-01')).toBe(base);
  });

  it('handles ISO datetime string with T', () => {
    expect(getChineseZodiacAnimal('1990-06-15T12:00:00Z')).toBe('horse');
  });
});

describe('getChineseElement', () => {
  const cases: [string, string][] = [
    ['1990-01-01', 'metal'],
    ['1991-01-01', 'metal'],
    ['1992-01-01', 'water'],
    ['1993-01-01', 'water'],
    ['1994-01-01', 'wood'],
    ['1995-01-01', 'wood'],
    ['1996-01-01', 'fire'],
    ['1997-01-01', 'fire'],
    ['1998-01-01', 'earth'],
    ['1999-01-01', 'earth'],
  ];

  it.each(cases)('%s → %s', (dob, expected) => {
    expect(getChineseElement(dob)).toBe(expected);
  });

  it('cycles every 10 years', () => {
    const base = getChineseElement('2000-01-01');
    expect(getChineseElement('2010-01-01')).toBe(base);
    expect(getChineseElement('2020-01-01')).toBe(base);
  });
});
