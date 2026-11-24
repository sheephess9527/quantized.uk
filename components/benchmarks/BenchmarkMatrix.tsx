'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import RunProvenance from '@/components/benchmarks/RunProvenance';
import { useLanguage } from '@/lib/i18n/context';
import { matrixData } from '@/lib/data/benchmarks';
import { benchmarkCsv, benchmarkFilterFields, benchmarkFilterOptions, filterBenchmarks, type BenchmarkFilters } from '@/lib/utils/benchmark-csv';

export default function BenchmarkMatrix() {
  const { t, lang } = useLanguage();
  const bench = t.bench;
  const [filters, setFilters] = useState<BenchmarkFilters>({});
  const rows = filterBenchmarks(filters);
  const hasFilters = benchmarkFilterFields.some(field => filters[field]);
  const labels = {
    hardware: bench.colHardware,
    model: bench.colModel,
    framework: bench.matrixRuntime,
    quant: bench.cols.quant,
  };

  function download() {
    const blob = new Blob([benchmarkCsv(rows, lang)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantized-uk-benchmarks-${lang}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="benchmark-matrix-title" className="glass rounded-2xl p-4 sm:p-6">
      <h2 id="benchmark-matrix-title" className="text-xl font-bold text-slate-100">{bench.tableTitle}</h2>
      <p className="text-sm text-slate-400 mt-1">{bench.tableSubtitle}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {benchmarkFilterFields.map(field => (
          <label key={field} className="min-w-0 block text-sm font-medium text-slate-300">
            {labels[field]}
            <select
              className="block w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-2 mt-1 text-slate-100"
              value={filters[field] ?? ''}
              onChange={event => setFilters({ ...filters, [field]: event.target.value })}
            >
              <option value="">{bench.matrixAll}</option>
              {benchmarkFilterOptions[field].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="my-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={download}
          disabled={!rows.length}
          className="min-h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <Download size={16} aria-hidden="true" />
          {bench.matrixDownload}
        </button>
        {hasFilters && (
          <button type="button" onClick={() => setFilters({})} className="min-h-11 px-2 text-sm text-violet-300 hover:text-violet-200">
            {bench.matrixReset}
          </button>
        )}
        <p role="status" className="text-sm text-slate-400">
          {bench.matrixCount.replace('{shown}', String(rows.length)).replace('{total}', String(matrixData.length))}
        </p>
      </div>
      <p className="mb-4 text-sm text-slate-400">{bench.dateNote}</p>
      {rows.length ? (
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="benchmark-matrix-title">
          <table className="w-full text-sm">
            <caption className="sr-only">{bench.tableTitle} — {bench.tableSubtitle}</caption>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {Object.values(bench.cols).map(col => (
                  <th key={col} scope="col" className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-slate-200 text-xs font-medium">{row.model}</td>
                  <td className="py-2.5 px-3 text-slate-300 text-xs">{row.hardware}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs font-mono"><RunProvenance row={row} /></td>
                  <td className="py-2.5 px-3">
                    <span className="badge bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs font-mono">
                      {row.quant}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sm font-semibold text-emerald-400">{row.speedTokSec}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-cyan-400">{row.vramUsedGB} GB</td>
                  <td className="py-2.5 px-3 text-xs text-slate-400">{row.notes[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-sm text-slate-300">{bench.matrixEmpty}</p>}
    </section>
  );
}
