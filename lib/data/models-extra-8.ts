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
    arch: { layers: 48, attHeads: 32, kvHeads: 4, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Multimodal MoE with only ~3B active parameters, so it stays responsive on Apple unified memory and survives CPU offload far better than a dense 30B. Q4 ~19GB — a 24GB card holds it outright.',
      zh: '多模态 MoE,激活参数仅约 3B,因此在苹果统一内存上依然跟手,CPU 卸载的表现也远好于稠密 30B。Q4 约 19GB,24GB 显卡可完整放下。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 19.0, pplLossPercent: 2.6, speedRTX4090: 95, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 15.2, pplLossPercent: 5.4, speedRTX4090: 104, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 32.6, pplLossPercent: 0.3, speedRTX4090: 78, hfSearchUrl: hf('Qwen3-VL-30B-A3B-Instruct GGUF Q8_0') },
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
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 13.9, pplLossPercent: 2.5, speedRTX4090: 86, hfSearchUrl: hf('Magistral-Small-2509 exl2 4.65') },
    ],
  },
  {
    id: 'seed-oss-36b',
    name: 'Seed-OSS 36B Instruct',
    family: 'ByteDance Seed',
    params: 36.0,
    paramLabel: '36B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 524288,
    arch: { layers: 64, attHeads: 80, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Dense 36B with a native 512K context. Q4 weights are ~22GB, which lands on a 24GB card or a 2×16GB split — but the context is the real cost: 512K of KV cache is roughly 128GB on its own, so budget context first and weights second.',
      zh: '稠密 36B,原生 512K 上下文。Q4 权重约 22GB,单张 24GB 卡或 2×16GB 拆分即可 —— 但真正的开销是上下文:512K 的 KV cache 单独就约 128GB,所以要先规划上下文再考虑权重。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 21.8, pplLossPercent: 2.7, speedRTX4090: 42, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 17.4, pplLossPercent: 5.6, speedRTX4090: 48, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 25.6, pplLossPercent: 1.3, speedRTX4090: 37, hfSearchUrl: hf('Seed-OSS-36B-Instruct GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 19.5, pplLossPercent: 3.8, speedRTX4090: 55, hfSearchUrl: hf('Seed-OSS-36B-Instruct AWQ') },
    ],
  },
];
