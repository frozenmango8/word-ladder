import { describe, expect, it } from 'vitest';
import { puzzleForDate, pickDailyIndex, utcToday } from './daily';
import { hashString, mulberry32 } from './random';
import type { Puzzle } from './types';

describe('daily seed', () => {
  it('hashes a date to a stable value', () => {
    expect(hashString('2026-11-27')).toBe(hashString('2026-11-27'));
    expect(hashString('2026-11-27')).not.toBe(hashString('2026-11-28'));
  });

  it('picks the same index for the same date', () => {
    expect(pickDailyIndex('2026-11-27', 1000)).toBe(pickDailyIndex('2026-11-27', 1000));
    expect(pickDailyIndex('2020-01-01', 500)).toBe(pickDailyIndex('2020-01-01', 500));
    expect(pickDailyIndex('2026-11-27', 1)).toBe(0);
  });

  it('stays inside the puzzle list for a month of dates', () => {
    for (let day = 1; day <= 28; day += 1) {
      const iso = `2026-11-${String(day).padStart(2, '0')}`;
      const index = pickDailyIndex(iso, 500);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(500);
      expect(index).toBe(pickDailyIndex(iso, 500));
    }
  });

  it('locks the seed used for the sample date', () => {
    expect(hashString('2026-11-27')).toBe(4279824600);
    expect(pickDailyIndex('2026-11-27', 1000)).toBe(336);
    expect(mulberry32(1)()).toBe(0.6270739405881613);
  });

  it('rejects an empty list', () => {
    expect(() => pickDailyIndex('2026-11-27', 0)).toThrow(/empty/i);
  });

  it('returns the puzzle at the seeded index', () => {
    const puzzles: Puzzle[] = [
      { start: 'cold', target: 'warm', par: 4 },
      { start: 'head', target: 'tail', par: 5 },
      { start: 'stone', target: 'bread', par: 6 },
    ];
    const picked = puzzleForDate(puzzles, '2026-11-27');
    expect(picked).toBe(puzzles[pickDailyIndex('2026-11-27', puzzles.length)]);
    expect(puzzleForDate(puzzles, '2026-11-27')).toEqual(picked);
  });
});

describe('utcToday', () => {
  it('uses the UTC date, including late evening UTC', () => {
    expect(utcToday(new Date(Date.UTC(2026, 10, 27, 23, 30)))).toBe('2026-11-27');
    expect(utcToday(new Date(Date.UTC(2026, 10, 28, 0, 5)))).toBe('2026-11-28');
  });
});
