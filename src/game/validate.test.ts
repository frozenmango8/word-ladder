import { describe, expect, it } from 'vitest';
import { checkMove, rejectionMessage } from './validate';

const words = new Set(['cold', 'cord', 'card', 'warm']);

describe('checkMove', () => {
  it('accepts a dictionary word one letter away', () => {
    expect(checkMove('cold', 'cord', words)).toEqual({ ok: true, word: 'cord' });
    expect(checkMove('Cold', 'Cord', words)).toEqual({ ok: true, word: 'cord' });
  });

  it('rejects a word that is not in the list', () => {
    expect(checkMove('cold', 'cozy', words)).toEqual({ ok: false, reason: 'not-word' });
  });

  it('rejects a change of more or fewer than one letter', () => {
    expect(checkMove('cold', 'card', words)).toEqual({ ok: false, reason: 'letters' });
    expect(checkMove('cold', 'warm', words)).toEqual({ ok: false, reason: 'letters' });
    expect(checkMove('cold', 'cold', words)).toEqual({ ok: false, reason: 'letters' });
  });

  it('rejects the wrong length', () => {
    expect(checkMove('cold', 'col', words)).toEqual({ ok: false, reason: 'length' });
    expect(checkMove('cold', '', words)).toEqual({ ok: false, reason: 'length' });
    expect(checkMove('cold', 'cords', words)).toEqual({ ok: false, reason: 'length' });
  });
});

describe('rejectionMessage', () => {
  it('explains each invalid move', () => {
    expect(rejectionMessage('not-word')).toBe("That word isn't in the list.");
    expect(rejectionMessage('letters')).toBe('Change exactly one letter.');
    expect(rejectionMessage('length')).toBe('Use a word of the same length.');
  });
});
