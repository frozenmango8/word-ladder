import type { RejectReason } from './types';

export type MoveResult =
  | { ok: true; word: string }
  | { ok: false; reason: RejectReason };

export function checkMove(
  from: string,
  to: string,
  words: ReadonlySet<string>,
): MoveResult {
  const current = from.trim().toLowerCase();
  const next = to.trim().toLowerCase();
  if (next.length !== current.length) return { ok: false, reason: 'length' };
  if (!/^[a-z]+$/.test(next) || !words.has(next)) {
    return { ok: false, reason: 'not-word' };
  }
  if (differences(current, next) !== 1) return { ok: false, reason: 'letters' };
  return { ok: true, word: next };
}

export function rejectionMessage(reason: RejectReason): string {
  switch (reason) {
    case 'length':
      return 'Use a word of the same length.';
    case 'not-word':
      return "That word isn't in the list.";
    case 'letters':
      return 'Change exactly one letter.';
  }
}

function differences(a: string, b: string): number {
  let count = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) count += 1;
  }
  return count;
}
