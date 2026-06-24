import { models } from '@/lib/data/models';
import { quantFormats } from '@/lib/data/formats';
import { gpuDatabase } from '@/lib/data/gpus';

export function getSiteStats() {
  const modelCount = models.length;
  const formatCount = quantFormats.length;
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