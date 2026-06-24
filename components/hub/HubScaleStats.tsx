'use client';

import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

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
    { label: `${s.bucketSmall} · ${buckets.small}` },
    { label: `${s.bucket7B} · ${buckets.mid7}` },
    { label: `${s.bucket14B} · ${buckets.mid14}` },
    { label: `${s.bucket32B} · ${buckets.large32}` },
    { label: `${s.bucket70B} · ${buckets.xl}` },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {pills.map((pill, i) => (
        <span
          key={i}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium border',
            pill.highlight
              ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
              : 'bg-white/[0.03] text-slate-500 border-white/[0.06]',
          )}
        >
          {pill.label}
        </span>
      ))}
    </div>
  );
}