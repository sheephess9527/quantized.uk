import dynamic from 'next/dynamic';
import { translations, type Lang } from '@/lib/i18n/translations';
import MethodologyPanel from '@/components/benchmarks/MethodologyPanel';
import BenchDataTables from '@/components/benchmarks/BenchDataTables';
import BenchmarkMatrix from '@/components/benchmarks/BenchmarkMatrix';
import CoverageSection from '@/components/benchmarks/CoverageSection';
import RunStandard from '@/components/benchmarks/RunStandard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { measuredCards, TOTAL_RUNS } from '@/lib/utils/bench-coverage';
import { BENCHMARK_LICENSE_URL } from '@/lib/utils/benchmark-csv';
import { JsonLd } from '@/components/seo/JsonLd';
import { GPU_COUNT, SITE_URL } from '@/lib/site';

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

export default function BenchmarksView({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang];
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
            ? `在 ${GPU_COUNT} 张显卡中的 ${measuredCards().length} 张上实测，共 ${TOTAL_RUNS} 次运行：吞吐量（tok/s）、显存占用与困惑度保留率。`
            : `${TOTAL_RUNS} measurement runs across ${measuredCards().length} of the ${GPU_COUNT} cards in the GPU index: throughput (tok/s), VRAM usage and perplexity retained.`,
          url: `${SITE_URL}${path}/`,
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          creator: { '@type': 'Organization', name: 'quantized.uk', url: SITE_URL },
          variableMeasured: ['tokens per second', 'VRAM usage (GB)', 'perplexity retained (%)'],
          // Chosen by the site owner 2026-10-05 (Search Console flagged the
          // missing field); the terms page states the same in section 10.
          license: BENCHMARK_LICENSE_URL,
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
            .replace('{m}', String(GPU_COUNT))}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          <a
            href={BENCHMARK_LICENSE_URL}
            rel="license noopener"
            target="_blank"
            className="hover:text-slate-300 underline decoration-dotted underline-offset-2"
          >
            {t.bench.dataLicense}
          </a>{' '}
          {/* Plain <a>: the JSON is one file for both languages, not a /zh route. */}
          <a href="/data/v1/models.json" className="hover:text-slate-300 underline decoration-dotted underline-offset-2">
            {t.bench.dataJson}
          </a>
        </p>
      </div>

      <div className="space-y-10">
        <BenchmarkMatrix />
        <BenchCharts />
        <BenchDataTables lang={lang} />
        <CoverageSection lang={lang} />

        <RunStandard lang={lang} />

        <MethodologyPanel />
      </div>
    </div>
  );
}
