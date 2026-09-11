import type { QuantModel } from '@/lib/data/types';
import { gpuDatabase } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { bestQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { contextLabel } from '@/lib/utils/context-label';

/**
 * Prose and questions for a model page, computed from that model's own row.
 *
 * The pages were 219 words of table and card with almost no sentences, which
 * leaves nothing for a reader to calibrate against and nothing an AI engine can
 * quote: `GGUF Q4_K_M 4.85 5.8 GB 2.8% 142 tok/s` does not answer "will Qwen3
 * 8B run on a 12GB card". The four tool pages already solved this with
 * `tool-content.ts`; this is the same idea, except 81 pages cannot be written
 * by hand, so every sentence is derived.
 *
 * **Derived, therefore honest, therefore varied.** Nothing here is a fixed
 * template with the name swapped in: the sentences are conditional on the
 * smallest card that fits, how many cards fit, which formats the model ships,
 * whether it is MoE, whether its attention is hybrid, whether a perplexity
 * figure or a measured speed exists at all. A model with one GGUF level and no
 * published loss gets visibly different copy from one with six levels across
 * three formats.
 */

const REF_CONTEXT = 4096;
const LONG_CONTEXT = 32768;

export interface ExplainerSection {
  heading: { en: string; zh: string };
  body: { en: string; zh: string };
}

export interface ExplainerFaq {
  q: { en: string; zh: string };
  a: { en: string; zh: string };
}

function sizeAt(model: QuantModel, bpw: number, ctx: number) {
  return calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw,
    contextLength: ctx,
    batchSize: 1,
  });
}

/** Cards that clear this size comfortably, smallest first. */
function cardsFitting(totalGB: number) {
  return gpuDatabase
    .filter(g => getVerdict(totalGB, g.vram) === 'green')
    .sort((a, b) => a.vram - b.vram);
}

