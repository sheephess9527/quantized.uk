'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/context';
import { speedBenchmarks, pplBenchmarks, matrixData } from '@/lib/data/benchmarks';
import MethodologyPanel from '@/components/benchmarks/MethodologyPanel';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const SPEED_COLORS = ['#7c3aed', '#7c3aed', '#7c3aed', '#06b6d4', '#06b6d4', '#22c55e', '#22c55e', '#22c55e'];

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

  const speedData = speedBenchmarks.map(b => ({
    name: `${b.hardware}\n${b.framework}`,
    shortName: b.hardware.replace('RTX ', 'RTX\n').replace('M3 ', 'M3\n').replace('M2 ', 'M2\n'),
    tokensPerSec: b.tokensPerSec,
    label: `${b.model} · ${b.hardware} · ${b.framework} · ${b.quant}`,
    color: b.color,
  }));

  const pplData = pplBenchmarks.map(b => ({
    quant: b.quant,
    ppl: b.ppl,
    loss: parseFloat(b.pplLossPercent.toFixed(2)),
  }));

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
        {/* Speed chart */}
        <section>
          <div className="glass rounded-2xl p-6">
            <SectionHeader title={t.bench.speedTitle} subtitle={t.bench.speedSubtitle} />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedData} margin={{ top: 4, right: 16, left: 0, bottom: 48 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'tok/s', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11, offset: 8 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(val: number) => [`${val} tok/s`, 'Speed']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                  />
                  <Bar dataKey="tokensPerSec" radius={[4, 4, 0, 0]}>
                    {speedData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Perplexity chart */}
        <section>
          <div className="glass rounded-2xl p-6">
            <SectionHeader title={t.bench.pplTitle} subtitle={t.bench.pplSubtitle} />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pplData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="quant"
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'PPL', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
                    domain={[5.5, 10]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    label={{ value: 'Loss %', angle: 90, position: 'insideRight', fill: '#475569', fontSize: 11 }}
                    domain={[0, 55]}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  <Line yAxisId="left"  type="monotone" dataKey="ppl"  name="PPL (abs)"   stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} />
                  <Line yAxisId="right" type="monotone" dataKey="loss" name="PPL Loss (%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

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
