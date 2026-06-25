'use client';

import { useLanguage } from '@/lib/i18n/context';
import FormatWizard from '@/components/tools/FormatWizard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function FormatWizardPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.formatWizard },
        ]}
      />
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-4">
          🧭 {t.wizard.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.wizard.title}</h1>
        <p className="text-slate-400 max-w-2xl">{t.wizard.subtitle}</p>
      </div>
      <FormatWizard />
    </div>
  );
}