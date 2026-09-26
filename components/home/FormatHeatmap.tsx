'use client';

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

      {/*
        A ranking, deliberately without numbers. The percentages this used to
        print had no reproducible source, and the comparison pages showed them
        beside real inventory counts as if the two were the same kind of fact.
        The counts per format are in the table above; this is only the order.
      */}
      <ol className="flex flex-col gap-2 flex-1">
        {quantFormats.map((fmt, i) => (
          <li key={fmt.id} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-3">{i + 1}</span>
            <span
              className="badge text-xs font-mono font-semibold"
              style={{ background: `${fmt.color}18`, color: fmt.textColor, borderColor: `${fmt.color}30` }}
            >
              {fmt.name}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-slate-600 mt-3 leading-relaxed">{dataSources.formatHeat[lang]}</p>
    </div>
  );
}
