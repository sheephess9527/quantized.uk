import Link from '@/components/i18n/LocalLink';
import { models } from '@/lib/data/models';
import { calcVRAM, quantWeights } from '@/lib/utils/vram';
import { isMoE } from '@/lib/utils/model-meta';
import type { Lang } from '@/lib/i18n/translations';
import type { QuantModel } from '@/lib/data/types';

type ArchKind = 'full' | 'hybrid-linear' | 'sliding-window' | 'compressed-mla';

interface ArchCategory {
  kind: ArchKind;
  titleEn: string;
  titleZh: string;
  ruleEn: string;
  ruleZh: string;
  models: QuantModel[];
  sample: QuantModel;
  kbPerToken32k: number;
  kvGiBAt32k: number;
  kvGiBAt128k: number;
}

function classifyArch(m: QuantModel): ArchKind {
  const att = m.arch.attention;
  if (!att) return 'full';
  if (att.compressed && att.compressed.length > 0) return 'compressed-mla';
  // DeepSeek-2-style MLA encoded as kvHeads=1, headDim=288
  if (m.arch.kvHeads === 1 && m.arch.headDim === 288) return 'compressed-mla';
  if ((att.windowLayers ?? 0) > 0) return 'sliding-window';
  if (att.fullLayers !== undefined && att.fullLayers < m.arch.layers) return 'hybrid-linear';
  return 'full';
}

function kvAt(m: QuantModel, tokens: number): number {
  const q = m.quants[0];
  return calcVRAM({
    paramsB: m.params,
    layers: m.arch.layers,
    kvHeads: m.arch.kvHeads,
    headDim: m.arch.headDim,
    attention: m.arch.attention,
    ...quantWeights(q),
    contextLength: tokens,
    batchSize: 1,
  }).kvCacheGB;
}

/**
 * Live-derived 2026 Attention & KV Cache Architecture Atlas across all indexed
 * models. Server-rendered directly into `/methodology/` and `/zh/methodology/`
 * as an authoritative link-magnet reference table.
 */
