import { describe, expect, it } from 'vitest';
import { shortestPath } from './bfs';
import { blockedWords } from './blocklist';
import { pickDailyIndex, puzzleForDate } from './daily';
import { allPuzzles, wordSet, wordsOfLength } from './lexicon';

describe('generated puzzles', () => {
  it('keeps a clean 4- and 5-letter lexicon', () => {
    for (const length of [4, 5]) {
      const words = wordsOfLength(length);
      expect(new Set(words).size).toBe(words.length);
      for (const word of words) {
        expect(word).toMatch(/^[a-z]+$/);
        expect(word).toHaveLength(length);
        expect(blockedWords.has(word)).toBe(false);
      }
    }
  });

  it('stores only ladders of 4 to 7 steps, and the par is the true distance', () => {
    const puzzles = allPuzzles();
    expect(puzzles.length).toBeGreaterThan(800);
    const sets = new Map<number, Set<string>>();
    for (const puzzle of puzzles) {
      expect(puzzle.par).toBeGreaterThanOrEqual(4);
      expect(puzzle.par).toBeLessThanOrEqual(7);
      expect(puzzle.start).toHaveLength(puzzle.target.length);
      let words = sets.get(puzzle.start.length);
      if (!words) {
        words = wordSet(puzzle.start.length);
        sets.set(puzzle.start.length, words);
      }
      expect(words.has(puzzle.start)).toBe(true);
      expect(words.has(puzzle.target)).toBe(true);
      const path = shortestPath(puzzle.start, puzzle.target, words);
      expect(path).not.toBeNull();
      expect(path?.length).toBe(puzzle.par + 1);
    }
  });

  it('gives every player the same puzzle on a given date', () => {
    const puzzles = allPuzzles();
    const date = '2026-11-27';
    const puzzle = puzzleForDate(puzzles, date);
    expect(puzzle).toBe(puzzles[pickDailyIndex(date, puzzles.length)]);
    expect(puzzleForDate(puzzles, date)).toEqual(puzzle);
  });
});
