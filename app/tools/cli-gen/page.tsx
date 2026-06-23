'use client';

import { useLanguage } from '@/lib/i18n/context';
import CLIGenerator from '@/components/tools/CLIGenerator';

export default function CLIGenPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-4">
          $ {t.nav.cliGen}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.cli.title}</h1>
        <p className="text-slate-400 max-w-2xl">{t.cli.subtitle}</p>
      </div>
      <CLIGenerator />
    </div>
  );
}
