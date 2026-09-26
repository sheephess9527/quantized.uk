import type { QuantVariant } from '@/lib/data/types';

/**
 * Ranking key for "which quant of this model is the best quality". Lower wins.
 *
 * A published perplexity loss is the real signal and is used directly. But
 * `pplLossPercent` is not available for every model: the 2026 releases mostly
 * ship weights and GGUF conversions without anyone publishing a per-level
 * perplexity sweep, and inventing one to fill the column would put a fabricated
 * number into the ranking that drives the hub cards, the homepage picks and the
 * GPU pages.
 *
 * So it became optional, and an unknown loss falls back to bits-per-weight —
 * within one model, more bits is more faithful, which is the only ordering the
 * data actually supports. The `LOSS_CEILING` offset keeps every unknown behind
 * every known figure, so a real measurement never loses a tie to a fallback.
 */
const LOSS_CEILING = 1000;

export function qualityRank(quant: QuantVariant): number {
  return quant.pplLossPercent ?? LOSS_CEILING - quant.bpw;
}

/** The best-quality quant of a model, by the rule above. */
export function bestQuant(quants: QuantVariant[]): QuantVariant {
  return quants.reduce((best, q) => (qualityRank(q) < qualityRank(best) ? q : best), quants[0]);
}

/**
 * Levels a vendor released the weights in. For these models the published
 * checkpoint *is* the quantized one, so it — not a community requant — is what
 * a page should size and describe.
 */
const NATIVE_LEVELS = new Set(['MXFP4']);

export function isNativeQuant(q: QuantVariant): boolean {
  return NATIVE_LEVELS.has(q.level);
}

/**
 * The one level a model page sizes against: the native release when there is
 * one, else GGUF Q4_K_M (every indexed model ships it), else the best level.
 */
export function referenceQuant(quants: QuantVariant[]): QuantVariant {
  return (
    quants.find(isNativeQuant) ??
    quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M') ??
    bestQuant(quants)
  );
}

/** `2.9%` when published, `—` when it is not. Never a guess. */
export function formatLoss(quant: QuantVariant, unknown = '—'): string {
  return quant.pplLossPercent === undefined ? unknown : `${quant.pplLossPercent.toFixed(1)}%`;
}
