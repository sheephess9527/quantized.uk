'use client';

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { benchmarkMethodology, dataSources, runtimeVersions } from '@/lib/data/meta';
import { cn } from '@/lib/utils/cn';

export default function MethodologyPanel() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const m = benchmarkMethodology;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info size={14} className="text-cyan-400" />
          <span className="text-sm font-semibold text-slate-300">{t.bench.methodology.title}</span>
        </div>
        <ChevronDown size={14} className={cn('text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {[
              { label: t.bench.methodology.model, value: m.model },
              { label: t.bench.methodology.dataset, value: m.dataset },
              { label: t.bench.methodology.context, value: `${m.context} tokens` },
              { label: t.bench.methodology.batch, value: String(m.batch) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.02] rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">{label}</p>
                <p className="text-xs font-mono text-slate-300">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">{t.bench.methodology.frameworks}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(m.frameworks).map(([k, v]) => (
                <span key={k} className="badge bg-white/[0.03] text-slate-400 border-white/[0.06] text-xs font-mono">
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
          {/*
            The measured stack and the current one, side by side. Showing only
            the first made the page read as abandoned; silently replacing it
            with the second would have claimed these runs happened on releases
            that did not exist when they were made.
          */}
          <div>
            <p className="text-xs text-slate-600 mb-2">
              {t.bench.methodology.currentVersions.replace('{date}', runtimeVersions.checkedAt)}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(runtimeVersions.current).map(([k, v]) => (
                <span key={k} className="badge bg-emerald-500/[0.08] text-emerald-300/90 border-emerald-500/20 text-xs font-mono">
                  {k}: {v}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">{runtimeVersions.note[lang]}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{m.notes[lang]}</p>
          <p className="text-xs text-slate-600">
            <span className="text-slate-500">{t.bench.methodology.source}: </span>
            {dataSources.benchmarks[lang]}
          </p>
        </div>
      )}
    </div>
  );
}