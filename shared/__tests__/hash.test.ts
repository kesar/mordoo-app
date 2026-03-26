import { describe, it, expect } from 'vitest';
import { hashCode } from '../hash';

describe('hashCode', () => {
  it('returns a non-negative integer', () => {
    expect(hashCode('hello')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashCode('hello'))).toBe(true);
  });

  it('is deterministic', () => {
    expect(hashCode('test-string')).toBe(hashCode('test-string'));
  });

  it('produces different hashes for different strings', () => {
    const a = hashCode('user-a:2026-03:0');
    const b = hashCode('user-b:2026-03:0');
    expect(a).not.toBe(b);
  });

  it('handles empty string', () => {
    expect(hashCode('')).toBe(0);
  });

  it('handles unicode / Thai characters', () => {
    const result = hashCode('สวัสดี');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('handles long strings without throwing', () => {
    const long = 'a'.repeat(10000);
    expect(() => hashCode(long)).not.toThrow();
    expect(hashCode(long)).toBeGreaterThanOrEqual(0);
  });
});
