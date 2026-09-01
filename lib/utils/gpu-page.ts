import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { matchesParamRange, type ParamRange } from '@/lib/utils/param-buckets';
import type { QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * URL slug for a GPU landing page.
 *
 * Derived from the display name rather than the internal id (`rtx4060ti16`),
 * because the query these pages answer is typed as words: "what can an
 * RTX 4060 Ti 16G run". Deliberately dot-free — `next/link` strips the trailing
 * slash from any path whose last segment contains a dot (see README, 2026-09-01).
 */
export function gpuSlug(gpu: GPU): string {
  return gpu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function gpuBySlug(slug: string): GPU | undefined {
  return gpuDatabase.find(g => gpuSlug(g) === slug);
}

/** Context length the landing pages size against — the calculator's own default. */
export const GPU_PAGE_CONTEXT = 4096;

export interface GpuFit {
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  headroomGB: number;
}

/**
 * The best-quality quant of each model that fits this card comfortably.
 *
 * One row per model, not per model×quant: a reader asking "what can this card
 * run" wants a list of models, and 79 models × 4 levels of the same question is
 * noise. "Comfortably" means a green verdict — the estimate uses at most 88% of
 * the card — so the list stays honest about the difference between fitting and
 * only just fitting.
 */
export function fitsOnGpu(gpu: GPU, contextLength = GPU_PAGE_CONTEXT): GpuFit[] {
  const out: GpuFit[] = [];

  for (const model of models) {
    let best: GpuFit | undefined;
    for (const quant of model.quants) {
      const { totalGB } = calcVRAM({
        paramsB: model.params,
        layers: model.arch.layers,
        kvHeads: model.arch.kvHeads,
        headDim: model.arch.headDim,
        bpw: quant.bpw,
        contextLength,
        batchSize: 1,
      });
      if (getVerdict(totalGB, gpu.vram) !== 'green') continue;
      // Lower perplexity loss wins; ties break toward the smaller footprint.
      if (!best || quant.pplLossPercent < best.quant.pplLossPercent) {
        best = { model, quant, totalGB, headroomGB: Math.round((gpu.vram - totalGB) * 10) / 10 };
      }
    }
    if (best) out.push(best);
  }

  return out.sort((a, b) => b.model.params - a.model.params);
}

export const GPU_PAGE_BUCKETS: ParamRange[] = ['70B+', '32B', '14B', '7B', '≤3B'];

export function groupFitsByBucket(fits: GpuFit[]) {
  return GPU_PAGE_BUCKETS
    .map(bucket => ({ bucket, fits: fits.filter(f => matchesParamRange(f.model.params, bucket)) }))
    .filter(group => group.fits.length > 0);
}

/**
 * The next card up that meaningfully changes what you can run — the cheapest
 * step that unlocks more models, not simply the next card in the list.
 */
export function nextStepUp(gpu: GPU, fitCount: number): { gpu: GPU; extraModels: number } | undefined {
  const candidates = gpuDatabase
    .filter(g => g.vram > gpu.vram && g.type === gpu.type)
    .sort((a, b) => a.vram - b.vram);

  for (const candidate of candidates) {
    const extra = fitsOnGpu(candidate).length - fitCount;
    if (extra > 0) return { gpu: candidate, extraModels: extra };
  }
  return undefined;
}
