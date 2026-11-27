import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGraph, distancesFrom, shortestPath } from '../src/game/bfs';
import { blockedWords } from '../src/game/blocklist';
import { mulberry32 } from '../src/game/random';
import type { Puzzle } from '../src/game/types';

// Fixed seed: choosing pairs is deterministic, so a rerun writes the same file.
// The daily game indexes that file, so a different seed changes the schedule.
const SEED = 0x5c011;
const PER_PAR = 140;
const MAX_PER_START = 2;
const MAX_PER_TARGET = 3;
const MIN_DEGREE: Record<number, number> = { 4: 2, 5: 2 };
const PARS = [4, 5, 6, 7] as const;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lists = [
  'data/scowl/english-words.10',
  'data/scowl/english-words.20',
  'data/scowl/american-words.10',
  'data/scowl/american-words.20',
];

// Present in SCOWL, but they read as typos or archaic forms.
const skip = new Set(['baud', 'buss', 'mans', 'thous', 'wive', 'wont']);

const words = new Set<string>();
for (const list of lists) {
  for (const line of readFileSync(join(root, list), 'utf8').split(/\r?\n/)) {
    const word = line.trim().toLowerCase();
    if (!/^[a-z]{4,5}$/.test(word)) continue;
    if (blockedWords.has(word) || skip.has(word)) continue;
    words.add(word);
  }
}

const byLength = new Map<number, Set<string>>([
  [4, new Set()],
  [5, new Set()],
]);
for (const word of words) byLength.get(word.length)?.add(word);

const random = mulberry32(SEED);
const puzzles: Puzzle[] = [];

for (const length of [4, 5]) {
  const group = byLength.get(length) ?? new Set<string>();
  const graph = buildGraph(group);
  const minDegree = MIN_DEGREE[length] ?? 1;
  const eligible = [...group]
    .filter((word) => (graph.get(word)?.length ?? 0) >= minDegree)
    .sort();
  const starts = shuffle(eligible, random);
  const buckets: Record<number, Puzzle[]> = { 4: [], 5: [], 6: [], 7: [] };
  const startCount = new Map<string, number>();
  const targetCount = new Map<string, number>();

  for (const start of starts) {
    if (PARS.every((par) => buckets[par].length >= PER_PAR)) break;
    const distances = distancesFrom(start, graph, 7);
    for (const par of PARS) {
      if (buckets[par].length >= PER_PAR) continue;
      if ((startCount.get(start) ?? 0) >= MAX_PER_START) continue;
      const options: string[] = [];
      for (const [word, distance] of distances) {
        if (distance !== par) continue;
        if ((graph.get(word)?.length ?? 0) < minDegree) continue;
        if ((targetCount.get(word) ?? 0) >= MAX_PER_TARGET) continue;
        options.push(word);
      }
      if (options.length === 0) continue;
      options.sort((a, b) => {
        const byDegree = (graph.get(b)?.length ?? 0) - (graph.get(a)?.length ?? 0);
        return byDegree || a.localeCompare(b);
      });
      const shortlist = options.slice(0, 12);
      const target = shortlist[Math.floor(random() * shortlist.length)];
      if (!target) continue;
      buckets[par].push({ start, target, par });
      startCount.set(start, (startCount.get(start) ?? 0) + 1);
      targetCount.set(target, (targetCount.get(target) ?? 0) + 1);
    }
  }

  for (const par of PARS) {
    if (buckets[par].length < 80) {
      throw new Error(`Only ${buckets[par].length} puzzles for ${length} letters at par ${par}`);
    }
    puzzles.push(...buckets[par]);
  }
}

puzzles.sort((a, b) => a.start.length - b.start.length || a.par - b.par || a.start.localeCompare(b.start) || a.target.localeCompare(b.target));

for (const puzzle of puzzles) {
  const group = byLength.get(puzzle.start.length) ?? new Set<string>();
  const path = shortestPath(puzzle.start, puzzle.target, group);
  const steps = path ? path.length - 1 : -1;
  if (steps !== puzzle.par) {
    throw new Error(`Par mismatch for ${puzzle.start} -> ${puzzle.target}`);
  }
}

const lexicon = {
  4: [...(byLength.get(4) ?? [])].sort(),
  5: [...(byLength.get(5) ?? [])].sort(),
};

writeFileSync(join(root, 'src/data/words.json'), `${JSON.stringify(lexicon, null, 2)}\n`);
writeFileSync(join(root, 'src/data/puzzles.json'), `${JSON.stringify(puzzles, null, 2)}\n`);

const counts = new Map<string, number>();
for (const puzzle of puzzles) {
  const key = `${puzzle.start.length}:${puzzle.par}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
console.log(`words ${lexicon[4].length} + ${lexicon[5].length}, puzzles ${puzzles.length}`);
for (const [key, count] of [...counts].sort()) console.log(`  ${key} ${count}`);

function shuffle(items: string[], next: () => number): string[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j] ?? copy[i];
    copy[j] = swap;
  }
  return copy;
}
