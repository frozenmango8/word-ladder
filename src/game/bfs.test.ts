import { describe, expect, it } from 'vitest';
import { buildGraph, shortestPath } from './bfs';

const words = new Set(['cold', 'cord', 'card', 'ward', 'warm', 'word', 'worm', 'core']);

describe('shortestPath', () => {
  it('finds a shortest ladder', () => {
    expect(shortestPath('cold', 'warm', words)).toEqual([
      'cold',
      'cord',
      'card',
      'ward',
      'warm',
    ]);
  });

  it('returns the word itself when start and target match', () => {
    expect(shortestPath('cold', 'cold', words)).toEqual(['cold']);
  });

  it('returns null when no ladder exists', () => {
    expect(shortestPath('cold', 'zzzz', words)).toBeNull();
    expect(shortestPath('cat', 'cats', new Set(['cat', 'cats']))).toBeNull();
    expect(shortestPath('cold', 'warm', new Set())).toBeNull();
  });

  it('prefers the shorter ladder when two routes exist', () => {
    const graph = new Set(['cat', 'cot', 'cog', 'dog', 'dot', 'dag']);
    expect(shortestPath('cat', 'dog', graph)).toEqual(['cat', 'cot', 'cog', 'dog']);
  });
});

describe('buildGraph', () => {
  it('links words that differ by one letter, in both directions', () => {
    const graph = buildGraph(new Set(['cat', 'cot', 'cog']));
    expect(graph.get('cat')).toEqual(['cot']);
    expect(graph.get('cot')).toEqual(['cat', 'cog']);
    expect(graph.get('cog')).toEqual(['cot']);
  });
});
