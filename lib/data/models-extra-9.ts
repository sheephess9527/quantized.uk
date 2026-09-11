import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-09-11';

/**
 * First 2026-architecture batch.
 *
 * **Every number here was derived, not recalled.** This environment cannot
 * reach huggingface.co (the egress proxy rejects it), so architecture came from
 * the authoritative `configuration_*.py` in `huggingface/transformers` — which
 * is reachable on raw.githubusercontent.com and carries each family's reference
 * checkpoint defaults — and every figure was then checked against a published
 * measurement before it was written down. Two models cleared that bar; several
 * others did not and are deliberately absent (see README §9, 2026-09-11).
 *
 * `pplLossPercent` is omitted throughout. Nobody has published a per-level
 * perplexity sweep for either model, and the column is optional precisely so
 * that a missing measurement stays missing instead of becoming an invented
 * number that then drives the hub ranking and the homepage picks.
 */
export const extraModels9: QuantModel[] = [
  {
    id: 'ministral-3-8b',
    name: 'Ministral 3 8B Instruct',
    family: 'Mistral Ministral 3',
    // 8.49B, computed from the reference config (vocab 131072, hidden 4096,
    // 34 layers, intermediate 14336, untied embeddings) and confirmed by the
    // published GGUF sizes: BF16 at 17.0 GB implies 16.02 bits per weight,
    // which is 16 to within rounding. Three independent routes to one number.
    params: 8.49,
    paramLabel: '8B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    // transformers `Ministral3Config`, checkpoint mistralai/Ministral-3-8B-Base-2512.
    // `sliding_window: None` — every layer keeps a full KV cache, so no
    // `attention` override is needed here.
    arch: { layers: 34, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Mistral ships the GGUF itself, in 3B / 8B / 14B and Instruct or Reasoning variants — the 8B is the one that fits an 8GB card at Q4 with room for real context. Plain full attention on all 34 layers, so the memory estimates below behave the way the calculator assumes. Quality loss per level has not been published.',
      zh: 'Mistral 官方直接发布 GGUF，分 3B / 8B / 14B 与 Instruct、Reasoning 两种变体；其中 8B 在 Q4 下能装进 8GB 显卡并留出可用的上下文余量。34 层全部是标准全注意力，因此下方的显存估算与计算器的假设完全一致。各档位的质量损失官方未公布。',
    },
    // bpw derived from the published file sizes at 8.49B parameters, not from
    // the generic table: 5.2 / 6.06 / 9.03 GB → 4.90 / 5.71 / 8.51.
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.90, vramGB: 5.2,  hfSearchUrl: hf('Ministral-3-8B-Instruct-2512-GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.71, vramGB: 6.1,  hfSearchUrl: hf('Ministral-3-8B-Instruct-2512-GGUF Q5_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 9.0,  hfSearchUrl: hf('Ministral-3-8B-Instruct-2512-GGUF Q8_0'),   confidence: 'community' },
    ],
  },
  {
    id: 'qwen3-8-27b',
    name: 'Qwen3.8 27B',
    family: 'Alibaba Qwen3.8',
    params: 27.78,
    paramLabel: '27B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    /**
     * The reason the calculator grew an `attention` field.
     *
     * `Qwen3NextConfig.__post_init__` in transformers builds the layer list as
     * `"linear_attention" if (i + 1) % full_attention_interval else
     * "full_attention"`, and this model ships `full_attention_interval: 4` —
     * so 16 of the 64 layers keep a growing KV cache and 48 hold a fixed
     * Gated DeltaNet recurrent state instead.
     *
     * Sizing all 64 the old way gave 8.0 GB of KV at 32K against a community
     * measurement of 2.0 GB. Counting only the 16 reproduces the published
     * figures at three separate context lengths: 0.50 / 2.00 / 16.00 GB at
     * 8K / 32K / 262K, measured 0.5 / 2.0 / 16.4.
     */
    arch: {
      layers: 64,
      attHeads: 24,
      kvHeads: 4,
      headDim: 256,
      attention: {
        fullLayers: 16,
        note: {
          en: '16 of 64 layers use full attention (full_attention_interval 4); the other 48 are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.',
          zh: '64 层中有 16 层是全注意力（full_attention_interval 为 4），其余 48 层是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'Hybrid attention: only 16 of its 64 layers keep a KV cache, which is why a 27B model holds a 262K context in about 16GB of cache rather than 64GB. Sizing it as a conventional stack overstates the cache fourfold — the estimates here count the 16 and match published measurements at 8K, 32K and 262K. Quality loss per level has not been published.',
      zh: '混合注意力：64 层中只有 16 层保留 KV 缓存，所以这个 27B 模型在 262K 上下文下的缓存约 16GB，而不是 64GB。按常规架构计算会把缓存高估四倍 —— 这里的估算只计入那 16 层，并与 8K、32K、262K 三个已公开实测值吻合。各档位的质量损失官方未公布。',
    },
    // 15.33 GiB for the standard Q4_K_M conversion at 27.78B → 4.74 bpw.
    // Unsloth's dynamic (UD) build of the same level is larger at 16.69 GiB;
    // it is a different quantization, not a different measurement of this one.
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.74, vramGB: 15.3, hfSearchUrl: hf('Qwen3.8-27B GGUF Q4_K_M'), confidence: 'community' },
    ],
  },
];
