'use client';

import { useLanguage } from '@/lib/i18n/context';
import { getSiteStats } from '@/lib/stats';

const siteStats = getSiteStats();

const stats = [
  { value: String(siteStats.modelCount), keyName: 'models'   },
  { value: String(siteStats.formatCount), keyName: 'formats'  },
  { value: String(siteStats.gpuCount),    keyName: 'gpus'     },
  { value: siteStats.q4Retention,         keyName: 'accuracy' },
] as const;

export default function StatsBar() {
  const { t } = useLanguage();

  return (
    // `-mt-8 relative z-10` used to make this card straddle the bottom of the
    // hero, back when it sat directly under it. JobPaths was later inserted in
    // between and the negative margin was never revisited, so the card spent
    // that time overlapping the job-path cards and covering their descriptions.
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="glass rounded-2xl p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map(({ value, keyName }) => (
            <div key={keyName} className="flex flex-col items-center py-4 px-6">
              <span className="text-2xl font-bold text-gradient">{value}</span>
              <span className="text-xs text-slate-500 mt-0.5">{t.home.stats[keyName]}</span>
              {keyName === 'accuracy' && (
                // The only derived number in a row of inventory counts, so it
                // states its basis inline rather than inviting the reader to
                // assume one.
                <span className="text-[10px] text-slate-600 mt-0.5 text-center leading-tight">
                  {t.home.stats.accuracyNote
                    .replace('{n}', String(siteStats.q4SampleSize))
                    .replace('{lo}', String(siteStats.q4Range[0]))
                    .replace('{hi}', String(siteStats.q4Range[1]))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
