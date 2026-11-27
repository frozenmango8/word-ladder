export type Puzzle = {
  start: string;
  target: string;
  par: number;
};

export type Mode = 'daily' | 'practice';

export type Status = 'playing' | 'won' | 'gave-up';

export type RejectReason = 'length' | 'not-word' | 'letters';
