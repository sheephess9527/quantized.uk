'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { formatPairs, headToHead, modelsWithFormat } from '@/lib/utils/format-compare';

export default function FormatIndexView() {
  const { t } = useLanguage();
  const c = t.formatCompare;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: c.allComparisons }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{c.indexTitle}</h1>
        <p className="text-slate-400 max-w-2xl">{c.indexSubtitle}</p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {formatPairs.map(pair => (
          <li key={pair.slug}>
            <Link
              href={`/formats/${pair.slug}/`}
              className="block glass glass-hover rounded-2xl p-5 h-full"
            >
              <span className="text-base font-semibold text-slate-100">
                <span style={{ color: pair.a.color }}>{pair.a.name}</span>
                <span className="text-slate-600 mx-1.5">vs</span>
                <span style={{ color: pair.b.color }}>{pair.b.name}</span>
              </span>
              <span className="block text-xs text-slate-500 font-mono mt-1.5">
                {modelsWithFormat(pair.a.name).length} · {modelsWithFormat(pair.b.name).length} · ⇄ {headToHead(pair).length}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
