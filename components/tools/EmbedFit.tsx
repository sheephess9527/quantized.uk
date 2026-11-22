'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import { useUrlQuery } from '@/lib/hooks/useUrlQuery';
import { parseEmbedFit, buildEmbedSnippets, embedMemoryLabel } from '@/lib/utils/embed-fit';
import { quantLevelKey } from '@/lib/utils/recommend';

export default function EmbedFit() {
  const { lang, t } = useLanguage();
  const fit = parseEmbedFit(useUrlQuery());
  const snippets = fit ? buildEmbedSnippets(fit, lang) : null;
  return <div className="min-h-screen bg-white p-2 text-slate-800">
    <section className="max-w-[360px] rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
      {fit && snippets ? <>
        <h1 className="truncate text-sm font-semibold" title={fit.model.name}>{fit.model.name}</h1>
        <p>{quantLevelKey(fit.quant)} · {fit.ctx.toLocaleString(lang)} {t.embed.tokens}</p>
        <p className="mt-1 truncate" title={fit.gpuLabel}>{fit.gpuLabel} · {embedMemoryLabel(fit, lang)}</p>
        <div className="my-2 flex items-center justify-between gap-2"><span>{t.embed.needed.replace('{gb}', fit.result.totalGB.toFixed(2))}</span>
          <strong className={`rounded-full px-2 py-1 ${fit.verdict === 'green' ? 'bg-emerald-100 text-emerald-800' : fit.verdict === 'yellow' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'}`}>{snippets.verdict}</strong></div>
      </> : <p className="mb-3">{t.embed.invalid}</p>}
      <Link className="text-blue-700 underline" href={snippets?.calculator ?? '/tools/vram-calc/?utm_source=embed'} target="_blank" rel="noopener">{t.embed.check}</Link>
    </section>
  </div>;
}
