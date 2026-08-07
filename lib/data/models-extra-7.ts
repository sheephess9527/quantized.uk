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
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 24, attHeads: 64, kvHeads: 8, headDim: 64 },
    addedAt: ADDED,
    description: {
      en: 'OpenAI open-weight MoE (21B total / 3.6B active), shipped natively in MXFP4 — ~12.8GB runs on a 16GB card with no quality tax. Only 3.6B active params means CPU-offload stays usable.',
      zh: 'OpenAI 开放权重 MoE（总 21B / 激活 3.6B），原生以 MXFP4 发布 —— 约 12.8GB，16GB 显卡即可跑且无额外精度损失。激活仅 3.6B，CPU 卸载也还能用。',
    },
    quants: [
      { format: 'GGUF', level: 'MXFP4', bpw: 4.25, vramGB: 12.8, pplLossPercent: 0.0, speedRTX4090: 195, hfSearchUrl: hf('gpt-oss-20b GGUF MXFP4'), confidence: 'community' },
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
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 36, attHeads: 64, kvHeads: 8, headDim: 64 },
    addedAt: ADDED,
    description: {
      en: 'The big GPT-OSS (117B total / 5.1B active). Native MXFP4 checkpoint is ~61GB — fits one 80GB card or a 128GB unified-memory Mac. Partial offload on 24GB consumer cards is slow but works.',
      zh: 'GPT-OSS 大杯（总 117B / 激活 5.1B）。原生 MXFP4 权重约 61GB —— 单张 80GB 卡或 128GB 统一内存 Mac 可跑。24GB 消费卡部分卸载虽慢但可用。',
    },
    quants: [
      { format: 'GGUF', level: 'MXFP4', bpw: 4.25, vramGB: 61.0, pplLossPercent: 0.0, speedRTX4090: 22, hfSearchUrl: hf('gpt-oss-120b GGUF MXFP4'), confidence: 'community' },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.10, vramGB: 58.5, pplLossPercent: 1.6, speedRTX4090: 24, hfSearchUrl: hf('gpt-oss-120b GGUF Q4_K_M') },
    ],
  },
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5-Air',
    family: 'Zhipu GLM-4.5',
    params: 106.0,
    paramLabel: '106B MoE',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 46, attHeads: 96, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Zhipu\'s agentic/reasoning MoE (106B total / 12B active). Q4 ~64GB — the sweet spot is a 96GB+ unified Mac or 2× 48GB cards. Strong tool-calling for its class.',
      zh: '智谱 Agent/推理向 MoE（总 106B / 激活 12B）。Q4 约 64GB —— 96GB+ 统一内存 Mac 或双 48GB 卡最合适。同级别中工具调用能力突出。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 64.3, pplLossPercent: 2.4, speedRTX4090: 18, hfSearchUrl: hf('GLM-4.5-Air GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.87, vramGB: 51.3, pplLossPercent: 5.1, speedRTX4090: 21, hfSearchUrl: hf('GLM-4.5-Air GGUF Q3_K_M') },
      { format: 'GGUF', level: 'Q2_K',   bpw: 2.63, vramGB: 34.8, pplLossPercent: 12.0, speedRTX4090: 26, hfSearchUrl: hf('GLM-4.5-Air GGUF Q2_K') },
    ],
  },
  {
    id: 'devstral-small-2507',
    name: 'Devstral Small 1.1 24B',
    family: 'Mistral Devstral',
    params: 23.6,
    paramLabel: '24B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Mistral + All Hands agentic coding model on a Mistral Small 3.1 base. Built for repo-scale tool use rather than single-file completion. Q4 ~14GB fits a 16GB card.',
      zh: 'Mistral 与 All Hands 合作的 Agent 编码模型，基于 Mistral Small 3.1。面向仓库级工具调用而非单文件补全。Q4 约 14GB，16GB 显卡可跑。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 14.3, pplLossPercent: 2.9, speedRTX4090: 62, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q4_K_M'), confidence: 'community' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 16.8, pplLossPercent: 1.4, speedRTX4090: 55, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q5_K_M') },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 19.4, pplLossPercent: 0.6, speedRTX4090: 48, hfSearchUrl: hf('Devstral-Small-2507 GGUF Q6_K') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 13.0, pplLossPercent: 4.0, speedRTX4090: 78, hfSearchUrl: hf('Devstral-Small-2507 AWQ') },
      { format: 'EXL2', level: '4.65bpw', bpw: 4.65, vramGB: 13.9, pplLossPercent: 2.5, speedRTX4090: 88, hfSearchUrl: hf('Devstral-Small-2507 exl2 4.65') },
    ],
  },
];
