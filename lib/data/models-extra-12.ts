import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-10-03';
const ADDED_OLMO3 = '2026-10-05';
const ADDED_GLIMMER = '2026-10-09';

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
  {
    // OLMo 3 7B. Architecture from AllenAI's own OLMo-core (`olmo3_7B` = `olmo2_7B` = llama2_7B
    // shape: 32 layers, d_model 4096, 32 heads, no GQA → kvHeads 32, head_dim 128) with
    // SlidingWindowAttentionConfig pattern [4096, 4096, 4096, -1] → 24 window layers + 8 full.
    // The released config (via search, huggingface.co is blocked here) carries
    // max_position_embeddings 65536 = YaRN factor 8 over an 8192 original, sliding_window 4096.
    // llama.cpp loads it as `olmo2` with `load_swa_pattern(ml, 4)`; with swa_full off a window
    // layer holds pad256(4096 + 512) = 4608 cells, the same rule as Gemma 2.
    id: 'olmo-3-7b',
    name: 'OLMo 3 7B Instruct',
    family: 'Allen AI OLMo',
    params: 7.3,
    paramLabel: '7B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 65536,
    arch: { layers: 32, attHeads: 32, kvHeads: 32, headDim: 128, attention: { fullLayers: 8, windowLayers: 24, windowTokens: 4608 } },
    addedAt: ADDED_OLMO3,
    description: {
      en: 'Allen AI\'s fully open 7B model, released with its training data, code and intermediate checkpoints. Its predecessor stopped at a 4K context; OLMo 3 reaches 64K, extended from an 8K base by YaRN. Three of every four layers use a 4K sliding window, which is what makes that affordable. It still uses full multi-head attention with no shared KV heads, so long context costs more here than on most 7B–8B models. At Q4_K_M it needs about 6.8 GB at 4K context and 10.9 GB at 32K. Without the sliding window, 32K would need about 22 GB. Sizes use the calculator\'s generic rates, since no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: 'Allen AI 完全开源的 7B 模型，训练数据、代码和中间检查点一并公开。上一代只有 4K 上下文，OLMo 3 达到 64K（由 8K 基础通过 YaRN 扩展而来）。每四层中有三层使用 4K 滑动窗口，这正是长上下文负担得起的原因。不过它仍是完整的多头注意力，没有共享 KV 头，所以长上下文的代价比大多数 7B–8B 模型高。Q4_K_M 在 4K 上下文下约需 6.8 GB，32K 下约 10.9 GB；如果没有滑动窗口，32K 需要约 22 GB。下方体积使用计算器的通用比特率，因为未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 6.8, hfSearchUrl: hf('Olmo-3-7B-Instruct GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 10.3, hfSearchUrl: hf('Olmo-3-7B-Instruct GGUF Q8_0'),  confidence: 'estimated' },
    ],
  },
  {
    // Muse Glimmer (Meta, released 2026-08-10, Apache 2.0). Text decoder from transformers
    // `models/muse_glimmer/configuration_muse_glimmer.py`: 52 layers, hidden 6656, 32 heads, 2 KV
    // heads × head_dim 128, intermediate 19968, vocab 202048, untied embeddings, 131072 positions,
    // sliding_window 2048, every 4th layer full attention (NoPE) → 13 full + 39 window layers.
    // llama.cpp `src/models/muse-glimmer.cpp` adds a per-layer attention output gate
    // (n_embd × n_head·head_dim) the config does not show; with it the decoder is 27.85B, matching
    // Meta's "28B text decoder". Loaded with `load_swa_pattern(ml, 4)` and the iSWA cache, so a
    // window layer holds pad256(2048 + 512) = 2560 cells. File sizes (search; huggingface.co is
    // blocked here): Q4_K_M is Meta's official `meta-models/Muse-Glimmer-30B-GGUF` build,
    // 16,756,683,904 B → 4.81 bpw (bartowski's own Q4_K_M recipe is 17.31 GB, 4.97); bartowski
    // Q5_K_M 20.11 / Q6_K 23.41 / Q8_0 29.61 GB → 5.78 / 6.72 / 8.50 bpw (Q8_0 on 8.50 confirms
    // the parameter count). The
    // ~1.8B vision encoder ships as a separate mmproj file and is not in `params`.
    id: 'muse-glimmer-30b',
    name: 'Muse Glimmer 30B',
    family: 'Meta Muse',
    params: 27.85,
    paramLabel: '30B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 52, attHeads: 32, kvHeads: 2, headDim: 128, attention: { fullLayers: 13, windowLayers: 39, windowTokens: 2560 } },
    addedAt: ADDED_GLIMMER,
    description: {
      en: 'Meta\'s first open-weight model since Llama 4, released in August under Apache 2.0 and built to run on one card. It is a dense model: a 28B text decoder that reads images through a separate vision encoder and answers in text. Three of every four layers use a 2K sliding window and the rest share just 2 KV heads, so long context is unusually cheap. At Q4_K_M it needs about 17.7 GB at 4K context and only 19.4 GB at its full 128K window, comfortable on a 24 GB card either way. Q5_K_M is tight on 24 GB, and Q8_0 wants a 32 GB card. The vision encoder (about 1.4 GB as a GGUF mmproj file) and Meta\'s optional speculative-decoding drafter load on top and are not included. Sizes come from the published GGUF file sizes; the Q4_K_M row is Meta\'s own official build. Meta\'s benchmark claims are its own, and no per-level quality loss has been published.',
      zh: 'Meta 自 Llama 4 以来第一个开放权重模型，8 月以 Apache 2.0 发布，目标就是单卡运行。它是稠密模型：28B 的文本解码器，通过单独的视觉编码器读取图像，输出文本。每四层中有三层使用 2K 滑动窗口，其余层只有 2 个 KV 头，所以长上下文格外便宜。Q4_K_M 在 4K 上下文下约需 17.7 GB，用满 128K 窗口也只要 19.4 GB，两种情况在 24 GB 显卡上都很宽裕。Q5_K_M 在 24 GB 上偏紧，Q8_0 需要 32 GB 显卡。视觉编码器（GGUF mmproj 文件约 1.4 GB）和 Meta 可选的投机解码草稿模型会额外占用显存，不含在上述数字内。体积按已公布的 GGUF 文件大小计算，Q4_K_M 一行是 Meta 官方发布的版本。基准成绩是 Meta 自己报的，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.81, vramGB: 17.7, hfSearchUrl: hf('Muse-Glimmer-30B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.78, vramGB: 21.2, hfSearchUrl: hf('Muse-Glimmer-30B GGUF Q5_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.72, vramGB: 24.6, hfSearchUrl: hf('Muse-Glimmer-30B GGUF Q6_K'),   confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 31.1, hfSearchUrl: hf('Muse-Glimmer-30B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
];
