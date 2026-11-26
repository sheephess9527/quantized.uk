'use client';

import { useState, type ReactNode } from 'react';
import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDisplayName, type GPU } from '@/lib/data/gpus';
import { contextLabel } from '@/lib/utils/context-label';
import { GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { compareGpuUpgrade, defaultGpuUpgrade, gpuUpgradeChoices } from '@/lib/utils/gpu-upgrade';
import { quantLevelKey } from '@/lib/utils/recommend';
import { quantRankBasis } from '@/lib/utils/quality';
import FitControls from './FitControls';

function ChangeList({ title, rows }: { title: string; rows: { id: string; name: string; detail: ReactNode }[] }) {
  const { t } = useLanguage();
  const preview = rows.slice(0, 3);
  const rest = rows.slice(preview.length);
  const list = (entries: typeof rows) => (
    <ul className="space-y-1.5">
      {entries.map(row => (
        <li key={row.id} className="break-words">
          <Link href={`/quant-hub/${row.id}/`} className="text-violet-300 hover:underline">{row.name}</Link>
          <span className="block text-xs text-slate-400">{row.detail}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="min-w-0">
      <h3 className="mb-1.5 font-semibold text-slate-200">{title} <span className="text-slate-400">· {rows.length}</span></h3>
      {preview.length ? list(preview) : <p className="text-slate-400">{t.gpuUpgrade.none}</p>}
      {rest.length > 0 && (
        <details className="mt-1">
          <summary className="cursor-pointer py-2 text-xs text-violet-300">{t.gpuUpgrade.more.replace('{count}', String(rest.length))}</summary>
          {list(rest)}
        </details>
      )}
    </section>
  );
}

export default function GpuUpgradeComparison({ current, tierLabel, settings }: {
  current: GPU;
  tierLabel?: string;
  settings?: { contextLength: number; batchSize: number };
}) {
  const { lang, t } = useLanguage();
  const u = t.gpuUpgrade;
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string>();
  const [localContext, setLocalContext] = useState(GPU_PAGE_CONTEXT);
  const [localBatchSize, setLocalBatchSize] = useState(1);
  const contextLength = settings?.contextLength ?? localContext;
  const batchSize = settings?.batchSize ?? localBatchSize;
  const choices = open ? gpuUpgradeChoices(current) : [];
  const candidate = choice === undefined
    ? defaultGpuUpgrade(current, choices)
    : choices.find(gpu => gpu.id === choice);
  const result = candidate ? compareGpuUpgrade(current, candidate, contextLength, batchSize) : undefined;

  return (
    <details className="glass rounded-2xl px-4 sm:px-6" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary className="min-h-[44px] cursor-pointer py-3 font-semibold text-slate-100">{u.title}</summary>
      {open && (
        <div className="space-y-3 pb-4 text-sm">
          <p className="text-slate-400">{u.current.replace('{name}', tierLabel ?? gpuDisplayName(current, lang))}</p>
          <label className="block max-w-sm text-slate-300">
            {u.candidate}
            <select value={candidate?.id ?? ''} onChange={event => setChoice(event.target.value)}
              className="mt-1 block min-h-[44px] w-full min-w-0 rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-slate-100">
              <option value="" disabled>{u.choose}</option>
              {choices.map(gpu => <option key={gpu.id} value={gpu.id}>{gpuDisplayName(gpu, lang)} · {gpu.vram} GB</option>)}
            </select>
          </label>
          {!settings && (
            <FitControls contextLength={localContext} batchSize={localBatchSize} onContextChange={setLocalContext} onBatchChange={setLocalBatchSize} />
          )}
          <p className="text-xs text-slate-400">{u.settings.replace('{ctx}', contextLabel(contextLength)).replace('{batch}', String(batchSize))}</p>
          {result && (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <ChangeList title={u.unlocked} rows={result.unlocked.map(({ model, quant }) => ({
                  id: model.id, name: model.name, detail: quantLevelKey(quant),
                }))} />
                <ChangeList title={u.quantGains} rows={result.quantGains.map(({ before, after }) => ({
                  id: after.model.id, name: after.model.name, detail: `${quantLevelKey(before.quant)} → ${quantLevelKey(after.quant)} · ${u[quantRankBasis(before.quant, after.quant)]}`,
                }))} />
                <ChangeList title={u.contextGains} rows={result.contextGains.map(({ fit, before, after }) => ({
                  id: fit.model.id, name: fit.model.name,
                  detail: u.contextGain.replace('{quant}', quantLevelKey(fit.quant))
                    .replace('{from}', before.toLocaleString(lang)).replace('{to}', after.toLocaleString(lang)),
                }))} />
              </div>
              {result.lostCount > 0 && (
                <p className="text-xs text-amber-300">{u.lost.replace('{count}', String(result.lostCount))}</p>
              )}
            </>
          )}
        </div>
      )}
    </details>
  );
}
