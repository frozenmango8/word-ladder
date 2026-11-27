import { shortestPath } from '../game/bfs';
import {
  formatUtcDate,
  pickPractice,
  puzzleForDate,
  utcToday,
} from '../game/daily';
import { allPuzzles, wordSet } from '../game/lexicon';
import { resultSentence, shareText } from '../game/share';
import { formatStats, recordWin } from '../game/stats';
import {
  DAILY_KEY,
  loadSession,
  loadStats,
  PRACTICE_KEY,
  saveSession,
  saveStats,
  THEME_KEY,
  type SavedSession,
} from '../game/storage';
import type { Mode, Puzzle, Status } from '../game/types';
import { checkMove, rejectionMessage } from '../game/validate';
import { renderBoard, type BoardModel, type BoardRow } from './board';
import { mountKeyboard, setKeyboardDisabled } from './keyboard';

type Session = {
  mode: Mode;
  date: string;
  puzzle: Puzzle;
  moves: string[];
  draft: string;
  status: Status;
  solution: string[] | null;
  message: string;
  tone: 'neutral' | 'error';
  notice: string;
  confirmGiveUp: boolean;
  invalid: boolean;
};

export function startGame(): void {
  const board = byId<HTMLElement>('board');
  const keyboard = byId<HTMLElement>('keyboard');
  const meta = byId<HTMLElement>('meta');
  const feedback = byId<HTMLElement>('feedback');
  const notice = byId<HTMLElement>('notice');
  const stats = byId<HTMLElement>('stats');
  const theme = byId<HTMLButtonElement>('theme');
  const modeDaily = byId<HTMLButtonElement>('mode-daily');
  const modePractice = byId<HTMLButtonElement>('mode-practice');
  const undoButton = byId<HTMLButtonElement>('undo');
  const hintButton = byId<HTMLButtonElement>('hint');
  const giveUpButton = byId<HTMLButtonElement>('give-up');
  const shareButton = byId<HTMLButtonElement>('share');
  const newButton = byId<HTMLButtonElement>('new-puzzle');

  const puzzles = allPuzzles();
  const today = utcToday();
  const sets = new Map<number, Set<string>>();
  const lexicon = (length: number): Set<string> => {
    let words = sets.get(length);
    if (!words) {
      words = wordSet(length);
      sets.set(length, words);
    }
    return words;
  };

  let mode: Mode = 'daily';
  const daily = openDaily();
  let practice = openPractice();

  mountKeyboard(keyboard, onKey);
  modeDaily.addEventListener('click', () => {
    mode = 'daily';
    render();
  });
  modePractice.addEventListener('click', () => {
    mode = 'practice';
    render();
  });
  undoButton.addEventListener('click', () => undo(current()));
  hintButton.addEventListener('click', () => hint(current()));
  giveUpButton.addEventListener('click', () => giveUp(current()));
  shareButton.addEventListener('click', () => {
    void share(current());
  });
  newButton.addEventListener('click', () => {
    practice = fresh(pickPractice(puzzles, practice.puzzle), 'practice', today);
    save(practice);
    render();
  });
  theme.addEventListener('click', () => {
    toggleTheme();
    renderTheme();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) renderTheme();
  });
  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return;
    if (event.key === 'Enter' || event.key === 'Backspace' || /^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      onKey(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    }
  });

  render();

  function current(): Session {
    return mode === 'daily' ? daily : practice;
  }

  function onKey(key: string): void {
    const session = current();
    if (session.status !== 'playing') return;
    session.notice = '';
    session.confirmGiveUp = false;
    if (key === 'Enter') {
      submit(session);
    } else if (key === 'Backspace') {
      session.draft = session.draft.slice(0, -1);
      clearError(session);
    } else if (/^[a-z]$/.test(key) && session.draft.length < session.puzzle.start.length) {
      session.draft += key;
      clearError(session);
    }
    render();
  }

  function submit(session: Session): void {
    const words = lexicon(session.puzzle.start.length);
    const result = checkMove(latest(session), session.draft, words);
    if (!result.ok) {
      session.message = rejectionMessage(result.reason);
      session.tone = 'error';
      session.invalid = true;
      return;
    }
    session.moves.push(result.word);
    session.draft = '';
    session.invalid = false;
    session.message = '';
    session.tone = 'neutral';
    if (result.word === session.puzzle.target) {
      win(session);
      return;
    }
    save(session);
  }

  function undo(session: Session): void {
    if (session.status !== 'playing') return;
    session.notice = '';
    session.confirmGiveUp = false;
    if (session.draft.length > 0) {
      session.draft = '';
      session.invalid = false;
    } else {
      session.moves.pop();
    }
    clearError(session);
    save(session);
    render();
  }

  function hint(session: Session): void {
    if (session.status !== 'playing') return;
    const words = lexicon(session.puzzle.start.length);
    const path = shortestPath(latest(session), session.puzzle.target, words);
    session.notice = '';
    session.confirmGiveUp = false;
    session.invalid = false;
    session.draft = '';
    if (!path || path.length < 2) {
      session.message = 'No ladder from here.';
      session.tone = 'error';
      render();
      return;
    }
    const next = path[1];
    if (!next) return;
    session.moves.push(next);
    if (next === session.puzzle.target) {
      win(session);
    } else {
      session.message = 'Next word on a shortest path.';
      session.tone = 'neutral';
      save(session);
    }
    render();
  }

  function giveUp(session: Session): void {
    if (session.status !== 'playing') return;
    if (!session.confirmGiveUp) {
      session.confirmGiveUp = true;
      session.message = 'Give up and show a shortest ladder?';
      session.tone = 'neutral';
      session.notice = '';
      render();
      return;
    }
    const words = lexicon(session.puzzle.start.length);
    session.status = 'gave-up';
    session.confirmGiveUp = false;
    session.draft = '';
    session.invalid = false;
    session.solution = shortestPath(session.puzzle.start, session.puzzle.target, words);
    session.message = `A shortest ladder is ${session.puzzle.par} steps.`;
    session.tone = 'neutral';
    save(session);
    render();
  }

  function win(session: Session): void {
    session.status = 'won';
    session.draft = '';
    session.invalid = false;
    session.confirmGiveUp = false;
    session.message = resultSentence(session.moves.length, session.puzzle.par);
    session.tone = 'neutral';
    saveStats(
      recordWin(loadStats(), {
        mode: session.mode,
        date: session.date,
        steps: session.moves.length,
        par: session.puzzle.par,
      }),
    );
    save(session);
  }

  async function share(session: Session): Promise<void> {
    if (session.status !== 'won') return;
    const text = shareText({
      mode: session.mode,
      date: session.date,
      steps: session.moves.length,
      par: session.puzzle.par,
    });
    const copied = await copyText(text);
    session.notice = copied ? 'Copied.' : text;
    render();
  }

  function render(): void {
    const session = current();
    modeDaily.setAttribute('aria-pressed', String(mode === 'daily'));
    modePractice.setAttribute('aria-pressed', String(mode === 'practice'));
    meta.textContent = metaLine(session);
    feedback.textContent = session.message;
    if (session.tone === 'error') feedback.dataset.tone = 'error';
    else delete feedback.dataset.tone;
    notice.textContent = session.notice;
    stats.textContent = formatStats(loadStats());
    const playing = session.status === 'playing';
    undoButton.disabled = !playing || (session.moves.length === 0 && session.draft.length === 0);
    hintButton.disabled = !playing;
    giveUpButton.disabled = !playing;
    giveUpButton.textContent = session.confirmGiveUp ? 'Show solution' : 'Give up';
    shareButton.hidden = session.status !== 'won';
    newButton.hidden = mode !== 'practice';
    setKeyboardDisabled(keyboard, !playing);
    renderTheme();
    renderBoard(board, modelFor(session));
  }

  function renderTheme(): void {
    const dark = appliedTheme() === 'dark';
    theme.textContent = dark ? 'Light' : 'Dark';
    theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function openDaily(): Session {
    const puzzle = puzzleForDate(puzzles, today);
    return restore(fresh(puzzle, 'daily', today), loadSession(DAILY_KEY), today);
  }

  function openPractice(): Session {
    const saved = loadSession(PRACTICE_KEY);
    const puzzle = saved
      ? puzzles.find((item) => item.start === saved.start && item.target === saved.target)
      : undefined;
    if (!saved || !puzzle) return fresh(pickPractice(puzzles), 'practice', today);
    return restore(fresh(puzzle, 'practice', today), saved, today);
  }

  function restore(session: Session, saved: SavedSession | null, date: string): Session {
    if (!saved) return session;
    if (saved.start !== session.puzzle.start || saved.target !== session.puzzle.target) {
      return session;
    }
    if (session.mode === 'daily' && saved.date !== date) return session;
    const words = lexicon(session.puzzle.start.length);
    if (!trailIsValid(session.puzzle.start, saved.moves, words)) return session;
    const reached = saved.moves[saved.moves.length - 1] === session.puzzle.target;
    if (saved.status === 'won' && !reached) return session;
    if (saved.status === 'playing' && reached) return session;
    session.moves = saved.moves;
    session.status = saved.status;
    if (saved.status === 'won') {
      session.message = resultSentence(saved.moves.length, session.puzzle.par);
    }
    if (saved.status === 'gave-up') {
      session.solution = shortestPath(session.puzzle.start, session.puzzle.target, words);
      session.message = `A shortest ladder is ${session.puzzle.par} steps.`;
    }
    return session;
  }
}

