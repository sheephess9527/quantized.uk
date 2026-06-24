'use client';

import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { dataLastUpdated } from '@/lib/data/meta';

export default function AboutPage() {
  const { t } = useLanguage();
  const a = t.about;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        {a.backHome}
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
          <Heart size={12} />
          {a.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{a.title}</h1>
        <p className="text-slate-400 leading-relaxed">{a.subtitle}</p>
        <p className="text-xs text-slate-600 mt-3">
          {a.lastUpdated} · {a.dataRefresh.replace('{date}', dataLastUpdated)}
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-8 border border-violet-500/10">
        <p className="text-sm font-medium text-slate-200 mb-2">{a.maintainerTitle}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{a.maintainerBody}</p>
      </div>

      <div className="space-y-8">
        {a.sections.map((section, i) => (
          <section key={i} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm text-slate-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 glass rounded-xl px-4 py-4 text-center">
        <p className="text-sm text-slate-400 mb-3">{a.cta}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
            {a.ctaChangelog}
          </Link>
          <Link href="/quant-hub/" className="text-violet-400 hover:text-violet-300 transition-colors">
            {a.ctaHub}
          </Link>
          <Link href="/legal/" className="text-slate-500 hover:text-slate-400 transition-colors">
            {t.legal.linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}