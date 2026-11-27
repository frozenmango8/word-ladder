export type BoardRow = {
  word: string;
  previous: string | null;
  label: string;
};

export type BoardModel = {
  caption: string | null;
  rows: BoardRow[];
  draft: { value: string; invalid: boolean } | null;
  target: string | null;
  length: number;
};

export function renderBoard(root: HTMLElement, model: BoardModel): void {
  const rail = document.createElement('div');
  rail.className = 'rail';

  if (model.caption) rail.append(label(model.caption));

  const list = document.createElement('ol');
  list.className = 'ladder';
  for (const row of model.rows) {
    const item = document.createElement('li');
    item.setAttribute('aria-label', row.label);
    const tiles = tileRow(row.word, row.previous);
    tiles.setAttribute('aria-hidden', 'true');
    item.append(tiles);
    list.append(item);
  }
  rail.append(list);

  if (model.draft) {
    const entry = document.createElement('div');
    const spoken = model.draft.value
      ? `Current entry, ${model.draft.value}`
      : 'Current entry, empty';
    entry.setAttribute('aria-label', spoken);
    const tiles = draftRow(model.draft.value, model.length, model.draft.invalid);
    tiles.setAttribute('aria-hidden', 'true');
    entry.append(tiles);
    rail.append(entry);
  }

  if (model.target) {
    const block = document.createElement('div');
    block.className = 'target-block';
    block.setAttribute('aria-label', `Target, ${model.target}`);
    const heading = label('Target');
    heading.setAttribute('aria-hidden', 'true');
    const tiles = tileRow(model.target, null);
    tiles.classList.add('target');
    tiles.setAttribute('aria-hidden', 'true');
    block.append(heading, tiles);
    rail.append(block);
  }

  root.replaceChildren(rail);
}

function label(text: string): HTMLParagraphElement {
  const node = document.createElement('p');
  node.className = 'rung-label';
  node.textContent = text;
  return node;
}

function tileRow(word: string, previous: string | null): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'row';
  row.style.setProperty('--n', String(word.length));
  for (let i = 0; i < word.length; i += 1) {
    const tile = document.createElement('span');
    tile.className = 'tile';
    tile.textContent = word[i].toUpperCase();
    if (previous && word[i] !== previous[i]) tile.classList.add('changed');
    row.append(tile);
  }
  return row;
}

function draftRow(draft: string, length: number, invalid: boolean): HTMLDivElement {
  const row = document.createElement('div');
  row.className = invalid ? 'row draft invalid' : 'row draft';
  row.style.setProperty('--n', String(length));
  for (let i = 0; i < length; i += 1) {
    const tile = document.createElement('span');
    tile.className = 'tile';
    if (i < draft.length) tile.textContent = draft[i].toUpperCase();
    if (i === draft.length) tile.classList.add('caret');
    row.append(tile);
  }
  return row;
}