export default function AttentionArchitectureAtlas({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const active = models.filter(m => m.status !== 'superseded');
  const moeCount = active.filter(isMoE).length;
  const nonUniformCount = active.filter(m => classifyArch(m) !== 'full').length;

  const byKind = new Map<ArchKind, QuantModel[]>();
  for (const m of active) {
    const k = classifyArch(m);
    byKind.set(k, [...(byKind.get(k) ?? []), m]);
  }

  const pickSample = (k: ArchKind, preferredId: string): QuantModel => {
    const list = byKind.get(k) ?? active;
    return list.find(m => m.id === preferredId) ?? list[0];
  };

  const defs: { kind: ArchKind; preferred: string; titleEn: string; titleZh: string; ruleEn: string; ruleZh: string }[] = [
    {
      kind: 'full',
      preferred: 'qwen3-32b',
      titleEn: 'Classic Full-Context GQA / MQA',
      titleZh: '传统全层上下文 GQA / MQA',
      ruleEn: 'Every decoder layer stores a K+V cache that grows linearly with context length.',
      ruleZh: '全部解码层的 K+V 缓存均随上下文长度线性增长。',
    },
    {
      kind: 'hybrid-linear',
      preferred: 'qwen3-8-27b',
      titleEn: 'Hybrid Linear + Full Attention (Gated DeltaNet / Mamba / ShortConv)',
      titleZh: '混合线性 + 全注意力（Gated DeltaNet / Mamba / 短卷积）',
      ruleEn: 'Only 1 in 4 (or 1 in 6) layers keeps a growing KV cache; linear layers hold a fixed-size recurrent state.',
      ruleZh: '仅 1/4（或 1/6）的层随上下文增长 KV 缓存；其余线性层只保留固定大小的循环状态。',
    },
    {
      kind: 'sliding-window',
      preferred: 'gemma-4-31b',
      titleEn: 'Interleaved Sliding-Window + Global Attention (SWA)',
      titleZh: '交错滑动窗口 + 全局注意力（SWA）',
      ruleEn: 'Local layers cap their KV cache at a fixed token window (e.g. 1,024–4,096 tokens) regardless of total context.',
      ruleZh: '局部注意力层的 KV 缓存被封顶在固定窗口内（如 1,024–4,096 词元），不随长上下文无限膨胀。',
    },
    {
      kind: 'compressed-mla',
      preferred: 'raon-1-mini',
      titleEn: 'Latent / Compressed K-Only Attention (MLA / CSA / Sparse Indexer)',
      titleZh: '潜在压缩 / 仅 K 注意力（MLA / CSA / 稀疏索引）',
      ruleEn: 'Caches one compressed latent vector (e.g. 576 values) per token instead of multi-head K+V tensors.',
      ruleZh: '每层每词元仅缓存一个压缩潜在向量（如 576 维），而非多头完整 K+V 张量。',
    },
  ];

  const categories: ArchCategory[] = defs.map(d => {
    const list = byKind.get(d.kind) ?? [];
    const sample = pickSample(d.kind, d.preferred);
    const kv32 = kvAt(sample, 32768);
    const kv128 = kvAt(sample, 131072);
    const kbPerTok = Math.round((kv32 * 1024 * 1024) / 32768);
    return {
      kind: d.kind,
      titleEn: d.titleEn,
      titleZh: d.titleZh,
      ruleEn: d.ruleEn,
      ruleZh: d.ruleZh,
      models: list,
      sample,
      kbPerToken32k: kbPerTok,
      kvGiBAt32k: kv32,
      kvGiBAt128k: kv128,
    };
  });

  // High-contrast 2026 showcase models demonstrating why naive calculators overstate KV by 3×–10×
  const showcaseIds = ['qwen3-32b', 'qwen3-8-27b', 'gemma-4-31b', 'glm-4.7-flash', 'raon-1-mini', 'inkling-2-mini'];
  const showcase = showcaseIds
    .map(id => active.find(m => m.id === id))
    .filter((m): m is QuantModel => Boolean(m));

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 space-y-4 text-sm leading-relaxed" aria-labelledby="attention-atlas">
      <div>
        <h2 id="attention-atlas" className="text-xl font-semibold text-slate-100">
          {zh
            ? `2026 注意力与 KV 缓存架构图谱（基于 ${active.length} 款现役模型的逐层审计）`
            : `2026 Attention & KV Cache Architecture Atlas (${active.length} Active Models Audited)`}
        </h2>
        <p className="text-slate-400 mt-1">
          {zh
            ? `在 ${active.length} 款现役模型中，已有 ${nonUniformCount} 款采用非均匀注意力缓存（混合线性注意力、交错滑动窗口或 MLA 潜在压缩），${moeCount} 款采用混合专家（MoE）架构。如果仍按「所有层均缓存完整上下文」的 2024 旧公式计算，长上下文下的 KV 显存会被夸大 3 倍至 10 倍。`
            : `Across ${active.length} active models in this index, ${nonUniformCount} now use non-uniform attention caching (hybrid linear attention, interleaved sliding windows, or MLA latent compression) and ${moeCount} use Mixture-of-Experts (MoE) routing. Sizing every layer as full-context GQA overstates 32K–128K KV cache by 3× to 10×.`}
        </p>
      </div>

      {/* Category Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-ink/[0.08] text-left text-xs text-slate-400">
              <th className="py-2 pr-3 font-medium">{zh ? '注意力缓存类别' : 'Attention Cache Class'}</th>
              <th className="py-2 pr-3 font-medium text-right">{zh ? '现役模型数' : 'Active Models'}</th>
              <th className="py-2 pr-3 font-medium">{zh ? '代表模型 (~30B 级)' : 'Reference (~30B class)'}</th>
              <th className="py-2 pr-3 font-medium text-right">{zh ? '32K KV 缓存' : '32K KV Cache'}</th>
              <th className="py-2 font-medium text-right">{zh ? '128K KV 缓存' : '128K KV Cache'}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.kind} className="border-b border-ink/[0.05] last:border-0 align-top">
                <td className="py-2.5 pr-3">
                  <div className="font-semibold text-slate-200">{zh ? c.titleZh : c.titleEn}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{zh ? c.ruleZh : c.ruleEn}</div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-right text-sky-300 font-semibold">
                  {c.models.length}
                </td>
                <td className="py-2.5 pr-3">
                  <Link href={`/quant-hub/${c.sample.id}/`} className="font-medium text-sky-300 hover:text-sky-200 underline underline-offset-4">
                    {c.sample.name}
                  </Link>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    ~{c.kbPerToken32k} KB/tok @ FP16
                  </div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-right text-slate-200">
                  {c.kvGiBAt32k.toFixed(2)} GiB
                </td>
                <td className="py-2.5 font-mono text-right text-emerald-300">
                  {c.kvGiBAt128k.toFixed(2)} GiB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Head-to-Head 27B–32B KV Cache Audit */}
      <div className="rounded-xl bg-bg-recessed border border-ink/[0.08] p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          {zh
            ? '同体量（26B–32B 级）模型在 32K 与 128K 上下文下的真实 KV 缓存对比（Batch 1, FP16 KV）'
            : 'Head-to-Head KV Cache Cost Across 26B–32B Architectures (Batch 1, FP16 KV)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-ink/[0.08] text-left text-slate-400">
                <th className="py-1.5 pr-2 font-medium">{zh ? '模型' : 'Model'}</th>
                <th className="py-1.5 pr-2 font-medium">{zh ? '层结构与增长缓存层' : 'Layer Split (Growing KV Layers)'}</th>
                <th className="py-1.5 pr-2 font-medium text-right">4K KV</th>
                <th className="py-1.5 pr-2 font-medium text-right">32K KV</th>
                <th className="py-1.5 font-medium text-right">128K KV</th>
              </tr>
            </thead>
            <tbody>
              {showcase.map(m => {
                const att = m.arch.attention;
                const splitLabel = att?.compressed
                  ? (zh ? `${m.arch.layers} 层 (${att.compressed[0].layers} 层压缩 MLA)` : `${m.arch.layers}L (${att.compressed[0].layers}L compressed MLA)`)
                  : att?.windowLayers
                    ? (zh ? `${m.arch.layers} 层 (${att.fullLayers ?? 0} 全 + ${att.windowLayers} 滑窗)` : `${m.arch.layers}L (${att.fullLayers ?? 0} full + ${att.windowLayers} SWA)`)
                    : att?.fullLayers !== undefined
                      ? (zh ? `${m.arch.layers} 层 (仅 ${att.fullLayers} 层随上下文增长)` : `${m.arch.layers}L (only ${att.fullLayers}L grow with ctx)`)
                      : (zh ? `${m.arch.layers} 层全注意力 (${m.arch.kvHeads}×${m.arch.headDim})` : `${m.arch.layers}L full (${m.arch.kvHeads}×${m.arch.headDim})`);
                return (
                  <tr key={m.id} className="border-b border-ink/[0.04] last:border-0">
                    <td className="py-1.5 pr-2">
                      <Link href={`/quant-hub/${m.id}/`} className="font-medium text-slate-200 hover:text-sky-300">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-slate-400">{splitLabel}</td>
                    <td className="py-1.5 pr-2 font-mono text-right text-slate-300">{kvAt(m, 4096).toFixed(2)} GiB</td>
                    <td className="py-1.5 pr-2 font-mono text-right text-sky-300">{kvAt(m, 32768).toFixed(2)} GiB</td>
                    <td className="py-1.5 font-mono text-right text-emerald-300">{kvAt(m, 131072).toFixed(2)} GiB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
