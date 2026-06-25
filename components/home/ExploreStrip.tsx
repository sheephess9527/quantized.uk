'use client';

import Link from 'next/link';
import { ChevronRight, Layers, BookOpen, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { getSiteStats } from '@/lib/stats';
import { articles } from '@/lib/data/cookbook';

const stats = getSiteStats();

const featuredCookbook = [
  { id: '8gb-gpu-starter-guide', titleKey: 'guide8gb' as const },
  { id: 'wsl2-ollama-gpu', titleKey: 'guideWsl2' as const },
  { id: 'docker-ollama-gpu', titleKey: 'guideDocker' as const },
];

export default function ExploreStrip() {
  const { t } = useLanguage();
  const e = t.home.explore;

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="section-title text-lg mb-5">{e.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/quant-hub/"
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">{e.hubLabel}</span>
          </div>
          <p className="text-2xl font-bold text-slate-100 mb-1">{stats.modelCount}</p>
          <p className="text-xs text-slate-500 mb-3">{e.hubDesc}</p>
          <span className="flex items-center gap-1 text-xs text-violet-400 group-hover:text-violet-300">
            {e.hubCta} <ChevronRight size={12} />
          </span>
        </Link>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">{e.cookbookLabel}</span>
          </div>
          <ul className="space-y-2 mb-3">
            {featuredCookbook.map(g => (
              <li key={g.id}>
                <Link
                  href={`/cookbook/${g.id}/`}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition-colors line-clamp-1"
                >
                  {e[g.titleKey]}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/cookbook/" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
            {e.cookbookCta.replace('{count}', String(articles.length))} <ChevronRight size={12} />
          </Link>
        </div>

        <Link
          href="/benchmarks/"
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04] transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">{e.benchLabel}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">{e.benchDesc}</p>
          <span className="flex items-center gap-1 text-xs text-emerald-400 group-hover:text-emerald-300">
            {e.benchCta} <ChevronRight size={12} />
          </span>
        </Link>
      </div>
    </section>
  );
}