import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { matrixData } from '@/lib/data/benchmarks';
import { measuredRowsFor } from '@/lib/utils/measured-runs';
import { gpuSlug } from '@/lib/utils/gpu-page';

export interface MeasuredCard {
  gpu: GPU;
  runs: number;
}

/**
 * QTZ-031: the page never stated its own coverage, so a reader had no way to
 * tell "measured" from "the same estimate everything else on the site uses."
 * Derived from `measuredRowsFor` (already the single source `/gpu/{card}/`
 * pages use to say "no benchmark runs recorded on this card") rather than a
 * second hardcoded list — the two counts cannot drift apart.
 */
export function measuredCards(): MeasuredCard[] {
  return gpuDatabase
    .map(gpu => ({ gpu, runs: measuredRowsFor(gpu).length }))
    .filter(c => c.runs > 0)
    .sort((a, b) => b.runs - a.runs);
}

export function measuredCardHref(gpu: GPU): string {
  return `/gpu/${gpuSlug(gpu)}/`;
}

export const TOTAL_RUNS = matrixData.length;
