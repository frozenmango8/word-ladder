import { describe, expect, it } from 'vitest';
import { resultSentence, shareText } from './share';

describe('shareText', () => {
  it('matches the spoiler-free daily line', () => {
    expect(
      shareText({ mode: 'daily', date: '2026-11-27', steps: 6, par: 5 }),
    ).toBe('word-ladder 2026-11-27: 6 steps (par 5)');
  });

  it('uses the singular for one step and labels practice', () => {
    expect(shareText({ mode: 'daily', date: '2026-11-27', steps: 1, par: 4 })).toBe(
      'word-ladder 2026-11-27: 1 step (par 4)',
    );
    expect(shareText({ mode: 'practice', date: '2026-11-27', steps: 6, par: 5 })).toBe(
      'word-ladder practice: 6 steps (par 5)',
    );
  });
});

describe('resultSentence', () => {
  it('compares the result with par', () => {
    expect(resultSentence(5, 5)).toBe('Solved in 5 steps, on par.');
    expect(resultSentence(6, 5)).toBe('Solved in 6 steps, one over par.');
    expect(resultSentence(8, 5)).toBe('Solved in 8 steps, 3 over par.');
  });
});
