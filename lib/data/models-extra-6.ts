import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-07-22';

/** Freshness batch: Gemma 3 27B, R1 Llama-8B distill, Phi-4, Qwen3 1.7B edge */
export const extraModels6: QuantModel[] = [
  {
    id: 'gemma-3-27b-it',
    name: 'Gemma 3 27B IT',
    family: 'Google Gemma 3',
    params: 27.4,
    paramLabel: '27B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'pro-gpu'],
    contextLength: 131072,
    arch: { layers: 62, attHeads: 32, kvHeads: 16, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Gemma 3 large instruct with long context and multimodal support. Q4 ~16GB — dual-GPU or 24GB card with short ctx.',
      zh: 'Gemma 3 大杯指令版，长上下文 + 多模态。Q4 约 16GB，适合 24GB 卡或双卡短上下文。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 16.2, pplLossPercent: 2.8, speedRTX4090: 48, hfSearchUrl: hf('gemma-3-27b-it GGUF Q4_K_M bartowski'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 13.0, pplLossPercent: 5.5, speedRTX4090: 55, hfSearchUrl: hf('gemma-3-27b-it GGUF Q3_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 14.5, pplLossPercent: 3.8, speedRTX4090: 62, hfSearchUrl: hf('gemma-3-27b-it AWQ') },
    ],
  },
  {
    id: 'deepseek-r1-distill-llama-8b',
    name: 'DeepSeek-R1-Distill-Llama-8B',
    family: 'DeepSeek',
    params: 8.03,
    paramLabel: '8B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 32, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'R1 reasoning distilled into Llama 3.1 8B. Best chain-of-thought for 8–12GB cards; huge community GGUF support.',
      zh: 'R1 推理蒸馏到 Llama 3.1 8B。8–12GB 显卡上最佳思维链之一，社区 GGUF 极丰富。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 5.6, pplLossPercent: 2.6, speedRTX4090: 145, hfSearchUrl: hf('DeepSeek-R1-Distill-Llama-8B GGUF Q4_K_M bartowski'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 6.5, pplLossPercent: 1.2, speedRTX4090: 128, hfSearchUrl: hf('DeepSeek-R1-Distill-Llama-8B GGUF Q5_K_M') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 5.3, pplLossPercent: 1.9, speedRTX4090: 210, hfSearchUrl: hf('DeepSeek-R1-Distill-Llama-8B exl2') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 4.9, pplLossPercent: 3.5, speedRTX4090: 188, hfSearchUrl: hf('DeepSeek-R1-Distill-Llama-8B AWQ') },
    ],
  },
  {
    id: 'phi-4',
    name: 'Phi-4 14B',
    family: 'Microsoft Phi',
    params: 14.7,
    paramLabel: '14B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 16384,
    arch: { layers: 40, attHeads: 40, kvHeads: 10, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Microsoft Phi-4 dense 14B — strong reasoning for size. Q4 ~9GB fits 12GB cards with moderate context.',
      zh: '微软 Phi-4 稠密 14B，同尺寸推理能力突出。Q4 约 9GB，12GB 卡中等上下文可跑。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 9.1, pplLossPercent: 2.7, speedRTX4090: 88, hfSearchUrl: hf('phi-4 GGUF Q4_K_M bartowski'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 10.5, pplLossPercent: 1.3, speedRTX4090: 78, hfSearchUrl: hf('phi-4 GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 8.2, pplLossPercent: 3.6, speedRTX4090: 112, hfSearchUrl: hf('phi-4 AWQ') },
    ],
  },
  {
    id: 'qwen3-1.7b',
    name: 'Qwen3 1.7B Instruct',
    family: 'Alibaba Qwen3',
    params: 1.72,
    paramLabel: '1.7B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 32768,
    arch: { layers: 28, attHeads: 16, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Tiny Qwen3 with thinking mode. Q4 ~1.4GB — phones, NUC, and always-on local agents.',
      zh: '迷你 Qwen3，支持思考模式。Q4 约 1.4GB，适合手机旁路、NUC 与常驻本地 Agent。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 1.4, pplLossPercent: 3.0, speedRTX4090: 280, hfSearchUrl: hf('Qwen3-1.7B GGUF Q4_K_M bartowski'), confidence: 'community' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 2.1, pplLossPercent: 0.4, speedRTX4090: 240, hfSearchUrl: hf('Qwen3-1.7B GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 1.2, pplLossPercent: 4.0, speedRTX4090: 320, hfSearchUrl: hf('Qwen3-1.7B AWQ') },
    ],
  },
];
