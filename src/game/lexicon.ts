import puzzlesFile from '../data/puzzles.json';
import wordsFile from '../data/words.json';
import type { Puzzle } from './types';

type LexiconFile = {
  '4': string[];
  '5': string[];
};

const words = wordsFile as LexiconFile;

export function wordsOfLength(length: number): readonly string[] {
  if (length === 4) return words['4'];
  if (length === 5) return words['5'];
  return [];
}

export function wordSet(length: number): Set<string> {
  return new Set(wordsOfLength(length));
}

export function allPuzzles(): Puzzle[] {
  return puzzlesFile as Puzzle[];
}
