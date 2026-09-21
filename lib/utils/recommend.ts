import { models, QuantModel, QuantVariant } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { qualityRank } from '@/lib/utils/quality';
import { usableCapacityGB, formatAllowed } from '@/lib/utils/gpu-page';

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
): Recommendation[] {
  const results: Recommendation[] = [];
  const capacity = usableCapacityGB(gpu);

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
      });
      const verdict = getVerdict(totalGB, capacity);
      if (verdict === 'red') continue;
      if (verdict === 'yellow' && !includeYellow) continue;
      results.push({ model, quant, totalGB, verdict });
    }
  }

  return results.sort((a, b) => {
    if (sortBy === 'quality') return qualityRank(a.quant) - qualityRank(b.quant);
    if (sortBy === 'speed') return (b.quant.speedRTX4090 ?? 0) - (a.quant.speedRTX4090 ?? 0);
    return a.totalGB - b.totalGB;
  });
}

export function quantLevelKey(quant: QuantVariant): string {
  return quant.format === 'GGUF' ? quant.level : `${quant.format} ${quant.level}`;
}