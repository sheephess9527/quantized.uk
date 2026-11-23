import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { fitsOnGpu, longestComfortableContext, usableCapacityGB, type GpuFit } from '@/lib/utils/gpu-page';
import { qualityRank } from '@/lib/utils/quality';

export function gpuUpgradeChoices(current: GPU): GPU[] {
  return gpuDatabase
    .filter(gpu => !gpu.isCPU && (gpu.id !== current.id || gpu.vram !== current.vram))
    .sort((a, b) => a.vram - b.vram);
}

export function defaultGpuUpgrade(current: GPU, choices: GPU[]): GPU | undefined {
  const capacity = usableCapacityGB(current);
  const larger = choices.filter(candidate => usableCapacityGB(candidate) > capacity);
  return larger.find(candidate => candidate.type === current.type) ?? larger[0];
}

export function compareGpuUpgrade(current: GPU, candidate: GPU, contextLength: number, batchSize: number) {
  const currentFits = fitsOnGpu(current, contextLength, batchSize);
  const candidateFits = fitsOnGpu(candidate, contextLength, batchSize);
  const currentByModel = new Map(currentFits.map(fit => [fit.model.id, fit]));
  const candidateIds = new Set(candidateFits.map(fit => fit.model.id));
  const unlocked: GpuFit[] = [];
  const quantGains: { before: GpuFit; after: GpuFit }[] = [];
  const contextGains: { fit: GpuFit; before: number; after: number }[] = [];

  for (const after of candidateFits) {
    const before = currentByModel.get(after.model.id);
    if (!before) {
      unlocked.push(after);
      continue;
    }
    if (qualityRank(after.quant) < qualityRank(before.quant)) quantGains.push({ before, after });
    if (contextGains.length < 3) {
      const currentMax = longestComfortableContext(before.model, current, before.quant, batchSize);
      if (currentMax === before.model.contextLength) continue;
      const candidateMax = longestComfortableContext(before.model, candidate, before.quant, batchSize);
      if (candidateMax > currentMax) contextGains.push({ fit: before, before: currentMax, after: candidateMax });
    }
  }

  return { unlocked, quantGains, contextGains, lostCount: currentFits.filter(fit => !candidateIds.has(fit.model.id)).length };
}
