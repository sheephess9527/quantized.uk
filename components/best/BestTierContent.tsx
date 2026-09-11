'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import { bestPage, type BestTier } from '@/lib/utils/best-page';
import { gpuSlug, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { formatLoss } from '@/lib/utils/quality';

/**
 * "Best local LLM for {N}GB" — a recommendation, not another list.
 *
 * Everything is computed (`best-page.ts`) and the picks come from the same
 * `homePicks` the homepage hero uses, so this page and the homepage cannot
 * recommend different models for the same card. The `Cards this applies to`
 * block is the other half of the job: it links every card at the tier, which
 * is where the GPU pages get an inbound link from something other than the
 * index.
 */
export default function BestTierContent({ tier }: { tier: BestTier }) {
  const { t, lang } = useLanguage();
  const b = t.best;
  const { picks, cards, nearMiss, ladder, appleLadder, fitCount, faqs } = bestPage(tier);
  const total = models.length;

  const fill = (s: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s);

  const label = tier.kind === 'apple' ? b.appleLabel : `${tier.vram}GB`;
  const useCaseLabel = (u: string) =>
    u === 'chat' ? b.useChat : u === 'code' ? b.useCode : b.useVision;

  const chat = picks.find(p => p.useCases.includes('chat'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: b.hubTitle, href: '/best/' },
          { label: fill(b.tierTitle, { label }) },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-3">{fill(b.tierTitle, { label })}</h1>
        {/*
          The answer first, in the first sentence. A page that opens by
          explaining what quantization is has already lost the reader who typed
          "best local llm 16gb" — and given an AI engine nothing to lift.
        */}
        {chat && (
          <p className="text-slate-300 max-w-3xl leading-relaxed">
            <span className="font-semibold text-slate-100">{b.shortAnswer}</span>{' '}
            {fill(b.shortAnswerBody, {
              model: chat.model.name,
              quant: quantLevelKey(chat.quant),
              vram: chat.totalGB.toFixed(1),
              label,
              headroom: chat.headroomGB.toFixed(1),
              others: picks
                .filter(p => !p.useCases.includes('chat'))
                .map(p => `${p.model.name} (${p.useCases.map(useCaseLabel).join(' / ')})`)
                .join(', '),
            })}
          </p>
        )}
        <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">{b.bestMeans}</p>
      </div>

      <div className="space-y-6">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">{b.picksTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                  <th scope="col" className="font-medium py-2 pr-3">{b.colUse}</th>
                  <th scope="col" className="font-medium py-2 pr-3">{b.colModel}</th>
                  <th scope="col" className="font-medium py-2 pr-3">{b.colQuant}</th>
                  <th scope="col" className="font-medium py-2 pr-3 text-right">{b.colVram}</th>
                  <th scope="col" className="font-medium py-2 pr-3 text-right">{b.colHeadroom}</th>
                  <th scope="col" className="font-medium py-2 pr-3 text-right">{b.colLoss}</th>
                  <th scope="col" className="font-medium py-2">{b.colWhy}</th>
                </tr>
              </thead>
              <tbody>
                {picks.map(p => (
                  <tr key={p.model.id} className="border-b border-white/[0.04] align-top">
                    <td className="py-3 pr-3 text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
                      {p.useCases.map(useCaseLabel).join(' · ')}
                    </td>
                    <td className="py-3 pr-3">
                      <Link href={`/quant-hub/${p.model.id}/`} className="text-slate-200 font-medium hover:text-violet-300">
                        {p.model.name}
                      </Link>
                      <span className="block text-xs text-slate-500 font-mono">{p.model.paramLabel}</span>
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-400">{quantLevelKey(p.quant)}</td>
                    <td className="py-3 pr-3 text-right font-mono text-slate-300">{p.totalGB.toFixed(1)} GB</td>
                    <td className="py-3 pr-3 text-right font-mono text-slate-400">{p.headroomGB.toFixed(1)} GB</td>
                    <td className="py-3 pr-3 text-right font-mono text-xs text-slate-400">{formatLoss(p.quant)}</td>
                    <td className="py-3 text-xs text-slate-400 leading-relaxed max-w-md">{p.why[lang]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            {fill(b.picksNote, { ctx: GPU_PAGE_CONTEXT / 1024, count: fitCount, total })}
          </p>
        </section>

        {cards.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2">{fill(b.cardsTitle, { label })}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">{b.cardsBody}</p>
            <ul className="flex flex-wrap gap-2">
              {cards.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/gpu/${gpuSlug(c)}/`}
                    className="inline-flex items-center min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-white/[0.07] hover:border-violet-500/30 hover:text-violet-300 transition-colors"
                  >
                    {c.name}
                    {c.bandwidth && <span className="ml-1.5 font-mono text-slate-500">{c.bandwidth.toLocaleString('en-US')} GB/s</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nearMiss && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            {/*
              The boundary is the half a list never gives, and it is the part an
              AI engine is most likely to quote — "what does NOT fit" is a
              question no competitor with no data can answer.
            */}
            <h2 className="text-lg font-bold text-slate-100 mb-2">{b.notFitTitle}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {fill(b.notFitBody, {
                model: nearMiss.model.name,
                quant: quantLevelKey(nearMiss.quant),
                needs: nearMiss.totalGB.toFixed(1),
                over: nearMiss.overBy.toFixed(1),
                label,
                ctx: GPU_PAGE_CONTEXT / 1024,
              })}
            </p>
          </section>
        )}

        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{b.contextTitle}</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            {fill(b.contextBody, {
              a: ladder[0].count,
              actx: ladder[0].context / 1024,
              b: ladder[1].count,
              bctx: ladder[1].context / 1024,
              c: ladder[2].count,
              cctx: ladder[2].context / 1024,
            })}
          </p>
          <Link href="/tools/vram-calc/" className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300">
            {b.contextCta} <ArrowRight size={14} />
          </Link>
        </section>

        {appleLadder && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2">{b.appleLadderTitle}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">{b.appleLadderBody}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                    <th scope="col" className="font-medium py-2 pr-3">{b.colMemory}</th>
                    <th scope="col" className="font-medium py-2 pr-3">{b.colLargest}</th>
                    <th scope="col" className="font-medium py-2 text-right">{b.colFits}</th>
                  </tr>
                </thead>
                <tbody>
                  {appleLadder.map(row => (
                    <tr key={row.vram} className="border-b border-white/[0.04]">
                      <td className="py-2.5 pr-3 font-mono text-slate-300">{row.vram} GB</td>
                      <td className="py-2.5 pr-3 text-slate-400">
                        {row.model ? (
                          <Link href={`/quant-hub/${row.model.id}/`} className="hover:text-violet-300">
                            {row.model.name}
                          </Link>
                        ) : '—'}
                        {row.totalGB !== undefined && (
                          <span className="text-slate-500 font-mono text-xs"> · {row.totalGB.toFixed(1)} GB</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">{b.faqTitle}</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{f.q[lang]}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.a[lang]}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
