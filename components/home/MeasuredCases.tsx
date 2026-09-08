'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { matrixData } from '@/lib/data/benchmarks';
import { benchmarkMethodology, dataSources } from '@/lib/data/meta';

/**
 * Six rows of the benchmark matrix, chosen to span hardware classes rather
 * than to flatter one card — a reader on a 4060 Ti or an M3 should see their
 * own class of machine in the sample, not only a 4090.
 *
 * Every row carries the hardware and the framework it was run on, and the
 * methodology line under the table names the model, dataset, context and batch
 * these figures are for. A speed number without those four is not a
 * measurement, it is a rumour.
 */
const SAMPLE_KEYS = [
  ['Llama 3.1 8B', 'RTX 4090 24G', 'ExLlamaV2'],
  ['Qwen3 30B-A3B', 'RTX 4090 24G', 'llama.cpp'],
  ['Llama 3.1 8B', 'RTX 4060 Ti 16G', 'llama.cpp'],
  ['Qwen2.5 7B', 'RTX 4060 Ti 16G', 'llama.cpp'],
  ['Llama 3.1 8B', 'M3 Max 48G', 'Ollama'],
  ['Llama 3.1 8B', 'RTX 3090 24G', 'ExLlamaV2'],
] as const;

const sample = SAMPLE_KEYS.map(([model, hardware, framework]) =>
  matrixData.find(r => r.model === model && r.hardware === hardware && r.framework === framework),
).filter((r): r is (typeof matrixData)[number] => r !== undefined);

export default function MeasuredCases() {
  const { t, lang } = useLanguage();
  const m = t.home.measured;

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="section-title text-lg flex items-center gap-2">
          <FlaskConical size={16} className="text-emerald-400" />
          {m.title}
        </h2>
        <p className="section-subtitle text-xs mt-0.5">{m.subtitle}</p>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-slate-600 border-b border-white/[0.06]">
              <th scope="col" className="font-medium py-2 pr-3">{m.colModel}</th>
              <th scope="col" className="font-medium py-2 pr-3">{m.colHardware}</th>
              <th scope="col" className="font-medium py-2 pr-3">{m.colStack}</th>
              <th scope="col" className="font-medium py-2 pr-3 text-right">{m.colSpeed}</th>
              <th scope="col" className="font-medium py-2 text-right">{m.colVram}</th>
            </tr>
          </thead>
          <tbody>
            {sample.map(row => (
              <tr key={`${row.model}-${row.hardware}-${row.framework}`} className="border-b border-white/[0.04]">
                <td className="py-2.5 pr-3 text-slate-200">{row.model}</td>
                <td className="py-2.5 pr-3 text-slate-400 font-mono text-xs">{row.hardware}</td>
                <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">
                  {row.framework} · {row.quant}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-emerald-300">{row.speedTokSec}</td>
                <td className="py-2.5 text-right font-mono text-slate-400">{row.vramUsedGB} GB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
        {m.methodology
          .replace('{model}', benchmarkMethodology.model)
          .replace('{dataset}', benchmarkMethodology.dataset)
          .replace('{ctx}', String(benchmarkMethodology.context))
          .replace('{batch}', String(benchmarkMethodology.batch))}
      </p>
      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dataSources.benchmarks[lang]}</p>

      <Link
        href="/benchmarks/"
        className="inline-flex items-center gap-1 mt-2 min-h-[44px] text-xs text-emerald-400 hover:text-emerald-300"
      >
        {m.cta} <ArrowRight size={12} />
      </Link>
    </section>
  );
}
