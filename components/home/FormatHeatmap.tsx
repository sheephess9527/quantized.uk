'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { quantFormats } from '@/lib/data/formats';
import { dataSources } from '@/lib/data/meta';

export default function FormatHeatmap() {
  const { t, lang } = useLanguage();

  return (
    <div className="glass rounded-2xl p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="section-title text-lg">{t.home.formatHeat.title}</h2>
        <p className="section-subtitle text-xs mt-0.5">{t.home.formatHeat.subtitle}</p>
      </div>

      <ul className="flex flex-col gap-3 flex-1">
        {quantFormats.map((fmt, i) => (
          <li key={fmt.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-3">{i + 1}</span>
                <span
                  className="badge text-xs font-mono font-semibold"
                  style={{ background: `${fmt.color}18`, color: fmt.color, borderColor: `${fmt.color}30` }}
                >
                  {fmt.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-300">{fmt.heatPercent}%</span>
                <span className="flex items-center gap-0.5 text-xs">
                  {fmt.heatTrend > 0 ? (
                    <><TrendingUp size={10} className="text-emerald-400" /><span className="text-emerald-400">+{fmt.heatTrend}%</span></>
                  ) : fmt.heatTrend < 0 ? (
                    <><TrendingDown size={10} className="text-red-400" /><span className="text-red-400">{fmt.heatTrend}%</span></>
                  ) : (
                    <><Minus size={10} className="text-slate-600" /><span className="text-slate-600">0%</span></>
                  )}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fmt.heatPercent}%`, background: fmt.color }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-600 mt-3">{t.home.formatHeat.vsLastWeek}</p>
      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{dataSources.formatHeat[lang]}</p>
    </div>
  );
}
