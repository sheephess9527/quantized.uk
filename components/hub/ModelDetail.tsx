'use client';

import Link from 'next/link';
import { ArrowLeft, Calculator, ExternalLink, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { QuantModel } from '@/lib/data/models';
import { cn } from '@/lib/utils/cn';
import { quantLevelKey } from '@/lib/utils/recommend';
import { getHFStats, formatDownloads, hfStats } from '@/lib/data/hf-stats';
import { hfRepoMap } from '@/lib/data/hf-repos';

const formatColors: Record<string, string> = {
  GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
};

const hwColors: Record<string, string> = {
  'consumer-gpu': 'bg-green-500/10 text-green-400 border-green-500/20',
  mac: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'cpu-vps': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'pro-gpu': 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  model: QuantModel;
}

export default function ModelDetail({ model }: Props) {
  const { t, lang } = useLanguage();
  const d = t.hub.detail;
  const hf = getHFStats(model.id);
  const hfRepo = hf?.repo ?? hfRepoMap[model.id];

  const bestQuant = model.quants.reduce((best, q) =>
    q.pplLossPercent < best.pplLossPercent ? q : best,
  model.quants[0]);

  const defaultQuant = model.quants.find(q => q.level === 'Q4_K_M')
    ?? model.quants.find(q => q.format === 'GGUF')
    ?? model.quants[0];

  const calcUrl = (quantLevel: string) =>
    `/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(quantLevel)}&ctx=4096&batch=1`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link
        href="/quant-hub/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        {d.backToHub}
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <h1 className="text-3xl font-bold text-slate-100">{model.name}</h1>
          <span className="badge bg-white/[0.05] text-slate-400 border-white/[0.08] font-mono">
            {model.paramLabel}
          </span>
        </div>
        <p className="text-slate-500 mb-2">{model.family}</p>
        <p className="text-slate-400 max-w-3xl leading-relaxed">{model.description[lang]}</p>

        {hf && hf.downloads > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
            <span>⬇ {formatDownloads(hf.downloads)} {d.hfDownloads}</span>
            <span>♥ {hf.likes} {d.hfLikes}</span>
            {hfRepo && (
              <a href={`https://huggingface.co/${hfRepo}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-mono">
                {hfRepo}
              </a>
            )}
            <span className="text-slate-700">· {d.hfFetched} {new Date(hfStats.fetchedAt).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {model.hardwareTags.map(hw => (
            <span key={hw} className={cn('badge text-xs', hwColors[hw])}>
              {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: d.context, value: model.contextLength >= 1000 ? `${(model.contextLength / 1000).toFixed(0)}K` : String(model.contextLength) },
          { label: d.variants, value: String(model.quants.length) },
          { label: d.bestQuality, value: `${bestQuant.format} ${bestQuant.level}` },
          { label: d.bestAccuracy, value: `${(100 - bestQuant.pplLossPercent).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-gradient">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href={calcUrl(quantLevelKey(defaultQuant))}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          <Calculator size={14} />
          {d.calcVram}
        </Link>
        <a
          href={hfRepo ? `https://huggingface.co/${hfRepo}` : (model.quants[0]?.hfSearchUrl ?? '#')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-slate-300 text-sm font-semibold transition-colors"
        >
          {t.hub.model.viewHF}
          <ExternalLink size={14} />
        </a>
        <Link
          href={`/tools/compare/?a=${model.id}&b=qwen2.5-7b`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-slate-300 text-sm font-semibold transition-colors"
        >
          {d.compare}
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-slate-200">{d.quantTable}</h2>
          <p className="text-xs text-slate-500 mt-1">{d.quantTableSub}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 font-medium">{d.colFormat}</th>
                <th className="text-left px-3 py-3 font-medium">{d.colLevel}</th>
                <th className="text-right px-3 py-3 font-medium">{d.colBpw}</th>
                <th className="text-right px-3 py-3 font-medium">{d.colVram}</th>
                <th className="text-right px-3 py-3 font-medium">{d.colPplLoss}</th>
                <th className="text-right px-3 py-3 font-medium">{d.colSpeed}</th>
                <th className="text-right px-5 py-3 font-medium">{d.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {model.quants.map((quant, i) => {
                const level = quantLevelKey(quant);
                const isBest = quant.pplLossPercent === bestQuant.pplLossPercent;
                return (
                  <tr
                    key={`${quant.format}-${quant.level}-${i}`}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className={cn('badge text-xs font-mono', formatColors[quant.format])}>
                        {quant.format}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        {quant.level}
                        {isBest && <Zap size={10} className="text-yellow-500" />}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">{quant.bpw}</td>
                    <td className="px-3 py-3 text-right font-mono text-violet-300">{quant.vramGB.toFixed(1)} GB</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">{quant.pplLossPercent.toFixed(1)}%</td>
                    <td className="px-3 py-3 text-right font-mono text-orange-300">
                      {quant.speedRTX4090 ? `${quant.speedRTX4090} tok/s` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={calcUrl(level)}
                          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {d.calc}
                        </Link>
                        <a
                          href={quant.hfSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-0.5"
                        >
                          HF
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}