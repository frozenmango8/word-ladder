# word-ladder

A daily word ladder. Change one letter at a time until the start word becomes the target.

Play at https://frozenmango8.github.io/word-ladder/

## How to play

You get two words of the same length, 4 or 5 letters. Each move changes exactly one letter and must be a word in the list. Par is the fewest moves the puzzle takes.

The daily puzzle is the same for everyone and changes at midnight UTC. Practice has no limit. Undo takes back a move, Hint plays the next word on a shortest path, and Give up shows one. Your streak counts daily solves in a row. Games played and average over par include practice. Stats stay in this browser.

Share copies a result without the words, such as `word-ladder 2026-11-27: 6 steps (par 5)`.

## Develop

```
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
npm run generate
```

`npm run generate` rebuilds the puzzle list from the word lists in `data/scowl`. That changes which puzzle falls on each date.

The words are SCOWL sizes 10 and 20 by Kevin Atkinson (common English, including American spellings). See `data/scowl/COPYRIGHT`. Offensive words are removed when the puzzles are generated.

## License

MIT
