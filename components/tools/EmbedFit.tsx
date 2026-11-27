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
  return <div className="min-h-screen bg-[#ffffff] p-2 text-[#1e293b]">
    <section className="max-w-[360px] rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-3 text-xs shadow-sm">
      {fit && snippets ? <>
        <h1 className="truncate text-sm font-semibold" title={fit.model.name}>{fit.model.name}</h1>
        <p>{quantLevelKey(fit.quant)} · {fit.ctx.toLocaleString(lang)} {t.embed.tokens}</p>
        <p className="mt-1 truncate" title={fit.gpuLabel}>{fit.gpuLabel} · {embedMemoryLabel(fit, lang)}</p>
        <div className="my-2 flex items-center justify-between gap-2"><span>{t.embed.needed.replace('{gb}', fit.result.totalGB.toFixed(2))}</span>
          <strong className={`rounded-full px-2 py-1 ${fit.verdict === 'green' ? 'bg-[#d1fae5] text-[#065f46]' : fit.verdict === 'yellow' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>{snippets.verdict}</strong></div>
      </> : <p className="mb-3">{t.embed.invalid}</p>}
      <Link className="text-[#0369a1] underline" href={snippets?.calculator ?? '/tools/vram-calc/?utm_source=embed'} target="_blank" rel="noopener">{t.embed.check}</Link>
    </section>
  </div>;
}
