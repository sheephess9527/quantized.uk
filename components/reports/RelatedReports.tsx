import { translations, type Lang } from '@/lib/i18n/translations';
import { relatedReports } from '@/lib/data/performance-reports';
import { gpuDatabase, gpuDisplayName } from '@/lib/data/gpus';

export default function RelatedReports({ modelId, gpuId, lang = 'en' }: { modelId: string; gpuId?: string; lang?: Lang }) {
  const d = translations[lang].evidence;
  const reports = relatedReports(modelId, gpuId);
  return <section className="glass rounded-2xl p-5 space-y-3" aria-label={d.reports}>
    <h3 className="text-sm font-semibold text-slate-200">{d.reports}</h3>
    <p className="text-xs text-slate-400">{d.relatedOnly}</p>
    {reports.length === 0 ? <p className="text-xs text-slate-500">{d.noReports}</p> : reports.map(r => {
      const card = gpuDatabase.find(g => g.id === r.gpuId);
      return <article key={r.id} className="rounded-xl border border-white/10 p-3 space-y-2 text-xs">
        <p className="font-semibold text-cyan-300">{r.gpuCount} × {card ? gpuDisplayName(card, lang) : r.gpuId}
          {gpuId && gpuId !== r.gpuId ? ` · ${d.otherGpu}` : ''}</p>
        <p className="text-slate-200">{d.decode}: {r.decodeTokS} tok/s · {d.prefill}: {r.prefillTokS} tok/s</p>
        <p className="text-slate-400">{r.configuration[lang]}</p>
        <p className="text-amber-200/80">{r.limitations[lang]}</p>
        <p className="text-slate-500">{d.reported}: {r.reportedAt} · {d.checked}: {r.checkedAt}</p>
        <a className="inline-block py-2 text-cyan-300 hover:underline" href={r.url} target="_blank" rel="noopener noreferrer">{d.source} ↗</a>
      </article>;
    })}
    <a className="inline-block py-2 text-xs text-violet-300 hover:underline" href="https://llamaperf.com/" target="_blank" rel="noopener noreferrer">{d.browse} ↗</a>
  </section>;
}
