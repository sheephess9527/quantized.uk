'use client';

import { useLanguage } from '@/lib/i18n/context';
import { changelog, dataLastUpdated } from '@/lib/data/meta';

export default function DataChangelog() {
  const { t, lang } = useLanguage();

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title text-lg">{t.home.changelog.title}</h2>
          <p className="section-subtitle text-xs mt-0.5">
            {t.home.changelog.subtitle.replace('{date}', dataLastUpdated)}
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {changelog.map((entry, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-slate-600 shrink-0 pt-0.5 w-20">{entry.date}</span>
            <span className="text-slate-400 leading-relaxed">{entry[lang]}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-white/[0.05]">
        {t.home.changelog.disclaimer}
      </p>
    </div>
  );
}