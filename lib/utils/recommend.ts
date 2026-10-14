import { models, QuantModel, QuantVariant } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { qualityRank } from '@/lib/utils/quality';
import { capacityGB, formatAllowed, tightCeiling } from '@/lib/utils/gpu-page';
import { rooflineTokS, moeRooflineTokS } from '@/lib/utils/roofline';

export type SortBy = 'quality' | 'speed' | 'vram';

export interface Recommendation {
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  verdict: 'green' | 'yellow' | 'red';
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
): Recommendation[] {
  const results: Recommendation[] = [];
  const capacity = capacityGB(gpu, cards);

  for (const model of models) {
    for (const quant of model.quants) {
      if (!formatAllowed(gpu, quant.format)) continue;
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
      });
      const verdict = getVerdict(totalGB, capacity, tightCeiling(gpu));
      if (verdict === 'red') continue;
      if (verdict === 'yellow' && !includeYellow) continue;
      results.push({ model, quant, totalGB, verdict });
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