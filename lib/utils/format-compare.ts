import { models } from '@/lib/data/models';
import { quantFormats, type QuantFormat } from '@/lib/data/formats';
import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';
import type { QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * "X vs Y" pages, built only from formats the index actually ships.
 *
 * HQQ is documented in `formats.ts` as reference material but no model uses it;
 * generating `gguf-vs-hqq` would produce a comparison page whose whole
 * right-hand column is empty — the same mistake as the Hub chip that matched
 * zero models.
 *
 * Ordered by adoption estimate so the better-known format leads, which is also
 * the way the query tends to be typed ("gguf vs awq", rarely the reverse).
 */
const COMPARABLE: QuantFormat[] = quantFormats
  .filter(f => SHIPPED_FORMATS.includes(f.name))
  .sort((a, b) => b.heatPercent - a.heatPercent);

export interface FormatPair {
  slug: string;
  a: QuantFormat;
  b: QuantFormat;
}

export const formatPairs: FormatPair[] = COMPARABLE.flatMap((a, i) =>
  COMPARABLE.slice(i + 1).map(b => ({
    slug: `${a.id}-vs-${b.id}`,
    a,
    b,
  })),
);

export function pairBySlug(slug: string): FormatPair | undefined {
  return formatPairs.find(p => p.slug === slug);
}

export function modelsWithFormat(formatName: string): QuantModel[] {
  return models.filter(m => m.quants.some(q => q.format === formatName));
}

export interface HeadToHead {
  model: QuantModel;
  a: QuantVariant;
  b: QuantVariant;
}

/**
 * Models that ship *both* formats — the only place the comparison stops being
 * editorial and becomes measurable, because the two rows describe the same
 * weights. Best (lowest perplexity loss) variant of each format per model.
 */
export function headToHead(pair: FormatPair): HeadToHead[] {
  const out: HeadToHead[] = [];
  for (const model of models) {
    const pick = (name: string) =>
      model.quants
        .filter(q => q.format === name)
        .sort((x, y) => x.pplLossPercent - y.pplLossPercent)[0];
    const a = pick(pair.a.name);
    const b = pick(pair.b.name);
    if (a && b) out.push({ model, a, b });
  }
  return out.sort((x, y) => y.model.params - x.model.params);
}
