'use client';

import { useState, useMemo } from 'react';
import Link from '@/components/i18n/LocalLink';
import { Layers, Plus, Trash2, Terminal, Cpu, Zap, ArrowRight, Bookmark } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase, gpuDisplayName, GPU_GROUPS, rowsInGpuGroup, type GPU } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { usableCapacityGB } from '@/lib/utils/gpu-page';
import { calcVRAM, getVerdict, quantWeights } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import CopyButton from '@/components/ui/CopyButton';

const RIG_PRESETS: { id: string; labelEn: string; labelZh: string; gpus: string[]; ramGB: number }[] = [
  { id: '3090-4060ti', labelEn: 'RTX 3090 24G + RTX 4060 Ti 16G (40 GB Budget Split)', labelZh: 'RTX 3090 24G + RTX 4060 Ti 16G（40 GB 经典混插）', gpus: ['rtx3090', 'rtx4060ti16'], ramGB: 64 },
  { id: 'dual-3090', labelEn: '2× RTX 3090 24G (48 GB Home Server)', labelZh: '2× RTX 3090 24G（48 GB 经典双卡）', gpus: ['rtx3090', 'rtx3090'], ramGB: 64 },
  { id: '5090-4090', labelEn: 'RTX 5090 32G + RTX 4090 24G (56 GB Workstation)', labelZh: 'RTX 5090 32G + RTX 4090 24G（56 GB 旗舰混插）', gpus: ['rtx5090', 'rtx4090'], ramGB: 128 },
];

