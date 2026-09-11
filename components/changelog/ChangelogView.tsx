'use client';

import Link from '@/components/i18n/LocalLink';
import { Rss } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { changelog, dataLastUpdated, dataSources } from '@/lib/data/meta';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

/**
 * The full data changelog, on its own indexable page.
 *
 * It used to exist only as a collapsed block at the bottom of the homepage,
 * while the same text was *also* rendered in the hero pill and again in
 * "This week's updates" — the same entry three times on one page, with the
 * older entries reachable only behind a disclosure nobody expands.
 *
 * `/changelog/` was one of the paths the audit found returning 404, and it is
 * the path a reader guesses.
 */
export default function ChangelogView() {
  const { t, lang } = useLanguage();
  const c = t.home.changelog;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: c.title }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{c.title}</h1>
        <p className="text-slate-400 leading-relaxed">{c.pageSubtitle.replace('{n}', String(changelog.length))}</p>
        <p className="text-xs text-slate-500 font-mono mt-2">{c.subtitle.replace('{date}', dataLastUpdated)}</p>
        <a
          href={lang === 'zh' ? '/zh/feed.xml' : '/feed.xml'}
          className="inline-flex items-center gap-1.5 min-h-[44px] mt-1 text-xs text-slate-400 hover:text-orange-400"
        >
          <Rss size={12} /> {t.home.weekly.rss}
        </a>
      </div>

      <ol className="space-y-5">
        {changelog.map((entry, i) => (
          <li key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
            <span className="font-mono text-xs text-slate-500 shrink-0 sm:w-24 sm:pt-0.5">{entry.date}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{entry[lang]}</span>
          </li>
        ))}
      </ol>

      <div className="glass rounded-2xl p-5 mt-10 space-y-2">
        <p className="text-xs text-slate-400 leading-relaxed">{c.disclaimer}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{dataSources.models[lang]}</p>
        <Link href="/quant-hub/?recency=recent" className="inline-flex items-center min-h-[44px] text-xs text-violet-400 hover:text-violet-300">
          {t.home.weekly.viewHub} →
        </Link>
      </div>
    </div>
  );
}
