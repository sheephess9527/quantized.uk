import type { QuantModel } from './types';

function hf(q: string) {
  return `https://huggingface.co/models?search=${encodeURIComponent(q)}`;
}

const ADDED = '2026-09-30';

/**
 * Two 30B–50B-total MoE models with ~3B active — the size that runs on one
 * 24–32 GB card or a Mac, picked for constrained hardware over the 700B+
 * flagships released in the same window (Hy4-Preview, GLM-5.x).
 *
 * Sources: architecture from `huggingface/transformers`
 * `configuration_glm4_moe_lite.py` / `configuration_kimi_linear.py` (reference
 * checkpoint defaults); llama.cpp support from its `conversion/` package and
 * `src/llama-kv-cache.cpp`; totals, context and licence from the vendors' own
 * GitHub READMEs. huggingface.co, ollama.com and docs.unsloth.ai were all
 * blocked, so **no published GGUF file size was available**: every quant row
 * uses the calculator's generic bpw and is marked `estimated`, not `community`.
 *
 * MLA cache: llama.cpp allocates only a K tensor for MLA layers (`has_v =
 * !is_mla`), of width `kv_lora_rank + qk_rope_head_dim` = 512 + 64 = 576 values
 * per token per layer. `calcVRAM` computes `2 × kvHeads × headDim`, so the
 * equivalent is `kvHeads: 1, headDim: 288` — a sizing encoding, not the head
 * layout (the real models have 20 and 32 attention heads).
 */
export const extraModels10: QuantModel[] = [
  {
    id: 'glm-4.7-flash',
    name: 'GLM-4.7-Flash',
    family: 'Zhipu GLM-4.7',
    // 29.94B computed layer by layer from Glm4MoeLiteConfig (vocab 154880,
    // hidden 2048, 47 layers, 1 dense + 46 MoE of 64 experts × 1536, 1 shared,
    // MLA q_lora 768 / kv_lora 512), matching the vendor's "30B-A3B".
    params: 29.94,
    paramLabel: '30B-A3B',
    categories: ['general', 'instruct', 'code'],
    hardwareTags: ['consumer-gpu', 'pro-gpu', 'mac'],
    // zai-org/GLM-4.5 README lists GLM-4.7-Flash under "can utilize their full
    // 128K context length". The config default (202752) is higher but is not a
    // published figure for this checkpoint.
    contextLength: 131072,
    arch: { layers: 47, attHeads: 20, kvHeads: 1, headDim: 288 },
    addedAt: ADDED,
    description: {
      en: 'Zhipu\'s lightweight member of GLM-4.7: 30B total, about 3B active per token, MIT licence. Its attention is MLA, which caches one compressed 576-value vector per token per layer instead of full keys and values — so at 32K context the cache is under 2 GB where a conventional 47-layer model would need several times that. llama.cpp runs it as a DeepSeek-2-style model. Sizes below use the calculator\'s generic Q4_K_M/Q8_0 rates: no GGUF file size could be checked, and quality loss per level has not been published.',
      zh: '智谱 GLM-4.7 系列的轻量款：总参数 30B，每 token 激活约 3B，MIT 许可。注意力采用 MLA，每层每个 token 只缓存一个 576 维的压缩向量，而不是完整的 K 和 V——所以 32K 上下文下缓存不到 2 GB，常规 47 层模型需要的是它的好几倍。llama.cpp 按 DeepSeek-2 类模型运行它。下方体积使用计算器通用的 Q4_K_M / Q8_0 比特率：未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 18.2, hfSearchUrl: hf('GLM-4.7-Flash GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 31.8, hfSearchUrl: hf('GLM-4.7-Flash GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
  {
    id: 'kimi-linear-48b-a3b',
    name: 'Kimi Linear 48B-A3B Instruct',
    family: 'Moonshot Kimi Linear',
    // Vendor README: 48B total / 3B activated. A layer-by-layer estimate from
    // KimiLinearConfig lands at ~49.1B (the KDA projections are approximated),
    // within 2.3% — the vendor figure is used.
    params: 48.0,
    paramLabel: '48B-A3B',
    categories: ['general', 'instruct'],
    hardwareTags: ['pro-gpu', 'mac'],
    // MoonshotAI/Kimi-Linear README: context length 1M.
    contextLength: 1048576,
    /**
     * 27 layers; the README gives a 3:1 KDA-to-MLA ratio and "reduces the need
     * for large KV caches by up to 75%". 7 full layers of 27 is a 74% cut and
     * 20:7 ≈ 3:1; transformers' fallback rule (every 4th, 0-based) would give 6
     * — a 78% cut, which the published figure does not support. KDA layers keep
     * a fixed recurrent state and, in llama.cpp, no KV cache at all.
     */
    arch: {
      layers: 27,
      attHeads: 32,
      kvHeads: 1,
      headDim: 288,
      attention: {
        fullLayers: 7,
        note: {
          en: '7 of 27 layers keep an MLA cache (the vendor\'s 3:1 ratio and "up to 75%" smaller cache); the other 20 are Kimi Delta Attention, a linear layer with a fixed-size state.',
          zh: '27 层中有 7 层保留 MLA 缓存（与官方给出的 3:1 比例和"缓存最多减少 75%"一致）；其余 20 层是 Kimi Delta Attention 线性层，只有固定大小的状态。',
        },
      },
    },
    addedAt: ADDED,
    description: {
      en: 'Moonshot\'s hybrid linear-attention model: 48B total, 3B active, a 1M-token window. Only 7 of its 27 layers keep a growing cache, and those store MLA\'s compressed vectors, so even the full million tokens needs about 8 GB of cache — the weights, not the context, decide what it runs on. At Q4 a Mac with 48 GB or more runs it comfortably; a 32 GB card holds it only with no room to spare. Sizes below use the calculator\'s generic rates: no GGUF file size could be checked, and quality loss per level has not been published.',
      zh: '月之暗面的混合线性注意力模型：总参数 48B，激活 3B，上下文窗口 100 万 token。27 层中只有 7 层保留会增长的缓存，而且存的是 MLA 压缩向量，所以即使用满 100 万 token，缓存也只要约 8 GB——决定它能在什么硬件上跑的是权重，不是上下文。Q4 下，48 GB 及以上的 Mac 可以从容运行；32 GB 显卡只能勉强装下、几乎不剩余量。下方体积使用计算器通用的比特率：未能核对到 GGUF 文件大小，各档位的质量损失也未公布。',
    },
    quants: [
      { format: 'GGUF', level: 'Q4_K_M', bpw: 4.85, vramGB: 29.1, hfSearchUrl: hf('Kimi-Linear-48B-A3B-Instruct GGUF Q4_K_M'), confidence: 'estimated' },
      { format: 'GGUF', level: 'Q8_0',   bpw: 8.5,  vramGB: 51.0, hfSearchUrl: hf('Kimi-Linear-48B-A3B-Instruct GGUF Q8_0'),   confidence: 'estimated' },
    ],
  },
];
