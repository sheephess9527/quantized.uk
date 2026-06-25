'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { getRecommendations } from '@/lib/utils/recommend';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { cn } from '@/lib/utils/cn';

const FEATURED_GPU_IDS = [
  'rtx4090',
  'rtx4060ti16',
  'rtx4060ti',
  'rtx3090',
  'm3-max-48',
  'm3-16',
] as const;

function countModelsForGpu(gpuId: string): number {
  const gpu = gpuDatabase.find(g => g.id === gpuId);
  if (!gpu) return 0;
  const recs = getRecommendations(gpu.vram, 4096, 1, 'quality', true);
  return new Set(recs.map(r => r.model.id)).size;
}

interface Props {
  selectedGpuId: string | null;
  onSelect: (gpuId: string | null) => void;
}

export default function GpuQuickChips({ selectedGpuId, onSelect }: Props) {
  const { t } = useLanguage();
  const { gpu: profileGpu } = useHardwareProfile();
  const q = t.hub.gpuChips;

  const chipIds = useMemo(() => {
    const ids: string[] = [...FEATURED_GPU_IDS];
    if (profileGpu && !ids.includes(profileGpu.id)) {
      ids.unshift(profileGpu.id);
    }
    return ids.slice(0, 7);
  }, [profileGpu]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const id of chipIds) map[id] = countModelsForGpu(id);
    return map;
  }, [chipIds]);

  return (
    <div className="mb-4">
      <p className="text-xs text-slate-600 mb-2">{q.label}</p>
      <div className="flex flex-wrap gap-2">
        {chipIds.map(id => {
          const gpu = gpuDatabase.find(g => g.id === id);
          if (!gpu) return null;
          const active = selectedGpuId === id;
          const count = counts[id] ?? 0;
          return (
            <button
              key={id}
              onClick={() => onSelect(active ? null : id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                active
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10',
              )}
            >
              <span>{gpu.icon}</span>
              <span>{gpu.name}</span>
              <span className={cn(
                'font-mono text-[10px] px-1.5 py-0.5 rounded',
                active ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/[0.04] text-slate-600',
              )}>
                {count}
              </span>
            </button>
          );
        })}
        {selectedGpuId && (
          <button
            onClick={() => onSelect(null)}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] hover:border-white/10 transition-all"
          >
            {q.clear}
          </button>
        )}
      </div>
      {selectedGpuId && (
        <p className="text-xs text-emerald-400/70 mt-2">
          {q.activeHint
            .replace('{count}', String(counts[selectedGpuId] ?? 0))
            .replace('{total}', String(models.length))}
        </p>
      )}
    </div>
  );
}