function fresh(puzzle: Puzzle, mode: Mode, date: string): Session {
  return {
    mode,
    date,
    puzzle,
    moves: [],
    draft: '',
    status: 'playing',
    solution: null,
    message: '',
    tone: 'neutral',
    notice: '',
    confirmGiveUp: false,
    invalid: false,
  };
}

function latest(session: Session): string {
  return session.moves[session.moves.length - 1] ?? session.puzzle.start;
}

function clearError(session: Session): void {
  session.invalid = false;
  if (session.tone === 'error') {
    session.message = '';
    session.tone = 'neutral';
  }
}

function trailIsValid(start: string, moves: string[], words: ReadonlySet<string>): boolean {
  let previous = start;
  for (const move of moves) {
    const result = checkMove(previous, move, words);
    if (!result.ok) return false;
    previous = result.word;
  }
  return true;
}

function metaLine(session: Session): string {
  const head = session.mode === 'daily' ? formatUtcDate(session.date) : 'Practice';
  const par = `Par ${session.puzzle.par}`;
  if (session.status === 'gave-up' || session.moves.length === 0) return `${head} · ${par}`;
  const steps = session.moves.length;
  const stepText = steps === 1 ? '1 step' : `${steps} steps`;
  return `${head} · ${par} · ${stepText}`;
}

