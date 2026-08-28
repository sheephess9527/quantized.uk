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

  const accuracies = models.map(m => {
    const minLoss = Math.min(...m.quants.map(q => q.pplLossPercent));
    return 100 - minLoss;
  });
  const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  return {
    modelCount,
    formatCount,
    gpuCount,
    avgAccuracy: `${avgAccuracy.toFixed(1)}%`,
  };
}