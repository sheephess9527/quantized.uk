'use client';

import { useLanguage } from '@/lib/i18n/context';

export default function SkipToContent() {
  const { t } = useLanguage();
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-bg focus:px-4 focus:py-3 focus:text-slate-100">
      {t.nav.skipToContent}
    </a>
  );
}
