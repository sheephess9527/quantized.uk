import { quantFormats, type QuantFormat } from '@/lib/data/formats';
import { models } from '@/lib/data/models';
import { modelsWithFormat } from '@/lib/utils/format-compare';

/**
 * Per-format inventory for the `/formats/` hub.
 *
 * Everything except the editorial prose already in `formats.ts` is counted from
 * the model index. That matters for one row in particular: `formats.ts`
 * documents HQQ, which **no model here ships**, and the honest thing is to
 * print `0 of 81` rather than to leave the format off the table or — worse —
 * to advertise it as available. The site made exactly that mistake once
 * already, badging HQQ on the homepage while the Hub had no HQQ results.
 *
 * The quality column is a median over the models that ship the format *and*
 * have a published perplexity figure; formats where nobody published one show
 * nothing instead of an estimate.
 */
export interface FormatOverviewRow {
  format: QuantFormat;
  modelCount: number;
  totalModels: number;
  /** Median published perplexity loss across this format's 4-bit-class levels. */
  medianLoss: number | null;
  lossSample: number;
  /** Levels this index actually carries for the format, most common first. */
  levels: string[];
}

export function formatOverview(): FormatOverviewRow[] {
  const total = models.length;

  return quantFormats.map(format => {
    const owning = modelsWithFormat(format.name);
    const quants = models.flatMap(m => m.quants).filter(q => q.format === format.name);

    const losses = quants
      .filter(q => q.pplLossPercent !== undefined && q.bpw <= 5)
      .map(q => q.pplLossPercent as number)
      .sort((a, b) => a - b);

    const levelCounts = new Map<string, number>();
    for (const q of quants) levelCounts.set(q.level, (levelCounts.get(q.level) ?? 0) + 1);

    return {
      format,
      modelCount: owning.length,
      totalModels: total,
      medianLoss: losses.length ? losses[Math.floor(losses.length / 2)] : null,
      lossSample: losses.length,
      levels: Array.from(levelCounts.entries()).sort((a, b) => b[1] - a[1]).map(([l]) => l),
    };
  }).sort((a, b) => b.modelCount - a.modelCount);
}
