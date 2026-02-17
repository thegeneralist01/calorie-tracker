import { describe, expect, it } from 'vitest';
import { replayChronological, sevenDayMovingAverage } from '../../src/lib/domain/metrics';

describe('sevenDayMovingAverage', () => {
  it('returns 0 for empty values', () => {
    expect(sevenDayMovingAverage([])).toBe(0);
  });

  it('uses only the latest seven entries', () => {
    expect(sevenDayMovingAverage([1, 2, 3, 4, 5, 6, 7, 8])).toBe(5);
  });
});

describe('replayChronological', () => {
  it('sorts events by creation time ascending and maps payloads', () => {
    const result = replayChronological([
      { createdAt: new Date('2026-01-02T10:00:00Z'), payload: 'second' },
      { createdAt: new Date('2026-01-02T09:00:00Z'), payload: 'first' },
      { createdAt: new Date('2026-01-02T11:00:00Z'), payload: 'third' }
    ]);

    expect(result).toEqual(['first', 'second', 'third']);
  });
});
