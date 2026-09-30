/**
 * One way to write a context length, used everywhere it is shown.
 *
 * Three call sites had their own version — `${n / 1024}K` in the calculator's
 * value readout, the same in its preset chips, `Math.round(n / 1024)K` in the
 * compare table — which agree on the round numbers and diverge the moment a
 * shared link carries something else: 6000 tokens rendered "5.859375K" in one
 * place and "6K" in another.
 *
 * The short form is what a reader scans; it is not exact, so anywhere it is
 * the primary label the exact token count goes alongside it (`exactLabel`),
 * which is also what the accessible name should say.
 */
export function contextLabel(tokens: number): string {
  if (tokens < 1024) return String(tokens);
  // 1,048,576 read "1024K" and Llama 4 Scout's window "10240K".
  const m = tokens / (1024 * 1024);
  if (m >= 1 && Number.isInteger(m * 10)) return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  const k = tokens / 1024;
  return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
}

/** `4K (4,096 tokens)` — for tooltips, accessible names and captions. */
export function exactLabel(tokens: number, unit = 'tokens'): string {
  return `${contextLabel(tokens)} (${tokens.toLocaleString('en-US')} ${unit})`;
}
