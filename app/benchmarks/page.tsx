'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/context';
import { matrixData } from '@/lib/data/benchmarks';
import MethodologyPanel from '@/components/benchmarks/MethodologyPanel';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

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
              <div className="h-6 w-48 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-72 rounded bg-white/[0.04] animate-pulse mt-2" />
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
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.benchmarks },
        ]}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.bench.title}</h1>
        <p className="text-slate-400">{t.bench.subtitle}</p>
      </div>

      <div className="space-y-10">
        <BenchCharts />

        {/* Matrix table */}
        <section>
          <div className="glass rounded-2xl p-6 overflow-x-auto">
            <SectionHeader title={t.bench.tableTitle} subtitle={t.bench.tableSubtitle} />
            <table className="w-full text-sm">
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
                    <td className="py-2.5 px-3 text-xs text-slate-500">{row.notes}</td>
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
