import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { matchesParamRange, type ParamRange } from '@/lib/utils/param-buckets';
import { qualityRank } from '@/lib/utils/quality';
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

/**
 * The two questions a "how many models fit" number can answer. They give
 * different counts (51 vs 60 on a 4060 Ti 16G) and both are defensible — what
 * is not defensible is showing one number on one page and the other elsewhere
 * without either saying which rule it used.
 *
 * `comfortable` = the calculator's green verdict, at most 88% of the card.
 * `tight`       = green or amber, up to 105% — loads on a good day, no headroom.
 */
export type FitLevel = 'comfortable' | 'tight';

export function countModelsFitting(gpu: GPU, level: FitLevel, contextLength = GPU_PAGE_CONTEXT): number {
  const allowed = level === 'comfortable' ? ['green'] : ['green', 'yellow'];
  let n = 0;
  for (const model of models) {
    const fits = model.quants.some(quant => {
      const { totalGB } = calcVRAM({
        paramsB: model.params,
        layers: model.arch.layers,
        kvHeads: model.arch.kvHeads,
        headDim: model.arch.headDim,
        attention: model.arch.attention,
        bpw: quant.bpw,
        contextLength,
        batchSize: 1,
      });
      return allowed.includes(getVerdict(totalGB, gpu.vram));
    });
    if (fits) n += 1;
  }
  return n;
}

/**
 * Cards this one shares its answer with.
 *
 * The fit list is a function of VRAM and nothing else, so every 12 GB card in
 * the database returns byte-identical results: measured across the 43 exported
 * pages, `rtx-4070`, `rtx-4070-super` and `rtx-4070-ti` were **97% identical**
 * by 5-gram overlap, and the mean across all pairs was 0.49. That is the
 * definition of mass-generated thin content — pages that differ only in a name.
 *
 * The honest fix is not to hide the overlap but to state it: these pages give
 * the same list *because the memory budget is the same*, and what actually
 * separates the cards — throughput — is not something this index measures per
 * card. Naming the siblings turns a duplicate into a useful sentence and gives
 * each page an internal link its neighbours do not have.
 *
 * Same `type` as well as same `vram`: a 16 GB Radeon and a 16 GB GeForce hold
 * the same models but do not share a runtime story, so they are not siblings.
 */
export function sameBudgetCards(gpu: GPU): GPU[] {
  return gpuDatabase.filter(g => g.id !== gpu.id && g.vram === gpu.vram && g.type === gpu.type);
}

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
        attention: model.arch.attention,
        bpw: quant.bpw,
        contextLength,
        batchSize: 1,
      });
      if (getVerdict(totalGB, gpu.vram) !== 'green') continue;
      // Lower perplexity loss wins; ties break toward the smaller footprint.
      if (!best || qualityRank(quant) < qualityRank(best.quant)) {
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
