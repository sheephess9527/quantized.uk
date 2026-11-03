import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-08-07';

/**
 * Freshness batch: OpenAI GPT-OSS 20B/120B (native MXFP4), GLM-4.5-Air MoE,
 * Devstral Small 1.1 agentic coder.
 *
 * Note on GPT-OSS: the released checkpoints are already MXFP4 for the MoE
 * weights (~90% of params), so "quantization loss" is measured against those
 * official weights, not an FP16 original that was never published.
 */
export const extraModels7: QuantModel[] = [
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B',
    family: 'OpenAI GPT-OSS',
    params: 20.9,
    paramLabel: '21B MoE',
    activeParams: 3.6,
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    // transformers GptOssConfig: sliding_window 128 on alternate layers;
    // llama.cpp `src/models/openai-moe.cpp` builds an iSWA cache (pattern 2).
    // MoE offload: 24 layers × 32 experts × (2880×5760 gate_up + 2880×2880 down + biases) = 19.12B routed; + attention 0.64B + embeddings 1.16B = 20.91B (GptOssConfig widths).
    arch: {
      moe: { expertParams: 19.12, experts: 32, perToken: 4, moeLayers: 24 },
      layers: 24,
      attHeads: 64,
      kvHeads: 8,
      headDim: 64,
      attention: {
        fullLayers: 12,
        windowLayers: 12,
        windowTokens: 768,
        note: {
          en: '12 of 24 layers use a 128-token sliding window, alternating with 12 full-attention layers, so only half the layers grow a cache with context (llama.cpp keeps window + one 512-token batch, padded to 768).',
          zh: '24 层中 12 层使用 128 token 滑动窗口，与 12 层全注意力交替，所以只有一半的层会随上下文增长缓存（llama.cpp 保留窗口加一个 512 token 批次，补齐到 768）。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'OpenAI open-weight MoE (21B total / 3.6B active), shipped natively in MXFP4 — ~12.8GB runs on a 16GB card with no quality tax. Only 3.6B active params means CPU-offload stays usable.',
      zh: 'OpenAI 开放权重 MoE（总 21B / 激活 3.6B），原生以 MXFP4 发布 —— 约 12.8GB，16GB 显卡即可跑且无额外精度损失。激活仅 3.6B，CPU 卸载也还能用。',
    },
    quants: [
      // bpw is the file's effective rate, not MXFP4's 4.25: only the MoE expert
      // tensors are MXFP4 (llama.cpp conversion/gpt_oss.py repacks those alone),
      // attention and embeddings are wider. llama.cpp's own gpt-oss guide
      // (ggml-org/llama.cpp discussion #15396) reports the file at 11.27 GiB →
      // 11.27 × 2^30 × 8 / 20.9e9 = 4.63. 4.25 understated weights by ~0.9 GiB.
      { format: 'GGUF', level: 'MXFP4', bpw: 4.63, vramGB: 12.8, pplLossPercent: 0.0, speedRTX4090: 195, hfSearchUrl: hf('gpt-oss-20b GGUF MXFP4'), confidence: 'community' },
      { format: 'GGUF', level: 'Q8_0',  bpw: 5.10, vramGB: 13.8, pplLossPercent: 0.0, speedRTX4090: 178, hfSearchUrl: hf('gpt-oss-20b GGUF Q8_0') },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.10, vramGB: 11.9, pplLossPercent: 1.4, speedRTX4090: 205, hfSearchUrl: hf('gpt-oss-20b GGUF Q4_K_M') },
    ],
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B',
    family: 'OpenAI GPT-OSS',
    params: 116.8,
    paramLabel: '117B MoE',
    activeParams: 5.1,
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 131072,
    // transformers GptOssConfig: sliding_window 128 on alternate layers;
    // llama.cpp `src/models/openai-moe.cpp` builds an iSWA cache (pattern 2).
    // MoE offload: 36 layers × 128 experts × 24.89M = 114.70B routed; + attention 0.96B + embeddings 1.16B = 116.82B (GptOssConfig defaults are this model).
    arch: {
      moe: { expertParams: 114.70, experts: 128, perToken: 4, moeLayers: 36 },
      layers: 36,
      attHeads: 64,
      kvHeads: 8,
      headDim: 64,
      attention: {
        fullLayers: 18,
        windowLayers: 18,
        windowTokens: 768,
        note: {
          en: '18 of 36 layers use a 128-token sliding window, alternating with 18 full-attention layers, so only half the layers grow a cache with context (llama.cpp keeps window + one 512-token batch, padded to 768).',
          zh: '36 层中 18 层使用 128 token 滑动窗口，与 18 层全注意力交替，所以只有一半的层会随上下文增长缓存（llama.cpp 保留窗口加一个 512 token 批次，补齐到 768）。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'The big GPT-OSS (117B total / 5.1B active). Native MXFP4 checkpoint is ~61GB — fits one 80GB card or a 128GB unified-memory Mac. Partial offload on 24GB consumer cards is slow but works.',
      zh: 'GPT-OSS 大杯（总 117B / 激活 5.1B）。原生 MXFP4 权重约 61GB —— 单张 80GB 卡或 128GB 统一内存 Mac 可跑。24GB 消费卡部分卸载虽慢但可用。',
    },
    quants: [
      // Same reasoning as the 20B: 59.02 GiB file (llama.cpp discussion #15396)
      // → 59.02 × 2^30 × 8 / 116.8e9 = 4.34 effective bpw.
      { format: 'GGUF', level: 'MXFP4', bpw: 4.34, vramGB: 61.0, pplLossPercent: 0.0, hfSearchUrl: hf('gpt-oss-120b GGUF MXFP4'), confidence: 'community' },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.10, vramGB: 58.5, pplLossPercent: 1.6, hfSearchUrl: hf('gpt-oss-120b GGUF Q4_K_M') },
    ],
  },
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5-Air',
    family: 'Zhipu GLM-4.5',
    params: 106.0,
    paramLabel: '106B MoE',
    activeParams: 12,
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 131072,
    // MoE offload: Glm4MoeConfig defaults (this model): 45 MoE layers × 128 × 3 × 4096 × 1408 = 99.66B routed, 1 dense lead layer; the rest (attention 5.0B, shared experts 0.78B, embeddings 1.24B) closes near 106B.
    arch: { layers: 46, attHeads: 96, kvHeads: 8, headDim: 128, moe: { expertParams: 99.66, experts: 128, perToken: 8, moeLayers: 45, denseLead: 1 } },
    addedAt: ADDED,
    description: {
      en: 'Zhipu\'s agentic/reasoning MoE (106B total / 12B active). Q4 ~64GB — the sweet spot is a 96GB+ unified Mac or 2× 48GB cards. Strong tool-calling for its class.',
      zh: '智谱 Agent/推理向 MoE（总 106B / 激活 12B）。Q4 约 64GB —— 96GB+ 统一内存 Mac 或双 48GB 卡最合适。同级别中工具调用能力突出。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 64.3, pplLossPercent: 2.4, hfSearchUrl: hf('GLM-4.5-Air GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 51.3, pplLossPercent: 5.1, hfSearchUrl: hf('GLM-4.5-Air GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q2_K',   bpw: 2.63, vramGB: 34.8, pplLossPercent: 12.0, hfSearchUrl: hf('GLM-4.5-Air GGUF Q2_K') },
    ],
  },
  {
    // Sizes from bartowski/mistralai_Devstral-Small-2507-GGUF (owner-pulled tree listing, 2026-11-03): BF16
    // 47,153,525,408 B ÷ 2 = 23.58B; mmproj (f16) 878,054,144 B separate.
    id: 'devstral-small-2507',
    name: 'Devstral Small 1.1 24B',
    family: 'Mistral Devstral',
    params: 23.58,
    paramLabel: '24B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Mistral + All Hands agentic coding model on a Mistral Small 3.1 base. Built for repo-scale tool use rather than single-file completion. At Q4_K_M it needs about 15.7 GB at 4K, tight on a 16 GB card and comfortable on 20 GB.',
      zh: 'Mistral 与 All Hands 合作的 Agent 编码模型，基于 Mistral Small 3.1。面向仓库级工具调用而非单文件补全。Q4_K_M 在 4K 下约需 15.7 GB，在 16 GB 显卡上偏紧，20 GB 起就宽裕。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.86, vramGB: 14.3, pplLossPercent: 2.9, speedRTX4090: 62, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q4_K_M'), confidence: 'community', source: { repo: 'bartowski/mistralai_Devstral-Small-2507-GGUF', file: 'mistralai_Devstral-Small-2507-Q4_K_M.gguf', bytes: 14_333_916_096, mmprojBytes: 878_054_144, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.69, vramGB: 16.8, pplLossPercent: 1.4, speedRTX4090: 55, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q5_K_M'), source: { repo: 'bartowski/mistralai_Devstral-Small-2507-GGUF', file: 'mistralai_Devstral-Small-2507-Q5_K_M.gguf', bytes: 16_763_990_976, mmprojBytes: 878_054_144, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 19.4, pplLossPercent: 0.6, speedRTX4090: 48, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q6_K'), source: { repo: 'bartowski/mistralai_Devstral-Small-2507-GGUF', file: 'mistralai_Devstral-Small-2507-Q6_K.gguf', bytes: 19_345_945_536, mmprojBytes: 878_054_144, checkedAt: '2026-11-03' } },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 13.0, pplLossPercent: 4.0, speedRTX4090: 78, hfSearchUrl: hf('Devstral-Small-2507 AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 13.9, pplLossPercent: 2.5, hfSearchUrl: hf('Devstral-Small-2507 exl2 4.65') },
    ],
  },
];
