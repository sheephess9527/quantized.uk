'use client';

import { Cpu, ChevronDown } from 'lucide-react';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { GPU_GROUPS, gpuDisplayName, rowsInGpuGroup } from '@/lib/data/gpus';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export default function HardwareProfileSelector({ compact = false }: { compact?: boolean }) {
  const { gpuId, setGpuId, gpu, hasProfile } = useHardwareProfile();
  const { t, lang } = useLanguage();

  if (compact) {
    return (
      <div className="relative">
        <select
          value={gpuId}
          onChange={e => setGpuId(e.target.value)}
          aria-label={t.profile.selectGpu}
          className={cn(
            // w-full is what makes the navbar's max-w-[9.5rem] cap actually
            // bite. Without it the select sizes to its widest <option>
            // ("Radeon PRO W7900 48G") — 239px — and pushed itself and the
            // language toggle off the right edge at the md breakpoint.
            'w-full appearance-none pl-7 pr-7 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
            hasProfile
              ? 'bg-violet-500/10 text-violet-300 border-violet-500/20'
              : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300',
          )}
          title={t.profile.selectGpu}
        >
          <option value="">{t.profile.myGpu}</option>
          {GPU_GROUPS.map(([type, key]) => {
            const rows = rowsInGpuGroup(type);
            return rows.length === 0 ? null : (
              <optgroup key={key} label={t.calc[key]}>
                {rows.map(g => (
                  <option key={g.id} value={g.id}>{gpuDisplayName(g, lang)} ({g.vram}G)</option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <Cpu size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <label className="block">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
          <Cpu size={12} className="text-violet-400" />
          {t.profile.myGpu}
        </span>
        <select
          value={gpuId}
          onChange={e => setGpuId(e.target.value)}
          className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-violet-500/50"
        >
          <option value="">{t.profile.selectGpu}</option>
          {GPU_GROUPS.map(([type, key]) => {
            const rows = rowsInGpuGroup(type);
            return rows.length === 0 ? null : (
              <optgroup key={key} label={t.calc[key]}>
                {rows.map(g => (
                  <option key={g.id} value={g.id}>{g.icon} {gpuDisplayName(g, lang)} ({g.vram} GB)</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>
      {gpu && (
        <p className="text-xs text-slate-600 mt-2">
          {t.profile.saved.replace('{name}', gpuDisplayName(gpu, lang)).replace('{vram}', String(gpu.vram))}
        </p>
      )}
    </div>
  );
}