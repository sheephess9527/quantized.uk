import type { QuantModel, QuantVariant } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict, type CalcInput } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { usableCapacityGB, formatAllowed, tightCeiling } from '@/lib/utils/gpu-page';
import { qualityRank } from '@/lib/utils/quality';
import { rooflineTokS } from '@/lib/utils/roofline';

/**
 * The calculator's second-order answers — the questions a reader asks once
 * they have one number: which file should I download, how far can I push the
 * context, how fast can it possibly go. Each is computed from the same
 * `calcVRAM` / `getVerdict` / `usableCapacityGB` the rest of the site uses, so
 * none of them can disagree with a GPU page or the reverse mode.
 */

export type Verdict = 'green' | 'yellow' | 'red';

export interface LevelRow {
  quant: QuantVariant;
  key: string;
  totalGB: number;
  /** Undefined when no card is chosen. */
  verdict?: Verdict;
  /** False when the card's backend cannot load this format at any size. */
  formatOk: boolean;
  /** Highest-quality level that fits the card comfortably — the one to fetch. */
  pick: boolean;
}

type Shape = Omit<CalcInput, 'bpw' | 'contextLength'>;

export function modelShape(model: QuantModel, batchSize: number, kvBytesPerValue?: number): Shape {
  return {
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    batchSize,
    kvBytesPerValue,
  };
}

/** Every level the model ships, sized at the reader's settings, smallest first. */
export function levelTable(
  model: QuantModel,
  gpu: GPU | undefined,
  contextLength: number,
  batchSize: number,
  kvBytesPerValue?: number,
): LevelRow[] {
  const shape = modelShape(model, batchSize, kvBytesPerValue);
  const rows: LevelRow[] = model.quants.map(quant => {
    const { totalGB } = calcVRAM({ ...shape, bpw: quant.bpw, contextLength });
    const formatOk = !gpu || formatAllowed(gpu, quant.format);
    const verdict = gpu
      ? formatOk ? getVerdict(totalGB, usableCapacityGB(gpu), tightCeiling(gpu)) : 'red'
      : undefined;
    return { quant, key: quantLevelKey(quant), totalGB, verdict, formatOk, pick: false };
  });
  if (gpu) {
    const best = rows
      .filter(r => r.verdict === 'green')
      .sort((a, b) => qualityRank(a.quant) - qualityRank(b.quant) || a.totalGB - b.totalGB)[0];
    if (best) best.pick = true;
  }
  return rows.sort((a, b) => a.totalGB - b.totalGB);
}

export interface ContextReach {
  /** Longest context (tokens, multiple of 1024) that stays green; 0 if none. */
  comfortable: number;
  /** Longest that is at most tight; 0 if none. */
  tight: number;
  /** The model's own window — the search never goes past it. */
  limit: number;
}

const STEP = 1024;

/**
 * Longest context that fits, by binary search over `calcVRAM` itself rather
 * than an inverted formula: the cache is piecewise linear in context once
 * sliding-window layers saturate, and inverting that by hand is exactly the
 * kind of second implementation that drifts from the first.
 */
export function contextReach(
  shape: Shape,
  bpw: number,
  gpu: GPU,
  limit: number,
): ContextReach {
  const capacity = usableCapacityGB(gpu);
  const ceiling = tightCeiling(gpu);
  const verdictAt = (ctx: number) => getVerdict(calcVRAM({ ...shape, bpw, contextLength: ctx }).totalGB, capacity, ceiling);
  const longest = (ok: (v: Verdict) => boolean) => {
    const maxSteps = Math.floor(limit / STEP);
    if (maxSteps < 1 || !ok(verdictAt(STEP))) return 0;
    if (ok(verdictAt(limit))) return limit;
    let lo = 1, hi = maxSteps; // ok(lo) holds; find the largest step that does
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (ok(verdictAt(mid * STEP))) lo = mid; else hi = mid - 1;
    }
    return lo * STEP;
  };
  return {
    comfortable: longest(v => v === 'green'),
    tight: longest(v => v !== 'red'),
    limit,
  };
}

/**
 * Token-generation upper bound on this card: bandwidth over weight bytes.
 * Undefined for MoE (only active experts are read — a dense ceiling would
 * understate it), for cards without a verified bandwidth, and whenever the
 * model does not fit, because then part of it runs from system RAM and the
 * card's bandwidth stops being the limit.
 */
export function speedCeiling(gpu: GPU, model: QuantModel, quant: QuantVariant, verdict: Verdict): number | undefined {
  if (verdict === 'red' || !formatAllowed(gpu, quant.format)) return undefined;
  return rooflineTokS(gpu, model, quant);
}
