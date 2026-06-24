'use client';

import { useLanguage } from '@/lib/i18n/context';
import { getSiteStats } from '@/lib/stats';

const siteStats = getSiteStats();

const stats = [
  { value: String(siteStats.modelCount), keyName: 'models'   },
  { value: String(siteStats.formatCount), keyName: 'formats'  },
  { value: String(siteStats.gpuCount),    keyName: 'gpus'     },
  { value: siteStats.avgAccuracy,         keyName: 'accuracy' },
] as const;

export default function StatsBar() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
      <div className="glass rounded-2xl p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map(({ value, keyName }) => (
            <div key={keyName} className="flex flex-col items-center py-4 px-6">
              <span className="text-2xl font-bold text-gradient">{value}</span>
              <span className="text-xs text-slate-500 mt-0.5">{t.home.stats[keyName]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
