'use client';

import { useLanguage } from '@/lib/i18n/context';
import { speedBenchmarks, pplBenchmarks } from '@/lib/data/benchmarks';
import ChartTable from '@/components/benchmarks/ChartTable';

/**
 * Text equivalent for the two charts above.
 *
 * Deliberately **not** inside `BenchCharts`. That component is loaded through
 * `next/dynamic` with `ssr: false` to keep Recharts off the first load, which
 * means anything living in it is absent from the exported HTML — so a text
 * alternative placed there would exist only after hydration, for readers who
 * are running the chart bundle anyway. Rendered from here it ships in the
 * static document: available to a screen reader before any JavaScript runs,
 * and indexable.
 */
export default function BenchDataTables() {
  const { t } = useLanguage();

  return (
    <section className="glass rounded-2xl p-6 space-y-2">
      <h2 className="text-sm font-semibold text-slate-300">{t.bench.tablesTitle}</h2>
      <p className="text-xs text-slate-500">{t.bench.tablesSubtitle}</p>

      <ChartTable
        caption={t.bench.speedTitle}
        toggleLabel={t.bench.showSpeedTable}
        columns={[t.bench.colModel, t.bench.colHardware, t.bench.colFramework, t.bench.colQuant, t.bench.colSpeed]}
        rows={speedBenchmarks.map(b => [b.model, b.hardware, b.framework, b.quant, b.tokensPerSec])}
      />
      <ChartTable
        caption={t.bench.pplTitle}
        toggleLabel={t.bench.showPplTable}
        columns={[t.bench.colQuant, t.bench.colPpl, t.bench.colPplLoss]}
        rows={pplBenchmarks.map(b => [b.quant, b.ppl, `${b.pplLossPercent.toFixed(2)}%`])}
      />
    </section>
  );
}
