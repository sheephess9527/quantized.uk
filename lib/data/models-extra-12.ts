import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-10-03';
const ADDED_OLMO3 = '2026-10-05';
const ADDED_GLIMMER = '2026-10-09';
const ADDED_QWEN38_FLASH = '2026-10-10';
const ADDED_QWEN36 = '2026-10-10';
const ADDED_QWEN35_SMALL = '2026-10-11';
const ADDED_MIMO26 = '2026-10-12';
const ADDED_MELLUM21 = '2026-10-13';

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
  {
    // Qwen3.8-Flash-Next (Qwen, released 2026-08-26; preview of the Qwen4 architecture). Official
    // config.json text_config (via search — huggingface.co is blocked here): 48 layers, hidden 2560,
    // 24 heads, 2 KV heads × head_dim 256, full_attention_interval 4 (12 full-attention layers, 36
    // Gated DeltaNet layers with a fixed recurrent state), 512 experts / 10 routed + 1 shared,
    // 262144 positions; QSA on the full layers (indexer 4 heads × 128, 1 key head, budget 2048,
    // compress ratio 4). Expert width 640 is from a GGUF card (AtomicChat), not the official file;
    // with it the trunk counts ~124.4B, matching the stated "125B total / 6B active".
    // llama.cpp: `qwen4exp` (PR #27742, merged 2026-08-27), `src/models/qwen4exp.cpp`. Its memory
    // is `llama_memory_hybrid_idx`: full KV on the 12 attention layers (QSA reads it sparsely, it does
    // not shrink it) plus an indexer cache of raw + pooled key (2 × 128 values) per token per layer.
    // Encoded as fullHeadDim 320: (2·2·256·2 + 2·128·2) bytes ÷ (2·2·2) — 256 is the real head dim.
    // `params` deliberately EXCLUDES the 51B n-gram (PLE) table and the 4B MTP head: llama.cpp loads
    // the table as `per_layer_tok_embd` with TENSOR_READ_LAZY (LAYER_INPUT, host/mmap — never VRAM),
    // and MTP ships as a separate GGUF. GGUF files bundle the table, so no file size isolates the
    // trunk's bpw: generic rates, `estimated`. Width 640 is not a multiple of 256, so ffn_down_exps
    // falls back to another type in k-quants — real files can differ by a few percent.
    id: 'qwen3-8-flash-next',
    name: 'Qwen3.8-Flash-Next',
    family: 'Qwen3.8',
    params: 125,
    paramLabel: '125B-A6B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 262144,
    arch: { layers: 48, attHeads: 24, kvHeads: 2, headDim: 256, attention: { fullLayers: 12, windowLayers: 0, fullHeadDim: 320 } },
    addedAt: ADDED_QWEN38_FLASH,
    description: {
      en: 'Qwen\'s preview of its next architecture: a 125B mixture-of-experts model with about 6B parameters active per token. Released in August, it also carries a 51B n-gram lookup table. llama.cpp reads that table lazily from RAM or disk, so it never needs VRAM. It does need disk space and is bundled inside the GGUF files, which is why they are far larger than the sizes below. Only 12 of its 48 layers keep a growing KV cache, so even the full 256K window adds about 7.5 GB. At Q4_K_M it needs about 79 GB at 4K context and 87 GB at 256K, comfortable on a 128 GB Mac or DGX Spark. A single 24 or 32 GB card runs it only with experts offloaded to system RAM. llama.cpp supports it as `qwen4exp`. Sizes use the calculator\'s generic rates, since no file size isolates the model from the table, and no per-level quality loss has been published.',
      zh: 'Qwen 下一代架构的预览版，8 月发布：125B 的混合专家模型，每个 token 约激活 6B 参数，另带一张 51B 的 n-gram 查找表。llama.cpp 从内存或磁盘按需读取这张表，它从不占用显存，但要占磁盘空间，而且打包在 GGUF 文件里，所以文件比下面的数字大得多。48 层中只有 12 层保留会增长的 KV 缓存，即使用满 256K 窗口也只多约 7.5 GB。Q4_K_M 在 4K 上下文下约需 79 GB，256K 下约 87 GB，128 GB 的 Mac 或 DGX Spark 能从容运行。单张 24 或 32 GB 显卡只有把专家卸载到系统内存才能跑。llama.cpp 以 `qwen4exp` 架构支持它。下方体积使用计算器的通用比特率（没有哪个文件大小能把模型本身和查找表分开），各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 79.3, hfSearchUrl: hf('Qwen3.8-Flash-Next GGUF'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 138.9, hfSearchUrl: hf('Qwen3.8-Flash-Next GGUF Q8_0'), confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.6-35B-A3B. Official config.json (via search; huggingface.co is blocked here): 40 layers,
    // hidden 2048, 16 heads / 2 KV heads × head_dim 256, full_attention_interval 4 (10 full-attention
    // + 30 Gated DeltaNet layers — the shape already validated on Qwen3.8 27B), 256 experts / 8 routed
    // + 1 shared, 262144 positions (Qwen3.5 config + a Qwen3.6 draft model; not seen in the 3.6 main
    // file). llama.cpp arch `qwen35moe`. Parameter count from bartowski's Q8_0 (37.81 GB ÷ 8.5 bpw =
    // 35.59B, matching the name); Q4_K_M 22.29 GB → 5.01 bpw. The vision encoder is a separate mmproj.
    id: 'qwen3-6-35b-a3b',
    name: 'Qwen3.6 35B-A3B',
    family: 'Alibaba Qwen3.6',
    params: 35.59,
    paramLabel: '35B-A3B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    arch: { layers: 40, attHeads: 16, kvHeads: 2, headDim: 256, attention: { fullLayers: 10, note: { en: '10 of 40 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '40 层中有 10 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN36,
    description: {
      en: 'One of the most recommended models for a 24 GB card this year: 35.6B parameters, about 3B active per token, so it reads per token about as much as a 3B model. Only 10 of its 40 layers keep a growing KV cache, so context is cheap: at Q4_K_M it needs about 23.4 GB at 4K and 24.0 GB at 32K. On this site\'s rule that is tight on a 24 GB card, not comfortable, because it counts a working buffer most guides leave out. A 32 GB card, or a 48 GB Mac through the GPU\'s share of unified memory, has real room. It reads images through a separate vision encoder. Sizes come from the published GGUF file sizes, and no per-level quality loss has been published.',
      zh: '今年被推荐最多的 24 GB 显卡模型之一：总参数 35.6B，每个 token 约激活 3B，每个 token 读取的数据量和 3B 模型差不多。40 层中只有 10 层保留会增长的 KV 缓存，所以上下文很便宜：Q4_K_M 在 4K 下约需 23.4 GB，32K 下约 24.0 GB。按本站的规则，这在 24 GB 显卡上属于「勉强」而不是「宽裕」，因为本站计入了多数指南忽略的运行缓冲；32 GB 显卡，或 48 GB 的 Mac（靠 GPU 可用的那部分统一内存）才有真正的余量。它通过单独的视觉编码器读取图像。体积按已公布的 GGUF 文件大小计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.01, vramGB: 23.4, hfSearchUrl: hf('Qwen3.6-35B-A3B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 39.6, hfSearchUrl: hf('Qwen3.6-35B-A3B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.6-27B. Official config.json / model card (via search): 64 layers, hidden 5120, intermediate
    // 17408, 24 heads / 4 KV heads × 256, full_attention_interval 4 (16 full + 48 Gated DeltaNet) —
    // the same layout as Qwen3.8 27B, whose cache sizing matched measurements at 8K/32K/262K. llama.cpp
    // `qwen35`. Params from bartowski's Q8_0 (29.12 GB → 27.41B); Q4_K_M 17.98 / Q5_K_M 20.97 GB →
    // 5.25 / 6.12 bpw (unsloth's builds are smaller: 16.8 / 19.5 / 28.6 GB). Not superseded by Qwen3.8
    // 27B: same window, same size — supersededDiffNote() would only have its generic line.
    id: 'qwen3-6-27b',
    name: 'Qwen3.6 27B',
    family: 'Alibaba Qwen3.6',
    params: 27.41,
    paramLabel: '27B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    arch: { layers: 64, attHeads: 24, kvHeads: 4, headDim: 256, attention: { fullLayers: 16, note: { en: '16 of 64 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '64 层中有 16 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN36,
    description: {
      en: 'The dense model of the Qwen3.6 generation and a popular local coding model. It has the same layout as Qwen3.8 27B, the newer release: only 16 of its 64 layers keep a growing KV cache. At Q4_K_M it needs about 19.1 GB at 4K context and 21.0 GB at 32K, comfortable on a 24 GB card either way. Q5_K_M is tight on 24 GB, and a 16 GB card cannot hold it at any level listed here. Sizes come from bartowski\'s published GGUF files; Unsloth\'s builds of the same levels are about 1 GB smaller. No per-level quality loss has been published.',
      zh: 'Qwen3.6 这一代的稠密模型，也是很受欢迎的本地写代码模型。它和更新的 Qwen3.8 27B 结构相同：64 层中只有 16 层保留会增长的 KV 缓存。Q4_K_M 在 4K 上下文下约需 19.1 GB，32K 下约 21.0 GB，两种情况在 24 GB 显卡上都很宽裕。Q5_K_M 在 24 GB 上偏紧；16 GB 显卡在这里列出的任何档位都装不下。体积按 bartowski 发布的 GGUF 文件计算，Unsloth 的同档位文件约小 1 GB。各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.25, vramGB: 19.1, hfSearchUrl: hf('Qwen3.6-27B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.12, vramGB: 22.2, hfSearchUrl: hf('Qwen3.6-27B GGUF Q5_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 30.7, hfSearchUrl: hf('Qwen3.6-27B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.5-9B. Official config.json text_config (via search): 32 layers, hidden 4096, intermediate
    // 12288, 16 heads / 4 KV heads × 256, full_attention_interval 4 (8 full + 24 Gated DeltaNet),
    // untied embeddings, vocab 248320, plus an MTP layer. Params from bartowski's Q8_0 (9.80 GB →
    // 9.22B; the config arithmetic gives ~9.2B, the large vocabulary is ~2B of it); Q4_K_M 6.17 GB →
    // 5.35 bpw. Context 262144 from the Qwen3.5 config. llama.cpp `qwen35`.
    id: 'qwen3-5-9b',
    name: 'Qwen3.5 9B',
    family: 'Alibaba Qwen3.5',
    params: 9.22,
    paramLabel: '9B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: { layers: 32, attHeads: 16, kvHeads: 4, headDim: 256, attention: { fullLayers: 8, note: { en: '8 of 32 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '32 层中有 8 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN36,
    description: {
      en: 'The newest small Qwen and a common pick for 8 to 16 GB cards. Only 8 of its 32 layers keep a growing KV cache, so it can use a long context on modest hardware. At Q4_K_M it needs about 6.6 GB at 4K and 7.5 GB at 32K, comfortable on an 8 GB card. Its full 256K window needs about 15.2 GB. Q8_0 needs about 10.4 GB, comfortable from 12 GB up. Reasoning is off by default on the small Qwen3.5 sizes, and it reads images through a separate vision encoder. Sizes come from the published GGUF file sizes, and no per-level quality loss has been published.',
      zh: 'Qwen 最新的小尺寸模型，8 到 16 GB 显卡的常见选择。32 层中只有 8 层保留会增长的 KV 缓存，所以在普通硬件上也能用长上下文。Q4_K_M 在 4K 下约需 6.6 GB，32K 下约 7.5 GB，8 GB 显卡就能从容运行；用满 256K 窗口约需 15.2 GB。Q8_0 约需 10.4 GB，12 GB 起就很宽裕。Qwen3.5 的小尺寸默认关闭推理模式；它通过单独的视觉编码器读取图像。体积按已公布的 GGUF 文件大小计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.35, vramGB: 6.6,  hfSearchUrl: hf('Qwen3.5-9B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 10.4, hfSearchUrl: hf('Qwen3.5-9B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.5-4B. Official config.json + model card (via search): 32 layers = 8 × (3 Gated DeltaNet + 1
    // gated attention), hidden 2560, intermediate 9216, 16 heads / 4 KV heads × 256, tied embeddings,
    // vocab 248320. Params from bartowski's Q8_0 (4.62 GB ÷ 8.5 → 4.35B); Q4_K_M 3.01 GB → 5.54 bpw
    // (the tied 248K-token vocabulary is ~0.64B of a small model, kept wide). Context 262144 as the
    // Qwen3.5 family config. llama.cpp `qwen35`. Original repo mapped (GGUF filename unconfirmed).
    id: 'qwen3-5-4b',
    name: 'Qwen3.5 4B',
    family: 'Alibaba Qwen3.5',
    params: 4.35,
    paramLabel: '4B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: { layers: 32, attHeads: 16, kvHeads: 4, headDim: 256, attention: { fullLayers: 8, note: { en: '8 of 32 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '32 层中有 8 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN35_SMALL,
    description: {
      en: 'The 4B size of Qwen3.5, for 4 to 8 GB cards, base-model Macs and CPU-only machines. Only 8 of its 32 layers keep a growing KV cache. At Q4_K_M it needs about 3.3 GB at 4K context and 4.3 GB at 32K, so a 6 GB card is enough for long chats; its full 256K window needs about 12 GB. Reasoning is off by default on the small Qwen3.5 sizes, and it reads images through a separate vision encoder. Sizes come from the published GGUF file sizes, and no per-level quality loss has been published.',
      zh: 'Qwen3.5 的 4B 尺寸，适合 4 到 8 GB 显卡、基础款 Mac 和纯 CPU 机器。32 层中只有 8 层保留会增长的 KV 缓存。Q4_K_M 在 4K 上下文下约需 3.3 GB，32K 下约 4.3 GB，所以 6 GB 显卡就够长对话使用；用满 256K 窗口约需 12 GB。Qwen3.5 的小尺寸默认关闭推理模式；它通过单独的视觉编码器读取图像。体积按已公布的 GGUF 文件大小计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.54, vramGB: 3.3, hfSearchUrl: hf('Qwen3.5-4B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 5.0, hfSearchUrl: hf('Qwen3.5-4B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.5-2B. Official config.json of Qwen3.5-2B-Base (the instruct release shares the
    // architecture): 24 layers (6 full attention), hidden 2048, intermediate 6144, 8 heads / 2 KV
    // heads × 256, tied embeddings. Params from bartowski's Q8_0 (2.08 GB → 1.96B); Q4_K_M 1.40 GB →
    // 5.71 bpw. Original repo mapped (GGUF filename unconfirmed).
    id: 'qwen3-5-2b',
    name: 'Qwen3.5 2B',
    family: 'Alibaba Qwen3.5',
    params: 1.96,
    paramLabel: '2B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: { layers: 24, attHeads: 8, kvHeads: 2, headDim: 256, attention: { fullLayers: 6, note: { en: '6 of 24 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '24 层中有 6 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN35_SMALL,
    description: {
      en: 'The 2B size of Qwen3.5, small enough for almost anything: old cards, base-model Macs, mini PCs and CPU-only servers. Only 6 of its 24 layers keep a growing KV cache, with 2 KV heads each. At Q4_K_M it needs about 1.5 GB at 4K context, 1.9 GB at 32K and 4.8 GB at its full 256K window. Even Q8_0 stays around 2.2 GB at 4K. Reasoning is off by default on the small Qwen3.5 sizes. Sizes come from the published GGUF file sizes, and no per-level quality loss has been published.',
      zh: 'Qwen3.5 的 2B 尺寸，几乎什么硬件都能跑：老显卡、基础款 Mac、迷你主机和纯 CPU 服务器。24 层中只有 6 层保留会增长的 KV 缓存，每层只有 2 个 KV 头。Q4_K_M 在 4K 上下文下约需 1.5 GB，32K 下约 1.9 GB，用满 256K 窗口约 4.8 GB；即使 Q8_0，4K 下也只要约 2.2 GB。Qwen3.5 的小尺寸默认关闭推理模式。体积按已公布的 GGUF 文件大小计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.71, vramGB: 1.5, hfSearchUrl: hf('Qwen3.5-2B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.49, vramGB: 2.2, hfSearchUrl: hf('Qwen3.5-2B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Qwen3.5-0.8B. Config (unsloth re-upload + a community copy of the official file, via search):
    // 24 layers, hidden 1024, intermediate 3584, 2 KV heads × 256 — the Qwen3.5 interval-4 pattern
    // gives 6 full-attention layers. No GGUF file size was reachable, so `params` is the vendor's
    // 0.8 and the bpw are the calculator's generic rates.
    id: 'qwen3-5-0.8b',
    name: 'Qwen3.5 0.8B',
    family: 'Alibaba Qwen3.5',
    params: 0.8,
    paramLabel: '0.8B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: { layers: 24, attHeads: 8, kvHeads: 2, headDim: 256, attention: { fullLayers: 6, note: { en: '6 of 24 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '24 层中有 6 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_QWEN35_SMALL,
    description: {
      en: 'The smallest Qwen3.5, for phones, single-board computers and as a fast draft or routing model next to a bigger one. At Q4_K_M it needs about 0.6 GB at 4K context and under 1 GB at 32K. Its full 256K window needs about 3.8 GB, almost all of it cache, so very long contexts cost more than the weights here. Sizes use the calculator\'s generic rates, since no GGUF file size could be checked, and no per-level quality loss has been published.',
      zh: '最小的 Qwen3.5，适合手机、单板电脑，或者在大模型旁边当快速草稿/路由模型。Q4_K_M 在 4K 上下文下约需 0.6 GB，32K 下不到 1 GB。用满 256K 窗口约需 3.8 GB，几乎全是缓存，所以在这里超长上下文比权重本身更占内存。下方体积使用计算器的通用比特率，因为未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 0.6, hfSearchUrl: hf('Qwen3.5-0.8B GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 0.9, hfSearchUrl: hf('Qwen3.5-0.8B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Xiaomi MiMo-V2.6-Pro (weights 2026-09-21/22, MIT). config.json of the -RL checkpoint (via search;
    // huggingface.co is blocked here): 70 layers, 128 heads / 8 KV heads, sliding_window 128, QK head
    // dim 192 / V head dim 128 (model card). 10 global + 60 SWA layers per secondary write-ups (the
    // hybrid_layer_pattern array itself was truncated in every copy reached) — the 6:1 shape of the
    // V2 family. `headDim: 160` = (192 + 128) / 2, which gives the exact K+V bytes per token. SWA
    // cells: llama.cpp `mimo2` is LLAMA_SWA_TYPE_STANDARD → pad256(128 + 512) = 768, as GPT-OSS.
    // Arch `mimo2` in llama.cpp; conversion for V2.6 merged 2026-09-22 (PR #29257, "runtime changes
    // weren't necessary"); experts ship as MXFP4 and are repacked, not requantized. Params from
    // AesSedai's RL GGUF: 537.99 GiB at a stated 4.52 bpw → 1.022T (vendor: 1.02T / ~42B active).
    // kernelpool's repack is smaller (557.1 GB ≈ 4.36 bpw); the larger file is used. Context 1M is
    // the vendor's figure as reported; no max_position_embeddings value was reachable.
    id: 'mimo-v2-6-pro',
    name: 'MiMo-V2.6-Pro',
    family: 'Xiaomi MiMo',
    params: 1022,
    paramLabel: '1T-A42B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 70, attHeads: 128, kvHeads: 8, headDim: 160, attention: { fullLayers: 10, windowLayers: 60, windowTokens: 768, note: { en: '10 of 70 layers use full attention; the other 60 use a 128-token sliding window (llama.cpp keeps the window plus one 512-token batch, padded to 768), so only one layer in seven grows a cache with context. Keys are 192 wide and values 128, sized here as their 160 average.', zh: '70 层中 10 层是全注意力，其余 60 层使用 128 token 滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，补齐到 768），所以每七层只有一层的缓存随上下文增长。键宽 192、值宽 128，这里按平均 160 计算。' } } },
    addedAt: ADDED_MIMO26,
    description: {
      en: 'Xiaomi\'s open-weight flagship, near the top of the open-model rankings this autumn. It has about 1.02 trillion parameters, roughly 42B of them active per token, and ships under the MIT licence. The released weights are already 4-bit (MXFP4 experts), and the GGUF builds repack them rather than quantize again. At that level it needs about 604 GB at 4K context, more than any single machine in this index. The largest Mac Studio gives its GPU about 384 GB, and four 80 GB H100s hold 320 GB. Eight 80 GB cards (640 GB) are about the smallest server that holds it, and even that is tight on this site\'s rule. It is listed so the calculator can say so. Only 10 of its 70 layers keep a growing cache, so even 1M tokens adds only about 50 GB. llama.cpp runs it as `mimo2`, and vision loads through a separate encoder. Sizes come from a published GGUF file; no per-level quality loss has been published.',
      zh: '小米的开放权重旗舰，今年秋天位列开源模型排行榜前列：约 1.02 万亿参数，每个 token 激活约 42B，MIT 许可。发布的权重本身就是 4 比特（专家层为 MXFP4），GGUF 版本只是重新打包、没有再次量化。在这个档位下 4K 上下文约需 604 GB，超过本索引里任何一台单机：最大的 Mac Studio 给 GPU 的约 384 GB，四张 80 GB 的 H100 合计 320 GB。八张 80 GB 显卡（640 GB）大约是能装下它的最小服务器，按本站规则也只算「勉强」。收录它是为了让计算器能把这一点说清楚。70 层中只有 10 层保留会增长的缓存，所以即使 100 万 token 也只多约 50 GB。llama.cpp 以 `mimo2` 架构运行它，视觉通过单独的编码器加载。体积按已公布的 GGUF 文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'MXFP4', bpw: 4.52, vramGB: 603.8, pplLossPercent: 0.0, hfSearchUrl: hf('MiMo-V2.6-Pro GGUF MXFP4'), confidence: 'estimated' },
    ],
  },
  {
    // JetBrains Mellum2.1 12B-A2.5B Thinking (2026-10-08, Apache 2.0). transformers
    // `models/mellum/configuration_mellum.py` defaults: 28 layers, hidden 2304, 32 heads / 4 KV × 128,
    // sliding_window 1024, 64 experts / 8 routed (moe_intermediate 896), vocab 98304, 131072 positions.
    // llama.cpp `src/models/mellum.cpp` (arch `mellum`, LLM_TYPE_12B_A2_5B for 28 layers) uses
    // load_swa_pattern(ml, 4) → 3 SWA + 1 full per 4 layers = 21 + 7; standard SWA →
    // pad256(1024 + 512) = 1536 cells, as Gemma 3. Params from JetBrains' own GGUF repo: BF16 24.3 GB →
    // 12.15B (config arithmetic gives 12.14B); Q8_0 12.9 GB → 8.49 bpw; Q4_K_M 8.1 GB → 5.33 bpw
    // (bartowski's Q4_K_M is 8.82 GB). The repo's MXFP4_MOE build (7.0 GB) is left out: it is not the
    // released format, and an MXFP4 row would be read as native. JetBrains publishes KL divergence,
    // not perplexity, so no pplLossPercent. CLI maps the original repo (GGUF filenames unconfirmed).
    id: 'mellum2-1-12b-a2-5b',
    name: 'Mellum2.1 12B-A2.5B Thinking',
    family: 'JetBrains Mellum',
    params: 12.15,
    paramLabel: '12B-A2.5B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 28, attHeads: 32, kvHeads: 4, headDim: 128, attention: { fullLayers: 7, windowLayers: 21, windowTokens: 1536, note: { en: '21 of 28 layers use a 1,024-token sliding window (llama.cpp keeps the window plus one 512-token batch, padded to 1,536); only every fourth layer grows a cache with context.', zh: '28 层中 21 层使用 1,024 token 滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，补齐到 1,536），只有每四层中的一层缓存随上下文增长。' } } },
    addedAt: ADDED_MELLUM21,
    description: {
      en: 'JetBrains\' open coding model for agents and fast sub-agents, released in October under Apache 2.0. It is a 12B mixture-of-experts model with about 2.5B parameters active per token, so it generates at roughly the speed of a 3B model. At Q4_K_M it needs about 8.6 GB at 4K context and 10.5 GB even at its full 128K window, because only 7 of its 28 layers keep a growing cache. That is comfortable on a 10 or 12 GB card; an 8 GB card cannot hold it. Q8_0 fits a 16 GB card. llama.cpp supports it as `mellum`. Sizes come from JetBrains\' own GGUF files; JetBrains publishes KL divergence rather than perplexity, so no quality-loss figure is shown.',
      zh: 'JetBrains 面向编程智能体和快速子智能体的开源代码模型，10 月以 Apache 2.0 发布。它是 12B 的混合专家模型，每个 token 约激活 2.5B 参数，生成速度大致相当于 3B 模型。Q4_K_M 在 4K 上下文下约需 8.6 GB，用满 128K 窗口也只要 10.5 GB，因为 28 层中只有 7 层保留会增长的缓存。10 GB 或 12 GB 显卡可以从容运行，8 GB 显卡装不下；Q8_0 适合 16 GB 显卡。llama.cpp 以 `mellum` 架构支持它。体积按 JetBrains 官方 GGUF 文件计算；官方公布的是 KL 散度而不是困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.33, vramGB: 8.6,  hfSearchUrl: hf('Mellum2.1-12B-A2.5B-Thinking GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.49, vramGB: 13.6, hfSearchUrl: hf('Mellum2.1-12B-A2.5B-Thinking GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
];
