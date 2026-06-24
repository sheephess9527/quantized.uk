'use client';

import { Suspense } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import VRAMCalculator from '@/components/tools/VRAMCalculator';

export default function VRAMCalcPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
          ⚡ {t.nav.vramCalc}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.calc.title}</h1>
        <p className="text-slate-400 max-w-2xl">{t.calc.subtitle}</p>
      </div>
      <Suspense fallback={<div className="glass rounded-2xl p-8 text-center text-slate-600 text-sm">Loading...</div>}>
        <VRAMCalculator />
      </Suspense>
    </div>
  );
}
