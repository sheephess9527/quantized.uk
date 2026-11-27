'use client';

import Link from '@/components/i18n/LocalLink';
import { useMemo } from 'react';
import { Award, Zap, Maximize2, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDisplayName, type GPU } from '@/lib/data/gpus';
import type { GpuFit } from '@/lib/utils/gpu-page';
import { usableCapacityGB } from '@/lib/utils/gpu-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import { speedQuote, streamTokS } from '@/lib/utils/speed-label';
import { liveBenchScores } from '@/lib/data/model-quality';
import { calcVRAM, getVerdict, quantWeights } from '@/lib/utils/vram';

interface ParetoPoint {
  fit: GpuFit;
  tokS: number;
  speedSource: string;
  vramPct: number;
  liveBench?: readonly [number, string];
  maxComfortCtxK: number;
  isPareto: boolean;
}

const CTX_STEPS = [4096, 8192, 16384, 32768, 65536, 131072, 262144];

function maxComfortableContextK(gpu: GPU, fit: GpuFit, batchSize: number): number {
  const cap = usableCapacityGB(gpu);
  let best = 4096;
  for (const c of CTX_STEPS) {
    if (c > fit.model.contextLength) break;
    const r = calcVRAM({
      paramsB: fit.model.params,
      layers: fit.model.arch.layers,
      kvHeads: fit.model.arch.kvHeads,
      headDim: fit.model.arch.headDim,
      attention: fit.model.arch.attention,
      ...quantWeights(fit.quant),
      contextLength: c,
      batchSize,
    });
    if (getVerdict(r.totalGB, cap) === 'green') {
      best = c;
    } else {
      break;
    }
  }
  return Math.round(best / 1024);
}

/**
 * Computes and renders the Quality × Speed × VRAM Pareto Frontier & 3 Sweet-Spot
 * picks for the current GPU, context length, and concurrency.
 * Every number comes directly from the calculator's `fitsOnGpu`, `speedQuote`,
 * `calcVRAM` and `liveBenchScores` — zero invented scores.
 */
