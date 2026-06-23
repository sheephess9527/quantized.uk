'use client';

import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/context';
import { formatRadarData, quantFormats } from '@/lib/data/formats';

const FORMAT_COLORS: Record<string, string> = {
  GGUF: '#7c3aed',
  AWQ:  '#06b6d4',
  EXL2: '#f97316',
  GPTQ: '#22c55e',
  HQQ:  '#eab308',
};

export default function FormatRadar() {
  const { t } = useLanguage();
  const [active, setActive] = useState<Record<string, boolean>>({ GGUF: true, AWQ: true, EXL2: true, GPTQ: false, HQQ: false });

  const toggleFormat = (name: string) =>
    setActive(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="section-title text-lg">{t.home.radar.title}</h2>
        <p className="section-subtitle text-xs mt-0.5">{t.home.radar.subtitle}</p>
      </div>

      {/* Format toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quantFormats.map(fmt => (
          <button
            key={fmt.id}
            onClick={() => toggleFormat(fmt.name)}
            className="badge text-xs font-mono font-medium transition-all duration-150"
            style={
              active[fmt.name]
                ? { background: `${fmt.color}20`, color: fmt.color, borderColor: `${fmt.color}35` }
                : { background: 'transparent', color: '#475569', borderColor: 'rgba(255,255,255,0.06)' }
            }
          >
            {fmt.name}
          </button>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={formatRadarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#334155', fontSize: 8 }}
              tickCount={4}
            />
            <Tooltip
              contentStyle={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            {Object.entries(FORMAT_COLORS).map(([name, color]) =>
              active[name] ? (
                <Radar
                  key={name}
                  name={name}
                  dataKey={name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                  dot={false}
                />
              ) : null
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
