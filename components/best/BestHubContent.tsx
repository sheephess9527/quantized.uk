'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Cpu } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { BEST_TIERS, tierSummary } from '@/lib/utils/best-page';

export default function BestHubContent() {
  const { t, lang } = useLanguage();
  const b = t.best;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: b.hubTitle }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{b.hubTitle}</h1>
        <p className="text-slate-400 leading-relaxed max-w-3xl">{b.hubIntro}</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {BEST_TIERS.map(tier => (
          <li key={tier.slug}>
            <Link
              href={`/best/${tier.slug}/`}
              className="block h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
            >
              <span className="flex items-center gap-2 text-slate-100 font-semibold mb-1">
                <Cpu size={14} className="text-violet-400" />
                {b.tierTitle.replace('{label}', tier.kind === 'apple' ? b.appleLabel : `${tier.vram}GB`)}
              </span>
              <span className="block text-sm text-slate-400 leading-relaxed">{tierSummary(tier, lang)}</span>
              <span className="block text-xs text-slate-500 mt-1.5">
                {tier.cards.length} {tier.kind === 'apple' ? b.appleLabel : ''} ·{' '}
                {tier.cards.slice(0, 3).map(c => c.name).join(', ')}
                {tier.cards.length > 3 ? '…' : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="glass rounded-2xl p-5 sm:p-6 flex flex-wrap gap-4">
        <Link href="/gpu/" className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300">
          {t.gpuPage.indexTitle} ({gpuDatabase.length}) <ArrowRight size={14} />
        </Link>
        <Link href="/quant-hub/" className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-400 hover:text-slate-200">
          {t.hub.indexedCount.replace('{total}', String(models.length))} <ArrowRight size={14} />
        </Link>
        <Link href="/tools/vram-calc/" className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-400 hover:text-slate-200">
          {t.nav.vramCalc} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
