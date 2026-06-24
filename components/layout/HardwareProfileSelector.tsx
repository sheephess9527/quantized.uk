'use client';

import { Cpu, ChevronDown } from 'lucide-react';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { gpuDatabase } from '@/lib/data/gpus';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export default function HardwareProfileSelector({ compact = false }: { compact?: boolean }) {
  const { gpuId, setGpuId, gpu, hasProfile } = useHardwareProfile();
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="relative">
        <select
          value={gpuId}
          onChange={e => setGpuId(e.target.value)}
          className={cn(
            'appearance-none pl-7 pr-7 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
            hasProfile
              ? 'bg-violet-500/10 text-violet-300 border-violet-500/20'
              : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300',
          )}
          title={t.profile.selectGpu}
        >
          <option value="">{t.profile.myGpu}</option>
          {gpuDatabase.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.vram}G)</option>
          ))}
        </select>
        <Cpu size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
        <Cpu size={12} className="text-violet-400" />
        {t.profile.myGpu}
      </label>
      <select
        value={gpuId}
        onChange={e => setGpuId(e.target.value)}
        className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
      >
        <option value="">{t.profile.selectGpu}</option>
        {gpuDatabase.map(g => (
          <option key={g.id} value={g.id}>{g.icon} {g.name} ({g.vram} GB)</option>
        ))}
      </select>
      {gpu && (
        <p className="text-xs text-slate-600 mt-2">
          {t.profile.saved.replace('{name}', gpu.name).replace('{vram}', String(gpu.vram))}
        </p>
      )}
    </div>
  );
}