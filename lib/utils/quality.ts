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

/** `2.9%` when published, `—` when it is not. Never a guess. */
export function formatLoss(quant: QuantVariant, unknown = '—'): string {
  return quant.pplLossPercent === undefined ? unknown : `${quant.pplLossPercent.toFixed(1)}%`;
}
