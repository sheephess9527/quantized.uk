'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/context';
import { speedBenchmarks, pplBenchmarks } from '@/lib/data/benchmarks';

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

export default function BenchCharts() {
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
    <>
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
    </>
  );
}
