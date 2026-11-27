import { describe, expect, it } from 'vitest';
import { emptyStats, formatStats, previousUtcDate, recordWin, type Stats } from './stats';

describe('previousUtcDate', () => {
  it('steps back one UTC day, including month and year boundaries', () => {
    expect(previousUtcDate('2026-11-27')).toBe('2026-11-26');
    expect(previousUtcDate('2026-03-01')).toBe('2026-02-28');
    expect(previousUtcDate('2024-03-01')).toBe('2024-02-29');
    expect(previousUtcDate('2026-01-01')).toBe('2025-12-31');
  });
});

describe('recordWin', () => {
  it('starts a streak on the first daily solve', () => {
    const next = recordWin(emptyStats(), {
      mode: 'daily',
      date: '2026-11-27',
      steps: 6,
      par: 5,
    });
    expect(next).toEqual({
      streak: 1,
      lastDaily: '2026-11-27',
      played: 1,
      overParSum: 1,
    });
  });

  it('continues a streak when yesterday was solved', () => {
    const stats: Stats = {
      streak: 3,
      lastDaily: '2026-11-26',
      played: 3,
      overParSum: 2,
    };
    const next = recordWin(stats, {
      mode: 'daily',
      date: '2026-11-27',
      steps: 5,
      par: 5,
    });
    expect(next.streak).toBe(4);
    expect(next.lastDaily).toBe('2026-11-27');
    expect(next.played).toBe(4);
    expect(next.overParSum).toBe(2);
  });

  it('resets the streak after a missed day', () => {
    const stats: Stats = {
      streak: 5,
      lastDaily: '2026-11-20',
      played: 5,
      overParSum: 0,
    };
    const next = recordWin(stats, {
      mode: 'daily',
      date: '2026-11-27',
      steps: 7,
      par: 4,
    });
    expect(next.streak).toBe(1);
    expect(next.overParSum).toBe(3);
  });

  it('does not count the same daily twice', () => {
    const stats = recordWin(emptyStats(), {
      mode: 'daily',
      date: '2026-11-27',
      steps: 5,
      par: 5,
    });
    expect(
      recordWin(stats, { mode: 'daily', date: '2026-11-27', steps: 9, par: 5 }),
    ).toBe(stats);
  });

  it('counts practice games without changing the streak', () => {
    const stats: Stats = {
      streak: 2,
      lastDaily: '2026-11-27',
      played: 2,
      overParSum: 1,
    };
    const next = recordWin(stats, {
      mode: 'practice',
      date: '2026-11-27',
      steps: 8,
      par: 6,
    });
    expect(next.streak).toBe(2);
    expect(next.lastDaily).toBe('2026-11-27');
    expect(next.played).toBe(3);
    expect(next.overParSum).toBe(3);
  });
});

describe('formatStats', () => {
  it('reads cleanly with no games and with an average', () => {
    expect(formatStats(emptyStats())).toBe('Streak 0 · 0 games · 0 over par');
    expect(
      formatStats({ streak: 4, lastDaily: '2026-11-27', played: 2, overParSum: 3 }),
    ).toBe('Streak 4 · 2 games · 1.5 over par');
    expect(
      formatStats({ streak: 1, lastDaily: '2026-11-27', played: 1, overParSum: 0 }),
    ).toBe('Streak 1 · 1 game · 0 over par');
  });
});
