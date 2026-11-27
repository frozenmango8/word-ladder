import type { Puzzle } from './types';
import { hashString, mulberry32 } from './random';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Index into the puzzle list for a UTC date.
 * The result depends on the date and on the list order, so regenerating
 * the list changes which puzzle falls on a given day.
 */
export function pickDailyIndex(isoDate: string, count: number): number {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Puzzle list is empty');
  }
  const random = mulberry32(hashString(isoDate));
  return Math.floor(random() * count);
}

export function puzzleForDate(puzzles: readonly Puzzle[], isoDate: string): Puzzle {
  const puzzle = puzzles[pickDailyIndex(isoDate, puzzles.length)];
  if (!puzzle) throw new Error('Puzzle list is empty');
  return puzzle;
}

export function pickPractice(puzzles: readonly Puzzle[], avoid?: Puzzle): Puzzle {
  if (puzzles.length === 0) throw new Error('Puzzle list is empty');
  if (puzzles.length === 1) return puzzles[0];
  let index = Math.floor(Math.random() * puzzles.length);
  const picked = puzzles[index];
  if (avoid && picked.start === avoid.start && picked.target === avoid.target) {
    index = (index + 1) % puzzles.length;
  }
  return puzzles[index];
}

export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function formatUtcDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
