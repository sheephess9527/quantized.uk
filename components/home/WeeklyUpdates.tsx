'use client';

import Link from 'next/link';
import { ArrowRight, Rss, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { changelog, dataLastUpdated } from '@/lib/data/meta';
import { isRecentModel } from '@/lib/utils/model-meta';

export default function WeeklyUpdates() {
  const { t, lang } = useLanguage();
  const w = t.home.weekly;
  const recent = models.filter(m => isRecentModel(m)).slice(0, 6);
  const latestNotes = changelog.slice(0, 3);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="section-title text-lg flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            {w.title}
          </h2>
          <p className="section-subtitle text-xs mt-0.5">
            {w.subtitle}
            <span className="text-slate-600 font-mono ml-2">{dataLastUpdated}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/quant-hub/?recency=recent"
            className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
          >
            {w.viewHub} <ArrowRight size={12} />
          </Link>
          <a
            href="/feed.xml"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400"
          >
            <Rss size={12} /> {w.rss}
          </a>
        </div>
      </div>

      {recent.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {recent.map(m => (
            <li key={m.id}>
              <Link
                href={`/quant-hub/${m.id}/`}
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 mr-1.5">
                  {t.hub.model.newBadge}
                </span>
                <span className="text-sm text-slate-200 font-medium">{m.name}</span>
                <span className="block text-xs text-slate-600 font-mono mt-0.5">
                  {m.paramLabel} · {m.addedAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="space-y-2 border-t border-white/[0.05] pt-3">
        {latestNotes.map((entry, i) => (
          <li key={i} className="text-xs text-slate-500 leading-relaxed">
            <span className="font-mono text-slate-600 mr-2">{entry.date}</span>
            {entry[lang]}
          </li>
        ))}
      </ul>
      <a href="#changelog" className="inline-block mt-3 text-xs text-slate-600 hover:text-slate-400">
        {w.viewChangelog} →
      </a>
    </section>
  );
}
