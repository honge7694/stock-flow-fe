import { describe, expect, it } from 'vitest';
import { formatInteger, formatMoney, formatNumber, formatPercent } from './numberFormat';

describe('number formatting', () => {
  it('groups thousands and limits decimals to two places by default', () => {
    expect(formatNumber(1234567.891)).toBe('1,234,567.89');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats integer counts, percentages, and currency consistently', () => {
    expect(formatInteger(12345.67)).toBe('12,346');
    expect(formatPercent(1234.567)).toBe('1,234.57%');
    expect(formatPercent(12.3, true)).toBe('+12.3%');
    expect(formatMoney(1234567.891, 'KRW')).toBe('1,234,567.89 KRW');
  });

  it('uses a placeholder for unavailable or invalid values', () => {
    expect(formatNumber(null)).toBe('-');
    expect(formatNumber(Number.NaN)).toBe('-');
    expect(formatMoney(undefined, 'KRW')).toBe('-');
  });
});
