import Link from '@/components/i18n/LocalLink';
import { translations, type Lang } from '@/lib/i18n/translations';
import { pendingModels, type PendingReason } from '@/lib/data/pending';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils/cn';

const reasonColors: Record<PendingReason, string> = {
  'no-weights': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  'no-runtime': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'not-sized': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'awaiting-data': 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  'community-only': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

/**
 * "Released, not runnable here yet" — one page listing what the patrol saw and did not index,
 * with the reason recorded at the time. Content is in the static HTML; no disclosure, no JS.
 */
export default function PendingView({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const p = t.pending;
  const sorted = pendingModels.slice().sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.quantHub, href: '/quant-hub/' }, { label: p.title }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{p.title}</h1>
        <p className="text-slate-400 leading-relaxed">{p.subtitle}</p>
        <p className="text-sm text-slate-500 leading-relaxed mt-2">{p.why}</p>
      </div>

      <ol className="space-y-4">
        {sorted.map(m => (
          <li key={m.id} id={m.id} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h2 className="text-lg font-semibold text-slate-100">{m.name}</h2>
              <span className="text-xs text-slate-500">{m.vendor}</span>
              {m.announced && <span className="text-xs text-slate-500 font-mono">{p.announced.replace('{date}', m.announced)}</span>}
            </div>
            <p className="mb-3">
              <span className="text-xs text-slate-500 mr-2">{p.reasonLabel}</span>
              <span className={cn('badge text-[11px]', reasonColors[m.reason])}>{p.reasons[m.reason]}</span>
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{m.detail[lang]}</p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mr-2">{p.recheckLabel}</span>
              {m.recheck[lang]}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-2">{p.checked.replace('{date}', m.checkedAt)}</p>
          </li>
        ))}
      </ol>

      <div className="glass rounded-2xl p-5 mt-10 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/quant-hub/" className="inline-flex items-center min-h-[44px] text-sm text-sky-400 hover:text-sky-300">
          {t.nav.quantHub} →
        </Link>
        <Link href="/changelog/" className="inline-flex items-center min-h-[44px] text-sm text-sky-400 hover:text-sky-300">
          {t.home.changelog.title} →
        </Link>
      </div>
    </div>
  );
}
