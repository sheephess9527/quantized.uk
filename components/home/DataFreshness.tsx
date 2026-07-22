'use client';

import { useLanguage } from '@/lib/i18n/context';
import { dataLastUpdated } from '@/lib/data/meta';

export default function DataFreshness({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <p className={`text-xs text-slate-600 font-mono ${className}`}>
      {t.home.dataUpdated.replace('{date}', dataLastUpdated)}
    </p>
  );
}
