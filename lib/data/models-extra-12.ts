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
const ADDED_GRANITE42 = '2026-10-14';
const ADDED_MUSE_SPARK = '2026-10-16';
const ADDED_NEMOTRON35 = '2026-10-16';
const ADDED_GRANITE42_MORE = '2026-10-16';
const ADDED_LIGHTNING = '2026-10-16';
const ADDED_BEAM = '2026-10-17';
const ADDED_LFM25 = '2026-10-14';
const ADDED_LING31 = '2026-10-17';
const ADDED_GEMMA4_12B = '2026-10-19';
const ADDED_NORTH_MINI = '2026-10-20';
const ADDED_MINICPM47 = '2026-10-20';

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
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.81, vramGB: 17.7, hfSearchUrl: hf('Muse-Glimmer-30B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'meta-models/Muse-Glimmer-30B-GGUF', file: 'Muse-Glimmer-30B-KQuant-17GB-Q4_K_M.gguf', bytes: 16_756_683_904, checkedAt: '2026-10-09' } },
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
  {
    // Granite 4.2 is dense (GraniteForCausalLM, llama.cpp `granite`), unlike Granite 4.0's
    // hybrid Mamba models. Shape from IBM's model card: 40 layers, 32 heads, 8 KV heads × 128,
    // embedding 4096, MLP 12800, 128K. 8.79B = that shape with a 100,352 vocab and untied
    // embeddings — what the Hub's "9B" and the 4.1 8B's 8.8B both reconcile with.
    // Q4_K_M bpw from a published file: 5,347,917,888 bytes → 4.87. Q8_0 at the format's 8.5.
    id: 'granite-4.2-8b',
    name: 'Granite 4.2 8B',
    family: 'IBM Granite',
    params: 8.79,
    paramLabel: '8B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_GRANITE42,
    description: {
      en: 'IBM\'s dense 8B reasoning model from the Granite 4.2 family (3B, 8B, 30B), released in August under Apache 2.0. Thinking is on by default; a non-thinking and a low-effort mode are chosen through the chat template. Unlike Granite 4.0\'s hybrid models it is a plain transformer, so llama.cpp runs it as `granite` and every one of its 40 layers keeps a full cache: about 6.3 GB at Q4_K_M with a 4K context, 11.1 GB at 32K and 27.6 GB across the whole 128K window. That makes it an 8 GB card model at short contexts and a 16 GB one for long documents. The Q4_K_M size comes from a published GGUF file; IBM publishes no perplexity by quantization level, so no quality-loss figure is shown.',
      zh: 'IBM Granite 4.2 系列（3B、8B、30B）中的 8B 稠密推理模型，8 月以 Apache 2.0 发布。默认开启思考，可通过聊天模板切换为不思考或低强度模式。它不是 Granite 4.0 那种混合架构，而是普通 Transformer，llama.cpp 以 `granite` 架构运行，40 层全部保留完整缓存：Q4_K_M 在 4K 上下文下约 6.3 GB，32K 约 11.1 GB，用满 128K 窗口约 27.6 GB。所以短上下文用 8 GB 显卡就够，处理长文档需要 16 GB。Q4_K_M 体积按已发布的 GGUF 文件计算；IBM 没有公布各量化档位的困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.87, vramGB: 6.3,  hfSearchUrl: hf('granite-4.2-8b GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 10.5, hfSearchUrl: hf('granite-4.2-8b GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // Granite 4.2 30B (IBM, model card dated 2026-08-25, Apache 2.0). Official config.json
    // (ibm-granite/granite-4.2-30b, pasted by the owner 2026-10-16 — huggingface.co is blocked here):
    // GraniteForCausalLM, 64 layers, hidden 4096, 32 heads / 8 KV × 128, SwiGLU 32768, vocab 100352
    // untied, 131072 positions; no layer_types, so every layer keeps a full cache. Counted from that
    // shape: 29.277B; IBM's BF16 GGUF is 58,558,182,336 B = 29.28B. bpw from IBM's own GGUF repo:
    // Q4_K_M 17,721,455,328 → 4.84, Q5_K_M 20,775,957,216 → 5.68, Q6_K 24,021,365,472 → 6.56,
    // Q8_0 31,111,705,312 → 8.50 (on 8.5: the count holds). The config's rope_theta is 5e7, the card
    // says 1e7 — irrelevant to sizing.
    id: 'granite-4.2-30b',
    name: 'Granite 4.2 30B',
    family: 'IBM Granite',
    params: 29.28,
    paramLabel: '30B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 64, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_GRANITE42_MORE,
    description: {
      en: 'The largest model in IBM\'s Granite 4.2 family, released in August under Apache 2.0. Like the 8B it is a plain dense transformer rather than Granite 4.0\'s hybrid design, so all 64 layers keep a full cache and context is not cheap: at Q4_K_M it needs about 19.6 GB at 4K, 27.3 GB at 32K and 53.7 GB across the whole 128K window. A 24 GB card runs it comfortably up to 8K and tightly at 16K; 32K needs a 32 GB card, and the full window an 80 GB card or a 96 GB Mac. Q8_0 (about 33.6 GB at 4K) wants a 48 GB card or a 64 GB Mac. Sizes come from IBM\'s own GGUF files; IBM publishes no perplexity by quantization level, so no quality-loss figure is shown.',
      zh: 'IBM Granite 4.2 系列中最大的模型，8 月以 Apache 2.0 发布。和 8B 一样是普通的稠密 Transformer，不是 Granite 4.0 的混合架构，64 层全部保留完整缓存，所以上下文并不便宜：Q4_K_M 在 4K 下约需 19.6 GB，32K 约 27.3 GB，用满 128K 窗口约 53.7 GB。24 GB 显卡到 8K 都很宽裕，16K 偏紧；32K 需要 32 GB 显卡，用满窗口需要 80 GB 显卡或 96 GB 的 Mac。Q8_0（4K 下约 33.6 GB）需要 48 GB 显卡或 64 GB 的 Mac。体积按 IBM 官方 GGUF 文件计算；IBM 没有公布各量化档位的困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.84, vramGB: 19.6, hfSearchUrl: hf('granite-4.2-30b GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-30b-GGUF', file: 'granite-4.2-30b-Q4_K_M.gguf', bytes: 17_721_455_328, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 22.8, hfSearchUrl: hf('granite-4.2-30b GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-30b-GGUF', file: 'granite-4.2-30b-Q5_K_M.gguf', bytes: 20_775_957_216, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.56, vramGB: 26.2, hfSearchUrl: hf('granite-4.2-30b GGUF Q6_K'),   confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-30b-GGUF', file: 'granite-4.2-30b-Q6_K.gguf', bytes: 24_021_365_472, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 33.6, hfSearchUrl: hf('granite-4.2-30b GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-30b-GGUF', file: 'granite-4.2-30b-Q8_0.gguf', bytes: 31_111_705_312, checkedAt: '2026-10-16' } },
    ],
  },
  {
    // Granite 4.2 3B. Official config.json (ibm-granite/granite-4.2-3b, pasted by the owner
    // 2026-10-16): GraniteForCausalLM, 40 layers, hidden 2560, 40 heads / 8 KV → head_dim 64, SwiGLU
    // 8192, vocab 100352 untied, 131072 positions, no layer_types. Counted: 3.660B; IBM's BF16 GGUF
    // 7,323,461,152 B = 3.66B. bpw from IBM's GGUF repo: Q4_K_M 2,244,011,552 → 4.90, Q5_K_M
    // 2,613,634,592 → 5.71, Q8_0 3,892,651,552 → 8.50.
    id: 'granite-4.2-3b',
    name: 'Granite 4.2 3B',
    family: 'IBM Granite',
    params: 3.66,
    paramLabel: '3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 40, kvHeads: 8, headDim: 64 },
    addedAt: ADDED_GRANITE42_MORE,
    description: {
      en: 'The smallest model in IBM\'s Granite 4.2 family, released in August under Apache 2.0: a dense 3.7B transformer for laptops, small cards and CPU servers. At Q4_K_M it needs about 2.7 GB at 4K context, 5.1 GB at 32K and 13.3 GB across the whole 128K window, so an 8 GB card runs it comfortably up to 32K and tightly at 64K. Q8_0 is only 4.4 GB at 4K, small enough that there is little reason to go lower on a GPU. Sizes come from IBM\'s own GGUF files; IBM publishes no perplexity by quantization level, so no quality-loss figure is shown.',
      zh: 'IBM Granite 4.2 系列中最小的模型，8 月以 Apache 2.0 发布：3.7B 稠密 Transformer，面向笔记本、小显存显卡和 CPU 服务器。Q4_K_M 在 4K 上下文下约需 2.7 GB，32K 约 5.1 GB，用满 128K 窗口约 13.3 GB，所以 8 GB 显卡到 32K 都很宽裕，64K 偏紧。Q8_0 在 4K 下也只要 4.4 GB，在显卡上几乎没有理由再往下压。体积按 IBM 官方 GGUF 文件计算；IBM 没有公布各量化档位的困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.9,  vramGB: 2.7, hfSearchUrl: hf('granite-4.2-3b GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-3b-GGUF', file: 'granite-4.2-3b-Q4_K_M.gguf', bytes: 2_244_011_552, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.71, vramGB: 3.1, hfSearchUrl: hf('granite-4.2-3b GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-3b-GGUF', file: 'granite-4.2-3b-Q5_K_M.gguf', bytes: 2_613_634_592, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 4.4, hfSearchUrl: hf('granite-4.2-3b GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'ibm-granite/granite-4.2-3b-GGUF', file: 'granite-4.2-3b-Q8_0.gguf', bytes: 3_892_651_552, checkedAt: '2026-10-16' } },
    ],
  },
  {
    // Liquid AI LFM2.5-24B-A2B (2026-10-12, LFM Open License v1.0 — free below $10M annual revenue).
    // Official config.json (read 2026-10-14 from huggingface.co): Lfm2MoeForCausalLM, llama.cpp
    // `lfm2moe`; 40 layers, layer_types = 10 `full_attention` (GQA) + 30 `conv` (double-gated short
    // convolution, conv_L_cache 3 — a fixed 3-token state that does not grow with context); hidden
    // 2048, 32 heads / 8 KV heads → head_dim 64; 64 experts top-4 (moe_intermediate 1536), first 2
    // layers dense (intermediate 11776); vocab 128000, tied; max_position_embeddings 131072.
    // params = the Hub's safetensors total, 23,971,585,280. Active 2.45B is the model card's figure
    // (the release name rounds it to A2B, hence the explicit `activeParams`).
    // Q4_K_M / Q8_0 bpw from LiquidAI's own GGUF repo: 14,526,258,464 / 25,493,732,640 bytes →
    // 4.85 / 8.51. Liquid publishes no perplexity by quantization level, so no pplLossPercent.
    id: 'lfm2-5-24b-a2b',
    name: 'LFM2.5 24B-A2B',
    family: 'Liquid AI LFM2.5',
    params: 23.97,
    paramLabel: '24B-A2B',
    activeParams: 2.45,
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 131072,
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 64, attention: { fullLayers: 10, note: { en: '10 of 40 layers are full (GQA) attention; the other 30 are short gated convolution blocks that keep a fixed 3-token state, so the KV cache grows at a quarter of the usual rate.', zh: '40 层中只有 10 层是全注意力（GQA），其余 30 层是带门控的短卷积块，只保留固定的 3 个 token 状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_LFM25,
    description: {
      en: 'Liquid AI\'s largest LFM2.5 model, released in October: a 24B mixture-of-experts reasoning model with about 2.45B parameters active per token. It is built for on-device agents and tool calling, and always thinks before it answers. Only 10 of its 40 layers keep a growing KV cache, so long context is cheap: at Q4_K_M it needs about 15.3 GB at 4K, 15.9 GB at 32K and 17.9 GB across the whole 128K window. That is tight on a 16 GB card and comfortable on 24 GB at any context; Q8_0 (about 26.7 GB) needs a 32 GB card. Text only. Sizes come from Liquid\'s own GGUF files, and no per-level quality loss has been published.',
      zh: 'Liquid AI 在 10 月发布的 LFM2.5 系列中最大的模型：24B 混合专家推理模型，每个 token 约激活 2.45B 参数，面向端侧智能体和工具调用，回答前总会先思考。40 层中只有 10 层保留会增长的 KV 缓存，所以长上下文很便宜：Q4_K_M 在 4K 下约需 15.3 GB，32K 约 15.9 GB，用满 128K 窗口约 17.9 GB。在 16 GB 显卡上偏紧，24 GB 显卡在任何上下文下都很宽裕；Q8_0（约 26.7 GB）需要 32 GB 显卡。仅支持文本。体积按 Liquid 官方发布的 GGUF 文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 15.3, hfSearchUrl: hf('LFM2.5-24B-A2B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'LiquidAI/LFM2.5-24B-A2B-GGUF', bytes: 14_526_258_464, checkedAt: '2026-10-14' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 26.7, hfSearchUrl: hf('LFM2.5-24B-A2B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'LiquidAI/LFM2.5-24B-A2B-GGUF', bytes: 25_493_732_640, checkedAt: '2026-10-14' } },
    ],
  },
  {
    // Meta Muse Spark Open (released 2026-10-15, Muse Model License). Shape from transformers'
    // `models/muse_spark/configuration_muse_spark.py`, whose defaults are documented against this one
    // checkpoint (`meta-models/Muse-Spark-Open-816B-A42B`): 62 layers, hidden 8192, 128 heads, 16 KV
    // heads × head_dim 64, vocab 202,048 untied, 256 experts / 8 routed at a 4096 latent width,
    // sliding_window 2048, every 4th layer counted back from the last is full attention (NoPE) →
    // 16 full + 46 sliding, 1,048,576 positions. llama.cpp `muse-spark` (`src/models/muse-spark.cpp`):
    // iSWA cache, LLAMA_SWA_TYPE_STANDARD → a window layer holds pad256(2048 + 512) = 2560 cells.
    // That shape counts 815.8B (Meta: 816B); llama.cpp also loads a per-layer attention gate
    // (8192 × 8192 × 62 = 4.16B), giving the 820B the ggml-org GGUF reports — `params` is what loads.
    // bpw from ggml-org's own GGUF card (via search; huggingface.co is blocked here): Q2_K 304 GB,
    // Q4_K_S 470 GB, Q8_0 872 GB, BF16 1.64 TB → 2.97 / 4.59 / 8.51 / 16.0 (Q8_0 and BF16 landing on
    // 8.5 / 16 confirm the count and that the units are decimal GB). The Q2_K is ggml-org's mixed
    // recipe (expert gate/up Q2_K, down Q3_K, latent projections and attention gate Q8_0), which is
    // why it reads 2.97 rather than Q2_K's nominal 2.63. Vision/audio encoders ship as separate
    // mmproj files (2.2–4.1 GB) and are not in `params`.
    id: 'muse-spark-open-816b-a42b',
    name: 'Muse Spark Open 816B-A42B',
    family: 'Meta Muse',
    params: 820.0,
    paramLabel: '816B-A42B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 62, attHeads: 128, kvHeads: 16, headDim: 64, attention: { fullLayers: 16, windowLayers: 46, windowTokens: 2560, note: { en: '46 of 62 layers use a 2,048-token sliding window (llama.cpp keeps the window plus one 512-token batch, padded to 2,560); only the 16 full-attention layers grow a cache with context.', zh: '62 层中 46 层使用 2,048 token 滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，补齐到 2,560），只有 16 层全注意力层的缓存随上下文增长。' } } },
    addedAt: ADDED_MUSE_SPARK,
    description: {
      en: 'Meta\'s largest open-weight model, released in October under the Muse Model License. It is an 816B mixture-of-experts model with about 42B parameters active per token, built for coding and agent work, with image and audio input. It is a single-machine model only at its smallest build. At Q2_K (ggml-org\'s 304 GB file) it needs about 319 GB at 4K context and still only 327 GB at 128K, because just 16 of its 62 layers keep a growing cache — comfortable on a 512 GB Mac Studio and tight across four 80 GB H100s. The full 1M window brings it to about 389 GB. Q4_K_S (470 GB) and Q8_0 (872 GB) fit no single machine in this index. The vision and audio encoders ship as separate files of 2–4 GB and are not included. Sizes come from the published GGUF files; Meta\'s benchmark claims are its own and no per-level quality loss has been published. The licence is not a standard open-source one: Meta\'s repository is gated, so downloads need an accepted access request; products built on it must show "Built with Muse Spark Open"; and a company with over $20M in annual revenue must sign a separate agreement with Meta before offering it as an API service.',
      zh: 'Meta 目前最大的开放权重模型，10 月以 Muse Model License 发布：816B 混合专家模型，每个 token 约激活 42B 参数，面向编程和智能体任务，支持图像和音频输入。只有最小的量化版本能在单台机器上运行。Q2_K（ggml-org 发布的 304 GB 文件）在 4K 上下文下约需 319 GB，到 128K 也只要 327 GB，因为 62 层中只有 16 层的缓存会随上下文增长——512 GB 的 Mac Studio 可以从容运行，四张 80 GB 的 H100 则偏紧。用满 100 万上下文约需 389 GB。Q4_K_S（470 GB）和 Q8_0（872 GB）在本站收录的任何单台机器上都装不下。视觉和音频编码器是另外 2–4 GB 的文件，未计入。体积按已发布的 GGUF 文件计算；基准成绩是 Meta 自己报的，各档位的质量损失未公布。它的许可证不是常规开源许可：Meta 的仓库需要申请访问才能下载；基于它的产品须注明"Built with Muse Spark Open"；年收入超过 2000 万美元的公司若要把它作为 API 服务提供，须先与 Meta 另签协议。',
    },
    quants: [
      { format: 'GGUF', level: 'Q2_K',   bpw: 2.97, vramGB: 318.9, hfSearchUrl: hf('Muse-Spark-Open-816B-A42B GGUF Q2_K'),   confidence: 'estimated' },
      { format: 'GGUF', level: 'Q4_K_S', bpw: 4.59, vramGB: 492.4, hfSearchUrl: hf('Muse-Spark-Open-816B-A42B GGUF Q4_K_S'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 912.3, hfSearchUrl: hf('Muse-Spark-Open-816B-A42B GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    // NVIDIA Nemotron 3.5 Bolt 74B-A9B (released 2026-10-15). Shape from the official BF16 repo's
    // config.json (nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16, read from huggingface.co by the
    // owner and pasted here 2026-10-16): NemotronHPuzzleForCausalLM, hidden 4096, 88 blocks =
    // 40 mamba + 40 moe + 8 attention (layers 7, 16, 25, 36, 47, 58, 69, 78), 32 heads / 2 KV × 128,
    // vocab 131072 untied, 262144 positions; per-block MoE from `block_configs` (240–496 routed
    // experts of width 1536–2560 at a 1024 latent, 9 per token, 1 shared expert 5376). Counted from
    // that config: 74.04B total, 9.05B active (card: 74B / 9B). Mamba-2 state (128 heads × 64 ×
    // state 128, fp32, ~4 MiB a layer, ~0.17 GB in all) does not grow with context; calcVRAM leaves
    // it inside the 10% buffer, as for the other hybrid entries. The only build is NVIDIA's native
    // 2-bit one (modelopt MIXED_PRECISION: experts + shared expert IQ2_XXS at 2.0625, latent
    // projections Q8_0): 22,018,326,528 B in both the official 24GB GGUF and unsloth's IQ2_XXS file
    // → 2.38 bpw; that recipe predicts 21.77 GB, within ~1%. The vision encoder ships separately
    // (mmproj 1,733,692,736 B). llama.cpp v0.7.0 lists the arch; Ollama v0.40.5 ships it.
    id: 'nemotron-3.5-bolt-74b-a9b',
    name: 'Nemotron 3.5 Bolt 74B-A9B',
    family: 'NVIDIA Nemotron',
    params: 74.04,
    paramLabel: '74B-A9B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'pro-gpu'],
    contextLength: 262144,
    arch: { layers: 88, attHeads: 32, kvHeads: 2, headDim: 128, attention: { fullLayers: 8, note: { en: 'Only 8 of 88 layers are attention layers with a growing KV cache (2 KV heads × 128); 40 are Mamba-2 layers with a fixed recurrent state and 40 are mixture-of-experts layers that cache nothing per token.', zh: '88 层中只有 8 层是会随上下文增长 KV 缓存的注意力层（2 个 KV 头 × 128）；40 层是状态大小固定的 Mamba-2 层，另 40 层是不缓存任何内容的混合专家层。' } } },
    addedAt: ADDED_NEMOTRON35,
    description: {
      en: 'NVIDIA\'s Nemotron 3.5 Bolt is a 74B mixture-of-experts model with about 9B parameters active per token, built to fit a 24 GB card. It is compressed from Nemotron 3.5 Super VL and ships in one build, NVIDIA\'s own native 2-bit file of 22.0 GB. Only 8 of its 88 layers keep a growing cache, so context costs little: about 23.1 GB at 4K, 24.1 GB at 128K and 25.2 GB at its full 256K window. That is the 24 GB NVIDIA designed for, but over this site\'s comfortable line, so a 24 GB card reads as tight; a 32 GB card or a 48 GB Mac runs it comfortably. The image encoder is a separate 1.7 GB file. NVIDIA\'s benchmark claims are its own, and no quality loss for the 2-bit build has been published.',
      zh: 'NVIDIA 的 Nemotron 3.5 Bolt 是 74B 混合专家模型，每个 token 约激活 9B 参数，目标是装进 24 GB 显卡。它由 Nemotron 3.5 Super VL 压缩而来，只有一个版本，即 NVIDIA 官方原生 2-bit 文件，22.0 GB。88 层中只有 8 层的缓存随上下文增长，所以上下文很便宜：4K 约 23.1 GB，128K 约 24.1 GB，用满 256K 约 25.2 GB。这正是 NVIDIA 设计的 24 GB，但超过了本站的宽裕线，所以 24 GB 显卡判定为偏紧；32 GB 显卡或 48 GB 的 Mac 可以从容运行。图像编码器是另外 1.7 GB 的文件。基准成绩是 NVIDIA 自己报的，2-bit 版本的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'IQ2_XXS', bpw: 2.38, vramGB: 23.1, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Bolt-74B-A9B GGUF'), confidence: 'estimated', source: { repo: 'unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF', file: 'NVIDIA-Nemotron-3.5-Bolt-74B-A9B-IQ2_XXS.gguf', bytes: 22_018_326_528, mmprojBytes: 1_733_692_736, checkedAt: '2026-10-16' } },
    ],
  },
  {
    // NVIDIA Nemotron 3.5 Super VL 120B-A12B (released 2026-10-15). Shape from the official BF16
    // repo's config.json (nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, pasted by the owner
    // 2026-10-16): NemotronHForCausalLM, hidden 4096, 88 layers = 40 mamba + 40 moe + 8 attention,
    // 32 heads / 2 KV × 128, 512 routed experts of width 2688 at a 1024 latent, 22 per token, 1 shared
    // expert 5376, vocab 131072 untied, 1,048,576 positions; one MTP layer ships as a separate GGUF.
    // Counted from that config: 120.67B total, 12.2B active; ggml-org's BF16 GGUF is
    // 241,518,661,568 B = 120.76B, which is `params` (what loads). bpw from ggml-org's single files:
    // Q4_0 71,803,752,384 B → 4.76, Q8_0 128,472,993,728 B → 8.51 (on 8.5: the count holds). Vision
    // mmproj Q8_0 966,925,568 B / BF16 1,733,696,768 B, separate. Mamba state as Bolt's (~0.17 GB).
    id: 'nemotron-3.5-super-vl-120b-a12b',
    name: 'Nemotron 3.5 Super VL 120B-A12B',
    family: 'NVIDIA Nemotron',
    params: 120.76,
    paramLabel: '120B-A12B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 88, attHeads: 32, kvHeads: 2, headDim: 128, attention: { fullLayers: 8, note: { en: 'Only 8 of 88 layers are attention layers with a growing KV cache (2 KV heads × 128); 40 are Mamba-2 layers with a fixed recurrent state and 40 are mixture-of-experts layers that cache nothing per token.', zh: '88 层中只有 8 层是会随上下文增长 KV 缓存的注意力层（2 个 KV 头 × 128）；40 层是状态大小固定的 Mamba-2 层，另 40 层是不缓存任何内容的混合专家层。' } } },
    addedAt: ADDED_NEMOTRON35,
    description: {
      en: 'NVIDIA\'s Nemotron 3.5 Super VL is a 120B mixture-of-experts vision-language model with about 12B parameters active per token. It is built for coding, tool use and document work, with a context window of up to 1M tokens. Only 8 of its 88 layers keep a growing cache, so even the full window is cheap: at Q4_0 (ggml-org\'s 71.8 GB file) it needs about 75 GB at 4K and 84 GB at 1M. That runs comfortably on a 128 GB Mac or a DGX Spark 128G, and tightly on one 80 GB card. Q8_0 (128 GB) wants a 256 GB Mac. The vision encoder is a separate 1–1.7 GB file. Sizes come from the published GGUF files; NVIDIA\'s benchmark claims are its own and no per-level quality loss has been published.',
      zh: 'NVIDIA 的 Nemotron 3.5 Super VL 是 120B 混合专家视觉语言模型，每个 token 约激活 12B 参数，面向编程、工具调用和文档处理，上下文最长 100 万 token。88 层中只有 8 层的缓存随上下文增长，所以即使用满窗口也不贵：Q4_0（ggml-org 发布的 71.8 GB 文件）在 4K 下约需 75 GB，100 万上下文约 84 GB。128 GB 的 Mac 或 DGX Spark 128G 可以从容运行，单张 80 GB 显卡偏紧。Q8_0（128 GB）需要 256 GB 的 Mac。视觉编码器是另外 1–1.7 GB 的文件。体积按已发布的 GGUF 文件计算；基准成绩是 NVIDIA 自己报的，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_0', bpw: 4.76, vramGB: 75.1,  hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Super-VL-120B-A12B GGUF Q4_0'), confidence: 'estimated', source: { repo: 'ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF', file: 'NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Q4_0.gguf', bytes: 71_803_752_384, mmprojBytes: 966_925_568, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 134.3, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Super-VL-120B-A12B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF', file: 'NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Q8_0.gguf', bytes: 128_472_993_728, mmprojBytes: 966_925_568, checkedAt: '2026-10-16' } },
    ],
  },
  {
    // NVIDIA Nemotron 3.5 Lightning 30B-A3B. Official config.json
    // (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, pasted by the owner 2026-10-16):
    // NemotronHForCausalLM, text only, hidden 2688, 52 layers = 23 mamba + 23 moe + 6 attention,
    // 32 heads / 2 KV × 128, 128 routed experts (relu2, width 1856) top-6 + 1 shared (3712), no latent,
    // vocab 131072 untied, 262144 positions. Counted: 31.58B total, ~3.2B active (incl. lm_head);
    // ggml-org's BF16 GGUF 63,181,504,576 B = 31.59B, which is `params`. bpw from ggml-org's single
    // files: Q4_0 18,898,091,584 → 4.79, Q8_0 33,585,495,616 → 8.51. Its one MTP layer is a separate
    // optional file (mtp-…-Q4_0 1,155,907,520 B) for speculative decoding, not in `params`. Mamba-2
    // state (64 heads × 64 × 128, fp32, ~2 MiB a layer) is fixed and left inside the buffer.
    id: 'nemotron-3.5-lightning-30b-a3b',
    name: 'Nemotron 3.5 Lightning 30B-A3B',
    family: 'NVIDIA Nemotron',
    params: 31.59,
    paramLabel: '30B-A3B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'mac', 'pro-gpu'],
    contextLength: 262144,
    arch: { layers: 52, attHeads: 32, kvHeads: 2, headDim: 128, attention: { fullLayers: 6, note: { en: 'Only 6 of 52 layers are attention layers with a growing KV cache (2 KV heads × 128); 23 are Mamba-2 layers with a fixed recurrent state and 23 are mixture-of-experts layers that cache nothing per token.', zh: '52 层中只有 6 层是会随上下文增长 KV 缓存的注意力层（2 个 KV 头 × 128）；23 层是状态大小固定的 Mamba-2 层，另 23 层是不缓存任何内容的混合专家层。' } } },
    addedAt: ADDED_LIGHTNING,
    description: {
      en: 'The small member of NVIDIA\'s Nemotron 3.5 family: a 30B text-only mixture-of-experts model with about 3B parameters active per token. It generates at roughly the speed of a 3B model. Only 6 of its 52 layers keep a growing cache, which makes long context almost free: at Q4_0 (ggml-org\'s 18.9 GB file) it needs about 19.8 GB at 4K, 20.6 GB at 128K and 21.4 GB at its full 256K window. That is comfortable on a 24 GB card up to 128K and tight only at the full window; a 16 GB card cannot hold it. Q8_0 (about 35 GB) wants a 48 GB card or a 64 GB Mac. An optional 1.2 GB draft file for speculative decoding ships separately. Sizes come from the published GGUF files; NVIDIA\'s benchmark claims are its own and no per-level quality loss has been published.',
      zh: 'NVIDIA Nemotron 3.5 系列中的小尺寸成员：30B 纯文本混合专家模型，每个 token 约激活 3B 参数，生成速度大致相当于 3B 模型。52 层中只有 6 层的缓存随上下文增长，所以长上下文几乎不占额外显存：Q4_0（ggml-org 发布的 18.9 GB 文件）在 4K 下约需 19.8 GB，128K 约 20.6 GB，用满 256K 约 21.4 GB。24 GB 显卡到 128K 都很宽裕，只有用满窗口时偏紧；16 GB 显卡装不下。Q8_0（约 35 GB）需要 48 GB 显卡或 64 GB 的 Mac。另有一个可选的 1.2 GB 草稿文件用于投机解码，单独下载。体积按已发布的 GGUF 文件计算；基准成绩是 NVIDIA 自己报的，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_0', bpw: 4.79, vramGB: 19.8, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Lightning-30B-A3B GGUF Q4_0'), confidence: 'estimated', source: { repo: 'ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF', file: 'NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Q4_0.gguf', bytes: 18_898_091_584, checkedAt: '2026-10-16' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 35.1, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Lightning-30B-A3B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF', file: 'NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Q8_0.gguf', bytes: 33_585_495_616, checkedAt: '2026-10-16' } },
    ],
  },
  {
    // inclusionAI Ling-3.1-flash (Ant Group, weights 2026-10-13, MIT). Official config.json (read
    // 2026-10-15 from huggingface.co): BailingMoeV3ForCausalLM / model_type bailing_hybrid (llama.cpp
    // `bailingmoe3`, b11571+ per AtomicChat's GGUF card); 72 layers = 63 KDA (Kimi Delta Attention,
    // linear, fixed-size state) + 9 gated MLA, one MLA layer per layer_group_size 8 (layers 7, 15 … 71
    // carry g_proj) — the card's "63 KDA + 9 Gated MLA (7:1)"; hidden 4096, 64 heads; MLA kv_lora_rank
    // 512 + qk_rope_head_dim 64 → kvHeads 1 × headDim 288 as for DeepSeek-V3 / Kimi Linear (AtomicChat:
    // "about 10 KB per token" = 9 × 576 × 2 B). 512 experts top-8 + 1 shared, first 4 layers dense;
    // vocab 157184; max_position_embeddings 262144 with rope_scaling null (the card says "1M-token
    // context window" but gives no scaling recipe; the GGUF's context_length is also 262144).
    // params = the GGUF's own tensor total, 563,946,483,520 (the Hub's safetensors total, 572.12B,
    // includes the MTP layer 72 that the GGUF drops; card: 560B total / 25B active). bpw from
    // AtomicChat's "AD" (dynamic) GGUF repo byte counts: AD-Q4_K_M 354,394,733,920 / AD-Q8_0
    // 600,847,449,760 → 5.03 / 8.52 (experts at the named type, attention/shared/router ≥ q8_0).
    // AtomicChat publishes KL divergence, not perplexity, so no pplLossPercent.
    id: 'ling-3.1-flash',
    name: 'Ling-3.1-flash',
    family: 'inclusionAI Ling',
    params: 563.95,
    paramLabel: '560B-A25B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['pro-gpu'],
    contextLength: 262144,
    arch: { layers: 72, attHeads: 64, kvHeads: 1, headDim: 288, attention: { fullLayers: 9, note: { en: '9 of 72 layers keep an MLA cache (one in every eight); the other 63 are Kimi Delta Attention, a linear layer with a fixed-size state, so the cache grows by only about 10 KB per token.', zh: '72 层中只有 9 层保留 MLA 缓存（每八层一层）；其余 63 层是 Kimi Delta Attention 线性层，只有固定大小的状态，所以每个 token 只让缓存增长约 10 KB。' } } },
    addedAt: ADDED_LING31,
    description: {
      en: 'inclusionAI\'s Ling-3.1-flash (Ant Group), released in October under MIT: a 560B mixture-of-experts reasoning model with 25B parameters active per token. It is aimed at agents, coding and long office tasks. Only 9 of its 72 layers keep a growing cache, and those store MLA\'s compressed vectors, so even its full 256K window adds only about 3 GB: the weights decide where it runs. At Q4_K_M it needs about 371 GB at 4K context, more than any single GPU in this index. The 512 GB Mac Studio gives its GPU about 384 GB, which holds it only tightly on this site\'s rule; on servers the vendor\'s reference setup is eight H200s or four GB300s running FP8. Q8_0 needs about 628 GB. The vendor quotes a 1M-token window, but the released config sets 262,144 positions with no scaling, so that is the limit used here. llama.cpp runs it as `bailingmoe3` from build b11571. Sizes come from a published GGUF file, whose maker reports KL divergence rather than perplexity, so no quality-loss figure is shown.',
      zh: 'inclusionAI（蚂蚁集团）的 Ling-3.1-flash，10 月以 MIT 许可发布：560B 混合专家推理模型，每个 token 激活 25B 参数。它面向智能体、编程和长时间的办公任务。72 层中只有 9 层保留会增长的缓存，而且存的是 MLA 压缩向量，所以即使用满 256K 窗口，缓存也只多约 3 GB——决定它能在什么硬件上跑的是权重。Q4_K_M 在 4K 上下文下约需 371 GB，超过本索引里任何一张单卡。512 GB 的 Mac Studio 能分给 GPU 约 384 GB，按本站规则只能算「勉强」装下；服务器上，官方的参考配置是 8 张 H200 或 4 张 GB300 跑 FP8。Q8_0 约需 628 GB。官方称上下文窗口为 100 万 token，但发布的 config 设定为 262,144 个位置且没有缩放配置，所以这里按这个上限计算。llama.cpp 从 b11571 版起以 `bailingmoe3` 架构运行它。体积按已公布的 GGUF 文件计算，制作者给出的是 KL 散度而非困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.03, vramGB: 370.6, hfSearchUrl: hf('Ling-3.1-flash GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'AtomicChat/Ling-3.1-flash-GGUF', bytes: 354_394_733_920, checkedAt: '2026-10-17' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.52, vramGB: 627.6, hfSearchUrl: hf('Ling-3.1-flash GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'AtomicChat/Ling-3.1-flash-GGUF', bytes: 600_847_449_760, checkedAt: '2026-10-17' } },
    ],
  },
  {
    // Reflection AI Beam 1.0 501B-A23B (open weights released 2026-10-16, Apache 2.0; announced
    // waitlist-only 10-05). Official config.json (reflection/Beam-1.0-501B-A23B, read from
    // huggingface.co 2026-10-17): BeamForCausalLM, hidden 5120, 52 layers, 48 heads / 8 KV × 128,
    // layer_types = every 6th layer full attention (5, 11, …, 47) plus the last (51) → 9 full + 43
    // sliding, sliding_window 512, full layers NoPE; first 3 layers dense (SwiGLU 20480), the other
    // 49 MoE with 256 experts of width 2560, 8 per token (8 groups, top-4), no shared expert; vocab
    // 151936 untied; 1,048,576 positions. Every layer also carries a 5120 × 6144 attention gate.
    // Counted from that config: ~501.3B total, ~22.7B active (card: 501B / 23B). `params` =
    // 501,267,612,352, the Hub's safetensors total, matched exactly by summing the tensor headers of
    // unsloth's 23-part BF16 GGUF. llama.cpp `beam` (src/models/beam.cpp, on master): iSWA cache,
    // LLAMA_SWA_TYPE_STANDARD → a window layer holds pad256(512 + 512) = 1024 cells (the Muse Spark
    // rule). bpw from published file bytes: DevQuasar Q2_K (14 parts) 182,067,737,056 B → 2.91;
    // unsloth Q8_0 (13 parts) 532,794,735,998 B → 8.50 (on 8.5: the count holds). No plain 4-bit
    // file exists yet — unsloth ships only UD-* tiers (UD-Q4_K_XL 306,533,349,412 B → 4.89), so it
    // is described in prose rather than filed as a level it is not. Reflection also ships FP8 /
    // NVFP4 safetensors and a DFlash2 draft model; neither is a GGUF level here.
    id: 'beam-1.0-501b-a23b',
    name: 'Beam 1.0 501B-A23B',
    family: 'Reflection Beam',
    params: 501.27,
    paramLabel: '501B-A23B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 52, attHeads: 48, kvHeads: 8, headDim: 128, attention: { fullLayers: 9, windowLayers: 43, windowTokens: 1024, note: { en: '43 of 52 layers use a 512-token sliding window (llama.cpp keeps the window plus one 512-token batch, 1,024 cells); only the 9 full-attention layers grow a cache with context.', zh: '52 层中 43 层使用 512 token 滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，共 1,024 个位置），只有 9 层全注意力层的缓存随上下文增长。' } } },
    addedAt: ADDED_BEAM,
    description: {
      en: 'Reflection AI\'s first open-weight model, released in October under Apache 2.0. It is a 501B text-only mixture-of-experts model with about 23B parameters active per token, built for coding and agent work, with a 1M-token window. Only 9 of its 52 layers keep a growing cache, so context costs little: at Q2_K (DevQuasar\'s 182 GB file) it needs about 191 GB at 4K, 196 GB at 128K and 230 GB across the full 1M window. That is comfortable on a 512 GB Mac Studio at any context and tight on a 256 GB one up to 128K. Unsloth\'s dynamic 4-bit UD-Q4_K_XL file (307 GB) works out to about 321 GB at 4K, which still fits the 512 GB Mac; Q8_0 (533 GB) fits no single machine in this index. Sizes come from the published GGUF files; Reflection\'s benchmark claims are its own and no per-level quality loss has been published.',
      zh: 'Reflection AI 的首个开放权重模型，10 月以 Apache 2.0 发布：501B 纯文本混合专家模型，每个 token 约激活 23B 参数，面向编程和智能体任务。上下文窗口 100 万 token；52 层中只有 9 层的缓存随上下文增长，所以上下文很便宜：Q2_K（DevQuasar 发布的 182 GB 文件）在 4K 下约需 191 GB，128K 约 196 GB，用满 100 万上下文约 230 GB。512 GB 的 Mac Studio 在任何上下文下都能从容运行，256 GB 的到 128K 为止偏紧。Unsloth 的动态 4-bit 文件 UD-Q4_K_XL（307 GB）在 4K 下约需 321 GB，512 GB 的 Mac 仍然装得下；Q8_0（533 GB）在本站收录的任何单台机器上都装不下。体积按已发布的 GGUF 文件计算；基准成绩是 Reflection 自己报的，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q2_K', bpw: 2.91, vramGB: 190.9, hfSearchUrl: hf('Beam-1.0-501B-A23B GGUF Q2_K'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.50, vramGB: 556.9, hfSearchUrl: hf('Beam-1.0-501B-A23B GGUF Q8_0'), confidence: 'estimated' },
    ],
  },
  {
    // Gemma 4 12B Unified (Google, 2026-06-03, Apache 2.0) — a gap-audit find, missed by every
    // daily patrol because it shipped in June. Shape from transformers
    // `models/gemma4_unified/convert_gemma4_unified_weights.py` `_VARIANTS["gemma-4-12b"]` (the
    // configuration file's defaults describe a smaller reference checkpoint): hidden 3840,
    // intermediate 4 × 3840, 48 layers = (5 sliding + 1 full) × 8, 16 heads, 8 KV × 256 on the
    // sliding layers, 1 global KV head × 512 on the full ones (`attention_k_eq_v`), window 1024,
    // tied 262,144 vocab. Counted from those: 1.007B embedding + 40 × 224.1M + 8 × 241.8M =
    // 11.91B decoder, + ~0.04B patch/audio embedders = 11.95B, the published figure.
    // llama.cpp: `conversion/gemma.py` registers Gemma4UnifiedForConditionalGeneration as the
    // `gemma4` arch; `src/models/gemma4.cpp` uses K as V when there is no v_proj but still caches
    // both, so the full layers are sized as K + V like the 31B. Window cells pad256(1024 + 512).
    // GGUF byte counts (owner-pasted 2026-10-20, tree size = CDN Content-Length): unsloth
    // `gemma-4-12b-it-Q8_0.gguf` 12,669,647,680 → exactly 8.51 bpw over the 11.91B decoder, so the
    // main GGUF holds the decoder only and `params` is 11.91 (the ~0.04B patch/audio embedders ship
    // in the separate mmproj file). Q4_K_M from unsloth's 7,121,861,440 → 4.78; bartowski's
    // Q4_K_M is a different file (7,662,533,088 → 5.15) — the description names both.
    id: 'gemma-4-12b',
    name: 'Gemma 4 12B IT',
    family: 'Google Gemma 4',
    params: 11.91,
    paramLabel: '12B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 262144,
    arch: {
      layers: 48,
      attHeads: 16,
      kvHeads: 8,
      headDim: 256,
      attention: {
        fullLayers: 8,
        windowLayers: 40,
        windowTokens: 1536,
        fullKvHeads: 1,
        fullHeadDim: 512,
        note: {
          en: '8 of 48 layers are global (1 KV head × 512) and grow with context; the other 40 use a 1,024-token sliding window (8 KV heads × 256).',
          zh: '48 层中 8 层为全局注意力（1 个 KV 头 × 512 维），缓存随上下文增长；其余 40 层是 1024 token 滑动窗口（8 个 KV 头 × 256 维）。',
        },
      },
    },
    addedAt: ADDED_GEMMA4_12B,
    description: {
      en: 'Google\'s mid-sized Gemma 4, released in June: a dense 12B with a 256K window. It takes text, images and audio without separate encoders — the raw inputs go straight into the one decoder. Only 8 of its 48 layers cache the full context, each with a single wide KV head, so the cache stays small: about 1 GB at 32K and 4.5 GB at the full 256K. At Q4_K_M (unsloth\'s 7.1 GB file) that is about 8.5 GB at 32K and 10.2 GB at 128K, both comfortable on a 12 GB card; a 16 GB card holds the whole window comfortably, and an 8 GB card is tight even at 4K. bartowski\'s Q4_K_M is a larger file (7.7 GB), so add about half a gigabyte if you use it. Sizes come from the published GGUF files; the image and audio embedders ship as a separate mmproj file, and no per-level quality loss has been published.',
      zh: 'Google 6 月发布的中等尺寸 Gemma 4：12B 稠密模型，256K 上下文，文本、图像、音频都不需要单独的编码器，原始输入直接进入同一个解码器。48 层中只有 8 层缓存完整上下文，每层只有一个宽 KV 头，所以缓存很小：32K 约 1 GB，用满 256K 也只要约 4.5 GB。Q4_K_M（unsloth 的 7.1 GB 文件）在 32K 下约 8.5 GB、128K 约 10.2 GB，12 GB 显卡都很从容；16 GB 显卡能从容加载完整窗口，8 GB 显卡即使 4K 也偏紧。bartowski 的 Q4_K_M 文件更大（7.7 GB），用它的话再加约 0.5 GB。体积按已发布的 GGUF 文件计算；图像和音频嵌入层在单独的 mmproj 文件里，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.78, vramGB: 7.1,  hfSearchUrl: hf('gemma-4-12b-it GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'unsloth/gemma-4-12b-it-GGUF', bytes: 7_121_861_440, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 12.7, hfSearchUrl: hf('gemma-4-12b-it GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'unsloth/gemma-4-12b-it-GGUF', file: 'gemma-4-12b-it-Q8_0.gguf', bytes: 12_669_647_680, checkedAt: '2026-10-20' } },
    ],
  },
  {
    // Cohere North Mini Code 1.0 (June 2026, Apache 2.0) — gap-audit find, held on 10-20 until the
    // owner pasted the real files (huggingface.co is blocked here): `CohereLabs/North-Mini-Code-1.0`
    // config.json — Cohere2MoeForCausalLM, 49 layers, `layer_types` = 13 full_attention + 36
    // sliding_attention (12 × [full, swa, swa, swa] + 1 full), sliding_window 4096, 32 heads / 4 KV
    // × 128, hidden 2048, 128 experts top-8 (768 wide), 1 dense lead layer (3072), tied 262,144
    // vocab, max_position_embeddings 500000 (model card: "Context length: 256K" — the card's figure
    // is used). params = safetensors `total_parameters` 30,484,303,872 = bartowski GGUF `total`;
    // counted from the config it is 29.0B experts + 0.92B attention + 0.54B embedding ≈ 30.49B.
    // bpw from bartowski byte counts: Q3_K_M 14,209,048,128 → 3.73, Q4_K_M 18,744,024,640 → 4.92,
    // Q8_0 32,437,263,936 → 8.51; BF16 61,004,406,272 → 16.01 confirms the chain.
    // llama.cpp: `cohere2moe` (PR #24260, merged 2026-06-13), `build_attn_inp_kv_iswa` with
    // LLAMA_SWA_TYPE_STANDARD → window cells pad256(4096 + 512) = 4608.
    id: 'north-mini-code-1.0',
    name: 'North Mini Code 1.0 30B-A3B',
    family: 'Cohere North',
    params: 30.48,
    paramLabel: '30B-A3B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'pro-gpu'],
    contextLength: 262144,
    arch: {
      layers: 49,
      attHeads: 32,
      kvHeads: 4,
      headDim: 128,
      attention: {
        fullLayers: 13,
        windowLayers: 36,
        windowTokens: 4608,
        note: {
          en: '13 of 49 layers use full attention and grow with context; the other 36 use a 4,096-token sliding window. All of them keep 4 KV heads × 128.',
          zh: '49 层中 13 层是全局注意力，缓存随上下文增长；其余 36 层是 4096 token 滑动窗口。所有层都是 4 个 KV 头 × 128 维。',
        },
      },
    },
    addedAt: ADDED_NORTH_MINI,
    description: {
      en: 'Cohere\'s open coding model, released in June: a 30B mixture-of-experts with about 3B parameters active per token. It is built for code generation, agentic software work and terminal tasks, and takes text only. Only 13 of its 49 layers keep a cache that grows with context, so long sessions stay affordable: at Q4_K_M (bartowski\'s 18.7 GB file) it needs about 20.0 GB at 4K, 20.8 GB at 32K and 23.5 GB at 128K — comfortable on a 24 GB card up to 32K and tight at 128K. A 16 GB card needs Q3_K_M (bartowski\'s 14.2 GB file): about 15.3 GB at 4K, tight, and too big past 32K. The model card says 256K context while its config allows 500K; this page uses 256K. Sizes come from the published GGUF files; no per-level quality loss has been published, and Cohere\'s benchmark claims are its own.',
      zh: 'Cohere 6 月发布的开源编程模型：30B 混合专家，每个 token 约激活 3B 参数，面向代码生成、智能体式软件开发和终端任务，纯文本。49 层中只有 13 层的缓存随上下文增长，所以长会话也负担得起：Q4_K_M（bartowski 的 18.7 GB 文件）在 4K 下约需 20.0 GB，32K 约 20.8 GB，128K 约 23.5 GB——24 GB 显卡到 32K 都很从容，128K 偏紧。16 GB 显卡需要用 Q3_K_M（bartowski 的 14.2 GB 文件）：4K 下约 15.3 GB，偏紧，超过 32K 就装不下。模型卡写的是 256K 上下文，配置文件允许 500K，本页按 256K 计算。体积按已发布的 GGUF 文件计算；各档位的质量损失未公布，基准成绩是 Cohere 自己报的。',
    },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.73, vramGB: 14.2, hfSearchUrl: hf('North-Mini-Code-1.0 GGUF Q3_K_M'), confidence: 'estimated', source: { repo: 'bartowski/North-Mini-Code-1.0-GGUF', bytes: 14_209_048_128, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.92, vramGB: 18.7, hfSearchUrl: hf('North-Mini-Code-1.0 GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/North-Mini-Code-1.0-GGUF', bytes: 18_744_024_640, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 32.4, hfSearchUrl: hf('North-Mini-Code-1.0 GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/North-Mini-Code-1.0-GGUF', bytes: 32_437_263_936, checkedAt: '2026-10-20' } },
    ],
  },
  {
    // OpenBMB MiniCPM-V 4.7 35B-A3B (Hugging Face repo from 2026-10-06, Apache 2.0). Owner-pulled
    // config.json (2026-10-20, huggingface.co blocked here): `minicpmv4_7` = SigLIP vision (27 layers,
    // hidden 1152) + a `qwen3_5_moe_text` backbone with exactly Qwen3.6 35B-A3B's shape — 40 layers,
    // hidden 2048, 16 heads / 2 KV × 256, full_attention_interval 4 (10 full + 30 Gated DeltaNet),
    // 256 experts / 8 routed + shared, vocab 248144, 262144 positions. llama.cpp `qwen35moe` for the
    // text; vision via OpenBMB's mmproj. Params from OpenBMB's own F16 GGUF: 69,375,191,008 B / 2 =
    // 34.69B (Q8_0 → 8.51 and Q4_0 → 4.55 bpw confirm it). Q4_K_S / Q4_K_M / Q5_K_M / Q8_0 from the
    // same repo's byte counts: 19.89 / 21.17 / 24.73 / 36.90 GB. mmproj-model-f16 = 1,119,575,840 B
    // (the 4x-downsampling one 910,491,648 B) — not in the sizes below; the description says so.
    id: 'minicpm-v-4-7-35b-a3b',
    name: 'MiniCPM-V 4.7 35B-A3B',
    family: 'OpenBMB MiniCPM-V',
    params: 34.69,
    paramLabel: '35B-A3B',
    categories: ['multimodal', 'general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    arch: { layers: 40, attHeads: 16, kvHeads: 2, headDim: 256, attention: { fullLayers: 10, note: { en: '10 of 40 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate. Same backbone shape as Qwen3.6 35B-A3B.', zh: '40 层中有 10 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。骨干结构与 Qwen3.6 35B-A3B 相同。' } } },
    addedAt: ADDED_MINICPM47,
    description: {
      en: 'A mixture-of-experts vision model from OpenBMB. It reads images and video on top of a 34.7B language model with about 3B parameters active per token, the same layout as Qwen3.6 35B-A3B. Only 10 of its 40 layers keep a growing KV cache, so context is cheap. At Q4_K_S it needs about 20.9 GB at 4K, comfortable on a 24 GB card; Q4_K_M (22.2 GB) is tight there, and a 32 GB card holds Q4_K_M across the whole 256K window. The vision encoder is a separate 1.1 GB file on top of these figures, which turns Q4_K_S on 24 GB tight as well once images are loaded. llama.cpp runs the text model as `qwen35moe`. Sizes come from OpenBMB\'s own GGUF files, and no per-level quality loss has been published.',
      zh: '面壁智能（OpenBMB）的混合专家视觉模型：在 34.7B 的语言模型上读图像和视频，每个 token 约激活 3B 参数，结构与 Qwen3.6 35B-A3B 相同。40 层中只有 10 层保留会增长的 KV 缓存，所以上下文很便宜。Q4_K_S 在 4K 下约需 20.9 GB，24 GB 显卡上很宽裕；Q4_K_M（22.2 GB）在 24 GB 上偏紧，32 GB 显卡用满 256K 窗口也装得下 Q4_K_M。视觉编码器是另外一个 1.1 GB 的文件，不在上面的数字里；加载图像后，24 GB 显卡上的 Q4_K_S 也会变成偏紧。llama.cpp 以 `qwen35moe` 架构运行它的文本部分。体积按 OpenBMB 官方 GGUF 文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_S', bpw: 4.59, vramGB: 20.9, hfSearchUrl: hf('MiniCPM-V-4.7-35B-A3B GGUF Q4_K_S'), confidence: 'estimated', source: { repo: 'openbmb/MiniCPM-V-4.7-35B-A3B-gguf', file: 'MiniCPM-V-4_7-35B-A3B-Q4_K_S.gguf', bytes: 19_889_400_736, mmprojBytes: 1_119_575_840, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.88, vramGB: 22.2, hfSearchUrl: hf('MiniCPM-V-4.7-35B-A3B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'openbmb/MiniCPM-V-4.7-35B-A3B-gguf', file: 'MiniCPM-V-4_7-35B-A3B-Q4_K_M.gguf', bytes: 21_166_255_008, mmprojBytes: 1_119_575_840, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.70, vramGB: 25.9, hfSearchUrl: hf('MiniCPM-V-4.7-35B-A3B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'openbmb/MiniCPM-V-4.7-35B-A3B-gguf', file: 'MiniCPM-V-4_7-35B-A3B-Q5_K_M.gguf', bytes: 24_728_583_072, mmprojBytes: 1_119_575_840, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 38.6, hfSearchUrl: hf('MiniCPM-V-4.7-35B-A3B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'openbmb/MiniCPM-V-4.7-35B-A3B-gguf', file: 'MiniCPM-V-4_7-35B-A3B-Q8_0.gguf', bytes: 36_902_368_928, mmprojBytes: 1_119_575_840, checkedAt: '2026-10-20' } },
    ],
  },
  {
    // Xiaomi MiMo-V2.6-Flash-RL (2026-09-21, MIT). Owner-pulled config.json (2026-10-20): 48 layers,
    // hidden 4096, 64 heads; hybrid_layer_pattern 0 = full at layers 0, 5, 11, 17, 23, 29, 35, 41, 47
    // (9 full) and 1 = sliding window 128 (39 SWA). Full layers 4 KV heads, SWA layers 8 KV heads;
    // K 192 / V 128 on both → headDim 160 (exact K+V bytes), fullKvHeads 4. SWA cells: llama.cpp
    // `mimo2` is LLAMA_SWA_TYPE_STANDARD → pad256(128 + 512) = 768, as MiMo-V2.6-Pro. 256 experts /
    // 8 routed (moe 2048) on layers 1–47, layer 0 dense (16384), vocab 152576 untied, 1,048,576
    // positions. Config arithmetic: 308.78B (vendor 309B; MTP layers ship as a separate mtp- file and
    // are excluded). ggml-org's GGUF (the only one; none from unsloth/bartowski): MXFP4 2 parts
    // 167,369,465,152 B → 4.34 bpw (GPT-OSS 120B lands on the same rate), Q2_K 126,365,949,248 B →
    // 3.27. Released weights are FP8 with MXFP4 experts, so MXFP4 is the native build (loss 0.0).
    // mmproj BF16 2,748,509,792 B, not in the sizes.
    id: 'mimo-v2-6-flash',
    name: 'MiMo-V2.6-Flash',
    family: 'Xiaomi MiMo',
    params: 308.78,
    paramLabel: '309B-A15B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 1048576,
    arch: { layers: 48, attHeads: 64, kvHeads: 8, headDim: 160, attention: { fullLayers: 9, windowLayers: 39, windowTokens: 768, fullKvHeads: 4, note: { en: '9 of 48 layers use full attention (4 KV heads); the other 39 use a 128-token sliding window with 8 KV heads (llama.cpp keeps the window plus one 512-token batch, padded to 768). Keys are 192 wide and values 128, sized here as their 160 average.', zh: '48 层中 9 层是全注意力（4 个 KV 头），其余 39 层使用 128 token 滑动窗口、8 个 KV 头（llama.cpp 保留窗口加一个 512 token 批次，补齐到 768）。键宽 192、值宽 128，这里按平均 160 计算。' } } },
    addedAt: ADDED_MINICPM47,
    description: {
      en: 'Xiaomi\'s smaller MiMo-V2.6 model: 309B parameters with about 15B active per token, MIT licence. It reads text, images, video and audio. The released weights are already 4-bit on the experts (MXFP4), and ggml-org\'s GGUF keeps them that way: about 175 GB at 4K context. That is comfortable only on a 512 GB Mac Studio, and tight on a 256 GB one. The Q2_K build (about 132 GB) fits a 256 GB Mac comfortably and is tight on a 192 GB one. Only 9 of its 48 layers keep a growing cache, so even the full 1M window adds about 25 GB. llama.cpp runs it as `mimo2`, the same as MiMo-V2.6-Pro, and vision loads through a separate encoder. Sizes come from ggml-org\'s GGUF files; no per-level quality loss has been published.',
      zh: '小米 MiMo-V2.6 系列中较小的一款：309B 参数，每个 token 约激活 15B，MIT 许可，能读文本、图像、视频和音频。发布的权重在专家层本身就是 4 比特（MXFP4），ggml-org 的 GGUF 原样保留：4K 上下文约需 175 GB，只有 512 GB 的 Mac Studio 才宽裕，256 GB 的偏紧。Q2_K 版本（约 132 GB）在 256 GB 的 Mac 上很宽裕，在 192 GB 的 Mac 上偏紧。48 层中只有 9 层保留会增长的缓存，所以即使用满 100 万 token 窗口也只多约 25 GB。llama.cpp 以 `mimo2` 架构运行它（与 MiMo-V2.6-Pro 相同），视觉通过单独的编码器加载。体积按 ggml-org 的 GGUF 文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q2_K',  bpw: 3.27, vramGB: 132.1, hfSearchUrl: hf('MiMo-V2.6-Flash-RL GGUF Q2_K'), confidence: 'estimated', source: { repo: 'ggml-org/MiMo-V2.6-Flash-RL-GGUF', file: 'MiMo-V2.6-Flash-RL-Q2_K-00001-of-00002.gguf', bytes: 126_365_949_248, parts: 2, mmprojBytes: 2_748_509_792, checkedAt: '2026-10-20' } },
      { format: 'GGUF', level: 'MXFP4', bpw: 4.34, vramGB: 175.3, pplLossPercent: 0.0, hfSearchUrl: hf('MiMo-V2.6-Flash-RL GGUF MXFP4'), confidence: 'estimated', source: { repo: 'ggml-org/MiMo-V2.6-Flash-RL-GGUF', file: 'MiMo-V2.6-Flash-RL-MXFP4-00001-of-00002.gguf', bytes: 167_369_465_152, parts: 2, mmprojBytes: 2_748_509_792, checkedAt: '2026-10-20' } },
    ],
  },
];
