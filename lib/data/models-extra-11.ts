import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-10-01';

/**
 * Gemma 4's two larger sizes — the ones that land on a single 16–32 GB card.
 * E2B/E4B (per-layer embeddings, KV shared across 18–20 layers) and the 12B
 * "unified" variant are left out until their cache layout can be sized as
 * carefully as these two.
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
];
