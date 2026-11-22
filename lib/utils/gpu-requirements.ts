import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { fitsOnGpu, GPU_PAGE_BUCKETS, GPU_PAGE_CONTEXT, type GpuFit } from '@/lib/utils/gpu-page';
import { matchesParamRange, type ParamRange } from '@/lib/utils/param-buckets';
import { isSuperseded } from '@/lib/utils/model-meta';

export const REQUIREMENTS_CARDS = ['rtx4060ti', 'rtx3060', 'rtx4060ti16', 'rtx4090', 'rtx5090'];

export function activeFits(gpu: GPU): GpuFit[] {
  return fitsOnGpu(gpu).filter(({ model }) => !isSuperseded(model) && model.contextLength >= GPU_PAGE_CONTEXT);
}

/** The `/local-llm-gpu-requirements/` table: one row per card, the largest active fit per size class. */
export function gpuRequirementsTable(): { buckets: ParamRange[]; rows: { gpu: GPU; cells: (GpuFit | undefined)[] }[] } {
  const buckets = [...GPU_PAGE_BUCKETS].reverse();
  const rows = REQUIREMENTS_CARDS.flatMap(id => {
    const gpu = gpuDatabase.find(g => g.id === id);
    if (!gpu) return [];
    const fits = activeFits(gpu);
    return [{ gpu, cells: buckets.map(b => fits.find(f => matchesParamRange(f.model.params, b))) }];
  });
  return { buckets, rows };
}
