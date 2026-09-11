'use client';

import Link from '@/components/i18n/LocalLink';
import { Cpu, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { countModelsFitting, fitsOnGpu, groupFitsByBucket, gpuSlug, nextStepUp, sameBudgetCards, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { measuredRowsFor } from '@/lib/utils/measured-runs';
import { gpuExplainer } from '@/lib/utils/gpu-explainer';
import { quantLevelKey } from '@/lib/utils/recommend';

/**
 * "What can my card run" — the question the GPU data could always answer but
 * only ever answered as a filter parameter, never as a page. Everything here is
 * derived from `gpuDatabase` + the model index at build time, so these pages
 * cost no new data and cannot disagree with the calculator.
 */
export default function GpuPageContent({ gpu }: { gpu: GPU }) {
  const { t, lang } = useLanguage();
  const g = t.gpuPage;

  const fits = fitsOnGpu(gpu);
  const groups = groupFitsByBucket(fits);
  const step = nextStepUp(gpu, fits.length);
  const siblings = sameBudgetCards(gpu);
  const measured = measuredRowsFor(gpu);
  // Both counts, side by side with their conditions. The Hub's GPU chips use
  // the looser rule; showing only one number here left two pages disagreeing
  // (51 vs 60) with nothing on either saying why.
  const tightExtra = countModelsFitting(gpu, 'tight') - fits.length;
  // The decision summary and the FAQ. Same call the page route uses for the
  // FAQPage schema, so the visible questions and the structured ones cannot
  // drift apart.
  const x = gpuExplainer(gpu);
  const total = models.length;

  const fill = (s: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: g.allGpus, href: '/gpu/' },
          { label: gpu.name },
        ]}
      />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
          <Cpu size={12} /> {gpu.vram}GB {g.vramLabel}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{fill(g.title, { gpu: gpu.name })}</h1>
        <p className="text-slate-400 max-w-3xl">
          {fill(g.subtitle, { count: fits.length, total, vram: gpu.vram })}
        </p>
      </div>

      {/*
        Until this block existed these 61 pages were the same page with a name
        swapped in — the fit list is a function of VRAM alone, so every 16 GB
        card returned identical rows. What separates them is how fast the card
        can read the weights, which is now a vendor spec in `gpuDatabase`.
      */}
      <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{fill(g.shortTitle, { gpu: gpu.name })}</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">{x.specLine[lang]}</p>

        <dl className="space-y-3">
          {x.rows.map(row => (
            <div key={row.kind} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 pt-0.5">
                {row.kind === 'biggest' ? g.rowBiggest : row.kind === 'headroom' ? g.rowHeadroom : g.rowSpeed}
              </dt>
              <dd className="text-sm text-slate-300 leading-relaxed">
                {row.fit && (
                  <Link href={`/quant-hub/${row.fit.model.id}/`} className="font-medium text-slate-200 hover:text-violet-300">
                    {row.fit.model.name}
                  </Link>
                )}
                {row.fit ? ' — ' : ''}
                <span className="text-slate-400">{row.detail[lang]}</span>
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4 border-t border-white/[0.05] pt-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 pt-0.5">{g.wallTitle}</dt>
            <dd className="text-sm text-slate-400 leading-relaxed">{x.ceiling[lang]}</dd>
          </div>
        </dl>
      </section>

      {fits.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-slate-400">{fill(g.noFits, { vram: gpu.vram })}</p>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <section key={group.bucket} className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">
                {group.bucket} <span className="text-sm font-normal text-slate-500">· {group.fits.length}</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    {fill(g.title, { gpu: gpu.name })} — {group.bucket}
                  </caption>
                  <thead>
                    <tr className="border-b border-white/[0.06] text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-2 px-3 font-semibold">{g.tableModel}</th>
                      <th className="text-left py-2 px-3 font-semibold">{g.tableQuant}</th>
                      <th className="text-right py-2 px-3 font-semibold">{g.tableVram}</th>
                      <th className="text-right py-2 px-3 font-semibold">{g.tableHeadroom}</th>
                      <th className="text-right py-2 px-3 font-semibold">{g.tableSpeed}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.fits.map(fit => (
                      <tr key={fit.model.id} className="border-b border-white/[0.04] last:border-0">
                        <td className="py-2.5 px-3">
                          <Link href={`/quant-hub/${fit.model.id}/`} className="text-slate-200 hover:text-violet-300">
                            {fit.model.name}
                          </Link>
                          <span className="block text-xs text-slate-600">{fit.model.paramLabel}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-cyan-300">{quantLevelKey(fit.quant)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-300">{fit.totalGB} GB</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-emerald-400">+{fit.headroomGB} GB</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-500">
                          {fit.quant.speedRTX4090 ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
        <h2 className="text-lg font-bold text-slate-100 mb-3">{g.methodTitle}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{g.methodBody}</p>
        {tightExtra > 0 && (
          <p className="text-sm text-slate-500 leading-relaxed mt-3">
            {fill(g.alsoTight, { extra: tightExtra })}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            href={`/tools/vram-calc/?mode=reverse&gpu=${gpu.id}&ctx=${GPU_PAGE_CONTEXT}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300"
          >
            {g.openCalc} <ArrowRight size={14} />
          </Link>
          <Link
            href="/quant-hub/"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-500 hover:text-slate-300"
          >
            {fill(g.browseHub, { total })}
          </Link>
        </div>
      </section>

      {/*
        Measured runs, or an explicit statement that there are none.
        Four of the 43 cards have rows in the benchmark matrix. Without this
        section every page reads as though its numbers were observed, and the
        four pages that *do* have observations get no credit for it.
      */}
      <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
        <h2 className="text-lg font-bold text-slate-100 mb-3">{g.measuredTitle}</h2>
        {measured.length > 0 ? (
          <>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {fill(g.measuredBody, { count: measured.length, gpu: gpu.name })}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                    <th scope="col" className="font-medium py-2 pr-3">{g.colModel}</th>
                    <th scope="col" className="font-medium py-2 pr-3">{g.colStack}</th>
                    <th scope="col" className="font-medium py-2 pr-3 text-right">{g.colSpeed}</th>
                    <th scope="col" className="font-medium py-2 text-right">{g.colVram}</th>
                  </tr>
                </thead>
                <tbody>
                  {measured.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3 text-slate-200">{row.model}</td>
                      <td className="py-2 pr-3 text-slate-500 font-mono text-xs">{row.framework} · {row.quant}</td>
                      <td className="py-2 pr-3 text-right font-mono text-emerald-300">{row.speedTokSec}</td>
                      <td className="py-2 text-right font-mono text-slate-400">{row.vramUsedGB} GB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 leading-relaxed">{fill(g.measuredNone, { gpu: gpu.name })}</p>
        )}
      </section>

      {/*
        Cards with the same memory budget return the same list, because the
        list is a function of VRAM. Saying so — and linking them — is what
        stops 43 pages from being 43 near-copies: measured before this change,
        `rtx-4070` and `rtx-4070-super` shared 97% of their 5-grams.
      */}
      {siblings.length > 0 && (
        <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{g.sameBudgetTitle}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {fill(g.sameBudgetBody, { vram: gpu.vram })}
          </p>
          <ul className="flex flex-wrap gap-2 mt-3">
            {siblings.map(sib => (
              <li key={sib.id}>
                <Link
                  href={`/gpu/${gpuSlug(sib)}/`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 min-h-[44px] text-sm text-slate-300 hover:border-violet-500/25 hover:text-white transition-all"
                >
                  <span aria-hidden>{sib.icon}</span> {sib.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step && (
        <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{g.stepUpTitle}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {fill(g.stepUpBody, { gpu: step.gpu.name, vram: step.gpu.vram, extra: step.extraModels })}{' '}
            <Link href={`/gpu/${gpuSlug(step.gpu)}/`} className="text-violet-400 hover:text-violet-300">
              {step.gpu.name} →
            </Link>
          </p>
        </section>
      )}

      {x.faqs.length > 0 && (
        <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">{g.faqTitle}</h2>
          <div className="space-y-4">
            {x.faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">{f.q[lang]}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.a[lang]}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="sr-only" lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
        {fill(g.subtitle, { count: fits.length, total, vram: gpu.vram })}
      </p>
    </div>
  );
}
