export function shareText(input: {
  mode: 'daily' | 'practice';
  date: string;
  steps: number;
  par: number;
}): string {
  const unit = input.steps === 1 ? 'step' : 'steps';
  const head =
    input.mode === 'daily' ? `word-ladder ${input.date}` : 'word-ladder practice';
  return `${head}: ${input.steps} ${unit} (par ${input.par})`;
}

export function resultSentence(steps: number, par: number): string {
  const unit = steps === 1 ? 'step' : 'steps';
  const over = steps - par;
  if (over <= 0) return `Solved in ${steps} ${unit}, on par.`;
  if (over === 1) return `Solved in ${steps} ${unit}, one over par.`;
  return `Solved in ${steps} ${unit}, ${over} over par.`;
}
