import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-08-08';

/**
 * Freshness batch aimed at the hardware-constrained reader (AMD / WSL2 / Mac /
 * dual-GPU), which is what the cookbook traffic mix suggests the site attracts:
 * multimodal pulled down to a single consumer card, a small-active MoE that
 * suits unified memory and CPU offload, a 24B reasoner, and a dual-GPU-sized
 * long-context dense model.
 */
export const extraModels8: QuantModel[] = [
  {
    id: 'qwen3-vl-8b',
    name: 'Qwen3-VL 8B Instruct',
    family: 'Alibaba Qwen3-VL',
    params: 8.8,
    paramLabel: '8B',
    categories: ['multimodal', 'instruct', 'general'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 40960,
    arch: { layers: 36, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Current-generation vision-language model that still fits a single 8–12GB card at Q4 (~5.9GB). The realistic multimodal option for people without a 24GB GPU — note the vision encoder adds VRAM the KV-cache math below does not model.',
      zh: '当代视觉语言模型,Q4 约 5.9GB,单张 8–12GB 卡仍可跑。没有 24GB 显卡的人做多模态的现实选择 —— 注意视觉编码器会额外占用显存,下方 KV cache 计算并未包含这部分。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 5.9, pplLossPercent: 3.0, speedRTX4090: 140, hfSearchUrl: hf('Qwen3-VL-8B-Instruct GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 6.9, pplLossPercent: 1.5, speedRTX4090: 126, hfSearchUrl: hf('Qwen3-VL-8B-Instruct GGUF Q5_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 10.0, pplLossPercent: 0.3, speedRTX4090: 108, hfSearchUrl: hf('Qwen3-VL-8B-Instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 5.3, pplLossPercent: 4.2, speedRTX4090: 165, hfSearchUrl: hf('Qwen3-VL-8B-Instruct AWQ') },
    ],
  },
  {
    id: 'qwen3-vl-30b-a3b',
    name: 'Qwen3-VL 30B-A3B Instruct',
    family: 'Alibaba Qwen3-VL',
    params: 30.5,
    paramLabel: '30B-A3B',
    categories: ['multimodal', 'instruct', 'general'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 40960,
    // MoE offload: text model as Qwen3 30B-A3B: 48 MoE layers × 128 experts × 3 × 2048 × 768 = 28.99B routed (Qwen3MoeConfig widths; 48 layers, not the config default 24 — with 48 the count closes at 30.53B = params).
    arch: { layers: 48, attHeads: 32, kvHeads: 4, headDim: 128, moe: { expertParams: 28.99, experts: 128, perToken: 8, moeLayers: 48 } },
    addedAt: ADDED,
    description: {
      en: 'Multimodal MoE with only ~3B active parameters, so it stays responsive on Apple unified memory and survives CPU offload far better than a dense 30B. Q4 ~19GB — a 24GB card holds it outright.',
      zh: '多模态 MoE,激活参数仅约 3B,因此在苹果统一内存上依然跟手,CPU 卸载的表现也远好于稠密 30B。Q4 约 19GB,24GB 显卡可完整放下。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 19.0, pplLossPercent: 2.6, speedRTX4090: 95, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 15.2, pplLossPercent: 5.4, speedRTX4090: 104, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 32.6, pplLossPercent: 0.3, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 17.2, pplLossPercent: 3.7, speedRTX4090: 112, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct AWQ') },
    ],
  },
  {
    id: 'magistral-small-2509',
    name: 'Magistral Small 1.2 24B',
    family: 'Mistral Magistral',
    params: 23.6,
    paramLabel: '24B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Mistral\'s reasoning model on a Mistral Small 3.2 base, with reasoning wrapped in [THINK] tags. Q4 ~14GB puts explicit chain-of-thought on a 16GB card — the level below the 70B-class reasoners most guides assume.',
      zh: 'Mistral 基于 Mistral Small 3.2 的推理模型,思维链包在 [THINK] 标签内。Q4 约 14GB,让显式思维链落到 16GB 显卡上 —— 比多数教程默认的 70B 级推理模型低一档。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 14.3, pplLossPercent: 2.9, speedRTX4090: 60, hfSearchUrl: hf('Magistral-Small-2509 GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 16.8, pplLossPercent: 1.4, speedRTX4090: 54, hfSearchUrl: hf('Magistral-Small-2509 GGUF Q5_K_M') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 19.4, pplLossPercent: 0.6, speedRTX4090: 47, hfSearchUrl: hf('Magistral-Small-2509 GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 13.0, pplLossPercent: 4.0, speedRTX4090: 76, hfSearchUrl: hf('Magistral-Small-2509 AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 13.9, pplLossPercent: 2.5, hfSearchUrl: hf('Magistral-Small-2509 exl2 4.65') },
    ],
  },
  {
    id: 'seed-oss-36b',
    name: 'Seed-OSS 36B Instruct',
    family: 'ByteDance Seed',
    // 36.16B = bartowski's and unsloth's BF16 GGUFs (72,311,396,928 / 72,311,397,472 B ÷ 2), owner-
    // pulled 2026-10-21; was typed 36.0. GGUF bpw from bartowski's files (unsloth's same levels differ
    // by 512 B). AWQ from QuantTrio's repo (quant_method awq, 4-bit): 8 shards = 21,135,821,912 B →
    // 4.68 bpw, not the 4.0 once typed here — its 55 tok/s on a 4090 then exceeds the bandwidth gate and
    // was removed, not adjusted. cyankiwi's "AWQ-4bit" is compressed-tensors, not AWQ — not used.
    params: 36.16,
    paramLabel: '36B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 524288,
    arch: { layers: 64, attHeads: 80, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Dense 36B with a native 512K context. The Q4_K_M file is 21.8 GB, so with cache and buffers it needs about 23.9 GB at 4K: tight on a 24 GB card, where Q3_K_M (19.5 GB) is the comfortable choice, or a 2×16GB split. The AWQ build is 21.1 GB, not the 4-bit rate the name suggests. Context is the real cost: 512K of KV cache is roughly 128GB on its own, so budget context first and weights second.',
      zh: '稠密 36B，原生 512K 上下文。Q4_K_M 文件是 21.8 GB，加上缓存和运行缓冲，4K 下约需 23.9 GB：在 24 GB 显卡上偏紧，那里宽裕的选择是 Q3_K_M（19.5 GB），或者用 2×16GB 拆分。AWQ 版本是 21.1 GB，并不是名字暗示的 4 比特体积。真正的开销是上下文：512K 的 KV cache 单独就约 128GB,所以要先规划上下文再考虑权重。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.82, vramGB: 23.9, pplLossPercent: 2.7, speedRTX4090: 42, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q4_K_M'), confidence: 'community', source: { repo: 'bartowski/ByteDance-Seed_Seed-OSS-36B-Instruct-GGUF', file: 'ByteDance-Seed_Seed-OSS-36B-Instruct-Q4_K_M.gguf', bytes: 21_762_149_024, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.90, vramGB: 19.5, pplLossPercent: 5.6, speedRTX4090: 48, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q3_K_M'), source: { repo: 'bartowski/ByteDance-Seed_Seed-OSS-36B-Instruct-GGUF', file: 'ByteDance-Seed_Seed-OSS-36B-Instruct-Q3_K_M.gguf', bytes: 17_620_949_664, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.66, vramGB: 27.8, pplLossPercent: 1.3, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q5_K_M'), source: { repo: 'bartowski/ByteDance-Seed_Seed-OSS-36B-Instruct-GGUF', file: 'ByteDance-Seed_Seed-OSS-36B-Instruct-Q5_K_M.gguf', bytes: 25_594_366_624, checkedAt: '2026-10-21' } },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.68,  vramGB: 23.2, pplLossPercent: 3.8, hfSearchUrl: hf('Seed-OSS-36B-Instruct AWQ'), source: { repo: 'QuantTrio/Seed-OSS-36B-Instruct-AWQ', file: 'model-00001-of-00008.safetensors', bytes: 21_135_821_912, parts: 8, checkedAt: '2026-10-21' } },
    ],
  },
];
