export type Stats = {
  streak: number;
  lastDaily: string | null;
  played: number;
  overParSum: number;
};

export type Win = {
  mode: 'daily' | 'practice';
  date: string;
  steps: number;
  par: number;
};

export function emptyStats(): Stats {
  return { streak: 0, lastDaily: null, played: 0, overParSum: 0 };
}

export function previousUtcDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Streak follows the daily puzzle only. Played games include practice. */
export function recordWin(stats: Stats, win: Win): Stats {
  if (win.mode === 'daily' && stats.lastDaily === win.date) return stats;

  const next: Stats = {
    streak: stats.streak,
    lastDaily: stats.lastDaily,
    played: stats.played + 1,
    overParSum: stats.overParSum + (win.steps - win.par),
  };

  if (win.mode === 'daily') {
    const continued = stats.lastDaily === previousUtcDate(win.date);
    next.streak = continued ? stats.streak + 1 : 1;
    next.lastDaily = win.date;
  }

  return next;
}

export function formatStats(stats: Stats): string {
  const games = stats.played === 1 ? '1 game' : `${stats.played} games`;
  return `Streak ${stats.streak} · ${games} · ${formatAverage(stats)}`;
}

function formatAverage(stats: Stats): string {
  if (stats.played === 0) return '0 over par';
  const rounded = Math.round((stats.overParSum / stats.played) * 10) / 10;
  if (rounded === 0) return '0 over par';
  return `${rounded.toFixed(1)} over par`;
}
