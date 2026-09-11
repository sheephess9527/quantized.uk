import { models } from '@/lib/data/models';
import { qualityRank } from '@/lib/utils/quality';
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

const ALL_PAIRS: FormatPair[] = COMPARABLE.flatMap((a, i) =>
  COMPARABLE.slice(i + 1).map(b => ({
    slug: `${a.id}-vs-${b.id}`,
    a,
    b,
  })),
);

/** Models shipping both of a pair's formats — the pair's only real content. */
function overlapCount(pair: FormatPair): number {
  return models.filter(
    m => m.quants.some(q => q.format === pair.a.name) && m.quants.some(q => q.format === pair.b.name),
  ).length;
}

/**
 * A pair with **no** model in common is not a comparison.
 *
 * `awq-vs-gptq` and `exl2-vs-gptq` each had an intersection of exactly zero:
 * not one model in the index ships both formats, so the page could not put a
 * single row of the same weights side by side. What it could do was restate the
 * two formats' editorial descriptions next to each other, which is what it did,
 * at ~650 words with one inbound link each.
 *
 * The reader's question is real — "AWQ or GPTQ?" gets typed — but the honest
 * answer is that nobody ever faces that choice for one model. So the pair stops
 * being a page and becomes a redirect into the page that *can* answer it, and
 * that page carries a section addressing the merged question directly.
 *
 * Derived, not listed: this is a property of the data, so if a model ever ships
 * both AWQ and GPTQ the pair becomes a page again with no code change.
 */
export const formatPairs: FormatPair[] = ALL_PAIRS.filter(p => overlapCount(p) > 0);

export interface MergedPair {
  pair: FormatPair;
  /** The surviving page this pair's URL should point at. */
  target: FormatPair;
}

/**
 * Where a pair with nothing to compare sends its readers.
 *
 * The target is the best-supported surviving page about the pair's **rarer**
 * format — GPTQ ships on 4 of 81 models and is the reason both merged pairs are
 * empty, so `gguf-vs-gptq` (4 models in common) is where both go. Chosen by
 * overlap rather than named, so it follows the data too.
 */
export const mergedPairs: MergedPair[] = ALL_PAIRS
  .filter(p => overlapCount(p) === 0)
  .flatMap(p => {
    const rarer =
      modelsWithFormat(p.a.name).length <= modelsWithFormat(p.b.name).length ? p.a : p.b;
    const target = formatPairs
      .filter(q => q.a.id === rarer.id || q.b.id === rarer.id)
      .sort((x, y) => overlapCount(y) - overlapCount(x))[0];
    return target ? [{ pair: p, target }] : [];
  });

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
        .sort((x, y) => qualityRank(x) - qualityRank(y))[0];
    const a = pick(pair.a.name);
    const b = pick(pair.b.name);
    if (a && b) out.push({ model, a, b });
  }
  return out.sort((x, y) => y.model.params - x.model.params);
}
