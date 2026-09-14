'use client';

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { benchmarkMethodology, dataSources, runtimeVersions } from '@/lib/data/meta';
import { cn } from '@/lib/utils/cn';

export default function MethodologyPanel() {
  const { t, lang } = useLanguage();
  // QTZ-031: this panel carries most of the page's new coverage/method
  // content. Collapsed by default, `{open && ...}` never rendered any of it
  // into the exported HTML — invisible to a crawler and to the word count
  // the audit's acceptance bar is checking. Open by default; the toggle
  // still lets a returning reader collapse it.
  const [open, setOpen] = useState(true);
  const m = benchmarkMethodology;
  const tm = t.bench.methodology;

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

          {/*
            QTZ-031: the audit's full structure (Throughput / Perplexity /
            VRAM / Hardware / Runs recorded), with every field this index
            never recorded shown as that rather than invented. A geek
            deciding whether to trust this page checks exactly this kind of
            gap — "not recorded" is a more credible answer than a plausible
            guess.
          */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">{tm.throughputTitle}</p>
              <dl className="space-y-1 text-xs">
                <Row label={tm.promptLen} value={`${m.promptLen} tokens`} />
                <Row label={tm.genLen} value={`${m.genLen} tokens`} />
                <Row label={tm.measurement} value={tm.notRecorded} muted />
                <Row label={tm.throughputReported} value={tm.throughputReportedValue} />
              </dl>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">{tm.perplexityTitle}</p>
              <dl className="space-y-1 text-xs">
                <Row label={tm.baseline} value={String(m.baselinePpl)} />
                <Row label={tm.perplexityReported} value={tm.perplexityReportedValue} />
              </dl>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">{tm.vramTitle}</p>
              <dl className="space-y-1 text-xs">
                <Row label={tm.vramMeasuredWith} value={tm.notRecorded} muted />
                <Row label={tm.vramReported} value={tm.vramReportedValue} />
              </dl>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            <p className="text-xs font-semibold text-slate-400">{tm.hardwareTitle}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {tm.hardwareDrivers.replace('{drivers}', m.drivers)}
            </p>
            <Row label={tm.hardwareCpuRam} value={tm.notRecorded} muted />
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-1">
            <Row label={tm.runsRecorded} value={tm.notRecorded} muted />
            <Row label={tm.lastRerun} value={tm.notRecorded} muted />
          </div>

          <p className="text-xs text-slate-600">
            <span className="text-slate-500">{t.bench.methodology.source}: </span>
            {dataSources.benchmarks[lang]}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-600 shrink-0">{label}</dt>
      <dd className={cn('font-mono text-right', muted ? 'text-slate-600 italic' : 'text-slate-300')}>{value}</dd>
    </div>
  );
}