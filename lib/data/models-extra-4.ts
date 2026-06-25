import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

/** Qwen3 32B/MoE flagship + DeepSeek V3/R1 frontier MoE */
export const extraModels4: QuantModel[] = [
  {
    id: 'qwen3-32b',
    name: 'Qwen3 32B Instruct',
    family: 'Alibaba Qwen3',
    params: 32.76,
    paramLabel: '32B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu'],
    contextLength: 40960,
    arch: { layers: 64, attHeads: 64, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Qwen3 dense 32B — successor to Qwen2.5-32B with stronger reasoning and thinking mode.',
      zh: 'Qwen3 稠密 32B — Qwen2.5-32B 继任者，推理与思考模式全面升级。',
    },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 17.8, pplLossPercent: 7.2, speedRTX4090: 50, hfSearchUrl: hf('Qwen3-32B GGUF Q3_K_M bartowski') },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 22.5, pplLossPercent: 2.5, speedRTX4090: 42, hfSearchUrl: hf('Qwen3-32B GGUF Q4_K_M bartowski') },
      { format: 'EXL2', level: '3.5bpw', bpw: 3.5,  vramGB: 16.8, pplLossPercent: 4.5, speedRTX4090: 62, hfSearchUrl: hf('Qwen3-32B exl2 turboderp') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 19.5, pplLossPercent: 3.6, speedRTX4090: 55, hfSearchUrl: hf('Qwen3-32B AWQ') },
    ],
  },
  {
    id: 'qwen3-30b-a3b',
    name: 'Qwen3 30B-A3B Instruct',
    family: 'Alibaba Qwen3',
    params: 30.5,
    paramLabel: '30B-A3B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 40960,
    arch: { layers: 48, attHeads: 32, kvHeads: 4, headDim: 128 },
    description: {
      en: 'Qwen3 MoE with only 3B active params. Q4 ~19GB file; outperforms QwQ-32B on 16GB cards.',
      zh: 'Qwen3 MoE，仅 3B 激活参数。Q4 约 19GB，16GB 显卡上超越 QwQ-32B。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 19.0, pplLossPercent: 2.4, speedRTX4090: 95, hfSearchUrl: hf('Qwen3-30B-A3B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 22.0, pplLossPercent: 1.1, speedRTX4090: 82, hfSearchUrl: hf('Qwen3-30B-A3B GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 17.5, pplLossPercent: 3.4, speedRTX4090: 118, hfSearchUrl: hf('Qwen3-30B-A3B AWQ') },
    ],
  },
  {
    id: 'qwen3-235b-a22b',
    name: 'Qwen3 235B-A22B Instruct',
    family: 'Alibaba Qwen3',
    params: 235.0,
    paramLabel: '235B-A22B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu'],
    contextLength: 40960,
    arch: { layers: 94, attHeads: 64, kvHeads: 4, headDim: 128 },
    description: {
      en: 'Qwen3 flagship MoE (22B active / 235B total). Q4_K_M ~142GB; rivals DeepSeek-R1 class models.',
      zh: 'Qwen3 旗舰 MoE（激活 22B / 总 235B）。Q4_K_M 约 142GB，对标 DeepSeek-R1 级模型。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 142.0, pplLossPercent: 2.2, speedRTX4090: 10, hfSearchUrl: hf('Qwen3-235B-A22B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 115.0, pplLossPercent: 4.8, speedRTX4090: 12, hfSearchUrl: hf('Qwen3-235B-A22B GGUF Q3_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 125.0, pplLossPercent: 3.2, speedRTX4090: 14, hfSearchUrl: hf('Qwen3-235B-A22B AWQ') },
    ],
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    family: 'DeepSeek',
    params: 671.0,
    paramLabel: '671B MoE',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu'],
    contextLength: 163840,
    arch: { layers: 61, attHeads: 128, kvHeads: 8, headDim: 128 },
    description: {
      en: 'DeepSeek-V3 frontier MoE (~37B active / 671B total). MLA + FP8; multi-node GPU cluster required at Q4.',
      zh: 'DeepSeek-V3 前沿 MoE（激活约 37B / 总 671B）。MLA + FP8；Q4 需多节点 GPU 集群。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 385.0, pplLossPercent: 2.0, speedRTX4090: 4, hfSearchUrl: hf('DeepSeek-V3 GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 310.0, pplLossPercent: 4.5, speedRTX4090: 5, hfSearchUrl: hf('DeepSeek-V3 GGUF Q3_K_M') },
    ],
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    family: 'DeepSeek',
    params: 671.0,
    paramLabel: '671B MoE',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu'],
    contextLength: 163840,
    arch: { layers: 61, attHeads: 128, kvHeads: 8, headDim: 128 },
    description: {
      en: 'DeepSeek-R1 reasoning model built on V3 MoE. Chain-of-thought at frontier scale — use distill variants for local GPUs.',
      zh: '基于 V3 MoE 的 DeepSeek-R1 推理模型。前沿级思维链 — 本地 GPU 请用蒸馏版。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 385.0, pplLossPercent: 1.8, speedRTX4090: 4, hfSearchUrl: hf('DeepSeek-R1 GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 310.0, pplLossPercent: 4.2, speedRTX4090: 5, hfSearchUrl: hf('DeepSeek-R1 GGUF Q3_K_M') },
    ],
  },
];