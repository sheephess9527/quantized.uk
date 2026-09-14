'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/context';
import { matrixData } from '@/lib/data/benchmarks';
import MethodologyPanel from '@/components/benchmarks/MethodologyPanel';
import BenchDataTables from '@/components/benchmarks/BenchDataTables';
import CoverageSection from '@/components/benchmarks/CoverageSection';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { gpuDatabase } from '@/lib/data/gpus';
import { measuredCards, TOTAL_RUNS } from '@/lib/utils/bench-coverage';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';

// Recharts is the heaviest chunk on this page; defer it so the header,
// matrix table and methodology render immediately. Skeletons mirror the
// two chart cards (h-72 / h-64 + header) to avoid layout shift.
const BenchCharts = dynamic(() => import('@/components/benchmarks/BenchCharts'), {
  ssr: false,
  loading: () => (
    <>
      {[288, 256].map(h => (
        <section key={h}>
          <div className="glass rounded-2xl p-6">
            <div className="mb-5">
              <div className="h-6 w-full max-w-[12rem] rounded bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-full max-w-[18rem] rounded bg-white/[0.04] animate-pulse mt-2" />
            </div>
            <div className="rounded-xl bg-white/[0.03] animate-pulse" style={{ height: h }} />
          </div>
        </section>
      ))}
    </>
  ),
});

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

export default function BenchmarksPage() {
  const { t, lang } = useLanguage();

  const path = lang === 'zh' ? '/zh/benchmarks' : '/benchmarks';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/*
        QTZ-031: a Dataset entity for the one page on the site that reports
        primary measurements rather than a derived figure. `variableMeasured`
        names exactly the three columns the matrix table renders — no metric
        claimed here that the table does not show.
      */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'quantized.uk hardware benchmark matrix',
          description: lang === 'zh'
            ? `在 ${gpuDatabase.length} 张显卡中的 ${measuredCards().length} 张上实测，共 ${TOTAL_RUNS} 次运行：吞吐量（tok/s）、显存占用与困惑度保留率。`
            : `${TOTAL_RUNS} measurement runs across ${measuredCards().length} of the ${gpuDatabase.length} cards in the GPU index: throughput (tok/s), VRAM usage and perplexity retained.`,
          url: `${SITE_URL}${path}/`,
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          creator: { '@type': 'Organization', name: 'quantized.uk', url: SITE_URL },
          variableMeasured: ['tokens per second', 'VRAM usage (GB)', 'perplexity retained (%)'],
        }}
      />
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.benchmarks },
        ]}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.bench.title}</h1>
        <p className="text-slate-400 mb-3">{t.bench.subtitle}</p>
        {/*
          QTZ-031: the page used to say "measured on real hardware" without
          saying how much of it — a reader had no way to tell a measured row
          from an estimated one elsewhere on the site. Named counts, derived
          from the same data CoverageSection below lists in full.
        */}
        <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
          {t.bench.coverageIntro
            .replace('{r}', String(TOTAL_RUNS))
            .replace('{c}', String(measuredCards().length))
            .replace('{m}', String(gpuDatabase.length))}
        </p>
      </div>

      <div className="space-y-10">
        <BenchCharts />
        <BenchDataTables />
        <CoverageSection />

        {/* Matrix table */}
        <section>
          <div className="glass rounded-2xl p-6 overflow-x-auto">
            <SectionHeader title={t.bench.tableTitle} subtitle={t.bench.tableSubtitle} />
            <table className="w-full text-sm">
              {/* Visually redundant with the SectionHeader above, but a table
                  needs its own accessible name — screen readers announce the
                  caption when entering table navigation mode. */}
              <caption className="sr-only">
                {t.bench.tableTitle} — {t.bench.tableSubtitle}
              </caption>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {Object.values(t.bench.cols).map(col => (
                    <th key={col} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-slate-200 text-xs font-medium">{row.model}</td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs">{row.hardware}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs font-mono">{row.framework}</td>
                    <td className="py-2.5 px-3">
                      <span className="badge bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs font-mono">
                        {row.quant}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-sm font-semibold text-emerald-400">{row.speedTokSec}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-cyan-400">{row.vramUsedGB} GB</td>
                    <td className="py-2.5 px-3 text-xs text-slate-500">{row.notes[lang]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <MethodologyPanel />
      </div>
    </div>
  );
}