export default function GpuParetoFrontier({
  gpu,
  fits,
  contextLength,
  batchSize,
}: {
  gpu: GPU;
  fits: GpuFit[];
  contextLength: number;
  batchSize: number;
}) {
  const { lang } = useLanguage();
  const zh = lang === 'zh';
  const cap = usableCapacityGB(gpu);

  const { points, frontier, sweetSpots } = useMemo(() => {
    const raw: ParetoPoint[] = [];
    for (const fit of fits) {
      const quote = speedQuote(gpu, fit.model, fit.quant, 128);
      const tokS = streamTokS(quote) ?? quote.point ?? 0;
      if (tokS <= 0) continue;
      raw.push({
        fit,
        tokS: Math.round(tokS),
        speedSource: quote.source,
        vramPct: Math.min(100, Math.round((fit.totalGB / cap) * 100)),
        liveBench: liveBenchScores.get(fit.model.id),
        maxComfortCtxK: maxComfortableContextK(gpu, fit, batchSize),
        isPareto: false,
      });
    }

    // Sort by parameter count desc, then speed desc to compute the Pareto frontier
    const bySize = [...raw].sort((a, b) => b.fit.model.params - a.fit.model.params || b.tokS - a.tokS);
    let maxSpeedSeen = -1;
    for (const pt of bySize) {
      if (pt.tokS > maxSpeedSeen) {
        pt.isPareto = true;
        maxSpeedSeen = pt.tokS;
      }
    }

    const paretoList = bySize.filter(p => p.isPareto).sort((a, b) => a.tokS - b.tokS);

    // 3 Sweet Spots:
    // 1. Max Capability Fit: largest parameter model on the Pareto frontier (preferring >=4 bpw)
    const maxCap = [...paretoList].sort((a, b) => {
      const a4 = a.fit.quant.bpw >= 4 ? 1 : 0;
      const b4 = b.fit.quant.bpw >= 4 ? 1 : 0;
      if (a4 !== b4) return b4 - a4;
      return b.fit.model.params - a.fit.model.params;
    })[0];

    // 2. Daily Driver Sweet Spot (≥ 35 tok/s, largest params at >= 4 bpw)
    const daily = [...raw]
      .filter(p => p.tokS >= 35 && p.fit.quant.bpw >= 4)
      .sort((a, b) => b.fit.model.params - a.fit.model.params || b.tokS - a.tokS)[0]
      ?? paretoList[Math.floor(paretoList.length / 2)];

    // 3. Long-Context Champion: highest comfortable context window × parameter size
    const longCtx = [...raw]
      .filter(p => p.fit.quant.bpw >= 4)
      .sort((a, b) => b.maxComfortCtxK - a.maxComfortCtxK || b.fit.model.params - a.fit.model.params)[0];

    return {
      points: raw,
      frontier: paretoList,
      sweetSpots: { maxCap, daily, longCtx },
    };
  }, [gpu, fits, cap, batchSize]);

  if (points.length < 3 || frontier.length < 2) return null;

  const maxTokS = Math.max(...points.map(p => p.tokS), 10);
  const maxParams = Math.max(...points.map(p => p.fit.model.params), 1);

  const cards = [
    sweetSpots.maxCap && {
      key: 'cap',
      icon: Award,
      badge: zh ? '最大体量甜点' : 'Max Capability Fit',
      accent: 'text-sky-300 border-sky-500/25 bg-sky-500/10',
      pt: sweetSpots.maxCap,
      why: zh
        ? `在 ${gpuDisplayName(gpu, lang)} 上可从容装下的最大参数档位（${sweetSpots.maxCap.fit.totalGB.toFixed(1)} / ${cap.toFixed(0)} GB）`
        : `Largest comfortable model on ${gpuDisplayName(gpu, lang)} (${sweetSpots.maxCap.fit.totalGB.toFixed(1)} / ${cap.toFixed(0)} GB)`,
    },
    sweetSpots.daily && {
      key: 'daily',
      icon: Zap,
      badge: zh ? '日常流畅甜点 (≥35 tok/s)' : 'Daily Driver Sweet Spot (≥35 tok/s)',
      accent: 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10',
      pt: sweetSpots.daily,
      why: zh
        ? `兼顾 ≥4-bit 量化保真度与 ~${sweetSpots.daily.tokS} tok/s 流畅交互速度的最佳平衡点`
        : `Best balance of ≥4-bit quantization fidelity and ~${sweetSpots.daily.tokS} tok/s interactive speed`,
    },
    sweetSpots.longCtx && {
      key: 'ctx',
      icon: Maximize2,
      badge: zh ? '长上下文冠军' : 'Long-Context Champion',
      accent: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10',
      pt: sweetSpots.longCtx,
      why: zh
        ? `混合/稀疏 KV 缓存架构，本卡可从容拉到 ${sweetSpots.longCtx.maxComfortCtxK}K 上下文`
        : `Hybrid/sparse KV cache reaches ${sweetSpots.longCtx.maxComfortCtxK}K comfortable context on this card`,
    },
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 mb-6" aria-labelledby="gpu-pareto-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Sparkles size={13} />
            {zh ? '帕累托效率前沿 · 黄金甜点决策' : 'Pareto Frontier · Sweet-Spot Decision Matrix'}
          </span>
          <h2 id="gpu-pareto-heading" className="text-lg font-bold text-slate-100 mt-1">
            {zh
              ? `${gpuDisplayName(gpu, lang)} 模型体量 × 速度 帕累托前沿（${Math.round(contextLength / 1024)}K 上下文）`
              : `${gpuDisplayName(gpu, lang)} Size × Speed Pareto Frontier (${Math.round(contextLength / 1024)}K context)`}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {zh
              ? '能装下不代表最优。下方高亮本卡在当前上下文下的 3 个「黄金甜点」与帕累托无支配前沿（即在不牺牲生成速度的前提下能跑到的最大模型体量，速度取自实测或显存带宽上限）。'
              : 'Fitting in memory is only step one. Below are the 3 sweet-spot picks and the non-dominated Pareto frontier on this card — models where no larger checkpoint runs faster (speeds from measured runs or bandwidth ceiling).'}
          </p>
        </div>
      </div>

      {/* 3 Sweet-Spot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {cards.map(({ key, icon: Icon, badge, accent, pt, why }) => {
          const levelKey = quantLevelKey(pt.fit.quant);
          return (
            <div key={key} className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-4 flex flex-col justify-between">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${accent}`}>
                  <Icon size={12} /> {badge}
                </span>
                <div className="mt-2.5 flex items-baseline justify-between gap-2">
                  <Link
                    href={`/quant-hub/${pt.fit.model.id}/`}
                    className="text-base font-bold text-slate-100 hover:text-sky-300 transition-colors"
                  >
                    {pt.fit.model.name}
                  </Link>
                  <span className="font-mono text-xs text-sky-300 shrink-0">{levelKey}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{why}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-ink/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300">
                  {pt.fit.totalGB.toFixed(1)} GB <span className="text-slate-500">({pt.vramPct}%)</span>
                </span>
                <span className="text-emerald-300">
                  {pt.speedSource === 'ceiling' ? `≤${pt.tokS}` : `~${pt.tokS}`} tok/s
                </span>
                <Link
                  href={`/tools/vram-calc/?model=${pt.fit.model.id}&gpu=${gpu.id}&quant=${encodeURIComponent(levelKey)}&ctx=${contextLength}`}
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-sans font-medium"
                >
                  {zh ? '计算器' : 'Inspect'} <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Scatter Plot + Accessible Frontier Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-xl bg-bg-recessed/70 border border-ink/[0.07] p-4">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>{zh ? 'Y 轴：模型参数量 (B)' : 'Y-axis: Model Parameters (B)'}</span>
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                {zh ? '帕累托前沿模型' : 'Pareto Frontier'}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500/50 inline-block" />
                {zh ? '其余可运行模型' : 'Other fitting models'}
              </span>
            </span>
          </div>
          <svg
            viewBox="0 0 520 210"
            className="w-full h-48 overflow-visible"
            role="img"
            aria-label={zh ? `${gpuDisplayName(gpu, lang)} 帕累托散点图` : `${gpuDisplayName(gpu, lang)} Pareto scatter chart`}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map(f => (
              <g key={f}>
                <line
                  x1={44}
                  x2={500}
                  y1={175 - f * 150}
                  y2={175 - f * 150}
                  stroke="currentColor"
                  className="text-ink/[0.07]"
                  strokeDasharray="3 3"
                />
                <text x={38} y={179 - f * 150} textAnchor="end" className="fill-slate-500 text-[10px] font-mono">
                  {Math.round(maxParams * f)}B
                </text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <text key={f} x={44 + f * 456} y={195} textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                {Math.round(maxTokS * f)} tok/s
              </text>
            ))}

            {/* Non-frontier background dots */}
            {points.filter(p => !p.isPareto).slice(0, 80).map(p => {
              const cx = 44 + Math.min(1, p.tokS / maxTokS) * 456;
              const cy = 175 - Math.min(1, p.fit.model.params / maxParams) * 150;
              return (
                <circle
                  key={p.fit.model.id}
                  cx={cx}
                  cy={cy}
                  r={3}
                  className="fill-slate-500/35"
                >
                  <title>{`${p.fit.model.name} (${quantLevelKey(p.fit.quant)}): ${p.fit.totalGB.toFixed(1)} GB · ${p.tokS} tok/s`}</title>
                </circle>
              );
            })}

            {/* Pareto Frontier Polyline */}
            {frontier.length > 1 && (
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 2"
                points={frontier
                  .map(p => {
                    const cx = 44 + Math.min(1, p.tokS / maxTokS) * 456;
                    const cy = 175 - Math.min(1, p.fit.model.params / maxParams) * 150;
                    return `${cx.toFixed(1)},${cy.toFixed(1)}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Pareto Frontier Nodes */}
            {frontier.map(p => {
              const cx = 44 + Math.min(1, p.tokS / maxTokS) * 456;
              const cy = 175 - Math.min(1, p.fit.model.params / maxParams) * 150;
              return (
                <g key={p.fit.model.id}>
                  <circle cx={cx} cy={cy} r={5} className="fill-sky-400 stroke-bg stroke-2">
                    <title>{`${p.fit.model.name} (${quantLevelKey(p.fit.quant)}): ${p.fit.totalGB.toFixed(1)} GB · ${p.tokS} tok/s`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Frontier Quick Table */}
        <div className="lg:col-span-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-ink/[0.08]">
                <th className="py-1.5 pr-2 font-medium">{zh ? '前沿模型' : 'Frontier Model'}</th>
                <th className="py-1.5 pr-2 font-medium">{zh ? '档位' : 'Quant'}</th>
                <th className="py-1.5 pr-2 font-medium text-right">{zh ? '显存' : 'VRAM'}</th>
                <th className="py-1.5 font-medium text-right">{zh ? '速度' : 'Speed'}</th>
              </tr>
            </thead>
            <tbody>
              {frontier.slice(0, 6).map(p => (
                <tr key={p.fit.model.id} className="border-b border-ink/[0.04] last:border-0">
                  <td className="py-1.5 pr-2">
                    <Link href={`/quant-hub/${p.fit.model.id}/`} className="font-medium text-slate-200 hover:text-sky-300">
                      {p.fit.model.name}
                    </Link>
                    {p.liveBench && (
                      <span className="ml-1.5 text-[10px] font-mono text-amber-300" title={`LiveBench (${p.liveBench[1]})`}>
                        LB {p.liveBench[0].toFixed(1)}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-slate-400">{quantLevelKey(p.fit.quant)}</td>
                  <td className="py-1.5 pr-2 font-mono text-right text-slate-300">{p.fit.totalGB.toFixed(1)}G</td>
                  <td className="py-1.5 font-mono text-right text-emerald-300">
                    {p.speedSource === 'ceiling' ? `≤${p.tokS}` : `~${p.tokS}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
