import { models } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { GPU_PAGE_BUCKETS } from '@/lib/utils/gpu-page';
import { matchesParamRange, type ParamRange } from '@/lib/utils/param-buckets';
import { isSuperseded } from '@/lib/utils/model-meta';
import { referenceQuant } from '@/lib/utils/quality';
import { sizeAt, cardsFitting, REF_CONTEXT } from '@/lib/utils/model-explainer';

export const LONG_REF_CONTEXT = 32768;

export interface SizeClassRow {
  bucket: ParamRange;
  count: number;
  at4k: [number, number];
  /** Only models whose native window reaches 32K; undefined if none do. */
  at32k?: [number, number];
  /** Smallest card that holds every model in the class comfortably at 4K. */
  wholeClass?: GPU;
}

/**
 * The calculator's answers for every size class, at each model's reference
 * quant — computed here so they reach the static HTML. Without JavaScript the
 * calculator is an inert dropdown; this table is the same arithmetic, readable.
 */
export function sizeClassReference(): SizeClassRow[] {
  return [...GPU_PAGE_BUCKETS].reverse().map((bucket): SizeClassRow => {
    const sized = models
      .filter(m => !isSuperseded(m) && matchesParamRange(m.params, bucket))
      .map(m => {
        const q = referenceQuant(m.quants);
        return {
          format: q.format,
          s4: sizeAt(m, q.bpw, REF_CONTEXT).totalGB,
          // A model whose own window is shorter than 32K has no 32K figure —
          // Gemma 2 "needed" 15.6 GB at a context it cannot hold.
          s32: m.contextLength >= LONG_REF_CONTEXT ? sizeAt(m, q.bpw, LONG_REF_CONTEXT).totalGB : undefined,
        };
      });
    const s4 = sized.map(x => x.s4);
    const s32 = sized.map(x => x.s32).filter((x): x is number => x !== undefined);
    const largest = sized.reduce((a, b) => (b.s4 > a.s4 ? b : a), sized[0]);
    return {
      bucket,
      count: sized.length,
      at4k: [Math.min(...s4), Math.max(...s4)],
      at32k: s32.length ? [Math.min(...s32), Math.max(...s32)] : undefined,
      wholeClass: largest ? cardsFitting(largest.s4, largest.format)[0] : undefined,
    };
  }).filter(r => r.count > 0);
}