function modelFor(session: Session): BoardModel {
  const length = session.puzzle.start.length;
  if (session.status === 'gave-up' && session.solution) {
    return {
      caption: 'Solution',
      rows: labeled(session.solution),
      draft: null,
      target: null,
      length,
    };
  }
  return {
    caption: session.status === 'playing' ? 'Start' : null,
    rows: labeled([session.puzzle.start, ...session.moves]),
    draft:
      session.status === 'playing'
        ? { value: session.draft, invalid: session.invalid }
        : null,
    target: session.status === 'playing' ? session.puzzle.target : null,
    length,
  };
}

function labeled(words: string[]): BoardRow[] {
  return words.map((word, index) => {
    const previous = index === 0 ? null : (words[index - 1] ?? null);
    return { word, previous, label: rowLabel(index, word, previous) };
  });
}

function rowLabel(index: number, word: string, previous: string | null): string {
  const name = index === 0 ? 'Start' : `Step ${index}`;
  if (!previous) return `${name}, ${word}`;
  const changes: string[] = [];
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] !== previous[i]) changes.push(`letter ${i + 1} changed to ${word[i]}`);
  }
  if (changes.length === 0) return `${name}, ${word}`;
  return `${name}, ${word}, ${changes.join(', ')}`;
}

function save(session: Session): void {
  saveSession(session.mode === 'daily' ? DAILY_KEY : PRACTICE_KEY, {
    date: session.date,
    start: session.puzzle.start,
    target: session.puzzle.target,
    moves: session.moves,
    status: session.status,
  });
}

function toggleTheme(): void {
  const next = appliedTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // The choice still applies for this visit.
  }
}

function appliedTheme(): 'light' | 'dark' {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-999px';
    document.body.append(area);
    area.select();
    let ok: boolean;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
