import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

/** 2025–2026 flagship models: Qwen3, Gemma 3, Llama 4, Llama 3.1 405B */
export const extraModels3: QuantModel[] = [
  {
    id: 'qwen3-8b',
    name: 'Qwen3 8B Instruct',
    family: 'Alibaba Qwen3',
    params: 8.19,
    paramLabel: '8B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 40960,
    arch: { layers: 36, attHeads: 32, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Latest Qwen3 dense 8B with thinking mode. Strong upgrade from Qwen2.5 7B for local deploy.',
      zh: '最新 Qwen3 稠密 8B，支持思考模式，本地部署比 Qwen2.5 7B 全面升级。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 5.8, pplLossPercent: 2.8, speedRTX4090: 142, hfSearchUrl: hf('Qwen3-8B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 7.5, pplLossPercent: 0.6, speedRTX4090: 122, hfSearchUrl: hf('Qwen3-8B GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 5.1, pplLossPercent: 3.8, speedRTX4090: 205, hfSearchUrl: hf('Qwen3-8B AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 5.5, pplLossPercent: 2.0, speedRTX4090: 228, hfSearchUrl: hf('Qwen3-8B exl2 turboderp') },
    ],
  },
  {
    id: 'qwen3-14b',
    name: 'Qwen3 14B Instruct',
    family: 'Alibaba Qwen3',
    params: 14.77,
    paramLabel: '14B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 40960,
    arch: { layers: 40, attHeads: 40, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Qwen3 14B — best balance of reasoning and VRAM in the 2026 Qwen lineup.',
      zh: 'Qwen3 14B — 2026 Qwen 系列中推理能力与显存占用的最佳平衡点。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 10.5, pplLossPercent: 2.6, speedRTX4090: 88, hfSearchUrl: hf('Qwen3-14B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 12.2, pplLossPercent: 1.2, speedRTX4090: 78, hfSearchUrl: hf('Qwen3-14B GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 9.5, pplLossPercent: 3.5, speedRTX4090: 115, hfSearchUrl: hf('Qwen3-14B AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 10.0, pplLossPercent: 1.8, speedRTX4090: 125, hfSearchUrl: hf('Qwen3-14B exl2') },
    ],
  },
  {
    id: 'gemma-3-4b-it',
    name: 'Gemma 3 4B IT',
    family: 'Google Gemma 3',
    params: 4.3,
    paramLabel: '4B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 34, attHeads: 8, kvHeads: 4, headDim: 256 },
    description: {
      en: 'Google Gemma 3 multimodal 4B. 128K context; strong vision + text on 8GB cards.',
      zh: 'Google Gemma 3 多模态 4B，128K 上下文，8GB 显卡可跑图文理解。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 3.4, pplLossPercent: 3.2, speedRTX4090: 175, hfSearchUrl: hf('gemma-3-4b-it GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 5.2, pplLossPercent: 0.2, speedRTX4090: 145, hfSearchUrl: hf('gemma-3-4b-it GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 3.0, pplLossPercent: 4.2, speedRTX4090: 210, hfSearchUrl: hf('gemma-3-4b-it AWQ') },
    ],
  },
  {
    id: 'gemma-3-12b-it',
    name: 'Gemma 3 12B IT',
    family: 'Google Gemma 3',
    params: 12.2,
    paramLabel: '12B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 48, attHeads: 16, kvHeads: 8, headDim: 240 },
    description: {
      en: 'Mid-size Gemma 3 with vision. Fits 16GB at Q4; excellent multilingual chat.',
      zh: '中型 Gemma 3 视觉模型，Q4 可装入 16GB，多语言对话表现优秀。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 8.8, pplLossPercent: 2.9, speedRTX4090: 105, hfSearchUrl: hf('gemma-3-12b-it GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 10.2, pplLossPercent: 1.3, speedRTX4090: 92, hfSearchUrl: hf('gemma-3-12b-it GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 8.0, pplLossPercent: 3.9, speedRTX4090: 128, hfSearchUrl: hf('gemma-3-12b-it AWQ') },
    ],
  },
  {
    id: 'llama-4-scout-17b',
    name: 'Llama 4 Scout 17B (16E)',
    family: 'Meta Llama 4',
    params: 109.0,
    paramLabel: '109B MoE',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['pro-gpu'],
    contextLength: 10485760,
    arch: { layers: 48, attHeads: 40, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Meta Llama 4 Scout MoE (17B active / 109B total). Multimodal; needs ~68GB VRAM at Q4_K_M.',
      zh: 'Meta Llama 4 Scout MoE（激活 17B / 总 109B），多模态，Q4_K_M 约需 68GB 显存。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 68.0, pplLossPercent: 2.4, speedRTX4090: 22, hfSearchUrl: hf('Llama-4-Scout-17B-16E-Instruct GGUF bartowski') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 55.0, pplLossPercent: 4.8, speedRTX4090: 26, hfSearchUrl: hf('Llama-4-Scout GGUF Q3_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 58.0, pplLossPercent: 3.2, speedRTX4090: 28, hfSearchUrl: hf('Llama-4-Scout AWQ') },
    ],
  },
  {
    id: 'llama-4-maverick-17b',
    name: 'Llama 4 Maverick 17B (128E)',
    family: 'Meta Llama 4',
    params: 400.0,
    paramLabel: '400B MoE',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 48, attHeads: 40, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Llama 4 Maverick flagship MoE (17B active / 400B total). Multi-GPU or H100 cluster territory.',
      zh: 'Llama 4 Maverick 旗舰 MoE（激活 17B / 总 400B），需多卡或 H100 集群。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 245.0, pplLossPercent: 2.2, speedRTX4090: 8, hfSearchUrl: hf('Llama-4-Maverick-17B-128E-Instruct GGUF') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 198.0, pplLossPercent: 4.5, speedRTX4090: 10, hfSearchUrl: hf('Llama-4-Maverick GGUF Q3_K_M') },
    ],
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B Instruct',
    family: 'Meta Llama 3.1',
    params: 405.0,
    paramLabel: '405B',
    categories: ['general', 'instruct'],
    hardwareTags: ['pro-gpu'],
    contextLength: 131072,
    arch: { layers: 126, attHeads: 128, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Meta frontier dense 405B. Q4 needs ~230GB+ VRAM; dual H100 80G or 8× consumer GPU.',
      zh: 'Meta 前沿稠密 405B，Q4 约需 230GB+ 显存；双 H100 80G 或 8 卡消费级方案。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 238.0, pplLossPercent: 2.3, speedRTX4090: 6, hfSearchUrl: hf('Llama-3.1-405B-Instruct GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 192.0, pplLossPercent: 5.0, speedRTX4090: 8, hfSearchUrl: hf('Llama-3.1-405B-Instruct GGUF Q3_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 210.0, pplLossPercent: 3.5, speedRTX4090: 10, hfSearchUrl: hf('Llama-3.1-405B-Instruct AWQ') },
    ],
  },
];