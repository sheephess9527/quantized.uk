'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { dataLastUpdated } from '@/lib/data/meta';
import type { ChangelogEntry } from '@/lib/data/changelog';

/**
 * A pointer, not a third copy.
 *
 * This was the full log behind a disclosure, on a page where the hero pill and
 * "This week's updates" already carried the same latest entry — the same text
 * rendered three times. The log now lives at `/changelog/`, which is indexable
 * and was a 404 before.
 *
 * The `#changelog` id stays exactly where it was: the About page, `/feed.xml`
 * and any external link all point at it, and an anchor that silently stops
 * resolving is worse than a redundant section.
 */
/** The entry and the count are passed from the server page: importing the changelog here shipped all of it (~205 kB) with the homepage. */
export default function DataChangelog({ latest, total }: { latest?: ChangelogEntry; total: number }) {
  const { t, lang } = useLanguage();
  const c = t.home.changelog;

  return (
    <div id="changelog" className="glass rounded-2xl p-5 scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-title text-lg">{c.title}</h2>
          <p className="section-subtitle text-xs mt-0.5">{c.subtitle.replace('{date}', dataLastUpdated)}</p>
        </div>
        <Link
          href="/changelog/"
          className="inline-flex items-center gap-1 min-h-[44px] text-xs font-medium text-violet-400 hover:text-violet-300"
        >
          {c.showAll.replace('{n}', String(total))} <ArrowRight size={12} />
        </Link>
      </div>

      {latest && (
        <p className="text-sm text-slate-400 leading-relaxed mt-3">
          <span className="font-mono text-xs text-slate-500 mr-2">{latest.date}</span>
          {latest[lang]}
        </p>
      )}

      <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-white/[0.05]">{c.disclaimer}</p>
    </div>
  );
}
