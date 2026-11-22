export type { QuantVariant, QuantSource, ModelArch, QuantModel } from './types';
import type { QuantModel } from './types';
import { extraModels } from './models-extra';
import { extraModels2 } from './models-extra-2';
import { extraModels3 } from './models-extra-3';
import { extraModels4 } from './models-extra-4';
import { extraModels5 } from './models-extra-5';
import { extraModels6 } from './models-extra-6';
import { extraModels7 } from './models-extra-7';
import { extraModels8 } from './models-extra-8';
import { extraModels9 } from './models-extra-9';
import { extraModels10 } from './models-extra-10';
import { extraModels11 } from './models-extra-11';
import { extraModels12 } from './models-extra-12';
import { extraModels13 } from './models-extra-13';
import { extraModels14 } from './models-extra-14';
import { extraModels15 } from './models-extra-15';
import { extraModels16 } from './models-extra-16';
import { extraModels17 } from './models-extra-17';
import { extraModels18 } from './models-extra-18';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const baseModels: QuantModel[] = [
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
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 43.5, pplLossPercent: 2.8,  hfSearchUrl: hf('Llama-3.1-70B-Instruct GGUF Q4_K_M') },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 49.8, pplLossPercent: 1.2,  hfSearchUrl: hf('Llama-3.1-70B-Instruct GGUF Q5_K_M') },
      { format: 'AWQ',  level: 'INT4',   bpw: 4.0,  vramGB: 38.2, pplLossPercent: 3.9,  hfSearchUrl: hf('Llama-3.1-70B-Instruct AWQ') },
      { format: 'EXL2', level: '3.5bpw', bpw: 3.5,  vramGB: 33.4, pplLossPercent: 5.2,  hfSearchUrl: hf('Llama-3.1-70B-Instruct exl2 3.5bpw') },
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
      { format: 'EXL2', level: '4.65bpw',bpw: 4.65, vramGB: 9.8,  pplLossPercent: 2.1, hfSearchUrl: hf('Qwen2.5-14B-Instruct exl2') },
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
    paramLabel: '16B-A2.4B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 163840,
    // MLA, sized as current llama.cpp caches it: one kv_lora_rank + qk_rope_head_dim
    // (512 + 64) vector per token per layer, no V → kvHeads 1 × headDim 288 (see ModelArch).
    // A legacy GGUF (unsplit attn_kv_b) caches full K/V instead; the description says so.
    arch: { layers: 27, attHeads: 16, kvHeads: 1, headDim: 288 },
    description: {
      en: 'MoE architecture coding model. Active params ~2.4B, total ~16B. Exceptional code quality. Its attention is MLA: a GGUF converted by current llama.cpp (tensors attn_k_b / attn_v_b) caches about 1 GB at 32K, which is what the estimates here assume. An older conversion with a single attn_kv_b tensor caches full keys and values instead — about 8.4 GB at 32K.',
      zh: 'MoE 架构代码模型，激活参数约 2.4B，代码能力卓越。注意力采用 MLA：用当前 llama.cpp 转换的 GGUF（含 attn_k_b / attn_v_b 张量）在 32K 下约缓存 1 GB，本站估算即按此计算；只有单个 attn_kv_b 张量的旧版转换会缓存完整的 K 和 V，32K 下约 8.4 GB。',
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
    status: 'superseded',
    supersededBy: 'gemma-4-e4b',
    paramLabel: '9B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 8192,
    // Layer split and window: google-deepmind/gemma `_gemma.py`; llama.cpp
    // `src/models/gemma2.cpp` builds an iSWA cache (pattern 2).
    arch: {
      layers: 42,
      attHeads: 16,
      kvHeads: 8,
      headDim: 256,
      attention: {
        fullLayers: 21,
        windowLayers: 21,
        windowTokens: 4608,
        note: {
          en: '21 of 42 layers use global attention; the other 21 alternate in with a 4,096-token sliding window, so their cache stops growing there (llama.cpp keeps window + one 512-token batch).',
          zh: '42 层中 21 层为全局注意力；另外 21 层交替使用 4096 token 的滑动窗口，缓存到窗口大小就不再增长（llama.cpp 保留窗口加一个 512 token 批次）。',
        },
      },
    },
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

export const models: QuantModel[] = [...baseModels, ...extraModels, ...extraModels2, ...extraModels3, ...extraModels4, ...extraModels5, ...extraModels6, ...extraModels7, ...extraModels8, ...extraModels9, ...extraModels10, ...extraModels11, ...extraModels12, ...extraModels13, ...extraModels14, ...extraModels15, ...extraModels16, ...extraModels17, ...extraModels18];

/**
 * Editor's Picks — refresh with each data cadence.
 *
 * `detail` is reader-facing prose, so it is `{ en, zh }` like every other such
 * field. It used to be a bare string, which put "vision on 12GB" in the middle
 * of the Chinese homepage.
 */
/**
 * Editor's picks. Only the choice and the note are typed: size and the card
 * named beside each pick are computed on render from `calcVRAM` and
 * `cardsFitting`, the same functions behind the model pages. Typed sizes and
 * cards drifted — a 15.6 GB pick was labelled for a 16 GB card (tight, not
 * comfortable) and four named cards were not in the GPU index at all.
 */
export const todayFeed: { id: number; type: 'new' | 'hot' | 'upd'; modelId: string; level: string; note: { en: string; zh: string }; quantizer: string }[] = [
  { id: 56, type: 'new', modelId: 'kormo-web-4b', level: 'Q4_K_M', note: { en: 'Korean and English browser screenshots', zh: '理解韩语和英语网页截图' }, quantizer: 'bartowski' },
  { id: 51, type: 'new', modelId: 'deepseek-v4-flash-0731', level: 'MXFP4', note: { en: 'compressed cache, 1M window', zh: '压缩缓存，100 万上下文' }, quantizer: 'ggml-org' },
  { id: 52, type: 'new', modelId: 'deepseek-v4-1-flash-1017', level: 'Q4_K_M', note: { en: '4 cache owners for 40 layers', zh: '40 层只有 4 层持有缓存' }, quantizer: 'mrfakename' },
  { id: 53, type: 'new', modelId: 'glm-5-3-flash', level: 'Q4_K_M', note: { en: '11 of 45 layers cache', zh: '45 层中仅 11 层缓存' }, quantizer: 'ggml-org' },
  { id: 54, type: 'new', modelId: 'kimi-k3-1-pro', level: 'Q2_K', note: { en: '2.8T, about 1 TB at Q2_K', zh: '2.8 万亿参数，Q2_K 约 1 TB' }, quantizer: 'DevQuasar' },
  { id: 55, type: 'new', modelId: 'minimax-m3-1-flash', level: 'Q2_K', note: { en: 'full K/V cache on all 60 layers', zh: '60 层全部保留 K/V 缓存' }, quantizer: 'smalinin' },
  { id: 50, type: 'new', modelId: 'clairic-flash-9b', level: 'Q4_K_M', note: { en: 'structured text and image extraction', zh: '文本和图像结构化提取' }, quantizer: 'Xylolabs' },
  { id: 49, type: 'new', modelId: 'clairic-27b', level: 'Q4_K_M', note: { en: 'structured multimodal output', zh: '多模态结构化输出' }, quantizer: 'Xylolabs' },
  { id: 48, type: 'new', modelId: 'shot-reader-8b', level: 'Q4_K_M', note: { en: 'structured shot description', zh: '结构化镜头描述' }, quantizer: 'mradermacher' },
  { id: 47, type: 'new', modelId: 'ternary-bonsai-2-27b', level: 'Q2_0', note: { en: 'official Q2_0 for upstream llama.cpp', zh: '适用上游 llama.cpp 的官方 Q2_0' }, quantizer: 'prism-ml' },
  { id: 46, type: 'new', modelId: 'daisyrose-27b', level: 'Q4_K_M', note: { en: 'Qwen-based multimodal reasoning', zh: '基于 Qwen 的多模态推理模型' }, quantizer: 'bartowski' },
  { id: 45, type: 'new', modelId: 'apex-35b-v1', level: 'Q4_K_M', note: { en: 'MoE with separate vision projector', zh: 'MoE，附独立视觉投影文件' }, quantizer: 'bartowski' },
  { id: 44, type: 'new', modelId: 'botpsy-0-8b', level: 'Q4_K_M', note: { en: 'tool calling; official text-only GGUF', zh: '工具调用；官方纯文本 GGUF' }, quantizer: 'qvac' },
  { id: 43, type: 'new', modelId: 'mnn-pocket-0-3b-qat', level: 'Q4_1', note: { en: 'official QAT checkpoint; tied embeddings', zh: '官方 QAT 权重；共享嵌入' }, quantizer: 'taobao-mnn' },
  { id: 42, type: 'new', modelId: 'mnn-pocket-0-3b', level: 'Q8_0', note: { en: 'official BF16-derived GGUF', zh: '官方 BF16 转换 GGUF' }, quantizer: 'taobao-mnn' },
  { id: 41, type: 'new', modelId: 'twil-8b-balanced', level: 'Q4_K_M', note: { en: 'balanced checkpoint; non-commercial research only', zh: 'balanced 权重；仅非商业研究、教育' }, quantizer: 'webAI' },
  { id: 40, type: 'new', modelId: 'arete-27b', level: 'Q4_K_M', note: { en: 'file-sized; only 16 of 64 layers grow KV', zh: '按文件估算；仅 16/64 层增长 KV' }, quantizer: 'bartowski' },
  { id: 36, type: 'new', modelId: 'lfm2-5-1-2b', level: 'Q4_K_M', note: { en: 'Official GGUF files indexed', zh: '按官方 GGUF 文件收录' }, quantizer: 'LiquidAI' },
  { id: 37, type: 'new', modelId: 'lfm2-5-8b-a1b', level: 'Q4_K_M', note: { en: 'Official GGUF files indexed', zh: '按官方 GGUF 文件收录' }, quantizer: 'LiquidAI' },
  { id: 38, type: 'new', modelId: 'ministral-3-3b', level: 'Q4_K_M', note: { en: 'Official GGUF files indexed', zh: '按官方 GGUF 文件收录' }, quantizer: 'Mistral' },
  { id: 39, type: 'new', modelId: 'ministral-3-14b', level: 'Q4_K_M', note: { en: 'Official GGUF files indexed', zh: '按官方 GGUF 文件收录' }, quantizer: 'Mistral' },
  { id: 35, type: 'new', modelId: 'clover-35b-a3b-preview', level: 'Q3_K_M', note: { en: 'Diffusion 35B MoE, 10 of 40 layers cache', zh: '扩散 35B MoE，40 层中仅 10 层缓存' }, quantizer: 'bartowski' },
  { id: 31, type: 'new', modelId: 'xing4-0-29b-a4b', level: 'IQ4_XS', note: { en: '29B MoE, 24 GB card', zh: '29B MoE，24 GB 显卡可跑' }, quantizer: 'bartowski' },
  { id: 33, type: 'new', modelId: 'hy-memory-30b-a3b', level: 'Q4_K_M', note: { en: 'Tencent 30B MoE, 24 GB card', zh: '腾讯 30B MoE，24 GB 显卡可跑' }, quantizer: 'Tencent' },
  { id: 34, type: 'new', modelId: 'kolibri-1-78b-a3-5b', level: 'IQ1_M', note: { en: '78B MoE at 1-bit, 24 GB card', zh: '78B MoE 1 比特，24 GB 显卡可跑' }, quantizer: 'bartowski' },
  { id: 32, type: 'new', modelId: 'ripple-65b-preview', level: 'IQ2_XXS', note: { en: 'Dense 65B, 24 GB card at 2-bit', zh: '65B 稠密，2 比特下 24 GB 可跑' }, quantizer: 'AtomicChat' },
  { id: 30, type: 'new', modelId: 'mistral-large-4', level: 'IQ2_XXS', note: { en: 'Mistral 1T MoE, 512 GB Mac', zh: 'Mistral 1T MoE，512 GB Mac 可跑' }, quantizer: 'ggml-org' },
  { id: 29, type: 'new', modelId: 'mimo-v2-6-distill-qwen-9b', level: 'Q4_K_M', note: { en: 'MiMo distilled into a 9B, 8 GB', zh: 'MiMo 蒸馏的 9B，8 GB 可跑' }, quantizer: 'bartowski' },
  { id: 28, type: 'new', modelId: 'nanbeige4.3-33b', level: 'Q3_K_M', note: { en: 'Dense 33B, Apache 2.0, 24 GB', zh: '33B 稠密，Apache 2.0，24 GB 可跑' }, quantizer: 'bartowski' },
  { id: 27, type: 'new', modelId: 'nemotron-3.5-bolt-e4b', level: 'Q4_K_M', note: { en: 'NVIDIA vision model, 8 GB', zh: 'NVIDIA 视觉小模型，8 GB 可跑' }, quantizer: 'lmstudio-community' },
  { id: 26, type: 'new', modelId: 'flint-40b-a2-5b', level: 'Q3_K_M', note: { en: 'Coding MoE, 2.5B active, 24 GB', zh: '编程 MoE，激活 2.5B，24 GB 可跑' }, quantizer: 'bartowski' },
  { id: 25, type: 'new', modelId: 'k2-horizon-7b', level: 'Q4_K_M', note: { en: 'Fully open, data included, 8 GB', zh: '完全开源，含训练数据，8 GB 可跑' }, quantizer: 'IFM' },
  { id: 24, type: 'new', modelId: 'minicpm-v-4-7-35b-a3b', level: 'Q4_K_S', note: { en: 'Vision MoE, 3B active, 24 GB', zh: '视觉 MoE，激活 3B，24 GB 可跑' }, quantizer: 'OpenBMB' },
  { id: 23, type: 'new', modelId: 'north-mini-code-1.0', level: 'Q4_K_M', note: { en: 'Coding MoE, 3B active, 24 GB', zh: '编程 MoE，激活 3B，24 GB 可跑' }, quantizer: 'bartowski' },
  { id: 22, type: 'new', modelId: 'gemma-4-12b', level: 'Q4_K_M', note: { en: '12B, 256K window on 16 GB', zh: '12B，16 GB 跑满 256K' }, quantizer: 'unsloth' },
  { id: 21, type: 'new', modelId: 'beam-1.0-501b-a23b', level: 'Q2_K', note: { en: '501B, Apache 2.0, 1M window', zh: '501B，Apache 2.0，100 万上下文' }, quantizer: 'DevQuasar' },
  { id: 20, type: 'new', modelId: 'ling-3.1-flash', level: 'Q4_K_M', note: { en: '560B, 25B active, 9 of 72 layers cache', zh: '560B，激活 25B，72 层中仅 9 层缓存' }, quantizer: 'AtomicChat' },
  { id: 17, type: 'new', modelId: 'lfm2-5-24b-a2b', level: 'Q4_K_M', note: { en: '2.45B active, 128K window', zh: '激活 2.45B，128K 上下文' }, quantizer: 'LiquidAI' },
  { id: 19, type: 'new', modelId: 'nemotron-3.5-lightning-30b-a3b', level: 'Q4_0', note: { en: '3B active, 256K on 24 GB', zh: '激活 3B，24 GB 跑 256K' }, quantizer: 'ggml-org' },
  { id: 18, type: 'new', modelId: 'nemotron-3.5-bolt-74b-a9b', level: 'IQ2_XXS', note: { en: '74B built for 24 GB', zh: '为 24 GB 打造的 74B' }, quantizer: 'nvidia' },
  { id: 16, type: 'new', modelId: 'granite-4.2-8b', level: 'Q4_K_M', note: { en: 'dense, thinking by default', zh: '稠密模型，默认思考' }, quantizer: 'ibm-granite' },
  { id: 15, type: 'new', modelId: 'olmo-3-7b', level: 'Q4_K_M', note: { en: 'fully open, 64K window', zh: '完全开源，64K 上下文' }, quantizer: 'allenai' },
  { id: 13, type: 'new', modelId: 'ernie-4.5-21b-a3b', level: 'Q4_K_M', note: { en: '3B active, 128K window', zh: '激活 3B，128K 上下文' }, quantizer: 'baidu' },
  { id: 14, type: 'new', modelId: 'smollm3-3b', level: 'Q4_K_M', note: { en: 'training data published', zh: '训练数据公开' }, quantizer: 'HuggingFaceTB' },
  { id: 12, type: 'new', modelId: 'gemma-4-e4b', level: 'Q4_K_M', note: { en: 'image + audio on 8 GB', zh: '8 GB 跑图像 + 音频' }, quantizer: 'google' },
  { id: 10, type: 'new', modelId: 'gemma-4-26b-a4b', level: 'Q4_K_M', note: { en: '4B active, 256K window', zh: '激活 4B，256K 上下文' }, quantizer: 'google' },
  { id: 11, type: 'new', modelId: 'gemma-4-31b', level: 'Q4_K_M', note: { en: '10 of 60 layers cache', zh: '60 层中仅 10 层缓存' }, quantizer: 'google' },
  { id: 8, type: 'new', modelId: 'glm-4.7-flash', level: 'Q4_K_M', note: { en: '3B active, MLA cache', zh: '激活 3B，MLA 压缩缓存' }, quantizer: 'zai-org' },
  { id: 9, type: 'new', modelId: 'kimi-linear-48b-a3b', level: 'Q4_K_M', note: { en: '1M context, 7 of 27 layers cache', zh: '100 万上下文，27 层中仅 7 层缓存' }, quantizer: 'moonshotai' },
  { id: 0, type: 'new', modelId: 'qwen3-8-27b', level: 'Q4_K_M', note: { en: '16 of 64 layers cache KV', zh: '64 层中仅 16 层缓存 KV' }, quantizer: 'unsloth' },
  { id: 7, type: 'new', modelId: 'ministral-3-8b', level: 'Q4_K_M', note: { en: 'official Mistral GGUF', zh: 'Mistral 官方 GGUF' }, quantizer: 'mistralai' },
  { id: 1, type: 'new', modelId: 'qwen3-vl-8b', level: 'Q4_K_M', note: { en: 'vision-language at 8B', zh: '8B 视觉语言模型' }, quantizer: 'bartowski' },
  { id: 5, type: 'hot', modelId: 'gpt-oss-20b', level: 'MXFP4', note: { en: 'native 4-bit', zh: '原生 4-bit' }, quantizer: 'openai' },
  { id: 6, type: 'hot', modelId: 'qwen3-coder-30b-a3b', level: 'Q4_K_M', note: { en: 'agentic coder', zh: 'agent 编码模型' }, quantizer: 'bartowski' },
];
