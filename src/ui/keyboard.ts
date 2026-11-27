const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function mountKeyboard(root: HTMLElement, onKey: (key: string) => void): void {
  root.replaceChildren();
  ROWS.forEach((letters, index) => {
    const row = document.createElement('div');
    row.className = 'keyboard-row';
    if (index === 2) row.append(keyButton('Enter', onKey));
    for (const letter of letters) row.append(keyButton(letter, onKey));
    if (index === 2) row.append(keyButton('Backspace', onKey));
    root.append(row);
  });
}

export function setKeyboardDisabled(root: HTMLElement, disabled: boolean): void {
  root.dataset.disabled = disabled ? 'true' : 'false';
  for (const button of root.querySelectorAll('button')) button.disabled = disabled;
}

function keyButton(key: string, onKey: (key: string) => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = key.length === 1 ? 'key' : 'key wide';
  button.dataset.key = key;
  button.textContent = face(key);
  if (key === 'Backspace') button.setAttribute('aria-label', 'Delete');
  button.addEventListener('click', () => onKey(key));
  return button;
}

function face(key: string): string {
  if (key === 'Backspace') return 'Del';
  if (key === 'Enter') return 'Enter';
  return key.toUpperCase();
}
