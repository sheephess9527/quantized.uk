import { models, QuantModel, QuantVariant } from '@/lib/data/models';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';

export type SortBy = 'quality' | 'speed' | 'vram';

export interface Recommendation {
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  verdict: 'green' | 'yellow' | 'red';
}

export function getRecommendations(
  gpuVram: number,
  contextLen: number,
  batchSize: number,
  sortBy: SortBy = 'quality',
  includeYellow = true,
): Recommendation[] {
  const results: Recommendation[] = [];

  for (const model of models) {
    for (const quant of model.quants) {
      const { totalGB } = calcVRAM({
        paramsB: model.params,
        layers: model.arch.layers,
        kvHeads: model.arch.kvHeads,
        headDim: model.arch.headDim,
        bpw: quant.bpw,
        contextLength: contextLen,
        batchSize,
      });
      const verdict = getVerdict(totalGB, gpuVram);
      if (verdict === 'red') continue;
      if (verdict === 'yellow' && !includeYellow) continue;
      results.push({ model, quant, totalGB, verdict });
    }
  }

  return results.sort((a, b) => {
    if (sortBy === 'quality') return a.quant.pplLossPercent - b.quant.pplLossPercent;
    if (sortBy === 'speed') return (b.quant.speedRTX4090 ?? 0) - (a.quant.speedRTX4090 ?? 0);
    return a.totalGB - b.totalGB;
  });
}

export function quantLevelKey(quant: QuantVariant): string {
  return quant.format === 'GGUF' ? quant.level : `${quant.format} ${quant.level}`;
}