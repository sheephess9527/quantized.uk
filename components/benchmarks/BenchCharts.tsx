'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/context';
import { speedBenchmarks, pplBenchmarks } from '@/lib/data/benchmarks';

/** `RTX 4060 Ti 16G` → `4060 Ti`, `M3 Max 48G` → `M3 Max`. Capacity is in the tooltip. */
function shortenHardware(hw: string): string {
  return hw.replace(/^RTX /, '').replace(/ \d+G$/, '');
}

/**
 * Two-line axis tick: model on top, hardware underneath. A single angled line
 * long enough to carry both would overlap at 18 bars; two short lines fit the
 * ~55px each bar gets on desktop and stay legible on a phone.
 */
function SpeedTick({ x, y, payload }: { x?: number; y?: number; payload?: { value?: string } }) {
  const [model = '', hw = ''] = String(payload?.value ?? '').split('\u0000');
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text textAnchor="end" transform="rotate(-35)" fill="#94a3b8" fontSize={9} dy={0}>
        {model}
      </text>
      <text textAnchor="end" transform="rotate(-35)" fill="#64748b" fontSize={8} dy={10}>
        {hw}
      </text>
    </g>
  );
}

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

  const speedData = speedBenchmarks.map((b, i) => ({
    // The axis used to be derived from `hardware` alone, so 13 of the 18 bars
    // were all labelled "RTX 4090" and nothing on screen said which model or
    // framework each one measured. Every bar now names the two dimensions that
    // actually vary between them; framework stays encoded in the colour, which
    // the key underneath the chart now explains.
    key: `${b.model}-${b.hardware}-${b.framework}-${i}`,
    // Precomputed as a plain string field: a function `dataKey` on XAxis makes
    // Recharts lose the category mapping and the bars stop rendering entirely.
    axisLabel: `${b.model}\u0000${shortenHardware(b.hardware)}\u0000${i}`,
    tokensPerSec: b.tokensPerSec,
    label: `${b.model} · ${b.hardware} · ${b.framework} · ${b.quant}`,
    color: b.color,
  }));

  const frameworkKey = Array.from(
    new Map(speedBenchmarks.map(b => [b.framework, b.color])).entries(),
  );

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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedData} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="axisLabel"
                  tick={<SpeedTick />}
                  interval={0}
                  height={72}
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
                {/* The chart is already lazy-loaded (ssr:false), so it appears
                    late; animating it from zero again only delays the numbers.
                    It also makes the render deterministic for the screenshot
                    checks this repo relies on. */}
                <Bar dataKey="tokensPerSec" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {speedData.map(entry => (
                    <Cell key={entry.key} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Bar colour has always encoded the framework; nothing on the page
              said so, which made a third dimension of the chart unreadable. */}
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
            {frameworkKey.map(([framework, color]) => (
              <li key={framework} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color, opacity: 0.85 }} />
                {framework}
              </li>
            ))}
          </ul>
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
