'use client';

import Link from 'next/link';
import { ChevronRight, GitCompareArrows } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { getSimilarModels } from '@/lib/utils/related';
import { cn } from '@/lib/utils/cn';

const hwColors: Record<string, string> = {
  'consumer-gpu': 'bg-green-500/10 text-green-400 border-green-500/20',
  mac: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'cpu-vps': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'pro-gpu': 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  modelId: string;
}

export default function SimilarModels({ modelId }: Props) {
  const { t, lang } = useLanguage();
  const similar = getSimilarModels(modelId);
  if (similar.length === 0) return null;

  const s = t.hub.similar;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">{s.title}</h2>
        {similar[0] && (
          <Link
            href={`/tools/compare/?a=${modelId}&b=${similar[0].id}`}
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <GitCompareArrows size={12} />
            {s.compareWith.replace('{name}', similar[0].name.split(' ').slice(0, 2).join(' '))}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {similar.map(model => {
          const minVram = Math.min(...model.quants.map(q => q.vramGB));
          const bestLoss = Math.min(...model.quants.map(q => q.pplLossPercent));
          return (
            <Link
              key={model.id}
              href={`/quant-hub/${model.id}/`}
              className="group glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="badge bg-white/[0.05] text-slate-400 border-white/[0.08] font-mono text-xs">
                  {model.paramLabel}
                </span>
                <ChevronRight size={12} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors line-clamp-2 mb-1">
                {model.name}
              </h3>
              <p className="text-xs text-slate-600 mb-3">{model.family}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {model.hardwareTags.slice(0, 2).map(hw => (
                  <span key={hw} className={cn('badge text-[10px]', hwColors[hw])}>
                    {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-violet-300">{minVram.toFixed(1)} GB</span>
                <span>{s.minVram}</span>
                <span className="text-slate-700">·</span>
                <span className="font-mono text-emerald-400">{(100 - bestLoss).toFixed(1)}%</span>
                <span>{s.accuracy}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {model.description[lang]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}