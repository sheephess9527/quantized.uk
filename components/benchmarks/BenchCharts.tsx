'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/context';
import { useTheme } from '@/lib/theme/context';
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
function SpeedTick({
  x,
  y,
  payload,
  primaryFill,
  secondaryFill,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  primaryFill: string;
  secondaryFill: string;
}) {
  const [model = '', hw = ''] = String(payload?.value ?? '').split('\u0000');
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text textAnchor="end" transform="rotate(-35)" fill={primaryFill} fontSize={9} dy={0}>
        {model}
      </text>
      <text textAnchor="end" transform="rotate(-35)" fill={secondaryFill} fontSize={8} dy={10}>
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const palette = isLight
    ? {
        tickPrimary: '#334155',
        tickSecondary: '#5f7086',
        axisLabel: '#526277',
        grid: 'rgba(15, 23, 42, 0.07)',
        cursor: 'rgba(15, 23, 42, 0.04)',
        tooltipBg: '#ffffff',
        tooltipBorder: '#dce3ec',
        tooltipLabel: '#334155',
        pplLine: '#0284c7',
        lossLine: '#dc2626',
      }
    : {
        tickPrimary: '#adbac7',
        tickSecondary: '#8090a2',
        axisLabel: '#8f9fb0',
        grid: 'rgba(205, 217, 229, 0.07)',
        cursor: 'rgba(205, 217, 229, 0.05)',
        tooltipBg: '#22272e',
        tooltipBorder: 'rgba(205, 217, 229, 0.14)',
        tooltipLabel: '#c2cfde',
        pplLine: '#58a6ff',
        lossLine: '#ff7b72',
      };

  const speedData = speedBenchmarks.map((b, i) => ({
    key: `${b.model}-${b.hardware}-${b.framework}-${i}`,
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
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis
                  dataKey="axisLabel"
                  tick={<SpeedTick primaryFill={palette.tickPrimary} secondaryFill={palette.tickSecondary} />}
                  interval={0}
                  height={72}
                />
                <YAxis
                  tick={{ fill: palette.tickSecondary, fontSize: 10 }}
                  label={{ value: 'tok/s', angle: -90, position: 'insideLeft', fill: palette.axisLabel, fontSize: 11, offset: 8 }}
                />
                <Tooltip
                  cursor={{ fill: palette.cursor }}
                  contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: palette.tooltipLabel }}
                  formatter={(val: number) => [`${val} tok/s`, 'Speed']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                />
                <Bar dataKey="tokensPerSec" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {speedData.map(entry => (
                    <Cell key={entry.key} fill={entry.color} fillOpacity={0.88} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
            {frameworkKey.map(([framework, color]) => (
              <li key={framework} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color, opacity: 0.88 }} />
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
                <CartesianGrid stroke={palette.grid} />
                <XAxis
                  dataKey="quant"
                  tick={{ fill: palette.tickSecondary, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: palette.tickSecondary, fontSize: 10 }}
                  label={{ value: 'PPL', angle: -90, position: 'insideLeft', fill: palette.axisLabel, fontSize: 11 }}
                  domain={[5.5, 10]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: palette.tickSecondary, fontSize: 10 }}
                  label={{ value: 'Loss %', angle: 90, position: 'insideRight', fill: palette.axisLabel, fontSize: 11 }}
                  domain={[0, 55]}
                />
                <Tooltip
                  contentStyle={{ background: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: palette.tooltipLabel, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: palette.tickSecondary }} />
                <Line yAxisId="left"  type="monotone" dataKey="ppl"  name="PPL (abs)"   stroke={palette.pplLine} strokeWidth={2} dot={{ r: 3, fill: palette.pplLine }} />
                <Line yAxisId="right" type="monotone" dataKey="loss" name="PPL Loss (%)" stroke={palette.lossLine} strokeWidth={2} dot={{ r: 3, fill: palette.lossLine }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </>
  );
}
