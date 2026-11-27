'use client';

import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { PARAM_RANGE_LABEL as L } from '@/lib/utils/param-buckets';

interface BucketCounts {
  small: number;
  mid7: number;
  mid14: number;
  large32: number;
  xl: number;
}

interface Props {
  total: number;
  families: number;
  formats: number;
  buckets: BucketCounts;
}

export default function HubScaleStats({ total, families, formats, buckets }: Props) {
  const { t } = useLanguage();
  const s = t.hub.scaleStats;

  const pills = [
    { label: s.total.replace('{total}', String(total)), highlight: true },
    { label: s.families.replace('{count}', String(families)) },
    { label: s.formats.replace('{count}', String(formats)) },
    { label: `${L['≤3B']} · ${buckets.small}` },
    { label: `${L['7B']} · ${buckets.mid7}` },
    { label: `${L['14B']} · ${buckets.mid14}` },
    { label: `${L['32B']} · ${buckets.large32}` },
    { label: `${L['70B+']} · ${buckets.xl}` },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {pills.map((pill, i) => (
        <span
          key={i}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium border',
            pill.highlight
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/25'
              : 'bg-ink/[0.03] text-slate-500 border-ink/[0.06]',
          )}
        >
          {pill.label}
        </span>
      ))}
    </div>
  );
}