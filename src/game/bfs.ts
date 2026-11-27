const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export function neighbors(word: string, words: ReadonlySet<string>): string[] {
  const chars = word.split('');
  const found: string[] = [];
  for (let i = 0; i < chars.length; i += 1) {
    const original = chars[i];
    for (const letter of ALPHABET) {
      if (letter === original) continue;
      chars[i] = letter;
      const next = chars.join('');
      if (words.has(next)) found.push(next);
    }
    chars[i] = original;
  }
  found.sort();
  return found;
}

export function buildGraph(words: ReadonlySet<string>): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const word of [...words].sort()) {
    graph.set(word, neighbors(word, words));
  }
  return graph;
}

/** One shortest ladder, including both ends. Null when no ladder exists. */
export function shortestPath(
  start: string,
  target: string,
  words: ReadonlySet<string>,
): string[] | null {
  if (start === target) return [start];
  if (start.length !== target.length) return null;
  if (!words.has(start) || !words.has(target)) return null;

  const previous = new Map<string, string>();
  const seen = new Set<string>([start]);
  const queue = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    for (const next of neighbors(current, words)) {
      if (seen.has(next)) continue;
      seen.add(next);
      previous.set(next, current);
      if (next === target) return trace(target, previous);
      queue.push(next);
    }
  }

  return null;
}

/** Distances from start, not searching past maxSteps. */
export function distancesFrom(
  start: string,
  graph: ReadonlyMap<string, readonly string[]>,
  maxSteps: number,
): Map<string, number> {
  const distance = new Map<string, number>([[start, 0]]);
  const queue = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    const soFar = distance.get(current) ?? 0;
    if (soFar >= maxSteps) continue;
    for (const next of graph.get(current) ?? []) {
      if (distance.has(next)) continue;
      distance.set(next, soFar + 1);
      queue.push(next);
    }
  }

  return distance;
}

function trace(target: string, previous: ReadonlyMap<string, string>): string[] {
  const path = [target];
  let cursor = target;
  let prior = previous.get(cursor);
  while (prior !== undefined) {
    path.push(prior);
    cursor = prior;
    prior = previous.get(cursor);
  }
  path.reverse();
  return path;
}
