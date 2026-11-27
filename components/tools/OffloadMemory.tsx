'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import type { OffloadPlan } from '@/lib/utils/calc-insights';
import VramStackBar from './VramStackBar';
import { getVerdict, type CalcResult } from '@/lib/utils/vram';

// Planning estimate for OS and background apps. This is host RAM, not VRAM.
const HOST_RESERVE_GIB = 4;

export default function OffloadMemory({ plan, capacity, result, ceiling }: {
  plan: OffloadPlan; capacity: number; result: CalcResult; ceiling: number;
}) {
  const { lang } = useLanguage();
  const zh = lang === 'zh';
  const [installed, setInstalled] = useState('');
  const host = Number(installed);
  const known = Number.isFinite(host) && host > 0;
  const used = plan.moe?.ramGB ?? plan.ramGB;
  const share = plan.gpuLayers / plan.layers;
  const gpu = plan.moe?.gpuGB ?? result.totalGB * share;
  // In an expert split, only weights move. Whole layers carry a share of every component.
  const residentShare = plan.moe ? 1 : share;
  const kv = result.kvCacheGB * residentShare;
  const activations = result.activationsGB * residentShare;
  const extra = (result.extraGB ?? 0) * residentShare;
  const verdict = getVerdict(gpu, capacity, ceiling);
  const fits = zh ? '装得下' : 'Fits';
  const insufficient = zh ? '容量不足' : 'Insufficient capacity';
  const gpuLabel = { green: fits, yellow: zh ? '余量较小' : 'Tight fit', red: insufficient };
  const hostFits = used + HOST_RESERVE_GIB <= host;
  return (
    <div className="mt-3 space-y-2 text-xs text-slate-300">
      <p>{zh ? '卸载后显存' : 'VRAM after offload'} · {gpu.toFixed(1)} / {capacity} GiB · {gpuLabel[verdict]}</p>
      <VramStackBar weightsGB={Math.max(0, gpu - kv - activations - extra)} kvGB={kv}
        activationsGB={activations} extraGB={extra} capacityGB={capacity} tightCeiling={ceiling} />
      <label className="flex items-center gap-2">
        {zh ? '本机内存容量（GiB）' : 'Installed RAM (GiB)'}
        <input type="number" min="1" value={installed} onChange={e => setInstalled(e.target.value)}
          className="w-20 rounded border border-ink/20 bg-slate-900 px-2 py-1" />
      </label>
      <div aria-live="polite">
        <p>{zh ? '卸载占用内存' : 'Offloaded RAM'} · {used.toFixed(1)} / {known ? host : '—'} GiB · {
          known ? (hostFits ? fits : insufficient) : (zh ? '填入容量后判断' : 'Enter capacity to check fit')
        }</p>
        <p>{zh ? '预估为系统预留' : 'Estimated OS reserve'} · {HOST_RESERVE_GIB} GiB</p>
        {known && <div aria-hidden="true" className="mt-1 flex h-2 overflow-hidden rounded bg-ink/10">
          <div className="bg-cyan-400" style={{ width: `${100 * used / Math.max(host, used + HOST_RESERVE_GIB)}%` }} />
          <div className="bg-amber-400" style={{ width: `${100 * HOST_RESERVE_GIB / Math.max(host, used + HOST_RESERVE_GIB)}%` }} />
        </div>}
      </div>
    </div>
  );
}
