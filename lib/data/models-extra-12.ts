import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-10-03';

/**
 * Two models picked for constrained hardware (8 GB cards / CPU, and 16 GB cards / Macs), both with
 * plain full attention on every layer, so no new sizing shape is needed.
 *
 * Sources (read 2026-10-03 from raw.githubusercontent; huggingface.co is blocked here):
 * - SmolLM3: transformers `models/smollm3/configuration_smollm3.py` (36 layers, hidden 2048,
 *   16 heads / 4 KV heads → head_dim 128, intermediate 11008, vocab 128256, tied embeddings).
 *   Parameter count from those fields: ~3.08B. Context from Hugging Face's own announcement
 *   (`huggingface/blog` `smollm3.md`): trained to 64K, "up to 128k" only by YaRN extension — the
 *   native 65536 is used. NoPE on every 4th layer changes positional encoding, not the KV cache.
 * - ERNIE 4.5 21B-A3B: transformers `models/ernie4_5_moe/configuration_ernie4_5_moe.py` (28 layers,
 *   hidden 2560, 20 heads / 4 KV heads → head_dim 128, 64 routed experts top-6 + 2 shared, expert
 *   width 1536, first layer dense at 12288, vocab 103424, tied, 131072 positions). Layer-by-layer
 *   total: ~21.8B, ~3B active — matching the release name.
 * - Both architectures exist in llama.cpp (`src/llama-arch.cpp`: "smollm3", "ernie4_5-moe").
 * No GGUF file size was reachable for either, so sizes use the calculator's generic rates and every
 * row is `estimated`; no per-level quality loss has been published, so `pplLossPercent` is absent.
 */
export const extraModels12: QuantModel[] = [
  {
    id: 'smollm3-3b',
    name: 'SmolLM3 3B',
    family: 'Hugging Face SmolLM',
    params: 3.08,
    paramLabel: '3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 65536,
    arch: { layers: 36, attHeads: 16, kvHeads: 4, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Hugging Face\'s fully open 3B model, with its training data and recipe published alongside the weights. It has a reasoning mode you can switch on or off, and a 64K window it was actually trained to, which reaches 128K only by YaRN extension. Four KV heads keep the cache small, so the window is affordable: at Q4_K_M it fits a 4 GB card at short context and an 8 GB card at its full trained window. That also makes it one of the few models here that is realistic on a CPU-only machine. Sizes use the calculator\'s generic rates, since no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: 'Hugging Face 完全开源的 3B 模型，训练数据和训练方法随权重一起公开。它带一个可开关的推理模式，实际训练到的上下文窗口是 64K，128K 要靠 YaRN 外推。只有 4 个 KV 头，缓存很小，所以长窗口也负担得起：Q4_K_M 下短上下文能放进 4 GB 显卡，用满训练窗口也能放进 8 GB 显卡。这也让它成为本站少数在纯 CPU 机器上也现实可用的模型之一。下方体积使用计算器的通用比特率，因为未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 2.3, hfSearchUrl: hf('SmolLM3-3B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 3.7, hfSearchUrl: hf('SmolLM3-3B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    id: 'ernie-4.5-21b-a3b',
    name: 'ERNIE 4.5 21B-A3B',
    family: 'Baidu ERNIE 4.5',
    params: 21.8,
    paramLabel: '21B-A3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 28, attHeads: 20, kvHeads: 4, headDim: 128 },
    addedAt: ADDED,
    description: {
      en: 'Baidu\'s open mixture-of-experts model: about 21.8B parameters in total and roughly 3B active per token. Each token goes through 6 of 64 routed experts plus 2 shared ones. The total decides the memory and the active count decides the speed, so it needs the VRAM of a 20B-class model and reads about as much per token as a 3B one. At Q4_K_M it needs about 14.1 GB at 4K context, which is right at the edge of comfortable on a 16 GB card and tight by 32K. A 24 GB card, or a 24 GB Mac through the GPU\'s share of unified memory, leaves real room for context. Sizes use the calculator\'s generic rates, since no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: '百度开源的混合专家模型：总参数约 21.8B，每个 token 约激活 3B，由 64 个路由专家（每个 token 选 6 个）加 2 个共享专家组成。总参数决定显存，激活参数决定速度，所以它需要 20B 级模型的显存，每个 token 读取的数据量却和 3B 模型差不多。Q4_K_M 在 4K 上下文下约需 14.1 GB，在 16 GB 显卡上正好处于“宽裕”的边缘，到 32K 就偏紧了；24 GB 显卡，或 24 GB 的 Mac（靠 GPU 可用的那部分统一内存）才有真正的上下文余量。下方体积使用计算器的通用比特率，因为未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 14.1, hfSearchUrl: hf('ERNIE-4.5-21B-A3B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 24.4, hfSearchUrl: hf('ERNIE-4.5-21B-A3B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
];
