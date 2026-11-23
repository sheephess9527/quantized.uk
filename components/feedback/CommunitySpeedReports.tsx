'use client';

import { useLanguage } from '@/lib/i18n/context';
import { matchingCommunitySpeeds, type SpeedConfiguration } from '@/lib/data/community-speed';

export default function CommunitySpeedReports({ configuration }: { configuration: SpeedConfiguration }) {
  const { t } = useLanguage();
  const d = t.communitySpeed;
  const rows = matchingCommunitySpeeds(configuration);
  if (!rows.length) return null;

  return <section className="glass rounded-2xl p-5 space-y-3" aria-label={d.label}>
    <h3 className="text-sm font-semibold text-cyan-300">{d.label}</h3>
    <p className="text-xs text-slate-400">{d.reviewedNote}</p>
    {rows.map(row => <article key={row.id} className="rounded-xl border border-white/10 p-3 space-y-2 text-xs">
      <p className="font-semibold text-slate-200">{row.runtime} {row.version}</p>
      {row.processor && <p className="text-slate-300">{d.processor}: {row.processor}</p>}
      <p className="text-slate-300">{t.evidence.prefill}: {row.prefill} tok/s · {t.evidence.decode}: {row.decode} tok/s</p>
      {row.url && <a className="inline-block py-2 text-cyan-300 hover:underline" href={row.url} target="_blank" rel="noopener noreferrer nofollow ugc">{d.source} ↗</a>}
    </article>)}
  </section>;
}
