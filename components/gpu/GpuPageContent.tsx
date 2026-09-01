'use client';

import Link from '@/components/i18n/LocalLink';
import { Cpu, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { fitsOnGpu, groupFitsByBucket, gpuSlug, nextStepUp, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
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

      <p className="sr-only" lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
        {fill(g.subtitle, { count: fits.length, total, vram: gpu.vram })}
      </p>
    </div>
  );
}