export function modelExplainer(model: QuantModel): { sections: ExplainerSection[]; faqs: ExplainerFaq[] } {
  const ref = model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M') ?? bestQuant(model.quants);
  const refKey = quantLevelKey(ref);
  const at4k = sizeAt(model, ref.bpw, REF_CONTEXT);
  const atLong = sizeAt(model, ref.bpw, LONG_CONTEXT);
  const fits = cardsFitting(at4k.totalGB);
  const smallest = fits[0];
  const formats = Array.from(new Set(model.quants.map(q => q.format)));
  const levels = model.quants.map(quantLevelKey);
  const best = bestQuant(model.quants);
  const fastest = [...model.quants].filter(q => q.speedRTX4090 != null)
    .sort((a, b) => (b.speedRTX4090 ?? 0) - (a.speedRTX4090 ?? 0))[0];
  const hybrid = model.arch.attention;
  const kvGrowth = atLong.kvCacheGB - at4k.kvCacheGB;
  const isMoE = /A\d/i.test(model.paramLabel);

  const sections: ExplainerSection[] = [];

  // 1. What it costs, and on what. Varies by size, by smallest card, by count.
  sections.push({
    heading: { en: `Running ${model.name} locally`, zh: `在本地运行 ${model.name}` },
    body: {
      en:
        `At ${refKey} and ${contextLabel(REF_CONTEXT)} of context, ${model.name} needs about ` +
        `${at4k.totalGB.toFixed(1)} GB — ${at4k.modelWeightsGB.toFixed(1)} GB of weights, ` +
        `${at4k.kvCacheGB.toFixed(2)} GB of KV cache and a ${at4k.activationsGB.toFixed(1)} GB activation buffer. ` +
        (smallest
          ? `The smallest card in this index that clears that comfortably is the ${smallest.name} at ${smallest.vram} GB, ` +
            `and ${fits.length} of the ${gpuDatabase.length} cards here do. `
          : `No card in this index clears that comfortably, so it is a multi-GPU or CPU-offload proposition. `) +
        `These are calculated figures, not measurements: the estimate stops counting a card as comfortable at 88% of its VRAM, ` +
        `which is roughly the room a desktop session needs.`,
      zh:
        `在 ${refKey}、${contextLabel(REF_CONTEXT)} 上下文下，${model.name} 约需 ` +
        `${at4k.totalGB.toFixed(1)} GB —— 权重 ${at4k.modelWeightsGB.toFixed(1)} GB、` +
        `KV 缓存 ${at4k.kvCacheGB.toFixed(2)} GB、激活缓冲 ${at4k.activationsGB.toFixed(1)} GB。` +
        (smallest
          ? `本索引中能宽裕跑它的最小显卡是 ${smallest.vram} GB 的 ${smallest.name}，${gpuDatabase.length} 张卡中有 ${fits.length} 张可以。`
          : `本索引中没有任何单卡能宽裕运行它，因此需要多卡或 CPU 卸载。`) +
        `这些是计算值而非实测值：估算把「宽裕」的界线画在显存的 88%，大致就是桌面环境需要留出的余量。`,
    },
  });

  // 2. Context scaling — the sentence that actually differs for hybrid models.
  sections.push({
    heading: { en: 'What longer context costs', zh: '上下文变长会多花多少' },
    body: {
      en:
        `Going from ${contextLabel(REF_CONTEXT)} to ${contextLabel(LONG_CONTEXT)} adds about ` +
        `${kvGrowth.toFixed(2)} GB, taking the total to ${atLong.totalGB.toFixed(1)} GB. ` +
        (hybrid
          ? `That is gentler than the parameter count suggests: only ${hybrid.fullLayers ?? model.arch.layers} of ` +
            `${model.arch.layers} layers keep a KV cache that grows with context` +
            (hybrid.windowLayers ? `, and ${hybrid.windowLayers} more cap theirs at a sliding window` : '') +
            `, so the cache scales at a fraction of the usual rate. `
          : `Weights do not move with context — only the KV cache does, and it grows linearly, so this is the number to watch when planning for long documents. `) +
        `The model's native window is ${contextLabel(model.contextLength)}; holding all of it at ${refKey} would need about ` +
        `${sizeAt(model, ref.bpw, model.contextLength).totalGB.toFixed(0)} GB.`,
      zh:
        `从 ${contextLabel(REF_CONTEXT)} 提到 ${contextLabel(LONG_CONTEXT)} 约多占 ` +
        `${kvGrowth.toFixed(2)} GB，总量来到 ${atLong.totalGB.toFixed(1)} GB。` +
        (hybrid
          ? `这比参数量给人的印象要温和：${model.arch.layers} 层中只有 ${hybrid.fullLayers ?? model.arch.layers} 层的 KV 缓存会随上下文增长` +
            (hybrid.windowLayers ? `，另有 ${hybrid.windowLayers} 层被滑动窗口封顶` : '') +
            `，因此缓存的增速只有常规架构的一小部分。`
          : `权重不随上下文变化，只有 KV 缓存会，而且是线性增长 —— 规划长文档场景时要盯的就是这个数字。`) +
        `该模型的原生上下文是 ${contextLabel(model.contextLength)}；在 ${refKey} 下把它全部撑满约需 ` +
        `${sizeAt(model, ref.bpw, model.contextLength).totalGB.toFixed(0)} GB。`,
    },
  });

  // 3. Which build to fetch — varies with how many formats/levels exist.
  const formatSentenceEn =
    formats.length === 1
      ? `This index only tracks ${model.name} in ${formats[0]}, across ${levels.length} level${levels.length === 1 ? '' : 's'} (${levels.join(', ')}).`
      : `This index tracks ${formats.length} formats for it — ${formats.join(', ')} — across ${levels.length} levels.`;
  const formatSentenceZh =
    formats.length === 1
      ? `本索引只收录了 ${model.name} 的 ${formats[0]} 格式，共 ${levels.length} 个档位（${levels.join('、')}）。`
      : `本索引收录了它的 ${formats.length} 种格式 —— ${formats.join('、')} —— 共 ${levels.length} 个档位。`;

  sections.push({
    heading: { en: 'Which build to download', zh: '该下载哪个版本' },
    body: {
      en:
        `${formatSentenceEn} ` +
        (best.pplLossPercent !== undefined
          ? `${quantLevelKey(best)} carries the lowest published perplexity loss at ${best.pplLossPercent.toFixed(1)}%. `
          : `No per-level perplexity sweep has been published for this model, so the quality column is empty rather than estimated — within one model, more bits per weight is the only ordering the data supports. `) +
        (fastest
          ? `The fastest level measured here is ${quantLevelKey(fastest)} at ${fastest.speedRTX4090} tok/s on an RTX 4090, batch 1. `
          : `No throughput has been measured for this model on this site's hardware. `) +
        `GGUF runs on llama.cpp and Ollama across NVIDIA, AMD and Apple silicon; AWQ and GPTQ target vLLM on CUDA and ROCm; EXL2 is ExLlamaV2 and CUDA only.`,
      zh:
        `${formatSentenceZh} ` +
        (best.pplLossPercent !== undefined
          ? `其中 ${quantLevelKey(best)} 的公开困惑度损失最低，为 ${best.pplLossPercent.toFixed(1)}%。`
          : `该模型没有公开的逐档困惑度数据，因此质量一列留空而不是填估算值 —— 在同一个模型内部，位数越多越忠实是数据唯一支持的排序。`) +
        (fastest
          ? `本站实测最快的档位是 ${quantLevelKey(fastest)}，在 RTX 4090、batch 1 下为 ${fastest.speedRTX4090} tok/s。`
          : `本站硬件上没有该模型的吞吐实测数据。`) +
        `GGUF 可在 NVIDIA、AMD 与苹果芯片上通过 llama.cpp 和 Ollama 运行；AWQ 与 GPTQ 面向 CUDA 和 ROCm 上的 vLLM；EXL2 仅限 CUDA 上的 ExLlamaV2。`,
    },
  });

  const faqs: ExplainerFaq[] = [
    {
      q: {
        en: `How much VRAM does ${model.name} need?`,
        zh: `${model.name} 需要多少显存？`,
      },
      a: {
        en:
          `About ${at4k.totalGB.toFixed(1)} GB at ${refKey} with ${contextLabel(REF_CONTEXT)} of context and batch 1, ` +
          `rising to roughly ${atLong.totalGB.toFixed(1)} GB at ${contextLabel(LONG_CONTEXT)}. ` +
          `That figure is weights plus KV cache plus a 10% activation buffer, calculated from the model's architecture rather than measured on a card.`,
        zh:
          `在 ${refKey}、${contextLabel(REF_CONTEXT)} 上下文、batch 1 下约 ${at4k.totalGB.toFixed(1)} GB，` +
          `到 ${contextLabel(LONG_CONTEXT)} 时约 ${atLong.totalGB.toFixed(1)} GB。` +
          `这个数字是权重加 KV 缓存再加 10% 激活缓冲，由模型架构计算得出，不是在显卡上实测的。`,
      },
    },
    {
      q: {
        en: smallest
          ? `Will ${model.name} run on a ${smallest.vram}GB GPU?`
          : `Can ${model.name} run on a single GPU?`,
        zh: smallest
          ? `${model.name} 能在 ${smallest.vram}GB 显卡上跑吗？`
          : `${model.name} 能用单张显卡跑吗？`,
      },
      a: {
        en: smallest
          ? `Yes — at ${refKey} and ${contextLabel(REF_CONTEXT)} context it needs about ${at4k.totalGB.toFixed(1)} GB, which leaves ` +
            `${(smallest.vram - at4k.totalGB).toFixed(1)} GB spare on a ${smallest.name}. That is the smallest card in this index that clears it comfortably; ` +
            `${fits.length} of ${gpuDatabase.length} do.`
          : `Not comfortably on any single card in this index at ${refKey}. It needs about ${at4k.totalGB.toFixed(1)} GB, which means splitting across GPUs or offloading layers to system RAM.`,
        zh: smallest
          ? `可以 —— 在 ${refKey}、${contextLabel(REF_CONTEXT)} 上下文下约需 ${at4k.totalGB.toFixed(1)} GB，` +
            `在 ${smallest.name} 上还剩 ${(smallest.vram - at4k.totalGB).toFixed(1)} GB。这是本索引中能宽裕跑它的最小显卡；${gpuDatabase.length} 张中有 ${fits.length} 张可以。`
          : `在 ${refKey} 下，本索引中没有单卡能宽裕运行它。它约需 ${at4k.totalGB.toFixed(1)} GB，意味着要多卡拆分或把部分层卸载到系统内存。`,
      },
    },
    {
      q: {
        en: `Which quantization of ${model.name} should I use?`,
        zh: `${model.name} 该用哪个量化档位？`,
      },
      a: {
        en:
          (best.pplLossPercent !== undefined
            ? `${quantLevelKey(best)} has the lowest published quality loss (${best.pplLossPercent.toFixed(1)}%), and ${refKey} is the level most people run. `
            : `No published quality comparison exists for this model, so pick by footprint: ${refKey} is the level most people run, and a higher bits-per-weight level is more faithful. `) +
          `All ${levels.length} levels in the index are ${levels.join(', ')}.` +
          (isMoE ? ` Note this is a mixture-of-experts model — all parameters must be resident even though only a fraction are active per token, so the memory cost follows the total, not the active count.` : ''),
        zh:
          (best.pplLossPercent !== undefined
            ? `${quantLevelKey(best)} 的公开质量损失最低（${best.pplLossPercent.toFixed(1)}%），而 ${refKey} 是多数人实际使用的档位。`
            : `该模型没有公开的质量对比数据，所以按体积来选：${refKey} 是多数人使用的档位，bits-per-weight 越高越忠实。`) +
          `索引中的 ${levels.length} 个档位是 ${levels.join('、')}。` +
          (isMoE ? ` 注意这是 MoE 模型 —— 尽管每个 token 只激活一部分参数，全部参数仍需驻留显存，因此显存开销按总参数量算，而不是激活参数量。` : ''),
      },
    },
  ];

  return { sections, faqs };
}
