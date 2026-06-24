'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Wand2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { runFormatWizard, HardwareType, Priority, UseCase } from '@/lib/utils/format-wizard';
import { cn } from '@/lib/utils/cn';

const formatColors: Record<string, string> = {
  GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
};

export default function FormatWizard() {
  const { t, lang } = useLanguage();
  const { gpu } = useHardwareProfile();
  const w = t.wizard;

  const [hardware, setHardware] = useState<HardwareType>(
    gpu?.type === 'apple' ? 'mac' : gpu?.isCPU ? 'cpu' : gpu ? 'nvidia' : 'nvidia',
  );
  const [priority, setPriority] = useState<Priority>('quality');
  const [useCase, setUseCase] = useState<UseCase>('chat');
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => runFormatWizard({
    hardware,
    priority,
    useCase,
    vramGB: gpu?.vram,
  }), [hardware, priority, useCase, gpu]);

  const top = results[0];

  const steps = [
    { label: w.stepHardware, content: (
      <div className="flex flex-wrap gap-2">
        {(['nvidia', 'mac', 'cpu'] as HardwareType[]).map(h => (
          <button key={h} onClick={() => setHardware(h)}
            className={cn('px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              hardware === h ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
            {w.hardware[h]}
          </button>
        ))}
      </div>
    )},
    { label: w.stepPriority, content: (
      <div className="flex flex-wrap gap-2">
        {(['quality', 'speed', 'ease'] as Priority[]).map(p => (
          <button key={p} onClick={() => setPriority(p)}
            className={cn('px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              priority === p ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
            {w.priority[p]}
          </button>
        ))}
      </div>
    )},
    { label: w.stepUseCase, content: (
      <div className="flex flex-wrap gap-2">
        {(['chat', 'code', 'api'] as UseCase[]).map(u => (
          <button key={u} onClick={() => setUseCase(u)}
            className={cn('px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              useCase === u ? 'bg-orange-500/15 text-orange-300 border-orange-500/25' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
            {w.useCase[u]}
          </button>
        ))}
      </div>
    )},
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {gpu && (
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={12} className="text-emerald-400" />
            {w.usingProfile.replace('{gpu}', gpu.name)}
          </div>
        )}

        {steps.map((s, i) => (
          <div key={i}>
            <p className="text-xs font-medium text-slate-500 mb-2">
              <span className="text-violet-400 mr-1.5">{i + 1}.</span>{s.label}
            </p>
            {s.content}
          </div>
        ))}

        <button
          onClick={() => setShowResults(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          <Wand2 size={14} />
          {w.getRecommendation}
        </button>
      </div>

      <div>
        {showResults ? (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-violet-500/20">
              <p className="text-xs text-violet-400 font-medium mb-2">{w.recommended}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className={cn('badge text-lg font-mono font-bold px-3 py-1', formatColors[top.format])}>
                  {top.format}
                </span>
                <span className="text-2xl font-bold text-slate-100">{top.quant}</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">
                <span className="text-slate-500">{w.framework}: </span>{top.framework}
              </p>
              <ul className="mt-3 space-y-1.5">
                {top.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    {r[lang]}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link
                  href={`/tools/vram-calc/?mode=reverse&gpu=${gpu?.id ?? 'rtx4090'}&sort=quality`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-colors"
                >
                  {w.seeModels} <ArrowRight size={12} />
                </Link>
                <Link
                  href="/tools/cli-gen/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-slate-400 text-xs font-medium hover:text-slate-200 transition-colors"
                >
                  {w.generateCli} <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-3">{w.allFormats}</p>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={r.format} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                    <span className={cn('badge text-xs font-mono', formatColors[r.format])}>{r.format}</span>
                    <span className="text-xs text-slate-500 flex-1">{r.framework}</span>
                    <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-64">
            <div className="text-center">
              <Wand2 size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">{w.pickOptions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}