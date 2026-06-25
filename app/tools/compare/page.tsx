'use client';

import { Suspense } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import ModelCompare from '@/components/tools/ModelCompare';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function ComparePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.modelCompare },
        ]}
      />
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
          <span>⚖️</span> {t.compare.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.compare.title}</h1>
        <p className="text-slate-400 max-w-2xl">{t.compare.subtitle}</p>
      </div>
      <Suspense fallback={<div className="glass rounded-2xl p-8 text-center text-slate-600 text-sm">Loading...</div>}>
        <ModelCompare />
      </Suspense>
    </div>
  );
}