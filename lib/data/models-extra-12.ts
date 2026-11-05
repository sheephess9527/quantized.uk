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
const ADDED_K2H = '2026-10-21';
const ADDED_1023 = '2026-10-23';
const ADDED_BOLT_E4B = '2026-10-24';
const ADDED_1026 = '2026-10-26';
const ADDED_1029 = '2026-10-29';
const ADDED_1030 = '2026-10-30';
const ADDED_1105 = '2026-11-05';

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
    // The PT (instruct) checkpoint, not -Thinking. 21.83B = both BF16 GGUFs ÷ 2 (owner-pulled
    // 2026-10-21). Q4_K_M from unsloth's file (bartowski's is 168,252,736 B larger, 4.95 bpw);
    // Q8_0 from bartowski (unsloth's differs by 704 B). No AWQ build of PT exists.
    params: 21.83,
    paramLabel: '21B-A3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac'],
    contextLength: 131072,
    // MoE offload: Ernie4_5_MoeConfig defaults (this model): 27 MoE layers × 64 × 3 × 2560 × 1536 = 20.38B routed, moe_layer_start_index 1; + 2 shared experts 0.64B, attention 0.44B, tied embeddings 0.26B, dense layer 0.09B = 21.82B.
    arch: { layers: 28, attHeads: 20, kvHeads: 4, headDim: 128, moe: { expertParams: 20.38, experts: 64, perToken: 6, moeLayers: 27, denseLead: 1 } },
    addedAt: ADDED,
    description: {
      en: 'Baidu\'s open mixture-of-experts model: about 21.8B parameters in total and roughly 3B active per token. Each token goes through 6 of 64 routed experts plus 2 shared ones. The total decides the memory and the active count decides the speed, so it needs the VRAM of a 20B-class model and reads about as much per token as a 3B one. At Q4_K_M it needs about 14.2 GB at 4K context, just past the comfortable line on a 16 GB card (it loads, with little margin). A 24 GB card, or a 24 GB Mac through the GPU\'s share of unified memory, leaves real room for context. Sizes come from the published GGUF files of the PT (instruct) checkpoint; bartowski\'s Q4_K_M is a different file, 0.17 GB larger than Unsloth\'s used here. No per-level quality loss has been published.',
      zh: '百度开源的混合专家模型：总参数约 21.8B，每个 token 约激活 3B，由 64 个路由专家（每个 token 选 6 个）加 2 个共享专家组成。总参数决定显存，激活参数决定速度，所以它需要 20B 级模型的显存，每个 token 读取的数据量却和 3B 模型差不多。Q4_K_M 在 4K 上下文下约需 14.2 GB，在 16 GB 显卡上刚好越过“宽裕”线（能加载，余量很小）；24 GB 显卡，或 24 GB 的 Mac（靠 GPU 可用的那部分统一内存）才有真正的上下文余量。体积按 PT（指令版）检查点已发布的 GGUF 文件计算；bartowski 的 Q4_K_M 是另一个文件，比这里用的 Unsloth 版大 0.17 GB。各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.89, vramGB: 14.2, hfSearchUrl: hf('ERNIE-4.5-21B-A3B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'unsloth/ERNIE-4.5-21B-A3B-PT-GGUF', file: 'ERNIE-4.5-21B-A3B-PT-Q4_K_M.gguf', bytes: 13_331_015_456, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.50,  vramGB: 24.4, hfSearchUrl: hf('ERNIE-4.5-21B-A3B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/baidu_ERNIE-4.5-21B-A3B-PT-GGUF', file: 'baidu_ERNIE-4.5-21B-A3B-PT-Q8_0.gguf', bytes: 23_205_354_592, checkedAt: '2026-10-21' } },
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
      en: 'Qwen\'s preview of its next architecture: a 125B mixture-of-experts model with about 6B parameters active per token. Released in August, it also carries a 51B n-gram lookup table. llama.cpp reads that table lazily from RAM or disk, so it never needs VRAM. It does need disk space and is bundled inside the GGUF files, which is why they are far larger than the sizes below. Only 12 of its 48 layers keep a growing KV cache, so even the full 256K window adds about 7.5 GB. At Q4_K_M it needs about 79 GB at 4K context, comfortable on a 128 GB Mac or DGX Spark; at 256K it needs about 87 GB, still comfortable on the Spark but tight on the Mac, whose GPU gets about three quarters of its memory. A single 24 or 32 GB card runs it only with experts offloaded to system RAM. llama.cpp supports it as `qwen4exp`. Sizes use the calculator\'s generic rates, since no file size isolates the model from the table, and no per-level quality loss has been published.',
      zh: 'Qwen 下一代架构的预览版，8 月发布：125B 的混合专家模型，每个 token 约激活 6B 参数，另带一张 51B 的 n-gram 查找表。llama.cpp 从内存或磁盘按需读取这张表，它从不占用显存，但要占磁盘空间，而且打包在 GGUF 文件里，所以文件比下面的数字大得多。48 层中只有 12 层保留会增长的 KV 缓存，即使用满 256K 窗口也只多约 7.5 GB。Q4_K_M 在 4K 上下文下约需 79 GB，128 GB 的 Mac 或 DGX Spark 都能从容运行；256K 下约需 87 GB，在 DGX Spark 上仍然宽裕，在 Mac 上偏紧，因为 macOS 只让 GPU 使用约四分之三的内存。单张 24 或 32 GB 显卡只有把专家卸载到系统内存才能跑。llama.cpp 以 `qwen4exp` 架构支持它。下方体积使用计算器的通用比特率（没有哪个文件大小能把模型本身和查找表分开），各档位的质量损失也未公布。',
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
    // file). llama.cpp arch `qwen35moe`. Params 35.53B = bartowski's BF16 GGUF ÷ 2 (owner-pulled
    // listing 2026-10-21; was 35.59 from Q8_0 ÷ 8.5). Unsloth's BF16 is 34.69B — bartowski's files carry
    // ~0.84B more tensors — so bpw is per bartowski file (`source`): Q4_K_M 5.02, Q8_0 8.51. The vision
    // encoder is a separate mmproj.
    id: 'qwen3-6-35b-a3b',
    name: 'Qwen3.6 35B-A3B',
    family: 'Alibaba Qwen3.6',
    params: 35.53,
    paramLabel: '35B-A3B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    // MoE offload: owner-pulled Qwen/Qwen3.6-35B-A3B config (2026-10-29): 40 MoE layers (no dense layers, no decoder_sparse_step) × 256 experts × 3 × 2048 × 512 = 32.21B routed, top-8 + 1 shared expert (512); the remaining 3.32B of the 35.53B total (bartowski's BF16) is attention, linear attention, shared experts and 2 × 248320 × 2048 untied embeddings.
    arch: { layers: 40, attHeads: 16, kvHeads: 2, headDim: 256, attention: { fullLayers: 10, note: { en: '10 of 40 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '40 层中有 10 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } }, moe: { expertParams: 32.21, experts: 256, perToken: 8, moeLayers: 40 } },
    addedAt: ADDED_QWEN36,
    description: {
      en: 'One of the most recommended models for a 24 GB card this year: 35.5B parameters, about 3B active per token, so it reads per token about as much as a 3B model. Only 10 of its 40 layers keep a growing KV cache, so context is cheap: at Q4_K_M it needs about 23.4 GB at 4K and 24.0 GB at 32K. On this site\'s rule that is tight on a 24 GB card, not comfortable, because it counts a working buffer most guides leave out. A 32 GB card, or a 48 GB Mac through the GPU\'s share of unified memory, has real room. It reads images through a separate vision encoder. Sizes come from bartowski\'s GGUF files; Unsloth\'s UD-Q4_K_M is a different file, 0.15 GB smaller. No per-level quality loss has been published.',
      zh: '今年被推荐最多的 24 GB 显卡模型之一：总参数 35.5B，每个 token 约激活 3B，每个 token 读取的数据量和 3B 模型差不多。40 层中只有 10 层保留会增长的 KV 缓存，所以上下文很便宜：Q4_K_M 在 4K 下约需 23.4 GB，32K 下约 24.0 GB。按本站的规则，这在 24 GB 显卡上属于「勉强」而不是「宽裕」，因为本站计入了多数指南忽略的运行缓冲；32 GB 显卡，或 48 GB 的 Mac（靠 GPU 可用的那部分统一内存）才有真正的余量。它通过单独的视觉编码器读取图像。体积按 bartowski 的 GGUF 文件计算；Unsloth 的 UD-Q4_K_M 是另一个文件，小 0.15 GB。各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.02, vramGB: 23.4, hfSearchUrl: hf('Qwen3.6-35B-A3B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.6-35B-A3B-GGUF', file: 'Qwen_Qwen3.6-35B-A3B-Q4_K_M.gguf', bytes: 22_285_080_192, mmprojBytes: 899_283_296, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51,  vramGB: 39.6, hfSearchUrl: hf('Qwen3.6-35B-A3B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.6-35B-A3B-GGUF', file: 'Qwen_Qwen3.6-35B-A3B-Q8_0.gguf', bytes: 37_812_647_552, mmprojBytes: 899_283_296, checkedAt: '2026-10-21' } },
    ],
  },
  {
    // Qwen3.6-27B. Official config.json / model card (via search): 64 layers, hidden 5120, intermediate
    // 17408, 24 heads / 4 KV heads × 256, full_attention_interval 4 (16 full + 48 Gated DeltaNet) —
    // the same layout as Qwen3.8 27B, whose cache sizing matched measurements at 8K/32K/262K. llama.cpp
    // `qwen35`. Params 27.33B = bartowski's BF16 GGUF ÷ 2 (owner-pulled
    // 2026-10-21; was 27.41 from Q8_0); bpw per bartowski file (`source`): Q4_K_M 5.26 / Q5_K_M 6.14 /
    // Q8_0 8.52. Unsloth's BF16 is 26.90B and its Q4_K_M / Q5_K_M / Q8_0 are 16.82 / 19.51 / 28.60 GB. Not superseded by Qwen3.8
    // 27B: same window, same size — supersededDiffNote() would only have its generic line.
    id: 'qwen3-6-27b',
    name: 'Qwen3.6 27B',
    family: 'Alibaba Qwen3.6',
    params: 27.33,
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
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.26, vramGB: 19.1, hfSearchUrl: hf('Qwen3.6-27B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.6-27B-GGUF', file: 'Qwen_Qwen3.6-27B-Q4_K_M.gguf', bytes: 17_984_872_960, mmprojBytes: 927_607_104, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.14, vramGB: 22.2, hfSearchUrl: hf('Qwen3.6-27B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.6-27B-GGUF', file: 'Qwen_Qwen3.6-27B-Q5_K_M.gguf', bytes: 20_965_122_560, mmprojBytes: 927_607_104, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.52,  vramGB: 30.7, hfSearchUrl: hf('Qwen3.6-27B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.6-27B-GGUF', file: 'Qwen_Qwen3.6-27B-Q8_0.gguf', bytes: 29_116_387_840, mmprojBytes: 927_607_104, checkedAt: '2026-10-21' } },
    ],
  },
  {
    // Qwen3.5-9B. Official config.json text_config (via search): 32 layers, hidden 4096, intermediate
    // 12288, 16 heads / 4 KV heads × 256, full_attention_interval 4 (8 full + 24 Gated DeltaNet),
    // untied embeddings, vocab 248320, plus an MTP layer. Params from bartowski's Q8_0 (9.80 GB →
    // 9.22B; the config arithmetic gives ~9.2B, the large vocabulary is ~2B of it); Q4_K_M 6.17 GB →
    // 5.35 bpw. Context 262144 from the Qwen3.5 config. llama.cpp `qwen35`.
    // File names and bytes from bartowski/Qwen_Qwen3.5-9B-GGUF (owner-pulled tree listing, 2026-11-03): BF16
    // 18,407,321,344 B ÷ 2 = 9.20B, consistent with 9.22; mmproj (f16) 918,165,952 B separate.
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
      en: 'The newest small Qwen and a common pick for 8 to 16 GB cards. Only 8 of its 32 layers keep a growing KV cache, so it can use a long context on modest hardware. At Q4_K_M it needs about 6.6 GB at 4K and 7.0 GB at 16K, comfortable on an 8 GB card; at 32K (7.5 GB) it is tight there and comfortable from 10 GB up. Its full 256K window needs about 15.2 GB. Q8_0 needs about 10.4 GB, comfortable from 12 GB up. Reasoning is off by default on the small Qwen3.5 sizes, and it reads images through a separate vision encoder. Sizes come from the published GGUF file sizes, and no per-level quality loss has been published.',
      zh: 'Qwen 最新的小尺寸模型，8 到 16 GB 显卡的常见选择。32 层中只有 8 层保留会增长的 KV 缓存，所以在普通硬件上也能用长上下文。Q4_K_M 在 4K 下约需 6.6 GB，16K 下约 7.0 GB，8 GB 显卡就能从容运行；32K（7.5 GB）在 8 GB 卡上偏紧，10 GB 起才宽裕；用满 256K 窗口约需 15.2 GB。Q8_0 约需 10.4 GB，12 GB 起就很宽裕。Qwen3.5 的小尺寸默认关闭推理模式；它通过单独的视觉编码器读取图像。体积按已公布的 GGUF 文件大小计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.35, vramGB: 6.6,  hfSearchUrl: hf('Qwen3.5-9B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.5-9B-GGUF', file: 'Qwen_Qwen3.5-9B-Q4_K_M.gguf', bytes: 6_169_341_984, mmprojBytes: 918_165_952, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 10.4, hfSearchUrl: hf('Qwen3.5-9B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.5-9B-GGUF', file: 'Qwen_Qwen3.5-9B-Q8_0.gguf', bytes: 9_804_541_984, mmprojBytes: 918_165_952, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.17, vramGB: 0, hfSearchUrl: hf('Qwen3.5-9B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.5-9B-GGUF', file: 'Qwen_Qwen3.5-9B-Q5_K_M.gguf', bytes: 7_111_487_520, mmprojBytes: 918_165_952, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.91, vramGB: 0, hfSearchUrl: hf('Qwen3.5-9B GGUF Q6_K'), confidence: 'estimated', source: { repo: 'bartowski/Qwen_Qwen3.5-9B-GGUF', file: 'Qwen_Qwen3.5-9B-Q6_K.gguf', bytes: 7_958_818_848, mmprojBytes: 918_165_952, checkedAt: '2026-11-03' } },
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
    // MoE offload: owner-pulled JetBrains/Mellum2.1-12B-A2.5B-Thinking config (2026-10-29): mlp_layer_types all 28 sparse, 64 experts × 3 × 2304 × 896 = 11.10B routed, top-8; + attention 0.59B and untied 98304 × 2304 embeddings 0.45B = 12.14B of 12.15B.
    arch: { layers: 28, attHeads: 32, kvHeads: 4, headDim: 128, attention: { fullLayers: 7, windowLayers: 21, windowTokens: 1536, note: { en: '21 of 28 layers use a 1,024-token sliding window (llama.cpp keeps the window plus one 512-token batch, padded to 1,536); only every fourth layer grows a cache with context.', zh: '28 层中 21 层使用 1,024 token 滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，补齐到 1,536），只有每四层中的一层缓存随上下文增长。' } }, moe: { expertParams: 11.10, experts: 64, perToken: 8, moeLayers: 28 } },
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
    // Sizes from bartowski/granite-4.2-8b-GGUF (owner-pulled tree listing, 2026-11-03): BF16 17,587,421,312 B
    // ÷ 2 = 8.79B. Replaces the earlier Q4_K_M figure (5,347,917,888 B → 4.87, publisher not recorded).
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
      en: 'IBM\'s dense 8B reasoning model from the Granite 4.2 family (3B, 8B, 30B), released in August under Apache 2.0. Thinking is on by default; a non-thinking and a low-effort mode are chosen through the chat template. Unlike Granite 4.0\'s hybrid models it is a plain transformer, so llama.cpp runs it as `granite` and every one of its 40 layers keeps a full cache: about 6.5 GB at Q4_K_M with a 4K context, 11.3 GB at 32K and 27.8 GB across the whole 128K window. That makes it an 8 GB card model at short contexts and a 16 GB one for long documents. Sizes come from bartowski\'s GGUF files; IBM publishes no perplexity by quantization level, so no quality-loss figure is shown.',
      zh: 'IBM Granite 4.2 系列（3B、8B、30B）中的 8B 稠密推理模型，8 月以 Apache 2.0 发布。默认开启思考，可通过聊天模板切换为不思考或低强度模式。它不是 Granite 4.0 那种混合架构，而是普通 Transformer，llama.cpp 以 `granite` 架构运行，40 层全部保留完整缓存：Q4_K_M 在 4K 上下文下约 6.5 GB，32K 约 11.3 GB，用满 128K 窗口约 27.8 GB。所以短上下文用 8 GB 显卡就够，处理长文档需要 16 GB。体积按 bartowski 的 GGUF 文件计算；IBM 没有公布各量化档位的困惑度，所以不显示质量损失。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.04, vramGB: 6.3,  hfSearchUrl: hf('granite-4.2-8b GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/granite-4.2-8b-GGUF', file: 'granite-4.2-8b-Q4_K_M.gguf', bytes: 5_539_283_360, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.51, vramGB: 10.5, hfSearchUrl: hf('granite-4.2-8b GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/granite-4.2-8b-GGUF', file: 'granite-4.2-8b-Q8_0.gguf', bytes: 9_345_614_240, checkedAt: '2026-11-03' } },
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
    // MoE offload: owner-pulled LiquidAI/LFM2.5-24B-A2B config (2026-10-29): num_dense_layers 2, then 38 MoE layers × 64 experts × 3 × 2048 × 1536 = 22.95B routed, top-4; + 2 dense MLPs (11776) 0.14B, tied embeddings 0.26B, conv/attention ~0.6B ≈ the 23.97B safetensors total.
    arch: { layers: 40, attHeads: 32, kvHeads: 8, headDim: 64, attention: { fullLayers: 10, note: { en: '10 of 40 layers are full (GQA) attention; the other 30 are short gated convolution blocks that keep a fixed 3-token state, so the KV cache grows at a quarter of the usual rate.', zh: '40 层中只有 10 层是全注意力（GQA），其余 30 层是带门控的短卷积块，只保留固定的 3 个 token 状态，因此 KV 缓存的增长只有常规架构的四分之一。' } }, moe: { expertParams: 22.95, experts: 64, perToken: 4, moeLayers: 38, denseLead: 2 } },
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
    // (mmproj 1,733,692,736 B official / 1,733,692,672 B unsloth's mmproj-BF16 — the row cites unsloth,
    // so it carries unsloth's). llama.cpp v0.7.0 lists the arch; Ollama v0.40.5 ships it.
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
      { format: 'GGUF', level: 'IQ2_XXS', bpw: 2.38, vramGB: 23.1, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Bolt-74B-A9B GGUF'), confidence: 'estimated', source: { repo: 'unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF', file: 'NVIDIA-Nemotron-3.5-Bolt-74B-A9B-IQ2_XXS.gguf', bytes: 22_018_326_528, mmprojBytes: 1_733_692_672, checkedAt: '2026-10-16' } },
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
    // MoE offload: 23 MoE blocks × 128 × 2 (relu2: up + down) × 2688 × 1856 = 29.37B routed, interleaved with Mamba and attention blocks.
    arch: { layers: 52, attHeads: 32, kvHeads: 2, headDim: 128, attention: { fullLayers: 6, note: { en: 'Only 6 of 52 layers are attention layers with a growing KV cache (2 KV heads × 128); 23 are Mamba-2 layers with a fixed recurrent state and 23 are mixture-of-experts layers that cache nothing per token.', zh: '52 层中只有 6 层是会随上下文增长 KV 缓存的注意力层（2 个 KV 头 × 128）；23 层是状态大小固定的 Mamba-2 层，另 23 层是不缓存任何内容的混合专家层。' } }, moe: { expertParams: 29.37, experts: 128, perToken: 6, moeLayers: 23, interleaved: true } },
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
    // MoE offload: 48 MoE layers × 128 × 3 × 2048 × 768 = 28.99B routed, 1 dense lead (the 29.0B above).
    arch: {
      moe: { expertParams: 28.99, experts: 128, perToken: 8, moeLayers: 48, denseLead: 1 },
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
    // MoE offload: owner-pulled openbmb/MiniCPM-V-4.7-35B-A3B text_config (2026-10-29) is the Qwen3.6 35B-A3B layout: 40 MoE layers × 256 × 3 × 2048 × 512 = 32.21B routed, top-8 + 1 shared; 2.48B of the 34.69B total stays on the card.
    arch: { layers: 40, attHeads: 16, kvHeads: 2, headDim: 256, attention: { fullLayers: 10, note: { en: '10 of 40 layers use full attention (full_attention_interval 4); the rest are Gated DeltaNet linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate. Same backbone shape as Qwen3.6 35B-A3B.', zh: '40 层中有 10 层是全注意力（full_attention_interval 为 4），其余是 Gated DeltaNet 线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。骨干结构与 Qwen3.6 35B-A3B 相同。' } }, moe: { expertParams: 32.21, experts: 256, perToken: 8, moeLayers: 40 } },
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
  {
    // MBZUAI IFM K2 Horizon MoVA 36B-A4B (2026-09-03, Apache 2.0, fully open incl. data). Owner-pulled
    // config.json (2026-10-21): k2_horizon, 48 layers, hidden 2560, 32 heads / 8 KV × 128, no sliding
    // window, 100 routed experts top-8 (768) + 1 shared, first 3 layers dense (6144), "MoVA" value
    // experts (64, top-4), softplus attention gate, vocab 250624 untied, 524288 positions. llama.cpp
    // master `k2-horizon` (`src/models/k2-horizon.cpp`): `build_attn_inp_kv()` — a plain cache on every
    // layer; n_layer 48 → LLM_TYPE_36B. Params = IFM's BF16 GGUF 74,924,627,296 B ÷ 2 = 37.46B (bartowski's
    // BF16 agrees to 9 kB); Q8_0 → 8.51 bpw confirms. Levels from IFM's own GGUF repo (bartowski's Q4_K_M
    // is 333,874,048 B larger). No mmproj. Active ~4B per the name (no config figure).
    id: 'k2-horizon-mova-36b-a4b',
    name: 'K2 Horizon MoVA 36B-A4B',
    family: 'MBZUAI K2 Horizon',
    params: 37.46,
    paramLabel: '36B-A4B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 524288,
    arch: { layers: 48, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_K2H,
    description: {
      en: 'The mixture-of-experts member of MBZUAI IFM\'s K2 Horizon family: 37.5B parameters with about 4B active per token, Apache 2.0, released with its training data. Every one of its 48 layers keeps an ordinary KV cache, so context is not cheap: Q4_K_M is about 24.2 GB at 4K, which is tight on a 24 GB card, and comfortable on a 32 GB card up to 16K. The 512K window would need about 129 GB. llama.cpp runs it as `k2-horizon`. Sizes come from IFM\'s own GGUF files (bartowski\'s Q4_K_M is about 0.3 GB larger); no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中的混合专家型号：37.5B 参数，每个 token 约激活 4B，Apache 2.0 许可，训练数据一并公开。48 层每层都保留普通 KV 缓存，所以上下文不便宜：Q4_K_M 在 4K 上下文约需 24.2 GB，24 GB 显卡上偏紧，32 GB 显卡到 16K 都宽裕；用满 512K 窗口约需 129 GB。llama.cpp 以 `k2-horizon` 架构运行它。体积按 IFM 官方 GGUF 文件计算（bartowski 的 Q4_K_M 约大 0.3 GB），各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.78, vramGB: 24.2, hfSearchUrl: hf('K2-Horizon-MoVA-36B-A4B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-MoVA-36B-A4B-GGUF', file: 'K2-Horizon-MoVA-36B-A4B-Q4_K_M.gguf', bytes: 22_368_011_616, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.65, vramGB: 28.5, hfSearchUrl: hf('K2-Horizon-MoVA-36B-A4B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-MoVA-36B-A4B-GGUF', file: 'K2-Horizon-MoVA-36B-A4B-Q5_K_M.gguf', bytes: 26_439_456_096, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q6_K', bpw: 6.57, vramGB: 33.0, hfSearchUrl: hf('K2-Horizon-MoVA-36B-A4B GGUF Q6_K'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-MoVA-36B-A4B-GGUF', file: 'K2-Horizon-MoVA-36B-A4B-Q6_K.gguf', bytes: 30_765_365_856, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 42.5, hfSearchUrl: hf('K2-Horizon-MoVA-36B-A4B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-MoVA-36B-A4B-GGUF', file: 'K2-Horizon-MoVA-36B-A4B-Q8_0.gguf', bytes: 39_831_174_496, checkedAt: '2026-10-21' } },
    ],
  },
  {
    // K2 Horizon 32B (dense). Owner-pulled config.json: 64 layers, hidden 5120, 64 heads / 8 KV × 128,
    // no sliding window, SwiGLU 26624, vocab 250624 untied, 524288 positions, no experts. llama.cpp
    // n_layer 64 → LLM_TYPE_32B, plain cache. Params = IFM BF16 69,571,404,896 B ÷ 2 = 34.79B (bartowski
    // agrees); Q8_0 → 8.50. Levels from IFM's GGUF repo (bartowski's Q4_K_M is 963,060,576 B larger).
    id: 'k2-horizon-32b',
    name: 'K2 Horizon 32B',
    family: 'MBZUAI K2 Horizon',
    params: 34.79,
    paramLabel: '32B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 524288,
    arch: { layers: 64, attHeads: 64, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_K2H,
    description: {
      en: 'The dense 32B member of MBZUAI IFM\'s K2 Horizon family (34.8B counted, Apache 2.0, released with its training data). All 64 layers keep an ordinary KV cache with 8 KV heads: Q4_K_M is about 23.1 GB at 4K, tight on a 24 GB card and comfortable on a 32 GB card up to 16K; each extra 32K of context adds roughly 8.8 GB. llama.cpp runs it as `k2-horizon`. Sizes come from IFM\'s own GGUF files (bartowski\'s Q4_K_M is about 1 GB larger); no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中的 32B 稠密型号（实际 34.8B 参数，Apache 2.0 许可，训练数据一并公开）。64 层每层都保留 8 个 KV 头的普通缓存：Q4_K_M 在 4K 上下文约需 23.1 GB，24 GB 显卡上偏紧，32 GB 显卡到 16K 都宽裕；上下文每多 32K 约多 8.8 GB。llama.cpp 以 `k2-horizon` 架构运行它。体积按 IFM 官方 GGUF 文件计算（bartowski 的 Q4_K_M 约大 1 GB），各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 23.1, hfSearchUrl: hf('K2-Horizon-32B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-32B-GGUF', file: 'K2-Horizon-32B-Q4_K_M.gguf', bytes: 21_075_778_656, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.68, vramGB: 26.9, hfSearchUrl: hf('K2-Horizon-32B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-32B-GGUF', file: 'K2-Horizon-32B-Q5_K_M.gguf', bytes: 24_696_478_816, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q6_K', bpw: 6.56, vramGB: 30.9, hfSearchUrl: hf('K2-Horizon-32B GGUF Q6_K'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-32B-GGUF', file: 'K2-Horizon-32B-Q6_K.gguf', bytes: 28_543_472_736, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.5, vramGB: 39.7, hfSearchUrl: hf('K2-Horizon-32B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-32B-GGUF', file: 'K2-Horizon-32B-Q8_0.gguf', bytes: 36_966_425_696, checkedAt: '2026-10-21' } },
    ],
  },
  {
    // K2 Horizon 7B (dense). Owner-pulled config.json: 36 layers, hidden 4096, 32 heads / 8 KV × 128,
    // no sliding window, SwiGLU 12288, vocab 250624 untied, 524288 positions. Counted from the config:
    // 8.999B; IFM BF16 18,010,413,440 B ÷ 2 = 9.005B (params); Q8_0 → 8.50. The "7B" name counts the
    // core without the 250K-vocab embeddings. Levels from IFM's GGUF repo (bartowski's Q4_K_M is
    // 183,739,296 B larger).
    id: 'k2-horizon-7b',
    name: 'K2 Horizon 7B',
    family: 'MBZUAI K2 Horizon',
    params: 9.01,
    paramLabel: '7B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 524288,
    arch: { layers: 36, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_K2H,
    description: {
      en: 'The small dense member of MBZUAI IFM\'s K2 Horizon family, Apache 2.0, released with its training data. It is called 7B but holds 9.0B parameters: the 250K-token vocabulary\'s input and output tables add about 2B. Q4_K_M is about 6.5 GB at 4K, comfortable on an 8 GB card at that length; a 16 GB card holds it comfortably to 32K (10.8 GB), and 128K needs about 25.6 GB because every layer keeps an ordinary KV cache. llama.cpp runs it as `k2-horizon`. Sizes come from IFM\'s own GGUF files (bartowski\'s Q4_K_M is about 0.2 GB larger); no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中的小号稠密型号，Apache 2.0 许可，训练数据一并公开。名字叫 7B，实际有 9.0B 参数：25 万词表的输入、输出两张表多出约 2B。Q4_K_M 在 4K 上下文约需 6.5 GB，8 GB 显卡在这个长度下宽裕；16 GB 显卡到 32K（10.8 GB）都宽裕，128K 则约需 25.6 GB，因为每层都保留普通 KV 缓存。llama.cpp 以 `k2-horizon` 架构运行它。体积按 IFM 官方 GGUF 文件计算（bartowski 的 Q4_K_M 约大 0.2 GB），各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.97, vramGB: 6.5, hfSearchUrl: hf('K2-Horizon-7B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-7B-GGUF', file: 'K2-Horizon-7B-Q4_K_M.gguf', bytes: 5_592_217_984, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.74, vramGB: 7.4, hfSearchUrl: hf('K2-Horizon-7B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-7B-GGUF', file: 'K2-Horizon-7B-Q5_K_M.gguf', bytes: 6_466_075_008, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q6_K', bpw: 6.57, vramGB: 8.3, hfSearchUrl: hf('K2-Horizon-7B GGUF Q6_K'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-7B-GGUF', file: 'K2-Horizon-7B-Q6_K.gguf', bytes: 7_394_548_096, checkedAt: '2026-10-21' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.5, vramGB: 10.6, hfSearchUrl: hf('K2-Horizon-7B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'IFM/K2-Horizon-7B-GGUF', file: 'K2-Horizon-7B-Q8_0.gguf', bytes: 9_573_964_160, checkedAt: '2026-10-21' } },
    ],
  },
  {
    // Recursive Flint (2026-10-21, Apache 2.0). Owner-pulled config.json (2026-10-23): `flint`, 49 layers,
    // hidden 2048, 32 heads / 4 KV × 128, 256 experts top-6 (512) + 1 shared (1024), 2 dense lead layers,
    // attention sinks, vocab 150144 untied, 262144 positions. layer_types: 14 full + 35 sliding (window
    // 513) — matches transformers' construction. llama.cpp `flint`: build_attn_inp_kv_iswa, standard SWA →
    // pad256(513 + 512) = 1280 cells. Params = ggml-org BF16 79,625,761,760 B ÷ 2 = 39.81B. Levels from
    // bartowski (one publisher; its filenames are what the CLI derives): Q3_K_M 3.92 / Q4_K_M 5.09 /
    // Q8_0 8.51 bpw. ggml-org's Q4_K_M is 1,958,740,224 B smaller (4.70 bpw); unsloth has no plain Q4_K_M.
    id: 'flint-40b-a2-5b',
    name: 'Recursive Flint 40B-A2.5B',
    family: 'Recursive Flint',
    params: 39.81,
    paramLabel: '40B-A2.5B',
    categories: ['code', 'instruct'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 262144,
    arch: { layers: 49, attHeads: 32, kvHeads: 4, headDim: 128, attention: { fullLayers: 14, windowLayers: 35, windowTokens: 1280, note: { en: '14 of 49 layers use full attention; the other 35 use a 513-token sliding window (llama.cpp keeps the window plus one 512-token batch, padded to 1280).', zh: '49 层中 14 层是全注意力，其余 35 层使用 513 token 的滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，补齐到 1280）。' } } },
    addedAt: ADDED_1023,
    description: {
      en: 'Recursive\'s open coding model, released on 21 October under Apache 2.0: 39.8B parameters, about 2.5B active per token. It is built for repository work such as tracing bugs and adding tests. Only 14 of its 49 layers keep a cache that grows with context, so long sessions stay cheap. On a 24 GB card the Q3_K_M build (bartowski\'s 19.5 GB file) needs about 20.6 GB at 4K, which is comfortable, and stays only tight up to 128K. Q4_K_M needs about 26.7 GB at 4K, so it wants a 32 GB card; ggml-org\'s Q4_K_M file is about 2 GB smaller than bartowski\'s. llama.cpp runs it as `flint`; Ollama v0.40.8 supports it on macOS only so far. Sizes come from real files; no per-level quality loss has been published.',
      zh: 'Recursive 10 月 21 日发布的开源编程模型，Apache 2.0 许可：39.8B 参数，每个 token 约激活 2.5B，面向追查 bug、补测试这类代码仓库工作。49 层中只有 14 层的缓存随上下文增长，所以长会话也很省显存。在 24 GB 显卡上，Q3_K_M（bartowski 的 19.5 GB 文件）在 4K 下约需 20.6 GB，宽裕；一直到 128K 也只是偏紧。Q4_K_M 在 4K 下约需 26.7 GB，需要 32 GB 显卡；ggml-org 的 Q4_K_M 文件比 bartowski 的小约 2 GB。llama.cpp 以 `flint` 架构运行它；Ollama v0.40.8 目前只在 macOS 上支持。体积按真实文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.92, vramGB: 0, hfSearchUrl: hf('RecursiveSI flint GGUF Q3_K_M'), confidence: 'estimated', source: { repo: 'bartowski/RecursiveSI_flint-GGUF', file: 'RecursiveSI_flint-Q3_K_M.gguf', bytes: 19_529_151_712, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.09, vramGB: 0, hfSearchUrl: hf('RecursiveSI flint GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/RecursiveSI_flint-GGUF', file: 'RecursiveSI_flint-Q4_K_M.gguf', bytes: 25_346_651_360, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 0, hfSearchUrl: hf('RecursiveSI flint GGUF Q8_0'), confidence: 'estimated', source: { repo: 'bartowski/RecursiveSI_flint-GGUF', file: 'RecursiveSI_flint-Q8_0.gguf', bytes: 42_350_359_776, checkedAt: '2026-10-23' } },
    ],
  },
  {
    // Poolside Laguna S 2.1 (OpenMDW-1.1; release date reported as 07-21 or 08-24). Owner-pulled
    // config.json (2026-10-23): `laguna`, 48 layers, hidden 3072, 8 KV × 128 on every layer (query heads
    // 48 on full layers, 72 on window layers), 256 experts top-10 (1024) + shared (1024), first layer dense,
    // per-head gating, vocab 100352 untied, 1,048,576 positions (YaRN ×128 from 8192 on full layers).
    // layer_types: 12 full + 36 sliding (window 512). llama.cpp `laguna`: build_attn_inp_kv_iswa when the
    // GGUF carries a window → pad256(512 + 512) = 1024 cells. Params = poolside F16 235,202,258,240 B ÷ 2 =
    // 117.60B (unsloth BF16 parts agree to 1 kB). Levels from ggml-org: Q4_K_M 4.60 / Q8_0 8.50 bpw.
    // poolside's own Q4_K_M is 96,031,829,760 B (6.53 bpw) — far larger; not mixed in.
    id: 'laguna-s-2-1-118b-a8b',
    name: 'Laguna S 2.1 118B-A8B',
    family: 'Poolside Laguna',
    params: 117.6,
    paramLabel: '118B-A8B',
    categories: ['code', 'instruct'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 1048576,
    arch: { layers: 48, attHeads: 48, kvHeads: 8, headDim: 128, attention: { fullLayers: 12, windowLayers: 36, windowTokens: 1024, note: { en: '12 of 48 layers use full attention; the other 36 use a 512-token sliding window (llama.cpp keeps the window plus one 512-token batch, 1024 cells).', zh: '48 层中 12 层是全注意力，其余 36 层使用 512 token 的滑动窗口（llama.cpp 保留窗口加一个 512 token 批次，共 1024 个单元）。' } } },
    addedAt: ADDED_1023,
    description: {
      en: 'Poolside\'s agentic coding model under its OpenMDW-1.1 licence: 117.6B parameters with about 8B active per token and a 1M-token window. Only 12 of its 48 layers keep a cache that grows with context; the rest use a 512-token sliding window. At Q4_K_M (ggml-org\'s 67.7 GB file) it needs about 71.0 GB at 4K, which is comfortable on a 128 GB DGX Spark or Mac, and the full 1M window adds only about 53 GB more. Poolside\'s own Q4_K_M file is far larger (96.0 GB), so check which file you download. llama.cpp runs it as `laguna`. Sizes come from real files; no per-level quality loss has been published.',
      zh: 'Poolside 的智能体编程模型，采用 OpenMDW-1.1 许可：117.6B 参数，每个 token 约激活 8B，100 万 token 上下文。48 层中只有 12 层的缓存随上下文增长，其余层只用 512 token 的滑动窗口。Q4_K_M（ggml-org 的 67.7 GB 文件）在 4K 下约需 71.0 GB，128 GB 的 DGX Spark 或 Mac 都很宽裕；用满 100 万窗口也只多约 53 GB。Poolside 自己发布的 Q4_K_M 文件大得多（96.0 GB），下载前请确认是哪个文件。llama.cpp 以 `laguna` 架构运行它。体积按真实文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.6, vramGB: 0, hfSearchUrl: hf('Laguna-S-2.1 GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'ggml-org/Laguna-S-2.1-GGUF', file: 'Laguna-S-2.1-Q4_K_M.gguf', bytes: 67_661_639_264, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.5, vramGB: 0, hfSearchUrl: hf('Laguna-S-2.1 GGUF Q8_0'), confidence: 'estimated', source: { repo: 'ggml-org/Laguna-S-2.1-GGUF', file: 'Laguna-S-2.1-Q8_0.gguf', bytes: 125_022_858_848, checkedAt: '2026-10-23' } },
    ],
  },
  {
    // K2 Horizon 0.9B (dense). Owner-pulled config.json: 28 layers, hidden 1536, 32 heads / 8 KV × 64,
    // vocab 64256 untied, 131072 positions (YaRN ×16 from 8192), no window → plain cache. Params =
    // bartowski bf16 2,159,434,560 B ÷ 2 = 1.08B (IFM's BF16 agrees). Levels from bartowski, whose files are
    // named `K2-Horizon-0.9B-*` (IFM's own repo names them `K2-Horizon-1B-*`; its Q4_K_M is 23,750,368 B smaller).
    id: 'k2-horizon-0-9b',
    name: 'K2 Horizon 0.9B',
    family: 'MBZUAI K2 Horizon',
    params: 1.08,
    paramLabel: '0.9B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: { layers: 28, attHeads: 32, kvHeads: 8, headDim: 64 },
    addedAt: ADDED_1023,
    description: {
      en: 'The smallest member of MBZUAI IFM\'s K2 Horizon family, Apache 2.0 and released with its training data. It is called 0.9B and holds 1.08B parameters. At Q4_K_M it needs about 1.0 GB at 4K and 2.6 GB at 32K, so it runs on almost anything, including a CPU. Every layer keeps an ordinary cache, which is why its full 128K window needs about 8.4 GB. IFM\'s own GGUF repo names these files 1B; the sizes here are bartowski\'s files, and no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中最小的型号，Apache 2.0 许可，训练数据一并公开。名字叫 0.9B，实际是 1.08B 参数。Q4_K_M 在 4K 下约需 1.0 GB，32K 下约 2.6 GB，几乎什么硬件都能跑，包括纯 CPU。它每一层都保留普通缓存，所以用满 128K 窗口约需 8.4 GB。IFM 自己的 GGUF 仓库把这些文件命名为 1B；这里的体积按 bartowski 的文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.11, vramGB: 0, hfSearchUrl: hf('K2-Horizon-0.9B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-0.9B-GGUF', file: 'K2-Horizon-0.9B-Q4_K_M.gguf', bytes: 689_934_432, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 0, hfSearchUrl: hf('K2-Horizon-0.9B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-0.9B-GGUF', file: 'K2-Horizon-0.9B-Q8_0.gguf', bytes: 1_148_623_968, checkedAt: '2026-10-23' } },
    ],
  },
  {
    // K2 Horizon 3.7B (dense). Owner-pulled config.json: 36 layers, hidden 2560, 32 heads / 8 KV × 128,
    // vocab 250624 untied, 524288 positions, no window → plain cache. Params = bartowski bf16
    // 10,128,352,256 B ÷ 2 = 5.06B — the "3.7B" omits the 250K-vocab tables (2 × 250624 × 2560 = 1.28B).
    // Levels from bartowski (IFM's repo names its files `K2-Horizon-4B-*`; its Q4_K_M is 97,903,520 B smaller).
    id: 'k2-horizon-3-7b',
    name: 'K2 Horizon 3.7B',
    family: 'MBZUAI K2 Horizon',
    params: 5.06,
    paramLabel: '3.7B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 524288,
    arch: { layers: 36, attHeads: 32, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_1023,
    description: {
      en: 'A small dense member of MBZUAI IFM\'s K2 Horizon family, Apache 2.0 and released with its training data. It is called 3.7B but holds 5.06B parameters: the 250K-token vocabulary\'s input and output tables add about 1.3B. At Q4_K_M it needs about 4.0 GB at 4K, comfortable on any card; at 32K it is about 8.3 GB, tight on an 8 GB card. Every layer keeps an ordinary cache, so 128K needs about 23.2 GB. IFM\'s own GGUF repo names these files 4B; the sizes here are bartowski\'s files, and no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中的小号稠密型号，Apache 2.0 许可，训练数据一并公开。名字叫 3.7B，实际有 5.06B 参数：25 万词表的输入、输出两张表多出约 1.3B。Q4_K_M 在 4K 下约需 4.0 GB，任何显卡都宽裕；32K 下约 8.3 GB，在 8 GB 显卡上偏紧。它每一层都保留普通缓存，所以 128K 约需 23.2 GB。IFM 自己的 GGUF 仓库把这些文件命名为 4B；这里的体积按 bartowski 的文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.14, vramGB: 0, hfSearchUrl: hf('K2-Horizon-3.7B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-3.7B-GGUF', file: 'K2-Horizon-3.7B-Q4_K_M.gguf', bytes: 3_254_501_664, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.51, vramGB: 0, hfSearchUrl: hf('K2-Horizon-3.7B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-3.7B-GGUF', file: 'K2-Horizon-3.7B-Q8_0.gguf', bytes: 5_386_413_344, checkedAt: '2026-10-23' } },
    ],
  },
  {
    // K2 Horizon 375B-A23B (MoE). Owner-pulled config.json: 61 layers, hidden 6144, 48 heads / 8 KV × 128,
    // 192 experts top-8 (1792) + 1 shared, first 3 layers dense (16384), no MoVA experts, vocab 250624
    // untied, 524288 positions, no window → plain cache on all 61 layers. No BF16 GGUF listed, so params are
    // counted from the config: 379.17B; bartowski's 11-part Q8_0 lands on exactly 8.50 bpw over that, which
    // confirms it. Levels from bartowski (split folders; bytes = sum of parts): Q2_K 3.09 / Q3_K_M 3.85 /
    // Q4_K_M 5.02 / Q8_0 8.50. No IFM GGUF repo exists for this size.
    id: 'k2-horizon-375b-a23b',
    name: 'K2 Horizon 375B-A23B',
    family: 'MBZUAI K2 Horizon',
    params: 379.17,
    paramLabel: '375B-A23B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['mac', 'pro-gpu'],
    contextLength: 524288,
    arch: { layers: 61, attHeads: 48, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_1023,
    description: {
      en: 'The largest K2 Horizon model from MBZUAI IFM, Apache 2.0 with its training data: 379B parameters, about 23B active per token. The parameter count is taken from its configuration. Every one of its 61 layers keeps an ordinary cache. Q2_K (bartowski\'s 146 GB in four parts) needs about 154 GB at 4K, comfortable on a 256 GB Mac Studio; Q4_K_M (238 GB in seven parts) needs about 250 GB and is comfortable only on a 512 GB one. IFM publishes no GGUF for this size; the sizes here are bartowski\'s files, and no per-level quality loss has been published.',
      zh: 'MBZUAI IFM 的 K2 Horizon 系列中最大的型号，Apache 2.0 许可，训练数据一并公开：按配置算出 379B 参数，每个 token 约激活 23B。61 层每一层都保留普通缓存。Q2_K（bartowski 的 146 GB，分 4 卷）在 4K 下约需 154 GB，256 GB 的 Mac Studio 宽裕；Q4_K_M（238 GB，分 7 卷）约需 250 GB，只有 512 GB 的才宽裕。IFM 没有为这个尺寸发布 GGUF；这里的体积按 bartowski 的文件计算，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q2_K', bpw: 3.09, vramGB: 0, hfSearchUrl: hf('K2-Horizon-375B-A23B GGUF Q2_K'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-375B-A23B-GGUF', file: 'K2-Horizon-375B-A23B-Q2_K-00001-of-00004.gguf', bytes: 146_249_929_920, parts: 4, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.85, vramGB: 0, hfSearchUrl: hf('K2-Horizon-375B-A23B GGUF Q3_K_M'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-375B-A23B-GGUF', file: 'K2-Horizon-375B-A23B-Q3_K_M-00001-of-00005.gguf', bytes: 182_537_573_664, parts: 5, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.02, vramGB: 0, hfSearchUrl: hf('K2-Horizon-375B-A23B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-375B-A23B-GGUF', file: 'K2-Horizon-375B-A23B-Q4_K_M-00001-of-00007.gguf', bytes: 237_797_004_832, parts: 7, checkedAt: '2026-10-23' } },
      { format: 'GGUF', level: 'Q8_0', bpw: 8.5, vramGB: 0, hfSearchUrl: hf('K2-Horizon-375B-A23B GGUF Q8_0'), confidence: 'estimated', source: { repo: 'bartowski/K2-Horizon-375B-A23B-GGUF', file: 'K2-Horizon-375B-A23B-Q8_0-00001-of-00011.gguf', bytes: 403_079_845_472, parts: 11, checkedAt: '2026-10-23' } },
    ],
  },
  {
    // NVIDIA Nemotron 3.5 Bolt E4B (released 2026-10-23; Ollama v0.40.10 ships it). Official config.json
    // (nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, 5,144 B, pasted by the owner 2026-10-24): model_type
    // gemma4, Gemma4ForConditionalGeneration with vision + audio towers. text_config is Gemma 4 E4B's
    // shape field for field: 42 layers (35 sliding / 7 full, 5:1), 8 heads / 2 KV × 256, global_head_dim
    // 512, sliding_window 512, num_kv_shared_layers 18, hidden_size_per_layer_input 256, vocab 262,144
    // (PLE vocab the same), tied embeddings — so the arch block is Gemma 4 E4B's and params is its 7.52B
    // (4.70B + 2.82B per-layer table); BF16 GGUF 15,053,100,032 B (ggml-org) = 7.53B incl. metadata.
    // Context: max_position_embeddings 65,536 (Ollama's notes say 128K; the config wins).
    // Files: one publisher per row — lmstudio-community is the only repo with a plain Q4_K_M and it also
    // ships Q8_0, so both rows cite it and the CLI's `<repo>-<level>` name exists. Q4_K_M 6,180,446,208 B
    // → 6.57 bpw: far above the nominal 4.85 (its Q6_K is 6,217,264,736 B, nearly the same), i.e. the
    // per-layer table is not stored at Q4 — sized from the file, not the level name. Q8_0 8,031,243,872 B
    // → 8.54. Neither lmstudio nor ggml-org ships an mmproj; unsloth's mmproj-F16 is 990,373,568 B /
    // Q8_0 559,875,776 B. unsloth ships only UD-* dynamic levels (UD-Q4_K_XL 5,060,482,240 B), not tracked.
    // dflash-* files are speculative-decoding drafts, not the model.
    id: 'nemotron-3.5-bolt-e4b',
    name: 'Nemotron 3.5 Bolt E4B',
    family: 'NVIDIA Nemotron',
    params: 7.52,
    paramLabel: 'E4B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 65536,
    arch: {
      layers: 42,
      attHeads: 8,
      kvHeads: 2,
      headDim: 256,
      // As Gemma 4 E4B: layers 24–41 reuse earlier caches (num_kv_shared_layers 18) and llama.cpp
      // allocates none for them; of the 24 that keep one, 4 are global and 20 sliding. Window 512 →
      // pad256(512 + 512) = 1024 cells.
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
    addedAt: ADDED_BOLT_E4B,
    description: {
      en: 'NVIDIA\'s Nemotron 3.5 Bolt E4B is a small vision model built on Google\'s Gemma 4 E4B. It has the same 42-layer shape, about 4.7B parameters doing the work plus a 2.8B per-layer embedding table, with image input and a 64K window. Only 4 of its 42 layers keep a cache that grows with context, so long context is cheap. The one plain Q4_K_M file (LM Studio\'s, 6.2 GB) is much larger than the level name suggests, because the embedding table is not stored at 4 bits. It needs about 6.6 GB at 4K, comfortable on an 8 GB card, and 7.6 GB at 64K, tight on an 8 GB card. Q8_0 (an 8.0 GB file) needs about 8.5 GB at 4K and wants a 12 GB card. On a discrete card llama.cpp keeps the embedding table in system RAM, so real VRAM use is lower than shown. The vision encoder is a separate 0.6–1.0 GB file published by unsloth, and a small DFlash draft model for speculative decoding ships beside it. NVIDIA\'s benchmark claims are its own, and no per-level quality loss has been published.',
      zh: 'NVIDIA 的 Nemotron 3.5 Bolt E4B 是基于 Google Gemma 4 E4B 的小型视觉模型。结构完全相同，42 层，实际参与计算的约 4.7B 参数外加一张 2.8B 的逐层嵌入表，支持图像输入，上下文 64K。42 层中只有 4 层的缓存随上下文增长，所以长上下文很便宜。唯一的标准 Q4_K_M 文件（LM Studio 发布，6.2 GB）比档位名称暗示的大得多，因为嵌入表没有按 4 bit 存储。4K 上下文约需 6.6 GB，8 GB 显卡宽裕；64K 约需 7.6 GB，8 GB 显卡偏紧。Q8_0（8.0 GB 文件）4K 约需 8.5 GB，要 12 GB 显卡。在独立显卡上，llama.cpp 会把嵌入表留在系统内存，实际显存占用比这里低。视觉编码器是另外 0.6–1.0 GB 的文件，由 unsloth 发布；旁边还有一个用于投机解码的小型 DFlash 草稿模型。基准成绩是 NVIDIA 自己报的，各档位的质量损失未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 6.57, vramGB: 0, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Bolt-E4B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF', file: 'NVIDIA-Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf', bytes: 6_180_446_208, checkedAt: '2026-10-24' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.54, vramGB: 0, hfSearchUrl: hf('NVIDIA-Nemotron-3.5-Bolt-E4B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF', file: 'NVIDIA-Nemotron-3.5-Bolt-E4B-Q8_0.gguf', bytes: 8_031_243_872, checkedAt: '2026-10-24' } },
    ],
  },
  {
    // Nanbeige4.3-33B (Nanbeige, repo created 2026-10-24, Apache 2.0). Owner-pulled config.json (883 B):
    // LlamaForCausalLM / model_type llama — a plain Llama layout, no custom code needed. 52 layers,
    // hidden 7168, 56 heads / 8 KV × 128, SwiGLU 22016, vocab 166,912 untied, 524,288 positions via
    // rope_theta 1.2e8 (no rope_scaling). Plain KV on every layer: 2 × 52 × 8 × 128 × 2 B = 208 KiB a token.
    // Params = safetensors 33,118,977,024 (bartowski BF16 66,243,464,192 B = 2 × that + 5.5 MB header).
    // bartowski's GGUF (llama.cpp b11845, header llama.*, tensors Q4_K/Q5_K/Q6_K/Q8_0 + F32 norms):
    // Q3_K_M 15,919,746,176 → 3.85 bpw, Q4_K_M 20,788,825,216 → 5.02, Q8_0 35,195,128,960 → 8.50.
    // The GGUF header's base_model says "-Base"; README and the Hub field say the Instruct repo, and the
    // chat template is the <think> instruct one — indexed as the instruct model.
    id: 'nanbeige4.3-33b',
    name: 'Nanbeige4.3 33B',
    family: 'Nanbeige',
    params: 33.12,
    paramLabel: '33B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    contextLength: 524288,
    arch: { layers: 52, attHeads: 56, kvHeads: 8, headDim: 128 },
    addedAt: ADDED_1026,
    description: { en: 'Nanbeige4.3 33B is a dense 33B model in the plain Llama layout, released under Apache 2.0. Its 512K window comes from a very large RoPE base, and every one of its 52 layers keeps a full KV cache (8 KV heads), so context is expensive: about 213 KB per token. Q4_K_M needs about 22.6 GB at 4K, tight on a 24 GB card, and 25.3 GB at 16K, which no longer fits one. Q3_K_M needs about 17.5 GB at 4K, comfortable on a 24 GB card, and 20.2 GB at 16K. A 32 GB card holds Q4_K_M comfortably to 16K. The full 512K window needs well over 100 GB of cache alone. Sizes come from bartowski\'s GGUF files; no per-level quality loss has been published.', zh: 'Nanbeige4.3 33B 是采用标准 Llama 结构的 33B 稠密模型，Apache 2.0 许可。它的 512K 上下文靠很大的 RoPE base 实现，而 52 层每层都保留完整 KV 缓存（8 个 KV 头），所以上下文很贵：每个 token 约 213 KB。Q4_K_M 在 4K 上下文约需 22.6 GB，24 GB 显卡偏紧；16K 约需 25.3 GB，单张 24 GB 卡就放不下了。Q3_K_M 在 4K 上下文约需 17.5 GB，24 GB 显卡宽裕；16K 约需 20.2 GB。32 GB 显卡跑 Q4_K_M 到 16K 都宽裕。用满 512K 窗口光缓存就要 100 GB 以上。体积按 bartowski 的 GGUF 文件计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 3.85, vramGB: 0, hfSearchUrl: hf('Nanbeige4.3-33B GGUF Q3_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Nanbeige_Nanbeige4.3-33B-GGUF', file: 'Nanbeige_Nanbeige4.3-33B-Q3_K_M.gguf', bytes: 15_919_746_176, checkedAt: '2026-10-26' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.02, vramGB: 0, hfSearchUrl: hf('Nanbeige4.3-33B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Nanbeige_Nanbeige4.3-33B-GGUF', file: 'Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf', bytes: 20_788_825_216, checkedAt: '2026-10-26' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.50, vramGB: 0, hfSearchUrl: hf('Nanbeige4.3-33B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/Nanbeige_Nanbeige4.3-33B-GGUF', file: 'Nanbeige_Nanbeige4.3-33B-Q8_0.gguf', bytes: 35_195_128_960, checkedAt: '2026-10-26' } },
    ],
  },
  {
    // Spark-X2.6-4B (XHToken, repo created 2026-10-19). Owner-pulled config.json: Spark2_5ForCausalLM,
    // model_type spark2_5 (custom code; llama.cpp `spark2-5`, which builds an iSWA cache with
    // LLAMA_SWA_TYPE_STANDARD — src/models/spark2-5.cpp). 36 layers in a 3:1 pattern = 27 sliding + 9 full,
    // sliding_window 512 → pad256(512 + 512) = 1024 cells; 16 heads / 4 KV × 256 on both layer types;
    // head-wise sigmoid attention gate; GELU FFN 10240; vocab 131,072 tied; 1,048,576 positions.
    // Params = safetensors 4,112,079,360. bartowski (b11716): Q4_K_M 2,621,104,768 → 5.10 bpw,
    // Q8_0 4,375,022,208 → 8.52. XHToken's own "Q4_K_M" is 3,543,441,312 B — BF16 embeddings, an untied
    // Q8_0 output, Q8_0 attn_output and BF16 attn_gate — not the standard recipe, so not used here.
    id: 'spark-x2.6-4b',
    name: 'Spark-X2.6 4B',
    family: 'XHToken Spark',
    params: 4.11,
    paramLabel: '4B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 1048576,
    arch: {
      layers: 36, attHeads: 16, kvHeads: 4, headDim: 256,
      attention: {
        fullLayers: 9,
        windowLayers: 27,
        windowTokens: 1024,
        note: {
          en: '9 of 36 layers are global and grow with context (4 KV heads × 256); the other 27 use a 512-token sliding window, so their cache stays fixed.',
          zh: '36 层中 9 层为全局注意力，缓存随上下文增长（4 个 KV 头 × 256 维）；其余 27 层是 512 token 滑动窗口，缓存大小固定。',
        },
      },
    },
    addedAt: ADDED_1026,
    description: { en: 'Spark-X2.6 4B is a small XHToken model with a nominal 1M-token window. Only 9 of its 36 layers keep a cache that grows with context; the other 27 use a 512-token sliding window. Q4_K_M needs about 3.0 GB at 4K, comfortable on an 8 GB card, and 4.1 GB at 32K, comfortable on an 8 GB card. At 128K it needs about 7.8 GB, tight on an 8 GB card, and the full 1M window needs over 40 GB. llama.cpp runs it as spark2-5. XHToken\'s own Q4_K_M file is 3.5 GB because it keeps the embeddings and attention gates at 16 bits; sizes here use bartowski\'s standard 2.6 GB file. No per-level quality loss has been published.', zh: 'Spark-X2.6 4B 是 XHToken 的小模型，标称上下文 100 万 token。36 层中只有 9 层的缓存随上下文增长，其余 27 层是 512 token 滑动窗口。Q4_K_M 在 4K 上下文约需 3.0 GB，8 GB 显卡宽裕；32K 约需 4.1 GB，仍然宽裕。128K 约需 7.8 GB，8 GB 显卡偏紧；用满 100 万上下文要 40 GB 以上。llama.cpp 以 spark2-5 架构运行它。XHToken 官方的 Q4_K_M 文件有 3.5 GB，因为嵌入层和注意力门保留了 16 位；这里按 bartowski 的标准 2.6 GB 文件计算。各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.10, vramGB: 0, hfSearchUrl: hf('Spark-X2.6-4B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/Spark-X2.6-4B-GGUF', file: 'Spark-X2.6-4B-Q4_K_M.gguf', bytes: 2_621_104_768, checkedAt: '2026-10-26' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.52, vramGB: 0, hfSearchUrl: hf('Spark-X2.6-4B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/Spark-X2.6-4B-GGUF', file: 'Spark-X2.6-4B-Q8_0.gguf', bytes: 4_375_022_208, checkedAt: '2026-10-26' } },
    ],
  },
  {
    // LFM3-1.7B (Liquid AI, 2026-10-27). Owner-pulled config.json (2026-10-29): Lfm3ForCausalLM, 24 layers
    // = 13 short-conv + 6 full_attention + 5 sliding_attention (window 256), 16 heads / 4 KV × 128, hidden
    // 2048, vocab 128000 tied, 262144 positions. llama.cpp `lfm3` builds a hybrid iSWA memory with
    // LLAMA_SWA_TYPE_STANDARD (src/models/lfm3.cpp) → window cells pad256(256 + 512) = 768; the conv state
    // (L_cache 7) is fixed and tiny. Params from Liquid's own BF16 GGUF: 3,466,626,336 B ÷ 2 = 1.733B;
    // Q8_0 1,846,238,496 B → 8.52 bpw confirms the chain. Liquid also ships a QAD-Q4_0 (1,049,615,680 B)
    // which is not a standard level and is not listed.
    id: 'lfm3-1-7b',
    name: 'LFM3 1.7B',
    family: 'Liquid AI LFM3',
    params: 1.73,
    paramLabel: '1.7B',
    categories: ['general', 'instruct'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: {
      layers: 24, attHeads: 16, kvHeads: 4, headDim: 128,
      attention: {
        fullLayers: 6,
        windowLayers: 5,
        windowTokens: 768,
        note: {
          en: 'Only 6 of 24 layers are global attention with a cache that grows with context; 5 use a 256-token sliding window and the other 13 are short convolutions with a fixed state.',
          zh: '24 层中只有 6 层是全局注意力、缓存随上下文增长；5 层是 256 token 滑动窗口，其余 13 层是短卷积，状态大小固定。',
        },
      },
    },
    addedAt: ADDED_1029,
    description: { en: 'The smallest model of Liquid AI\'s LFM3 family, released on 27 October: a 1.7B text model with a 256K-token window, built for phones, laptops and small GPUs. Only 6 of its 24 layers keep a cache that grows with context; 5 use a 256-token sliding window and the other 13 are short convolutions. At Q4_K_M it needs about 1.2 GB at 4K and 2.8 GB at 128K, comfortable on an 8 GB card; the full window needs about 4.5 GB at 256K, comfortable on an 8 GB card. Q8_0 needs about 2.0 GB at 4K. Ollama runs the LFM3 family on Windows, Linux and Apple silicon since v0.40.13, and llama.cpp loads its architecture on every platform. Sizes come from Liquid\'s own GGUF files, and no per-level quality loss has been published.', zh: 'Liquid AI LFM3 系列中最小的模型，10 月 27 日发布：一个 1.7B 文本模型，上下文 256K，面向手机、笔记本和小显存显卡。24 层中只有 6 层的缓存随上下文增长；5 层是 256 token 滑动窗口，其余 13 层是短卷积。Q4_K_M 在 4K 下约需 1.2 GB，128K 下约需 2.8 GB，8 GB 显卡可以从容运行；用满 256K 窗口约需 4.5 GB。Q8_0 在 4K 下约需 2.0 GB。Ollama 自 v0.40.13 起在 Windows、Linux 和 Apple 芯片上都能运行 LFM3 系列，llama.cpp 也在各平台都能加载它的架构。体积按 Liquid 官方发布的 GGUF 文件大小计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.08, vramGB: 0, hfSearchUrl: hf('LFM3-1.7B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-1.7B-GGUF', file: 'LFM3-1.7B-Q4_K_M.gguf', bytes: 1_099_627_808, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.82, vramGB: 0, hfSearchUrl: hf('LFM3-1.7B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-1.7B-GGUF', file: 'LFM3-1.7B-Q5_K_M.gguf', bytes: 1_258_663_200, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.60, vramGB: 0, hfSearchUrl: hf('LFM3-1.7B GGUF Q6_K'),   confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-1.7B-GGUF', file: 'LFM3-1.7B-Q6_K.gguf', bytes: 1_427_638_304, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.54, vramGB: 0, hfSearchUrl: hf('LFM3-1.7B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-1.7B-GGUF', file: 'LFM3-1.7B-Q8_0.gguf', bytes: 1_846_238_496, checkedAt: '2026-10-29' } },
    ],
  },
  {
    // LFM3-VL 2B (Liquid AI). Owner-pulled config.json (2026-11-03): Lfm3VlForConditionalGeneration, text
    // model `lfm3` with the same shape as LFM3 1.7B — 24 layers = 13 conv + 6 full_attention + 5 sliding_attention
    // (window 256 → 768 cells in llama.cpp), 16 heads / 4 KV × 128, hidden 2048, vocab 128000,
    // max_position_embeddings 128000. Vision tower (14 layers, hidden 1024) ships as a separate mmproj.
    // Params from Liquid's BF16 GGUF: 3,466,626,336 B ÷ 2 = 1.73B; Q8_0 1,846,238,496 B → 8.54 bpw confirms it.
    // Text-weight file sizes equal LFM3 1.7B's byte for byte (same tensor shapes, different weights).
    // LFM3-VL-2B-QAD-Q4_0.gguf (1,049,615,648 B) not indexed: its name is not `<repo>-<level>`, so the CLI
    // could not name it.
    id: 'lfm3-vl-2b',
    name: 'LFM3-VL 2B',
    family: 'Liquid AI LFM3',
    params: 1.73,
    paramLabel: '2B',
    categories: ['multimodal', 'general'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 128000,
    arch: {
      layers: 24, attHeads: 16, kvHeads: 4, headDim: 128,
      attention: {
        fullLayers: 6,
        windowLayers: 5,
        windowTokens: 768,
        note: {
          en: 'Only 6 of 24 layers are global attention with a cache that grows with context; 5 use a 256-token sliding window and the other 13 are short convolutions with a fixed state.',
          zh: '24 层中只有 6 层是全局注意力、缓存随上下文增长；5 层是 256 token 滑动窗口，其余 13 层是短卷积，状态大小固定。',
        },
      },
    },
    addedAt: '2026-11-03',
    description: {
      en: 'The vision-language member of Liquid AI\'s LFM3 family, with the same 24-layer text model shape as LFM3 1.7B. A 14-layer vision encoder ships as a separate projector file (379 MB at F16, loaded alongside the model). Only 6 of the 24 text layers keep a cache that grows with context; 5 use a 256-token sliding window and 13 are short convolutions. Its text window is 128,000 tokens, half of LFM3 1.7B\'s. llama.cpp and Ollama both run it.',
      zh: 'Liquid AI LFM3 系列的视觉语言模型：文本部分与 LFM3 1.7B 结构相同（24 层），另带一个 14 层视觉编码器，以单独的投影文件发布（F16 为 379 MB，与模型一起加载）。24 个文本层中只有 6 层的缓存随上下文增长，5 层是 256 token 滑动窗口，13 层是短卷积。文本窗口为 128,000 token，是 LFM3 1.7B 的一半。llama.cpp 和 Ollama 都能运行它。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.08, vramGB: 0, hfSearchUrl: hf('LFM3-VL-2B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-VL-2B-GGUF', file: 'LFM3-VL-2B-Q4_K_M.gguf', bytes: 1_099_627_808, mmprojBytes: 378_996_032, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 5.82, vramGB: 0, hfSearchUrl: hf('LFM3-VL-2B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-VL-2B-GGUF', file: 'LFM3-VL-2B-Q5_K_M.gguf', bytes: 1_258_663_200, mmprojBytes: 378_996_032, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.60, vramGB: 0, hfSearchUrl: hf('LFM3-VL-2B GGUF Q6_K'),   confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-VL-2B-GGUF', file: 'LFM3-VL-2B-Q6_K.gguf', bytes: 1_427_638_304, mmprojBytes: 378_996_032, checkedAt: '2026-11-03' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.54, vramGB: 0, hfSearchUrl: hf('LFM3-VL-2B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'LiquidAI/LFM3-VL-2B-GGUF', file: 'LFM3-VL-2B-Q8_0.gguf', bytes: 1_846_238_496, mmprojBytes: 378_996_032, checkedAt: '2026-11-03' } },
    ],
  },
  {
    // MiMo-V2.6-Distill-Qwen-9B (Xiaomi, 2026-09-21). Owner-pulled config.json (2026-10-29):
    // Qwen3_5ForConditionalGeneration (text `qwen3_5`, llama.cpp `qwen35`) — the Qwen3.5 9B layout: 32
    // layers = 24 linear_attention + 8 full_attention, 16 heads / 4 KV × 256, hidden 4096, vocab 248320,
    // 262144 positions. Params from bartowski's BF16 GGUF: 17,920,693,440 B ÷ 2 = 8.96B; Q8_0
    // 9,545,979,424 B → 8.52 bpw confirms it. The vision encoder is a separate mmproj (f16 918,166,048 B).
    // One publisher only (bartowski); ggml-org's files were not read.
    id: 'mimo-v2-6-distill-qwen-9b',
    name: 'MiMo-V2.6-Distill-Qwen-9B',
    family: 'Xiaomi MiMo',
    params: 8.96,
    paramLabel: '9B',
    categories: ['general', 'instruct', 'multimodal'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 262144,
    arch: { layers: 32, attHeads: 16, kvHeads: 4, headDim: 256, attention: { fullLayers: 8, note: { en: '8 of 32 layers use full attention; the other 24 are linear attention with a fixed recurrent state, so the KV cache grows at a quarter of the usual rate.', zh: '32 层中 8 层是全注意力，其余 24 层是线性注意力、只保留固定大小的循环状态，因此 KV 缓存的增长只有常规架构的四分之一。' } } },
    addedAt: ADDED_1029,
    description: { en: 'Xiaomi\'s MiMo-V2.6 distilled into the Qwen3.5 9B architecture, released in September, with image input through a separate vision encoder. Only 8 of its 32 layers keep a cache that grows with context. At Q4_K_M it needs about 6.3 GB at 4K and 6.7 GB at 16K, comfortable on an 8 GB card; at 32K (7.2 GB) it is tight on an 8 GB card and comfortable from 10 GB up. It needs about 10.5 GB at 128K, comfortable on a 12 GB card. Q8_0 needs about 10.1 GB at 4K, comfortable on a 12 GB card. The vision encoder adds about 0.9 GB. Sizes come from bartowski\'s GGUF files, and no per-level quality loss has been published.', zh: '小米把 MiMo-V2.6 蒸馏到 Qwen3.5 9B 架构上的版本，9 月发布，通过单独的视觉编码器读取图像。32 层中只有 8 层保留会增长的缓存。Q4_K_M 在 4K 下约需 6.3 GB，16K 下约需 6.7 GB，8 GB 显卡可以从容运行；32K（7.2 GB）在 8 GB 卡上偏紧，10 GB 起才宽裕；128K 下约需 10.5 GB，12 GB 显卡可以从容运行。Q8_0 在 4K 下约需 10.1 GB，12 GB 起很宽裕。视觉编码器另需约 0.9 GB。体积按 bartowski 发布的 GGUF 文件大小计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'Q3_K_M', bpw: 4.00, vramGB: 0, hfSearchUrl: hf('MiMo-V2.6-Distill-Qwen-9B GGUF Q3_K_M'), confidence: 'estimated', source: { repo: 'bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF', file: 'MiMo-V2.6-Distill-Qwen-9B-Q3_K_M.gguf', bytes: 4_479_948_320, mmprojBytes: 918_166_048, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.22, vramGB: 0, hfSearchUrl: hf('MiMo-V2.6-Distill-Qwen-9B GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF', file: 'MiMo-V2.6-Distill-Qwen-9B-Q4_K_M.gguf', bytes: 5_841_049_120, mmprojBytes: 918_166_048, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.14, vramGB: 0, hfSearchUrl: hf('MiMo-V2.6-Distill-Qwen-9B GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF', file: 'MiMo-V2.6-Distill-Qwen-9B-Q5_K_M.gguf', bytes: 6_876_124_704, mmprojBytes: 918_166_048, checkedAt: '2026-10-29' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.52, vramGB: 0, hfSearchUrl: hf('MiMo-V2.6-Distill-Qwen-9B GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF', file: 'MiMo-V2.6-Distill-Qwen-9B-Q8_0.gguf', bytes: 9_545_979_424, mmprojBytes: 918_166_048, checkedAt: '2026-10-29' } },
    ],
  },
  {
    // Mistral Large 4 (Mistral AI, 1T-A52B). Official params.json in mistralai/Mistral-Large-4-1T-A52B
    // (read 2026-10-30): dim 6144, 72 layers, 64 heads × 128, MLA kv_lora_rank 512 + qk_rope 64,
    // 128 routed experts top-4 + 1 shared, expert hidden 6144, first_k_dense_replace 1, vocab 204800,
    // 1,048,576 positions, DSA indexer (32 heads × 128, top-k 2048), vision encoder in the separate mmproj.
    // Params: sum of tensor counts across all 13 shard headers of ggml-org/Mistral-Large-4-1T-A52B-GGUF
    // Q4_K_M = 1,049,357,365,536 (text model). MoE: 71 × 128 × 3 × 6144 × 6144 = 1,029.18B routed;
    // the ~20.2B remainder (attention, shared experts, embeddings, indexer) + 4/128 of the experts ≈ 52B
    // active, matching the name.
    // Cache, from llama.cpp src/llama-model.cpp (LLM_ARCH_MISTRAL_LARGE4 → llama_kv_cache_dsa) and
    // src/llama-kv-cache-dsa.cpp: 63 of 72 layers own an MLA cache (576 values per token); the other 9
    // (layers 39, 43, … 71) reuse layer 35's. The 44 "full" indexer layers each add a 1 × 128 indexer
    // key. f16 bytes per token = 63·576·2 + 44·128·2 = 83,840. Encoded as fullLayers 63, fullKvHeads 1,
    // fullHeadDim 333 (83,840 ÷ (2·2·63) = 332.7, rounded up; +0.09%).
    id: 'mistral-large-4',
    name: 'Mistral Large 4',
    family: 'Mistral Large',
    params: 1049.36,
    paramLabel: '1T-A52B',
    categories: ['general', 'instruct', 'code', 'multimodal'],
    hardwareTags: ['pro-gpu', 'mac'],
    contextLength: 1048576,
    arch: {
      layers: 72, attHeads: 64, kvHeads: 1, headDim: 288,
      attention: {
        fullLayers: 63,
        windowLayers: 0,
        fullKvHeads: 1,
        fullHeadDim: 333,
        note: {
          en: 'MLA attention: 63 of 72 layers keep their own compressed cache and the other 9 reuse an earlier layer\'s; 44 layers add a small sparse-attention indexer key. About 82 KB per token in total.',
          zh: 'MLA 注意力：72 层中 63 层保留各自的压缩缓存，另外 9 层复用前面某层的缓存；其中 44 层还多存一个稀疏注意力索引键。合计每个 token 约 82 KB。',
        },
      },
      moe: { expertParams: 1029.18, experts: 128, perToken: 4, moeLayers: 71, denseLead: 1 },
    },
    addedAt: ADDED_1030,
    description: { en: 'Mistral AI\'s open-weight flagship, released in October: a 1T mixture-of-experts model with about 52B active per token. It reads text and images (the vision encoder is a separate 3.4 GB file) and has a 1M-token window. Its compressed attention cache costs about 82 KB per token, so context is cheap next to the weights. Only the 2-bit files fit any machine in this index, a 512 GB Mac Studio: IQ2_XXS (ggml-org\'s 298 GB file) needs about 311 GB at 4K and 334 GB at 256K, both comfortable, and about 401 GB across the full 1M window, which is tight. Q2_K (381 GB) needs about 398 GB at 4K and is tight on that Mac up to 64K. Q4_K_M (635 GB, about 664 GB at 4K) and Q8_0 (1.1 TB) need multi-GPU servers. llama.cpp runs it since late October. Sizes come from ggml-org\'s GGUF files, and no per-level quality loss has been published.', zh: 'Mistral AI 的开放权重旗舰模型，10 月发布：1T 混合专家模型，每个 token 约激活 52B 参数。它支持文本和图像输入（视觉编码器是单独的 3.4 GB 文件），上下文窗口 100 万 token。它的注意力缓存经过压缩，每个 token 约 82 KB，和权重相比上下文很便宜。本站收录的机器中只有 512 GB 的 Mac Studio 装得下，而且只能用 2-bit 文件：IQ2_XXS（ggml-org 的 298 GB 文件）在 4K 下约需 311 GB、256K 约 334 GB，都很从容，用满 100 万上下文约 401 GB，偏紧。Q2_K（381 GB）在 4K 下约需 398 GB，在这台 Mac 上到 64K 为止偏紧。Q4_K_M（635 GB，4K 下约 664 GB）和 Q8_0（1.1 TB）需要多卡服务器。llama.cpp 自 10 月下旬起支持运行。体积按 ggml-org 发布的 GGUF 文件计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'IQ2_XXS', bpw: 2.27, vramGB: 0, hfSearchUrl: hf('Mistral-Large-4-1T-A52B GGUF IQ2_XXS'), confidence: 'estimated', source: { repo: 'ggml-org/Mistral-Large-4-1T-A52B-GGUF', bytes: 297_676_048_832, mmprojBytes: 3_444_696_416, checkedAt: '2026-10-30' } },
      { format: 'GGUF', level: 'Q2_K',    bpw: 2.90, vramGB: 0, hfSearchUrl: hf('Mistral-Large-4-1T-A52B GGUF Q2_K'),    confidence: 'estimated', source: { repo: 'ggml-org/Mistral-Large-4-1T-A52B-GGUF', bytes: 380_706_433_472, mmprojBytes: 3_444_696_416, checkedAt: '2026-10-30' } },
      { format: 'GGUF', level: 'Q4_K_M',  bpw: 4.84, vramGB: 0, hfSearchUrl: hf('Mistral-Large-4-1T-A52B GGUF Q4_K_M'),  confidence: 'estimated', source: { repo: 'ggml-org/Mistral-Large-4-1T-A52B-GGUF', bytes: 634_802_244_608, mmprojBytes: 3_444_696_416, checkedAt: '2026-10-30' } },
      { format: 'GGUF', level: 'Q8_0',    bpw: 8.50, vramGB: 0, hfSearchUrl: hf('Mistral-Large-4-1T-A52B GGUF Q8_0'),    confidence: 'estimated', source: { repo: 'ggml-org/Mistral-Large-4-1T-A52B-GGUF', bytes: 1_115_150_340_608, mmprojBytes: 3_444_696_416, checkedAt: '2026-10-30' } },
    ],
  },
  {
    // Metis-1.6 Praxis (Lernex, 2026-11-01, Apache 2.0). Owner-pulled config.json + GGUF tree (2026-11-04):
    // `metis16`, 12 layers (Mamba-2 except attention at indices 4 and 8), 32 heads / 8 KV × 64, hidden 2048,
    // vocab 65536 (tied), 131072 positions, num_passes 2. Every layer carries a latent MoE (latent 1024,
    // 128 routed experts × 512 + one shared, 4 per token).
    // Cache, from llama.cpp src/models/metis16.cpp + llama-memory-hybrid.cpp: the graph runs the stack twice with
    // il = pass·n_layer + layer, and the hybrid memory's default filter gives every non-recurrent virtual layer its
    // own KV cache — so 2 attention layers × 2 passes = 4 caches. Encoded as fullLayers 4 (of the 12 physical
    // layers). Mamba state is fixed-size (~2 MB a layer), not sized.
    // Params: Lernex's BF16 GGUF 5,897,524,608 B ÷ 2 = 2.95B (the Hub's safetensors total, 3.08B, counts the tied
    // lm_head a second time). bpw from Lernex's own files; no other publisher has GGUFs.
    // activeParams is derived here, not vendor-stated: weights read per token = 2 passes × (0.40B non-expert
    // trunk + 4/128 of 2.42B routed experts) + the 0.13B output projection once = 1.09B. A pass re-reads the
    // same weights, which is what the speed ceiling needs.
    id: 'metis-1-6-praxis',
    name: 'Metis-1.6 Praxis',
    family: 'Metis',
    params: 2.95,
    paramLabel: '3B MoE',
    activeParams: 1.09,
    categories: ['general'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: {
      layers: 12, attHeads: 32, kvHeads: 8, headDim: 64,
      attention: {
        fullLayers: 4,
        windowLayers: 0,
        note: {
          en: 'Looped hybrid: 10 of 12 layers are Mamba-2 with a fixed state and 2 are attention, and the stack runs twice per token. Each pass keeps its own attention cache, so 4 caches grow with context — about 8 KB per token.',
          zh: '循环混合结构：12 层中 10 层是状态固定的 Mamba-2，2 层是注意力，每个 token 把整组层跑两遍。每一遍都有自己的注意力缓存，所以共有 4 份缓存随上下文增长，每个 token 约 8 KB。',
        },
      },
    },
    addedAt: ADDED_1105,
    description: { en: 'The smaller of Lernex\'s two Metis-1.6 models, released on 1 November under Apache 2.0. It is a looped hybrid: 12 layers, mostly Mamba-2 with two attention layers and a small mixture-of-experts block on every layer, and the whole stack runs twice per token, so each token reads about 1.1B parameters\' worth of weights from a 2.95B model. Each pass keeps its own attention cache, about 8 KB per token in total, which makes its 128K window cheap. At Q4_K_M it needs about 2.2 GB at 4K and 3.2 GB at 128K, comfortable on a 4 GB card. Q8_0 needs about 4.5 GB at 128K, comfortable on a 6 GB card. llama.cpp runs it since 3 November. Sizes come from Lernex\'s own GGUF files, and no per-level quality loss has been published.', zh: 'Lernex 的两个 Metis-1.6 模型中较小的一个，11 月 1 日以 Apache 2.0 发布。它是循环混合结构：12 层以 Mamba-2 为主，其中 2 层是注意力，每层都带一个小型混合专家模块，每个 token 把整组层跑两遍，因此 2.95B 的模型每个 token 约读取 1.1B 参数的权重。每一遍都有自己的注意力缓存，合计每个 token 约 8 KB，所以 128K 上下文很便宜。Q4_K_M 在 4K 下约需 2.2 GB，128K 下约需 3.2 GB，4 GB 显卡可以从容运行。Q8_0 在 128K 下约需 4.5 GB，6 GB 显卡可以从容运行。llama.cpp 自 11 月 3 日起支持运行。体积按 Lernex 自己发布的 GGUF 文件计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'IQ4_XS', bpw: 4.98, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Praxis GGUF IQ4_XS'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Praxis-GGUF', file: 'Metis-1.6-Praxis-IQ4_XS.gguf', bytes: 1_836_154_464, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.48, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Praxis GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Praxis-GGUF', file: 'Metis-1.6-Praxis-Q4_K_M.gguf', bytes: 2_019_139_168, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.31, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Praxis GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Praxis-GGUF', file: 'Metis-1.6-Praxis-Q5_K_M.gguf', bytes: 2_325_706_336, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 7.04, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Praxis GGUF Q6_K'),   confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Praxis-GGUF', file: 'Metis-1.6-Praxis-Q6_K.gguf', bytes: 2_597_131_872, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.74, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Praxis GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Praxis-GGUF', file: 'Metis-1.6-Praxis-Q8_0.gguf', bytes: 3_224_393_312, checkedAt: '2026-11-04' } },
    ],
  },
  {
    // Metis-1.6 Logos (Lernex, 2026-11-01, Apache 2.0). Same sources as Praxis: 20 layers, attention at 5 / 10 / 15,
    // 40 heads / 10 KV × 64, hidden 2560, vocab 65536 (tied), 131072 positions, 2 passes; latent MoE on every
    // layer (latent 1024, 192 routed × 768 + one shared, 4 per token). 3 attention layers × 2 passes = 6 caches.
    // Params: BF16 GGUF 20,470,411,392 B ÷ 2 = 10.24B (safetensors total 10.39B counts the tied lm_head twice).
    // activeParams derived: 2 × (1.01B trunk + 4/192 of 9.06B routed) + 0.17B output once = 2.57B.
    id: 'metis-1-6-logos',
    name: 'Metis-1.6 Logos',
    family: 'Metis',
    params: 10.24,
    paramLabel: '10B MoE',
    activeParams: 2.57,
    categories: ['general'],
    hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],
    contextLength: 131072,
    arch: {
      layers: 20, attHeads: 40, kvHeads: 10, headDim: 64,
      attention: {
        fullLayers: 6,
        windowLayers: 0,
        note: {
          en: 'Looped hybrid: 17 of 20 layers are Mamba-2 with a fixed state and 3 are attention, and the stack runs twice per token. Each pass keeps its own attention cache, so 6 caches grow with context — about 15 KB per token.',
          zh: '循环混合结构：20 层中 17 层是状态固定的 Mamba-2，3 层是注意力，每个 token 把整组层跑两遍。每一遍都有自己的注意力缓存，所以共有 6 份缓存随上下文增长，每个 token 约 15 KB。',
        },
      },
    },
    addedAt: ADDED_1105,
    description: { en: 'The larger of Lernex\'s two Metis-1.6 models, released on 1 November under Apache 2.0. It is a looped hybrid: 20 layers, mostly Mamba-2 with three attention layers and a mixture-of-experts block on every layer, and the whole stack runs twice per token, so each token reads about 2.6B parameters\' worth of weights from a 10.24B model. Each pass keeps its own attention cache, about 15 KB per token in total. IQ4_XS needs about 6.4 GB at 4K and 6.9 GB at 32K, comfortable on an 8 GB card. Q4_K_M needs about 7.1 GB at 4K, tight on an 8 GB card and comfortable from 10 GB up; at 128K it needs about 9.1 GB, comfortable on a 12 GB card. Q8_0 needs about 11.7 GB at 4K, comfortable on a 16 GB card. llama.cpp runs it since 3 November. Sizes come from Lernex\'s own GGUF files, and no per-level quality loss has been published.', zh: 'Lernex 的两个 Metis-1.6 模型中较大的一个，11 月 1 日以 Apache 2.0 发布。它是循环混合结构：20 层以 Mamba-2 为主，其中 3 层是注意力，每层都带一个混合专家模块，每个 token 把整组层跑两遍，因此 10.24B 的模型每个 token 约读取 2.6B 参数的权重。每一遍都有自己的注意力缓存，合计每个 token 约 15 KB。IQ4_XS 在 4K 下约需 6.4 GB，32K 下约需 6.9 GB，8 GB 显卡可以从容运行。Q4_K_M 在 4K 下约需 7.1 GB，在 8 GB 卡上偏紧，10 GB 起才宽裕；128K 下约需 9.1 GB，12 GB 显卡可以从容运行。Q8_0 在 4K 下约需 11.7 GB，16 GB 显卡可以从容运行。llama.cpp 自 11 月 3 日起支持运行。体积按 Lernex 自己发布的 GGUF 文件计算，各档位的质量损失未公布。' },
    quants: [
      { format: 'GGUF', level: 'IQ4_XS', bpw: 4.74, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Logos GGUF IQ4_XS'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Logos-GGUF', file: 'Metis-1.6-Logos-IQ4_XS.gguf', bytes: 6_065_003_936, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q4_K_M', bpw: 5.27, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Logos GGUF Q4_K_M'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Logos-GGUF', file: 'Metis-1.6-Logos-Q4_K_M.gguf', bytes: 6_744_975_776, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q5_K_M', bpw: 6.12, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Logos GGUF Q5_K_M'), confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Logos-GGUF', file: 'Metis-1.6-Logos-Q5_K_M.gguf', bytes: 7_834_279_776, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q6_K',   bpw: 6.91, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Logos GGUF Q6_K'),   confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Logos-GGUF', file: 'Metis-1.6-Logos-Q6_K.gguf', bytes: 8_847_425_376, checkedAt: '2026-11-04' } },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.68, vramGB: 0, hfSearchUrl: hf('Metis-1.6-Logos GGUF Q8_0'),   confidence: 'estimated', source: { repo: 'Lernex/Metis-1.6-Logos-GGUF', file: 'Metis-1.6-Logos-Q8_0.gguf', bytes: 11_105_534_816, checkedAt: '2026-11-04' } },
    ],
  },
];
