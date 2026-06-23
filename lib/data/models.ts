export interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;
  bpw: number;
  vramGB: number;
  pplLossPercent: number;
  speedRTX4090?: number;
  hfSearchUrl: string;
}

export interface ModelArch {
  layers: number;
  attHeads: number;
  kvHeads: number;
  headDim: number;
}

export interface QuantModel {
  id: string;
  name: string;
  family: string;
  params: number;
  paramLabel: string;
  categories: string[];
  hardwareTags: string[];
  contextLength: number;
  arch: ModelArch;
  quants: QuantVariant[];
  description: { en: string; zh: string };
}

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

export const models: QuantModel[] = [
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B Instruct',
    family: 'Meta Llama 3.1',
    params: 8.03,
    paramLabel: '8B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 32, attHeads: 32, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Meta\'s flagship 8B model with 128K context. Best-in-class for local deployment.',
      zh: 'Meta 旗舰 8B 模型，128K 上下文，端侧部署最优选择之一。',
    },
    quants: [
      { format: 'GGUF', level: 'Q2_K',   bpw: 2.63, vramGB: 3.2,  pplLossPercent: 48.5, speedRTX4090: 210, hfSearchUrl: hf('Llama-3.1-8B-Instruct GGUF Q2_K') },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 5.7,  pplLossPercent: 3.2,  speedRTX4090: 148, hfSearchUrl: hf('Llama-3.1-8B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 7.4,  pplLossPercent: 0.8,  speedRTX4090: 128, hfSearchUrl: hf('Llama-3.1-8B-Instruct GGUF Q6_K') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 9.1,  pplLossPercent: 0.1,  speedRTX4090: 118, hfSearchUrl: hf('Llama-3.1-8B-Instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 4.9,  pplLossPercent: 4.5,  speedRTX4090: 218, hfSearchUrl: hf('Llama-3.1-8B-Instruct AWQ') },
      { format: 'EXL2', level: '4.65bpw',bpw: 4.65, vramGB: 5.4,  pplLossPercent: 2.5,  speedRTX4090: 235, hfSearchUrl: hf('Llama-3.1-8B-Instruct exl2 4.65') },
    ],
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B Instruct',
    family: 'Meta Llama 3.1',
    params: 70.6,
    paramLabel: '70B',
    categories: ['general', 'instruct'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 80, attHeads: 64, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Meta\'s frontier 70B model. Requires 40GB+ VRAM; dual 3090 or M2 Ultra.',
      zh: 'Meta 前沿 70B 模型，需要 40GB+ 显存，适合双 3090 或 M2 Ultra。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 43.5, pplLossPercent: 2.8, speedRTX4090: 38,  hfSearchUrl: hf('Llama-3.1-70B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 49.8, pplLossPercent: 1.2, speedRTX4090: 32,  hfSearchUrl: hf('Llama-3.1-70B-Instruct GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 38.2, pplLossPercent: 3.9, speedRTX4090: 55,  hfSearchUrl: hf('Llama-3.1-70B-Instruct AWQ') },
      { format: 'EXL2', level: '3.5bpw', bpw: 3.5,  vramGB: 33.4, pplLossPercent: 5.2, speedRTX4090: 62,  hfSearchUrl: hf('Llama-3.1-70B-Instruct exl2 3.5bpw') },
    ],
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B Instruct',
    family: 'Meta Llama 3.2',
    params: 3.21,
    paramLabel: '3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 28, attHeads: 24, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Tiny but capable. Runs on 4GB VRAM or 8GB RAM, even on phones via llama.cpp.',
      zh: '小巧而实用，4GB 显存或 8GB 内存即可运行，甚至可在手机端通过 llama.cpp 运行。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 2.2, pplLossPercent: 3.5, speedRTX4090: 320, hfSearchUrl: hf('Llama-3.2-3B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 3.6, pplLossPercent: 0.2, speedRTX4090: 285, hfSearchUrl: hf('Llama-3.2-3B-Instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 2.0, pplLossPercent: 4.8, speedRTX4090: 420, hfSearchUrl: hf('Llama-3.2-3B-Instruct AWQ') },
    ],
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen2.5 7B Instruct',
    family: 'Alibaba Qwen2.5',
    params: 7.62,
    paramLabel: '7B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 28, attHeads: 28, kvHeads: 4, headDim: 128 },
    description: {
      en: 'Alibaba\'s highly optimized 7B. Punches well above its weight, especially in coding.',
      zh: '阿里 Qwen 系列 7B，性能远超同级，代码能力尤其突出。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 5.4, pplLossPercent: 3.0, speedRTX4090: 155, hfSearchUrl: hf('Qwen2.5-7B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 7.0, pplLossPercent: 0.7, speedRTX4090: 132, hfSearchUrl: hf('Qwen2.5-7B-Instruct GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 4.8, pplLossPercent: 4.2, speedRTX4090: 222, hfSearchUrl: hf('Qwen2.5-7B-Instruct AWQ') },
      { format: 'EXL2', level: '4.65bpw',bpw: 4.65, vramGB: 5.2, pplLossPercent: 2.2, speedRTX4090: 245, hfSearchUrl: hf('Qwen2.5-7B-Instruct exl2') },
    ],
  },
  {
    id: 'qwen2.5-14b',
    name: 'Qwen2.5 14B Instruct',
    family: 'Alibaba Qwen2.5',
    params: 14.7,
    paramLabel: '14B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 48, attHeads: 40, kvHeads: 8, headDim: 128 },
    description: {
      en: 'The sweet spot between performance and resource usage. 16GB VRAM with Q4.',
      zh: '性能与资源消耗的最佳平衡点，Q4 量化仅需 16GB 显存。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 10.2, pplLossPercent: 2.9, speedRTX4090: 98, hfSearchUrl: hf('Qwen2.5-14B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 11.8, pplLossPercent: 1.4, speedRTX4090: 86, hfSearchUrl: hf('Qwen2.5-14B-Instruct GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 9.2,  pplLossPercent: 3.8, speedRTX4090: 128, hfSearchUrl: hf('Qwen2.5-14B-Instruct AWQ') },
      { format: 'EXL2', level: '4.65bpw',bpw: 4.65, vramGB: 9.8,  pplLossPercent: 2.1, speedRTX4090: 138, hfSearchUrl: hf('Qwen2.5-14B-Instruct exl2') },
    ],
  },
  {
    id: 'qwen2.5-32b',
    name: 'Qwen2.5 32B Instruct',
    family: 'Alibaba Qwen2.5',
    params: 32.5,
    paramLabel: '32B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu'],
    contextLength: 131072,
    arch: { layers: 64, attHeads: 40, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Near-GPT-4 reasoning on a 24GB VRAM card (Q4_K_S). Groundbreaking value.',
      zh: '24GB 显存单卡可运行 Q4_K_S，推理能力接近 GPT-4，性价比极高。',
    },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 17.5, pplLossPercent: 7.8, speedRTX4090: 52, hfSearchUrl: hf('Qwen2.5-32B-Instruct GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 22.0, pplLossPercent: 2.7, speedRTX4090: 44, hfSearchUrl: hf('Qwen2.5-32B-Instruct GGUF Q4_K_M') },
      { format: 'EXL2', level: '3.5bpw', bpw: 3.5,  vramGB: 16.4, pplLossPercent: 4.8, speedRTX4090: 68, hfSearchUrl: hf('Qwen2.5-32B-Instruct exl2 3.5bpw') },
    ],
  },
  {
    id: 'deepseek-coder-v2-lite',
    name: 'DeepSeek-Coder-V2-Lite Instruct',
    family: 'DeepSeek',
    params: 15.7,
    paramLabel: '16B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 163840,
    arch: { layers: 27, attHeads: 16, kvHeads: 16, headDim: 128 },
    description: {
      en: 'MoE architecture coding model. Active params ~2.4B, total ~16B. Exceptional code quality.',
      zh: 'MoE 架构代码模型，激活参数约 2.4B，代码能力卓越。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 11.1, pplLossPercent: 3.1, speedRTX4090: 145, hfSearchUrl: hf('DeepSeek-Coder-V2-Lite-Instruct GGUF') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 17.5, pplLossPercent: 0.2, speedRTX4090: 118, hfSearchUrl: hf('DeepSeek-Coder-V2-Lite-Instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 9.8,  pplLossPercent: 4.1, speedRTX4090: 192, hfSearchUrl: hf('DeepSeek-Coder-V2-Lite-Instruct AWQ') },
    ],
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi-3.5 Mini Instruct',
    family: 'Microsoft Phi',
    params: 3.82,
    paramLabel: '3.8B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 32, attHeads: 32, kvHeads: 32, headDim: 96 },
    description: {
      en: 'Microsoft\'s tiny powerhouse. Best 4B model for on-device deployment.',
      zh: 'Microsoft 的小巧精悍之作，端侧部署最佳 4B 模型之一。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 2.8, pplLossPercent: 3.8, speedRTX4090: 298, hfSearchUrl: hf('Phi-3.5-mini-instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 4.2, pplLossPercent: 0.2, speedRTX4090: 255, hfSearchUrl: hf('Phi-3.5-mini-instruct GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 2.5, pplLossPercent: 5.1, speedRTX4090: 385, hfSearchUrl: hf('Phi-3.5-mini-instruct AWQ') },
    ],
  },
  {
    id: 'mistral-nemo-12b',
    name: 'Mistral Nemo 12B Instruct',
    family: 'Mistral AI',
    params: 12.2,
    paramLabel: '12B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 128 },
    description: {
      en: 'Mistral + NVIDIA collaboration. 128K context, excellent multilingual support.',
      zh: 'Mistral 与 NVIDIA 合作推出，128K 上下文，多语言能力出色。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 8.5, pplLossPercent: 3.1, speedRTX4090: 112, hfSearchUrl: hf('Mistral-Nemo-Instruct-2407 GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 11.0, pplLossPercent: 0.9, speedRTX4090: 95, hfSearchUrl: hf('Mistral-Nemo-Instruct-2407 GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 7.8,  pplLossPercent: 4.4, speedRTX4090: 148, hfSearchUrl: hf('Mistral-Nemo-Instruct-2407 AWQ') },
    ],
  },
  {
    id: 'gemma-2-9b',
    name: 'Gemma 2 9B Instruct',
    family: 'Google Gemma 2',
    params: 9.24,
    paramLabel: '9B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 8192,
    arch: { layers: 42, attHeads: 16, kvHeads: 8, headDim: 256 },
    description: {
      en: 'Google\'s compact Gemma 2 with sliding window attention. Punches above 9B.',
      zh: 'Google Gemma 2 采用滑动窗口注意力机制，性能超越同级 9B 模型。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 6.5, pplLossPercent: 3.3, speedRTX4090: 132, hfSearchUrl: hf('gemma-2-9b-it GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 10.2, pplLossPercent: 0.2, speedRTX4090: 108, hfSearchUrl: hf('gemma-2-9b-it GGUF Q8_0') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 5.8,  pplLossPercent: 4.6, speedRTX4090: 188, hfSearchUrl: hf('gemma-2-9b-it AWQ') },
    ],
  },
];

export const todayFeed = [
  { id: 1, type: 'new' as const, model: 'Qwen2.5-72B-Instruct', format: 'GGUF', detail: 'Q4_K_M · 43.6 GB · bartowski', hardware: 'RTX 4090 ×2', hoursAgo: 2 },
  { id: 2, type: 'hot' as const, model: 'DeepSeek-R1-Distill-Qwen-14B', format: 'EXL2', detail: '4.65bpw · 9.8 GB · turboderp', hardware: 'RTX 4090', hoursAgo: 5 },
  { id: 3, type: 'new' as const, model: 'Llama-3.3-70B-Instruct', format: 'GGUF', detail: 'Q5_K_M · 50.1 GB · unsloth', hardware: 'A100 80G', hoursAgo: 8 },
  { id: 4, type: 'upd' as const, model: 'Mistral-Small-24B-Instruct', format: 'AWQ', detail: 'INT4 · 14.2 GB · city96', hardware: 'RTX 3090', hoursAgo: 12 },
  { id: 5, type: 'hot' as const, model: 'Qwen2.5-Coder-32B-Instruct', format: 'GGUF', detail: 'Q4_K_M · 22.0 GB · bartowski', hardware: 'RTX 4090', hoursAgo: 18 },
];
