import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-10-01';
const ADDED_E = '2026-10-02';

/**
 * Gemma 4's two larger sizes — the ones that land on a single 16–32 GB card —
 * and, since 2026-10-02, the two on-device sizes E2B/E4B. The 12B "unified"
 * variant is still left out.
 *
 * Sources: per-size configs from transformers'
 * `models/gemma4/convert_gemma4_weights.py` (`_VARIANTS`); layer pattern
 * `_DEFAULT_LAYER_TYPES` = 5 sliding + 1 full; `head_dim` 256 / `global_head_dim`
 * 512 from `configuration_gemma4.py`; layer counts cross-checked against
 * llama.cpp `src/models/gemma4.cpp` (`case 30: 26B_A4B`, `case 60: 31B`), which
 * builds an iSWA cache and stores K and V separately even where
 * `attention_k_eq_v` makes them one projection (V is normed, not roped).
 * Sliding window 1024 → llama.cpp allocates pad256(1024 + 512) = 1536 cells.
 * No GGUF file size was reachable (huggingface.co blocked), so quant rows use
 * the calculator's generic bpw and are marked `estimated`.
 *
 * `params` is the text decoder only, counted layer by layer from those
 * configs; llama.cpp loads the vision tower from a separate mmproj file.
 */
export const extraModels11: QuantModel[] = [
  {
    id: 'gemma-4-26b-a4b',
    name: 'Gemma 4 26B-A4B IT',
    family: 'Google Gemma 4',
    // 25.23B total / 3.81B active (text), vendor "26B / 4B active".
    params: 25.23,
    paramLabel: '26B-A4B',
    categories: ['general', 'instruct', 'multimodal', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    // max_position_embeddings = 262_144 in the conversion config.
    contextLength: 262144,
    arch: {
      layers: 30,
      attHeads: 16,
      kvHeads: 8,
      headDim: 256,
      attention: {
        fullLayers: 5,
        windowLayers: 25,
        windowTokens: 1536,
        fullKvHeads: 2,
        fullHeadDim: 512,
        note: {
          en: '5 of 30 layers are global (2 KV heads × 512) and grow with context; the other 25 use a 1,024-token sliding window (8 KV heads × 256).',
          zh: '30 层中 5 层为全局注意力（2 个 KV 头 × 512 维），缓存随上下文增长；其余 25 层是 1024 token 滑动窗口（8 个 KV 头 × 256 维）。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'Google\'s Gemma 4 mixture-of-experts model: about 25B parameters in the text model, roughly 4B active per token, a 256K window and image input. Only 5 of its 30 layers keep a cache that grows with context, and those use fewer, wider heads, so the cache stays small — about 0.9 GB at 32K and 5.3 GB at the full 256K. At Q4 that is about 17 GB at 32K: comfortable on a 24 GB card, which can still load the whole window (tight). A 16 GB card is just too small. Sizes use the calculator\'s generic rates — no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: 'Google Gemma 4 的混合专家模型：文本部分约 25B 参数，每 token 激活约 4B，256K 上下文，支持图像输入。30 层中只有 5 层的缓存随上下文增长，而且这些层用的是更少、更宽的注意力头，所以缓存很小——32K 下约 0.9 GB，用满 256K 也只要约 5.3 GB。Q4 下 32K 上下文约 17 GB：24 GB 显卡可以从容运行，甚至能加载完整窗口（偏紧）。16 GB 显卡差一点装不下。下方体积使用计算器通用比特率——未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 15.3, hfSearchUrl: hf('gemma-4-26B-A4B-it GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 26.8, hfSearchUrl: hf('gemma-4-26B-A4B-it GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    id: 'gemma-4-31b',
    name: 'Gemma 4 31B IT',
    family: 'Google Gemma 4',
    // 30.70B text decoder; vendor "31B" includes the vision tower.
    params: 30.7,
    paramLabel: '31B',
    categories: ['general', 'instruct', 'multimodal', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    arch: {
      layers: 60,
      attHeads: 32,
      kvHeads: 16,
      headDim: 256,
      attention: {
        fullLayers: 10,
        windowLayers: 50,
        windowTokens: 1536,
        fullKvHeads: 4,
        fullHeadDim: 512,
        note: {
          en: '10 of 60 layers are global (4 KV heads × 512) and grow with context; the other 50 use a 1,024-token sliding window (16 KV heads × 256).',
          zh: '60 层中 10 层为全局注意力（4 个 KV 头 × 512 维），缓存随上下文增长；其余 50 层是 1024 token 滑动窗口（16 个 KV 头 × 256 维）。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'Google\'s dense Gemma 4 flagship: about 31B parameters, a 256K window and image input. Only 10 of its 60 layers cache the full context, and those use four wide KV heads, so 128K of context adds about 11 GB of cache where a conventional 60-layer design would need about 120 GB. At Q4 it is about 21 GB at 4K — on a 24 GB card that is right at the edge of comfortable, and tight from 32K. A 32 GB card holds 32K comfortably. Sizes use the calculator\'s generic rates — no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: 'Google Gemma 4 的稠密旗舰：约 31B 参数，256K 上下文，支持图像输入。60 层中只有 10 层缓存完整上下文，而且这些层只用 4 个宽 KV 头，所以 128K 上下文只增加约 11 GB 缓存，常规的 60 层结构则要约 120 GB。Q4 下 4K 上下文约 21 GB——在 24 GB 显卡上刚好压在"从容"的边缘，32K 起就偏紧；32 GB 显卡跑 32K 很从容。下方体积使用计算器通用比特率——未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 18.6, hfSearchUrl: hf('gemma-4-31B-it GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 32.6, hfSearchUrl: hf('gemma-4-31B-it GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    id: 'gemma-4-e4b',
    name: 'Gemma 4 E4B IT',
    family: 'Google Gemma 4',
    // 7.52B text total = 4.70B + a 2.82B per-layer embedding table (262,144 ×
    // 42 × 256). Vendor "8B" adds the vision and audio encoders.
    params: 7.52,
    paramLabel: 'E4B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: {
      layers: 42,
      attHeads: 8,
      kvHeads: 2,
      headDim: 256,
      // num_kv_shared_layers = 18: layers 24–41 reuse the cache of earlier
      // layers, and llama.cpp allocates none for them (`reuse` callback in
      // llama-model.cpp for GEMMA3N/GEMMA4). Of the 24 that keep one, the 5:1
      // pattern gives 4 global and 20 sliding. Window 512 → pad256(512 + 512).
      attention: {
        fullLayers: 4,
        windowLayers: 20,
        windowTokens: 1024,
        fullKvHeads: 2,
        fullHeadDim: 512,
        note: {
          en: 'Only 24 of 42 layers keep a cache — the last 18 reuse it. Of those 24, 4 are global (2 KV heads × 512) and grow with context; 20 use a 512-token sliding window.',
          zh: '42 层中只有 24 层有自己的缓存——最后 18 层复用前面层的缓存。这 24 层里 4 层为全局注意力（2 个 KV 头 × 512 维），缓存随上下文增长；其余 20 层是 512 token 滑动窗口。',
        },
      },
    },
    addedAt: ADDED_E,
    description: {
      en: 'Google\'s on-device Gemma 4: about 4.7B parameters doing the work plus a 2.8B per-layer embedding table, a 128K window, and image and audio input. Only 4 of its 42 layers keep a cache that grows with context, so the full 128K window costs about 2.0 GB of cache. At Q4 it is about 4.9 GB at 4K and 7.0 GB at the full window — an 8 GB card runs it comfortably at everyday context lengths. Sizes here count the whole model in GPU memory, which is what a Mac or a full GPU load uses; llama.cpp keeps the embedding table in system RAM instead, so on a discrete card it needs roughly 1.6 GB less VRAM than shown at Q4. Sizes use the calculator\'s generic rates — no GGUF file size could be checked.',
      zh: 'Google 面向端侧的 Gemma 4：实际参与计算的约 4.7B 参数，外加一张 2.8B 的逐层嵌入表，128K 上下文，支持图像和音频输入。42 层中只有 4 层的缓存随上下文增长，所以用满 128K 也只要约 2.0 GB 缓存。Q4 下 4K 上下文约 4.9 GB，用满窗口约 7.0 GB——日常上下文长度下 8 GB 显卡可以从容运行。这里的体积按整个模型都放进 GPU 内存计算，也就是 Mac 或整模型上 GPU 时的占用；llama.cpp 会把嵌入表留在系统内存，所以在独立显卡上，Q4 实际显存占用比这里少约 1.6 GB。体积使用计算器通用比特率——未能核对到 GGUF 文件大小。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 4.56, hfSearchUrl: hf('gemma-4-E4B-it GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 7.99, hfSearchUrl: hf('gemma-4-E4B-it GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    id: 'gemma-4-e2b',
    name: 'Gemma 4 E2B IT',
    family: 'Google Gemma 4',
    // 4.65B text total = 2.30B (vendor "2.3B effective") + a 2.35B per-layer
    // embedding table (262,144 × 35 × 256). Vendor "5.1B" adds the encoders.
    params: 4.65,
    paramLabel: 'E2B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: {
      layers: 35,
      attHeads: 8,
      kvHeads: 1,
      headDim: 256,
      // num_kv_shared_layers = 20: only layers 0–14 keep a cache. Pattern is
      // 4 sliding + 1 global, so 3 global and 12 sliding. Window 512 → 1024 cells.
      attention: {
        fullLayers: 3,
        windowLayers: 12,
        windowTokens: 1024,
        fullKvHeads: 1,
        fullHeadDim: 512,
        note: {
          en: 'Only 15 of 35 layers keep a cache — the last 20 reuse it. Of those 15, 3 are global (1 KV head × 512) and grow with context; 12 use a 512-token sliding window.',
          zh: '35 层中只有 15 层有自己的缓存——最后 20 层复用前面层的缓存。这 15 层里 3 层为全局注意力（1 个 KV 头 × 512 维），缓存随上下文增长；其余 12 层是 512 token 滑动窗口。',
        },
      },
    },
    addedAt: ADDED_E,
    description: {
      en: 'The smallest Gemma 4: about 2.3B parameters doing the work plus a 2.3B per-layer embedding table, a 128K window, and image and audio input. Its cache barely grows — 3 of 35 layers track the full context, about 0.8 GB at 128K. At Q4 it is about 3.0 GB at 4K and 3.8 GB at the full window — comfortable on any card in this index and on an 8 GB Mac. Sizes count the whole model in GPU memory; llama.cpp keeps the embedding table in system RAM, so on a discrete card it needs roughly 1.3 GB less VRAM than shown at Q4. Sizes use the calculator\'s generic rates — no GGUF file size could be checked.',
      zh: '最小的 Gemma 4：实际参与计算的约 2.3B 参数，外加一张 2.3B 的逐层嵌入表，128K 上下文，支持图像和音频输入。它的缓存几乎不增长——35 层中只有 3 层跟踪完整上下文，128K 下约 0.8 GB。Q4 下 4K 上下文约 3.0 GB，用满窗口约 3.8 GB——本索引中任何一张卡、以及 8 GB 的 Mac 都能从容运行。体积按整个模型都放进 GPU 内存计算；llama.cpp 会把嵌入表留在系统内存，所以在独立显卡上，Q4 实际显存占用比这里少约 1.3 GB。体积使用计算器通用比特率——未能核对到 GGUF 文件大小。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 2.82, hfSearchUrl: hf('gemma-4-E2B-it GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 4.94, hfSearchUrl: hf('gemma-4-E2B-it GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
];
