import { models, QuantModel, QuantVariant } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { qualityRank } from '@/lib/utils/quality';
import { capacityGB, formatAllowed, tightCeiling } from '@/lib/utils/gpu-page';
import { rooflineTokS, moeRooflineTokS } from '@/lib/utils/roofline';
import { measuredSpeed } from '@/lib/utils/measured-speed';
import { matchingSpeedRun } from '@/lib/utils/measured-runs';
import { hasImageInput, hasToolCalling } from '@/lib/utils/model-facts';

export type SortBy = 'quality' | 'speed' | 'vram';
export type RecommendationInput = 'text' | 'image';
export interface RecommendationFilters {
  minTok?: number;
  tools?: boolean;
  code?: boolean;
}

export function recommendationSpeed(gpu: GPU, model: QuantModel, quant: QuantVariant, cards = 1): { tokS: number; source: 'measured' | 'estimated' } | undefined {
  if (cards > 1) return undefined;
  const run = matchingSpeedRun(gpu, model, quant);
  if (run) return { tokS: run.speedTokSec, source: 'measured' };
  const estimate = measuredSpeed(gpu, model, quant);
  return estimate ? { tokS: estimate.tokS, source: 'estimated' } : undefined;
}

export interface Recommendation {
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  verdict: 'green' | 'yellow' | 'red';
  /** Recorded vision encoder in GiB, included in totalGB in image mode. */
  extraGB?: number;
}

/**
 * `gpu` used to be a bare vram number, which is how the calculator's reverse
 * mode ended up recommending AWQ/EXL2 on Mac and CPU profiles (nothing here
 * knew the target had no CUDA) and sizing a Mac against its full nameplate
 * figure (nothing here knew macOS keeps part of it) — the same two faults
 * `fitsOnGpu` had, in the interactive tool that shares none of its code.
 */
export function getRecommendations(
  gpu: GPU,
  contextLen: number,
  batchSize: number,
  sortBy: SortBy = 'quality',
  includeYellow = true,
  kvBytesPerValue?: number,
  cards = 1,
  /**
   * One row per model: its best-quality level that fits, a green fit preferred
   * over a tight one. Answers "what can I run" instead of listing every level
   * (Grok Bot, 2026-10-14).
   */
  bestPerModel = false,
  input: RecommendationInput = 'text',
  filters: RecommendationFilters = {},
): Recommendation[] {
  if (!Number.isFinite(contextLen) || contextLen <= 0 || !Number.isFinite(batchSize) || batchSize <= 0) return [];
  const results: Recommendation[] = [];
  const capacity = capacityGB(gpu, cards);

  for (const model of models) {
    if (filters.tools && !hasToolCalling(model.id)) continue;
    if (filters.code && !model.categories.includes('code')) continue;
    // Memory capacity cannot extend the model's supported attention window.
    if (contextLen > model.contextLength) continue;
    if (input === 'image' && !hasImageInput(model.id)) continue;
    for (const quant of model.quants) {
      if (cards === 1 && Number.isFinite(filters.minTok) && filters.minTok! > 0) {
        const speed = recommendationSpeed(gpu, model, quant, cards);
        if (speed === undefined || speed.tokS < filters.minTok!) continue;
      }
      if (!formatAllowed(gpu, quant.format)) continue;
      const bytes = quant.source?.mmprojBytes;
      // Image mode only makes a fit claim when its separate encoder is known.
      // Missing bytes do not mean a zero-size encoder; non-GGUF layouts need
      // their own accounting before they can join this list.
      if (input === 'image' && (quant.format !== 'GGUF' || !bytes || !Number.isFinite(bytes) || bytes <= 0)) continue;
      const extraGB = input === 'image' ? bytes! / 1024 ** 3 : undefined;
      const { totalGB } = calcVRAM({
        paramsB: model.params,
        layers: model.arch.layers,
        kvHeads: model.arch.kvHeads,
        headDim: model.arch.headDim,
        attention: model.arch.attention,
        bpw: quant.bpw,
        contextLength: contextLen,
        batchSize,
        kvBytesPerValue,
        extraGB,
      });
      const verdict = getVerdict(totalGB, capacity, tightCeiling(gpu));
      if (verdict === 'red') continue;
      if (verdict === 'yellow' && !includeYellow) continue;
      results.push({ model, quant, totalGB, verdict, ...(extraGB !== undefined ? { extraGB } : {}) });
    }
  }

  let rows = results;
  if (bestPerModel) {
    const best = new Map<string, Recommendation>();
    for (const r of results) {
      const cur = best.get(r.model.id);
      const better = !cur
        || (r.verdict === 'green' && cur.verdict !== 'green')
        || (r.verdict === cur.verdict && qualityRank(r.quant) < qualityRank(cur.quant));
      if (better) best.set(r.model.id, r);
    }
    rows = Array.from(best.values());
  }

  // Speed sort used the RTX 4090 figure whatever card was picked. It ranks by
  // the picked card's bandwidth ceiling instead — over every row, dense and MoE
  // (the active-parameter bound) alike. On one card the calibrated estimate is
  // a constant × the dense ceiling, so the order among dense rows is the same;
  // ranking by the estimate alone left every row without one (MoE, models
  // outside its range) below the slowest row that had one. A card with no
  // stated bandwidth falls back to the RTX 4090 figure.
  const speedOf = (r: Recommendation) => rooflineTokS(gpu, r.model, r.quant) ?? moeRooflineTokS(gpu, r.model, r.quant);
  return rows.sort((a, b) => {
    if (sortBy === 'quality') {
      // In the one-per-model view the bigger model is the stronger answer.
      if (bestPerModel && a.model.params !== b.model.params) return b.model.params - a.model.params;
      return qualityRank(a.quant) - qualityRank(b.quant);
    }
    if (sortBy === 'speed') {
      const sa = speedOf(a), sb = speedOf(b);
      if (sa !== undefined && sb !== undefined && sa !== sb) return sb - sa;
      return (b.quant.speedRTX4090 ?? 0) - (a.quant.speedRTX4090 ?? 0);
    }
    return a.totalGB - b.totalGB;
  });
}

export function quantLevelKey(quant: QuantVariant): string {
  return quant.format === 'GGUF' ? quant.level : `${quant.format} ${quant.level}`;
}