export default function EcosystemAndRigWorkbench() {
  const { t, lang } = useLanguage();
  const zh = lang === 'zh';

  const [rigGpuIds, setRigGpuIds] = useState<string[]>(['rtx3090', 'rtx4060ti16']);
  const [concurrency, setConcurrency] = useState<number>(4);
  const [ctxPerSeq, setCtxPerSeq] = useState<number>(8192);
  const [pickerGpuId, setPickerGpuId] = useState<string>('rtx4090');

  const rigGpus = useMemo(
    () => rigGpuIds.map(id => gpuDatabase.find(g => g.id === id)).filter((g): g is GPU => Boolean(g)),
    [rigGpuIds],
  );

  const totalVramGB = useMemo(
    () => rigGpus.reduce((sum, g) => sum + usableCapacityGB(g), 0),
    [rigGpus],
  );

  const minBandwidth = useMemo(() => {
    const bws = rigGpus.map(g => g.bandwidth).filter((b): b is number => typeof b === 'number' && b > 0);
    return bws.length ? Math.min(...bws) : undefined;
  }, [rigGpus]);

  const tensorSplitArg = useMemo(
    () => rigGpus.map(g => Math.round(usableCapacityGB(g))).join(','),
    [rigGpus],
  );

  // Top fitting models for this multi-GPU rig at (ctxPerSeq * concurrency) total KV pool
  const rigFits = useMemo(() => {
    const totalKvTokens = ctxPerSeq * concurrency;
    const out: { model: (typeof models)[number]; quant: (typeof models)[number]['quants'][number]; totalGB: number; kvGB: number; verdict: 'green' | 'yellow' }[] = [];
    for (const m of models) {
      if (m.status === 'superseded' || ctxPerSeq > m.contextLength) continue;
      const q = m.quants.find(x => x.format === 'GGUF' && x.level === 'Q4_K_M') ?? m.quants.find(x => x.format === 'GGUF' && x.bpw >= 4);
      if (!q) continue;
      const r = calcVRAM({
        paramsB: m.params,
        layers: m.arch.layers,
        kvHeads: m.arch.kvHeads,
        headDim: m.arch.headDim,
        attention: m.arch.attention,
        ...quantWeights(q),
        contextLength: totalKvTokens,
        batchSize: 1,
      });
      const v = getVerdict(r.totalGB, totalVramGB);
      if (v === 'green' || v === 'yellow') {
        out.push({ model: m, quant: q, totalGB: r.totalGB, kvGB: r.kvCacheGB, verdict: v });
      }
    }
    return out.sort((a, b) => b.model.params - a.model.params).slice(0, 6);
  }, [totalVramGB, ctxPerSeq, concurrency]);

  const sampleFit = rigFits[0];
  const sampleFile = sampleFit?.quant.source?.file ?? 'model-Q4_K_M.gguf';
  const rigCommand = `llama-server -m ./${sampleFile} -ngl 99 -sm layer -ts ${tensorSplitArg || '24,16'} -np ${concurrency} -c ${ctxPerSeq * concurrency} --flash-attn on`;

  // Terminal one-liner for developers & AI agents
  const curlCommand = `curl -sS https://quantized.uk/data/v1/models.json | jq '[.models[] | select(.status != "superseded") | {id, name, params, contextLength, q4_gb: (.quants[] | select(.level=="Q4_K_M") | .vramGBAt4K)}] | sort_by(-.params) | .[:10]'`;

  // Hugging Face Bookmarklet (zero-install, opens quantized.uk calculator on any HF model card)
  const hfBookmarklet = `javascript:(()=>{const m=location.pathname.split('/').filter(Boolean).slice(0,2).join('/');window.open('https://quantized.uk${zh ? '/zh' : ''}/quant-hub/?q='+encodeURIComponent(m),'_blank');})();`;

  return (
    <div className="mt-10 space-y-6">
      {/* Section 1: Heterogeneous Multi-GPU Rig Builder & Concurrent KV Planner */}
      <section className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="rig-builder-heading">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Layers size={13} />
              {zh ? '异构多卡攒机台 · 多并发容量规划' : 'Heterogeneous Multi-GPU Rig Builder & Concurrency Planner'}
            </span>
            <h2 id="rig-builder-heading" className="text-lg font-bold text-slate-100 mt-1">
              {zh
                ? '混插不同显卡（--tensor-split）与多并发请求 KV 缓存池推演'
                : 'Mix Different GPUs (--tensor-split) & Size Concurrent KV Cache Pools'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {zh
                ? '支持任意不同型号显卡混插（如 RTX 3090 24G + RTX 4060 Ti 16G），自动生成 llama-server --tensor-split 分片比例、识别流水线木桶带宽，并按「并发请求数 × 单请求上下文」核算连续批处理总显存。'
                : 'Combine different GPUs (e.g. RTX 3090 24G + RTX 4060 Ti 16G), generate the exact llama-server --tensor-split ratio, spot the pipeline bandwidth bottleneck, and size total KV cache across concurrent sequences.'}
            </p>
          </div>
        </div>

        {/* Preset Rig Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {RIG_PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setRigGpuIds(p.gpus)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-ink/[0.04] hover:bg-sky-500/15 border border-ink/[0.08] hover:border-sky-500/30 text-slate-300 hover:text-sky-300 transition-colors"
            >
              {zh ? p.labelZh : p.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Rig Devices & Concurrency Controls */}
          <div className="lg:col-span-6 space-y-3">
            <div className="space-y-2">
              {rigGpus.map((g, idx) => (
                <div key={`${g.id}-${idx}`} className="flex items-center justify-between gap-2 rounded-xl bg-bg-recessed border border-ink/[0.08] px-3.5 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-sky-400">GPU #{idx}</span>
                    <span className="text-sm font-semibold text-slate-200 truncate">{gpuDisplayName(g, lang)}</span>
                    <span className="text-xs font-mono text-slate-400">
                      {usableCapacityGB(g).toFixed(0)} GB {g.bandwidth ? `· ${g.bandwidth} GB/s` : ''}
                    </span>
                  </div>
                  {rigGpus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRigGpuIds(prev => prev.filter((_, i) => i !== idx))}
                      aria-label={zh ? '移除此显卡' : 'Remove GPU'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {rigGpus.length < 4 && (
              <div className="flex items-center gap-2">
                <select
                  aria-label={zh ? '选择要添加的显卡' : 'Select GPU to add'}
                  value={pickerGpuId}
                  onChange={e => setPickerGpuId(e.target.value)}
                  className="flex-1 bg-ink/[0.04] border border-ink/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  {GPU_GROUPS.map(([type, key]) => {
                    const rows = rowsInGpuGroup(type).filter(g => !g.isLaptop && !g.isCPU && !g.isUnified);
                    return rows.length === 0 ? null : (
                      <optgroup key={key} label={t.calc[key]}>
                        {rows.map(g => <option key={g.id} value={g.id}>{gpuDisplayName(g, lang)} ({g.vram} GB)</option>)}
                      </optgroup>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={() => setRigGpuIds(prev => [...prev, pickerGpuId])}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 text-xs font-semibold shrink-0"
                >
                  <Plus size={13} /> {zh ? '加入显卡' : 'Add GPU'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="block text-xs text-slate-400">
                {zh ? '并发序列数 (-np / parallel)' : 'Concurrent Sequences (-np)'}
                <select
                  value={concurrency}
                  onChange={e => setConcurrency(Number(e.target.value))}
                  className="mt-1 w-full bg-ink/[0.04] border border-ink/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                >
                  {[1, 2, 4, 8, 16].map(n => (
                    <option key={n} value={n}>{n}× {zh ? '并发用户' : 'parallel slots'}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                {zh ? '单路请求上下文' : 'Context per Slot'}
                <select
                  value={ctxPerSeq}
                  onChange={e => setCtxPerSeq(Number(e.target.value))}
                  className="mt-1 w-full bg-ink/[0.04] border border-ink/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                >
                  {[4096, 8192, 16384, 32768].map(c => (
                    <option key={c} value={c}>{Math.round(c / 1024)}K / slot ({Math.round((c * concurrency) / 1024)}K pool)</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{zh ? '可用显存池总计：' : 'Combined Usable VRAM Pool:'}</span>
                <span className="font-mono font-bold text-sky-300">{totalVramGB.toFixed(1)} GB (--tensor-split {tensorSplitArg})</span>
              </div>
              {minBandwidth && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{zh ? '流水线木桶带宽（最慢卡限制）：' : 'Pipeline Pacing Bandwidth (Slowest Card):'}</span>
                  <span className="font-mono text-amber-300">{minBandwidth} GB/s</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Top Fitting Models & Generated Multi-GPU Command */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3">
            <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-3.5">
              <p className="text-xs font-semibold text-slate-200 mb-2">
                {zh
                  ? `该装机组合在 ${concurrency} 并发 × ${Math.round(ctxPerSeq / 1024)}K 下可装下的最大模型：`
                  : `Largest Models Fitting This Rig at ${concurrency}× ${Math.round(ctxPerSeq / 1024)}K Concurrency:`}
              </p>
              {rigFits.length === 0 ? (
                <p className="text-xs text-slate-500">{zh ? '当前显存池不足以在此并发下装下 4-bit 模型。' : 'No ≥4-bit model fits this VRAM pool at the selected concurrency.'}</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-ink/[0.08]">
                      <th className="py-1 pr-2 font-medium">{zh ? '模型' : 'Model'}</th>
                      <th className="py-1 pr-2 font-medium">{zh ? '档位' : 'Quant'}</th>
                      <th className="py-1 pr-2 font-medium text-right">{zh ? '并发 KV' : 'Pool KV'}</th>
                      <th className="py-1 font-medium text-right">{zh ? '总显存' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rigFits.map(f => (
                      <tr key={f.model.id} className="border-b border-ink/[0.04] last:border-0">
                        <td className="py-1.5 pr-2">
                          <Link href={`/quant-hub/${f.model.id}/`} className="font-medium text-slate-200 hover:text-sky-300">
                            {f.model.name}
                          </Link>
                        </td>
                        <td className="py-1.5 pr-2 font-mono text-slate-400">{quantLevelKey(f.quant)}</td>
                        <td className="py-1.5 pr-2 font-mono text-right text-cyan-300">{f.kvGB.toFixed(1)} GB</td>
                        <td className="py-1.5 font-mono text-right">
                          <span className={f.verdict === 'green' ? 'text-emerald-300' : 'text-amber-300'}>
                            {f.totalGB.toFixed(1)} / {totalVramGB.toFixed(0)}G
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-3 flex flex-wrap items-center justify-between gap-2">
              <code className="text-xs font-mono text-sky-300 break-all flex-1">{rigCommand}</code>
              <CopyButton
                text={rigCommand}
                label={zh ? '复制多卡服务命令' : 'Copy multi-GPU command'}
                copiedLabel={zh ? '已复制' : 'Copied'}
                className="min-h-9 text-xs shrink-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Terminal CLI / AI Agent JSON Feed & Hugging Face Quick-Check */}
      <section className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="ecosystem-api-heading">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Terminal size={13} />
            {zh ? '终端 CLI · AI 智能体数据接口 · Hugging Face 联动' : 'Terminal CLI · AI Agent Data Feed · Hugging Face Quick-Fit'}
          </span>
          <h2 id="ecosystem-api-heading" className="text-lg font-bold text-slate-100 mt-1">
            {zh
              ? '在终端、Claude Code / Cursor 或 Hugging Face 模型页直接调用 quantized.uk'
              : 'Use quantized.uk Directly from Your Terminal, AI Coding Agent, or Hugging Face'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-4 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu size={14} className="text-sky-400" />
                {zh ? '1. 终端一行命令查询公共 JSON 索引（CC BY 4.0）' : '1. One-Liner Terminal Query (Public CC BY 4.0 JSON API)'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {zh
                  ? '无需安装客户端，直接通过 curl + jq 拉取 /data/v1/models.json 与 /data/v1/gpus.json，也可将 /llms.txt 作为 Claude Code、Cursor 或 OpenCode 的文档源。'
                  : 'Query /data/v1/models.json and /data/v1/gpus.json straight from your shell with curl + jq, or point Claude Code / Cursor at /llms.txt for exact-file VRAM sizing.'}
              </p>
            </div>
            <div className="rounded-lg bg-bg border border-ink/[0.08] p-2.5 flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-sky-300 break-all">{curlCommand}</code>
              <CopyButton
                text={curlCommand}
                label={zh ? '复制' : 'Copy'}
                copiedLabel={zh ? '已复制' : 'Copied'}
                className="min-h-8 text-xs shrink-0"
              />
            </div>
          </div>

          <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-4 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Bookmark size={14} className="text-emerald-400" />
                {zh ? '2. Hugging Face 模型页一键查显存书签脚本（Bookmarklet）' : '2. Hugging Face Model Card Instant-Fit Bookmarklet'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {zh
                  ? '复制下方书签脚本存入浏览器书签栏。在浏览任意 Hugging Face 模型仓库时点击一下，即可自动提取仓库名并在 quantized.uk 中检索或导入计算显存。'
                  : 'Save the snippet below as a browser bookmark. Clicking it on any Hugging Face model repository opens quantized.uk filtered to that exact checkpoint.'}
              </p>
            </div>
            <div className="rounded-lg bg-bg border border-ink/[0.08] p-2.5 flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-emerald-300 break-all">{hfBookmarklet}</code>
              <CopyButton
                text={hfBookmarklet}
                label={zh ? '复制脚本' : 'Copy script'}
                copiedLabel={zh ? '已复制' : 'Copied'}
                className="min-h-8 text-xs shrink-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
