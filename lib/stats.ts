import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';

export function getSiteStats() {
  const modelCount = models.length;
  // Sits next to "models indexed" and "GPUs in database", so it has to be an
  // inventory count: formats you can actually find a model in. formats.ts
  // documents HQQ too, but no indexed model ships it — counting it here
  // advertised a format the Hub has no filter for.
  const formatCount = SHIPPED_FORMATS.length;
  const gpuCount = gpuDatabase.length;

  // Quality retention, stated against ONE named level.
  //
  // This used to average `100 - min(pplLoss)` across models, which silently
  // mixed incomparable rows: the minimum happened to be Q4_K_M for 31 models,
  // Q8_0 for 18, Q5_K_M for 13, EXL2 for 6. The result moved whenever a level
  // was *added* to the data, so it measured the shape of the index rather than
  // anything about quantization — and it sat on the homepage next to three
  // honest inventory counts.
  //
  // Q4_K_M instead: every one of the 79 models ships it, it is the level most
  // readers actually run, and a median is robust to the tail. `q4Range` is
  // exposed so the figure can be shown with its spread rather than alone.
  const q4Losses = models
    .flatMap(m => m.quants.filter(q => q.format === 'GGUF' && q.level === 'Q4_K_M'))
    .map(q => q.pplLossPercent)
    .sort((a, b) => a - b);
  const medianQ4Loss = q4Losses[Math.floor(q4Losses.length / 2)];

  return {
    modelCount,
    formatCount,
    gpuCount,
    q4Retention: `${(100 - medianQ4Loss).toFixed(1)}%`,
    q4SampleSize: q4Losses.length,
    q4Range: [q4Losses[0], q4Losses[q4Losses.length - 1]] as const,
  };
}