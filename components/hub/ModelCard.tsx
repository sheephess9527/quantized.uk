'use client';

import Link from 'next/link';
import { ExternalLink, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { QuantModel } from '@/lib/data/models';
import { cn } from '@/lib/utils/cn';

const formatColors: Record<string, string> = {
  GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
};

const hwColors: Record<string, string> = {
  'consumer-gpu': 'bg-green-500/10 text-green-400 border-green-500/20',
  'mac': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'cpu-vps': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'pro-gpu': 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  model: QuantModel;
  lang: 'en' | 'zh';
}

export default function ModelCard({ model, lang }: Props) {
  const { t } = useLanguage();
  const uniqueFormats = Array.from(new Set(model.quants.map(q => q.format)));
  const minVram = Math.min(...model.quants.map(q => q.vramGB));
  const maxSpeed = Math.max(...model.quants.filter(q => q.speedRTX4090).map(q => q.speedRTX4090 ?? 0));
  const bestQuant = model.quants.reduce((best, q) =>
    !best || (q.pplLossPercent ?? Infinity) < (best.pplLossPercent ?? Infinity) ? q : best,
  );

  return (
    <Link
      href={`/quant-hub/${model.id}/`}
      className="glass glass-hover rounded-2xl p-5 flex flex-col gap-4 group transition-all duration-200 hover:scale-[1.01]"
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-violet-200 transition-colors">{model.name}</h3>
          <span className="badge shrink-0 bg-white/[0.05] text-slate-400 border-white/[0.08] font-mono text-xs">
            {model.paramLabel}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-2">{model.family}</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          {model.description[lang]}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-xs font-bold text-violet-300">{minVram.toFixed(1)} GB</p>
          <p className="text-xs text-slate-600 mt-0.5">{t.hub.model.minVram}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-xs font-bold text-cyan-300">
            {model.contextLength >= 1000 ? `${(model.contextLength / 1000).toFixed(0)}K` : model.contextLength}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{t.hub.model.context}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          {maxSpeed > 0 ? (
            <>
              <p className="text-xs font-bold text-orange-300">{maxSpeed}</p>
              <p className="text-xs text-slate-600 mt-0.5">{t.hub.model.speed}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-500">—</p>
              <p className="text-xs text-slate-600 mt-0.5">{t.hub.model.speed}</p>
            </>
          )}
        </div>
      </div>

      {/* Format badges */}
      <div>
        <p className="text-xs text-slate-600 mb-1.5">{t.hub.model.formats}</p>
        <div className="flex flex-wrap gap-1.5">
          {uniqueFormats.map(fmt => (
            <span key={fmt} className={cn('badge text-xs font-mono', formatColors[fmt] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Hardware tags */}
      <div className="flex flex-wrap gap-1.5">
        {model.hardwareTags.map(hw => (
          <span key={hw} className={cn('badge text-xs', hwColors[hw] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
            {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-600">
          {bestQuant && (
            <>
              <Zap size={10} className="text-yellow-500" />
              <span>{bestQuant.format} {bestQuant.level}</span>
            </>
          )}
        </div>
        <span
          role="link"
          tabIndex={0}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            window.open(model.quants[0]?.hfSearchUrl ?? '#', '_blank', 'noopener,noreferrer');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              window.open(model.quants[0]?.hfSearchUrl ?? '#', '_blank', 'noopener,noreferrer');
            }
          }}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
        >
          {t.hub.model.viewHF}
          <ExternalLink size={10} />
        </span>
      </div>
    </Link>
  );
}
