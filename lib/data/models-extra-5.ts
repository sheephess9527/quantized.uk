import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

/** Qwen3 4B dense, Qwen3-Coder MoE, Mistral Large 3, GLM-4-9B */
export const extraModels5: QuantModel[] = [
  {
    id: 'qwen3-4b',
    name: 'Qwen3 4B Instruct',
    family: 'Alibaba Qwen3',
    params: 4.0,
    paramLabel: '4B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 32768,
    arch: { layers: 36, attHeads: 32, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Smallest Qwen3 dense with thinking mode. Q4 ~3.2GB — ideal for 8GB GPUs and edge devices.',
      zh: '最小 Qwen3 稠密模型，支持思考模式。Q4 约 3.2GB，适合 8GB 显卡与边缘设备。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 3.2, pplLossPercent: 2.9, speedRTX4090: 168, hfSearchUrl: hf('Qwen3-4B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 4.1, pplLossPercent: 0.7, speedRTX4090: 145, hfSearchUrl: hf('Qwen3-4B GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 2.8, pplLossPercent: 3.8, speedRTX4090: 225, hfSearchUrl: hf('Qwen3-4B AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 3.0, pplLossPercent: 2.1, speedRTX4090: 248, hfSearchUrl: hf('Qwen3-4B exl2 turboderp') },
    ],
  },
  {
    id: 'qwen3-coder-30b-a3b',
    name: 'Qwen3-Coder 30B-A3B Instruct',
    family: 'Alibaba Qwen3',
    params: 30.5,
    paramLabel: '30B-A3B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 262144,
    arch: { layers: 48, attHeads: 32, kvHeads: 4, headDim: 128 },
    description: {
      en: 'Agentic coding MoE with 3.3B active params and 256K native context. Top open coder for 16–24GB cards.',
      zh: 'Agentic 代码 MoE，3.3B 激活参数，原生 256K 上下文。16–24GB 显卡上最强开源代码模型之一。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 19.2, pplLossPercent: 2.3, speedRTX4090: 92, hfSearchUrl: hf('Qwen3-Coder-30B-A3B GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 22.0, pplLossPercent: 1.0, speedRTX4090: 80, hfSearchUrl: hf('Qwen3-Coder-30B-A3B GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 17.8, pplLossPercent: 3.2, speedRTX4090: 115, hfSearchUrl: hf('Qwen3-Coder-30B-A3B AWQ') },
    ],
  },
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3 675B Instruct',
    family: 'Mistral AI',
    params: 675.0,
    paramLabel: '675B MoE',
    categories: ['general', 'instruct', 'multimodal', 'code'],
    hardwareTags: ['pro-gpu'],
    contextLength: 262144,
    arch: { layers: 64, attHeads: 64, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Mistral 3 flagship MoE (41B active / 675B total) with vision encoder. FP8 on 8×H200; GGUF quant for research clusters only.',
      zh: 'Mistral 3 旗舰 MoE（激活 41B / 总 675B），含视觉编码器。FP8 需 8×H200；GGUF 量化仅供研究集群。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 388.0, pplLossPercent: 2.1, speedRTX4090: 4, hfSearchUrl: hf('Mistral-Large-3-675B GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 312.0, pplLossPercent: 4.5, speedRTX4090: 5, hfSearchUrl: hf('Mistral-Large-3-675B GGUF Q3_K_M') },
    ],
  },
  {
    id: 'glm-4-9b-chat',
    name: 'GLM-4-9B-Chat',
    family: 'Zhipu GLM-4',
    params: 9.0,
    paramLabel: '9B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 2, headDim: 128 },
    description: {
      en: 'Zhipu GLM-4 open 9B with 128K context, tool calling, and strong bilingual (EN/ZH) performance.',
      zh: '智谱 GLM-4 开源 9B，128K 上下文，支持工具调用，中英双语表现突出。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 6.2, pplLossPercent: 3.0, speedRTX4090: 135, hfSearchUrl: hf('glm-4-9b-chat GGUF Q4_K_M bartowski') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 9.8, pplLossPercent: 0.4, speedRTX4090: 105, hfSearchUrl: hf('glm-4-9b-chat GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 5.5, pplLossPercent: 4.2, speedRTX4090: 178, hfSearchUrl: hf('glm-4-9b-chat AWQ') },
    ],
  },
];