import { emptyStats, type Stats } from './stats';
import type { Status } from './types';

export const STATS_KEY = 'word-ladder-stats';
export const DAILY_KEY = 'word-ladder-daily';
export const PRACTICE_KEY = 'word-ladder-practice';
export const THEME_KEY = 'word-ladder-theme';

export type SavedSession = {
  date: string;
  start: string;
  target: string;
  moves: string[];
  status: Status;
};

export function loadStats(): Stats {
  const data = read(STATS_KEY);
  if (!isRecord(data)) return emptyStats();
  const { streak, lastDaily, played, overParSum } = data;
  if (
    !isFiniteNumber(streak) ||
    !isFiniteNumber(played) ||
    !isFiniteNumber(overParSum)
  ) {
    return emptyStats();
  }
  return {
    streak,
    played,
    overParSum,
    lastDaily: typeof lastDaily === 'string' ? lastDaily : null,
  };
}

export function saveStats(stats: Stats): void {
  write(STATS_KEY, stats);
}

export function loadSession(key: string): SavedSession | null {
  const data = read(key);
  if (!isRecord(data)) return null;
  const { date, start, target, moves, status } = data;
  if (typeof date !== 'string' || typeof start !== 'string' || typeof target !== 'string') {
    return null;
  }
  if (typeof status !== 'string' || !isStatus(status)) return null;
  if (!Array.isArray(moves) || moves.some((move) => typeof move !== 'string')) return null;
  return { date, start, target, moves, status };
}

export function saveSession(key: string, session: SavedSession): void {
  write(key, session);
}

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode and a full disk both fail closed.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStatus(value: string): value is Status {
  return value === 'playing' || value === 'won' || value === 'gave-up';
}
