'use client';

import type { MatrixRow } from '@/lib/data/benchmarks';
import { useLanguage } from '@/lib/i18n/context';

export default function RunProvenance({ row }: { row: MatrixRow }) {
  const { t } = useLanguage();
  return (
    <span className="block text-xs leading-relaxed text-slate-400 font-normal">
      <span className="block font-mono">{row.runtimeVersion}</span>
      <span className="block font-sans">{t.bench.measuredBy.replace('{date}', row.firstPublishedAt)}</span>
    </span>
  );
}
