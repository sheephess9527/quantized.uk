import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { fitsOnGpu, countModelsFitting, sameBudgetCards, gpuSlug, GPU_PAGE_CONTEXT, type GpuFit } from '@/lib/utils/gpu-page';
import { measuredRowsFor } from '@/lib/utils/measured-runs';
import type { QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * The decision summary and questions for one GPU landing page.
 *
 * These 61 pages were near-isomorphic and the site's own changelog admitted it:
 * the fit list is a function of VRAM alone, so every 16 GB card returned the
 * same models in the same order. Naming the siblings helped, but it did not
 * touch the reason the pages were the same — **the page said nothing about the
 * card**.
 *
 * What actually separates two cards holding the same models is how fast they
 * can read the weights. An RTX 4060 Ti 16G and an RTX 4080 Super both fit a
 * 24B at Q4_K_M; one reads the weight set at 288 GB/s and the other at 736.
 * That is now in `gpuDatabase` (vendor specs, see README §9) and it is what
 * these sections are built from.
 *
 * **The speed number is a roofline, never a measurement.** Token generation
 * reads the whole weight set once per token, so `bandwidth / weightsGB` is a
 * hard ceiling on tok/s — arithmetic over two published numbers, not a run.
 * Real throughput lands below it, and the copy says so. The alternative was to
 * print the index's measured RTX 4090 figures on a Radeon page, which is the
 * "one row, two bases" mistake the compare tool already made once.
 */

export interface GpuAnswerRow {
  /** Which question this row answers. */
  kind: 'biggest' | 'headroom' | 'speed';
  fit?: GpuFit;
  /** Pre-formatted, language-specific detail line. */
  detail: { en: string; zh: string };
}

export interface GpuFaq {
  q: { en: string; zh: string };
  a: { en: string; zh: string };
}

export interface GpuExplainer {
  specLine: { en: string; zh: string };
  rows: GpuAnswerRow[];
  ceiling: { en: string; zh: string };
  faqs: GpuFaq[];
}

/** Headroom rule for the "room to grow" pick: fits inside 60% of the card. */
const GROW_FRACTION = 0.6;

function weightsGB(model: QuantModel, quant: QuantVariant) {
  return calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw: quant.bpw,
    contextLength: GPU_PAGE_CONTEXT,
    batchSize: 1,
  }).modelWeightsGB;
}

/**
 * The 8B-class reference the roofline is quoted against.
 *
 * Fixed across every page on purpose: a per-card "fastest model" pick would be
 * monotonic in model size and would hand every card the smallest model in the
 * index, which is the degenerate answer `homePicks` already shipped once. One
 * shared reference makes the number comparable between two cards, which is the
 * whole point of printing it.
 */
export function rooflineReference(): { model: QuantModel; quant: QuantVariant } | undefined {
  let best: { model: QuantModel; quant: QuantVariant } | undefined;
  let bestDelta = Infinity;
  for (const model of models) {
    const quant = model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M');
    if (!quant) continue;
    const delta = Math.abs(model.params - 8);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = { model, quant };
    }
  }
  return best;
}

/**
 * Memory-bandwidth ceiling on token generation, in tok/s.
 *
 * Dense models only. A mixture-of-experts model reads one router's worth of
 * experts per token, not the whole weight set, so this arithmetic does not
 * describe it — the index's own Qwen3 30B-A3B run measures 95 tok/s on a card
 * whose dense roofline for that file size is 57, which is correct behaviour for
 * an MoE and would look like a broken ceiling if quoted. `paramLabel` carries
 * the active count (`30B-A3B`), and nothing in the data model carries the
 * active parameter count as a number, so the honest move is to decline.
 */
export function rooflineTokS(gpu: GPU, model: QuantModel, quant: QuantVariant): number | undefined {
  if (!gpu.bandwidth) return undefined;
  if (/A\d/i.test(model.paramLabel)) return undefined;
  return Math.round(gpu.bandwidth / weightsGB(model, quant));
}

/** `1792` → `1,792`. */
function gbs(n: number) {
  return n.toLocaleString('en-US');
}

/**
 * The card whose page this reader should compare against: same memory budget,
 * materially different bandwidth. This is what makes the wall text specific.
 */
function fasterTwin(gpu: GPU): GPU | undefined {
  const bw = gpu.bandwidth;
  if (!bw) return undefined;
  return gpuDatabase
    .filter(g => g.id !== gpu.id && g.vram === gpu.vram && g.bandwidth !== undefined && g.bandwidth > bw * 1.3)
    .sort((a, b) => (b.bandwidth ?? 0) - (a.bandwidth ?? 0))[0];
}

function ceilingText(gpu: GPU, fits: GpuFit[], total: number): { en: string; zh: string } {
  const twin = fasterTwin(gpu);
  const bw = gpu.bandwidth;

  if (gpu.isCPU) {
    return {
      en: `Speed, not capacity. Every model on this page "fits" in ${gpu.vram} GB of system memory, but CPU inference reads the weights over DDR channels rather than a graphics bus — typically well under a tenth of a discrete card's bandwidth, and dependent on your DIMM configuration rather than on the RAM total. That is why no bandwidth figure is listed here. Treat the smaller entries as the usable range and the large ones as "will load".`,
      zh: `瓶颈是速度，不是容量。本页所有模型都「装得下」${gpu.vram} GB 系统内存，但 CPU 推理是通过 DDR 通道读取权重，而非显卡总线 —— 带宽通常不到独显的十分之一，而且取决于你的内存条配置，而不是内存总量。这也是本页不列带宽数字的原因。请把较小的条目视为实际可用范围，较大的条目视为「能加载」。`,
    };
  }

  if (gpu.type === 'apple') {
    return {
      en: `The GPU's share of unified memory, not the ${gpu.vram} GB on the box. macOS reserves part of the pool for the system and caps what a single process may wire down, so the practical budget is meaningfully below nameplate — the limit is adjustable (\`iogpu.wired_limit_mb\`) but it is not absent. Bandwidth is ${bw ? `${gbs(bw)} GB/s` : 'unlisted'}, which is the number that decides tok/s once a model fits.`,
      zh: `瓶颈是 GPU 能用到的那部分统一内存，而不是标称的 ${gpu.vram} GB。macOS 会为系统保留一部分，并限制单个进程可以锁定的内存量，因此实际预算明显低于标称值 —— 这个上限可以调整（\`iogpu.wired_limit_mb\`），但它确实存在。带宽为 ${bw ? `${gbs(bw)} GB/s` : '未列出'}，模型装下之后，决定 tok/s 的就是这个数字。`,
    };
  }

  if (gpu.type === 'amd') {
    return {
      en: `Backend coverage, not capacity. At ${bw ? `${gbs(bw)} GB/s` : 'this bandwidth'} the memory system is competitive with NVIDIA cards of the same size; what varies is whether your runtime has a working ROCm build for your kernel and card. llama.cpp and vLLM both ship official ROCm support — this is a setup question, not a hardware ceiling.`,
      zh: `瓶颈是后端支持，不是容量。在 ${bw ? `${gbs(bw)} GB/s` : '该带宽'} 下，显存子系统与同容量的 NVIDIA 卡相当；真正的变量是你的运行时是否有适配你内核与显卡的可用 ROCm 构建。llama.cpp 与 vLLM 都提供官方 ROCm 支持 —— 这是配置问题，不是硬件天花板。`,
    };
  }

  if (twin && bw) {
    return {
      en: `Bandwidth, not capacity. The models on this page fit, but at ${gbs(bw)} GB/s this card reads the whole weight set once per generated token — a ${gbs(twin.bandwidth ?? 0)} GB/s ${twin.name} holds exactly the same ${gpu.vram} GB and moves those bytes ${((twin.bandwidth ?? 0) / bw).toFixed(1)}× faster. Expect the same quant to generate proportionally slower here.`,
      zh: `瓶颈是带宽，不是容量。本页的模型都装得下，但在 ${gbs(bw)} GB/s 下，每生成一个 token 这张卡都要把整套权重读一遍 —— 同样是 ${gpu.vram} GB 的 ${twin.name} 带宽为 ${gbs(twin.bandwidth ?? 0)} GB/s，搬运这些字节要快 ${((twin.bandwidth ?? 0) / bw).toFixed(1)} 倍。同一量化档位在这张卡上生成速度会成比例地更慢。`,
    };
  }

  if (fits.length >= total * 0.9) {
    return {
      en: `What this index has 4-bit builds for. At ${gpu.vram} GB${bw ? ` and ${gbs(bw)} GB/s` : ''} capacity has stopped being the constraint — ${fits.length} of ${total} models fit comfortably, and the remainder are not blocked by a few more gigabytes. The limiting factor becomes which weights have been released in a format you can load.`,
      zh: `瓶颈是本索引收录了哪些 4-bit 构建。在 ${gpu.vram} GB${bw ? `、${gbs(bw)} GB/s` : ''} 下容量已经不再是限制 —— ${total} 个模型中有 ${fits.length} 个可从容运行，剩下的也不是差几个 GB 的问题。真正的限制变成了哪些权重发布了你能加载的格式。`,
    };
  }

  return {
    en: `Capacity. ${fits.length} of ${total} models clear ${gpu.vram} GB comfortably at 4K context, and the ones that do not are short by whole gigabytes rather than by a rounding error${bw ? ` — at ${gbs(bw)} GB/s the memory system is not what holds this card back` : ''}. Moving up a size class is what changes the list, not a different quant.`,
    zh: `瓶颈是容量。${total} 个模型中有 ${fits.length} 个能在 4K 上下文下从容装进 ${gpu.vram} GB，装不下的那些差的是好几个 GB，而不是一点零头${bw ? ` —— 在 ${gbs(bw)} GB/s 下，限制这张卡的并不是显存子系统` : ''}。要改变这份清单，靠的是换更大容量的卡，而不是换量化档位。`,
  };
}

/**
 * "a" or "an" for a card name.
 *
 * `translations.ts` notes that the page title dodges this ("a RTX 4090" is
 * wrong, and "an RTX / a Radeon" needs a pronunciation rule for 61 names). The
 * FAQ cannot dodge it — "What is the best local LLM for a RTX 5090?" is the
 * question people type, and it needs the article. The rule is short because the
 * names are: an initialism takes the article its **first letter's name** starts
 * with (R is "ar", so "an RTX"; M is "em", so "an MI100"), and a normal word
 * takes the ordinary vowel rule ("a Radeon", "a Mac", "an Instinct").
 */
export function article(name: string): 'a' | 'an' {
  const first = name.split(/\s+/)[0] ?? '';
  if (/^\d/.test(first)) return /^(8|11|18)\b/.test(first) ? 'an' : 'a';
  // An initialism: all caps, or caps followed by digits (RTX, RX, A100, W7900).
  if (/^[A-Z]+\d*[A-Z]*\d*$/.test(first) && first === first.toUpperCase()) {
    return /^[AEFHILMNORSX]/.test(first) ? 'an' : 'a';
  }
  return /^[aeiou]/i.test(first) ? 'an' : 'a';
}

export function gpuExplainer(gpu: GPU): GpuExplainer {
  const fits = fitsOnGpu(gpu);
  const total = models.length;
  const tight = countModelsFitting(gpu, 'tight');
  const biggest = fits[0];
  const grow = fits.find(f => f.totalGB <= gpu.vram * GROW_FRACTION);
  const ref = rooflineReference();
  const roof = ref ? rooflineTokS(gpu, ref.model, ref.quant) : undefined;
  const measured = measuredRowsFor(gpu);
  const siblings = sameBudgetCards(gpu);
  const twin = fasterTwin(gpu);

  const bwPhrase = gpu.bandwidth
    ? { en: `${gbs(gpu.bandwidth)} GB/s${gpu.memType ? ` ${gpu.memType}` : ''}`, zh: `${gbs(gpu.bandwidth)} GB/s${gpu.memType ? ` ${gpu.memType}` : ''}` }
    : { en: 'bandwidth not listed', zh: '带宽未列出' };

  const specLine = {
    en: `${gpu.vram} GB, ${bwPhrase.en}${gpu.bandwidthNote ? ` (${gpu.bandwidthNote.en})` : ''}. ${fits.length} of ${total} models in this index fit comfortably at ${GPU_PAGE_CONTEXT / 1024}K context; ${tight} load at all.`,
    zh: `${gpu.vram} GB，${bwPhrase.zh}${gpu.bandwidthNote ? `（${gpu.bandwidthNote.zh}）` : ''}。索引中 ${total} 个模型里有 ${fits.length} 个能在 ${GPU_PAGE_CONTEXT / 1024}K 上下文下从容运行，${tight} 个至少能加载。`,
  };

  const rows: GpuAnswerRow[] = [];

  if (biggest) {
    rows.push({
      kind: 'biggest',
      fit: biggest,
      detail: {
        en: `${biggest.totalGB.toFixed(1)} GB at ${quantLevelKey(biggest.quant)} — ${biggest.headroomGB.toFixed(1)} GB spare at 4K, so longer context comes out of a thin margin.`,
        zh: `${quantLevelKey(biggest.quant)} 下约 ${biggest.totalGB.toFixed(1)} GB —— 4K 时仅剩 ${biggest.headroomGB.toFixed(1)} GB，上下文再拉长就要动用这点余量。`,
      },
    });
  }

  if (grow && grow.model.id !== biggest?.model.id) {
    rows.push({
      kind: 'headroom',
      fit: grow,
      detail: {
        en: `${grow.totalGB.toFixed(1)} GB at ${quantLevelKey(grow.quant)} — under ${Math.round(GROW_FRACTION * 100)}% of the card, which leaves ${grow.headroomGB.toFixed(1)} GB for a long context window or a second process.`,
        zh: `${quantLevelKey(grow.quant)} 下约 ${grow.totalGB.toFixed(1)} GB —— 占用不到显存的 ${Math.round(GROW_FRACTION * 100)}%，留下 ${grow.headroomGB.toFixed(1)} GB 给长上下文或第二个进程。`,
      },
    });
  }

  if (ref && roof) {
    const measuredNote = measured.length
      ? { en: ` This index has ${measured.length} measured run${measured.length === 1 ? '' : 's'} on this card; see the table below for what they actually returned.`, zh: ` 本索引在这张卡上有 ${measured.length} 条实测记录，实际结果见下方表格。` }
      : { en: ` No run on this card has been measured here, so there is nothing to compare the ceiling against.`, zh: ` 本站没有在这张卡上的实测记录，因此无法与这个上限对照。` };
    rows.push({
      kind: 'speed',
      detail: {
        en: `${ref.model.name} at ${quantLevelKey(ref.quant)} reads ${weightsGB(ref.model, ref.quant).toFixed(1)} GB of weights per token, so ${bwPhrase.en.split(' ')[0]} GB/s puts a hard ceiling near ${roof} tok/s. That is arithmetic on two published numbers, not a benchmark — real throughput lands below it.${measuredNote.en}`,
        zh: `${ref.model.name} 在 ${quantLevelKey(ref.quant)} 下每个 token 要读取 ${weightsGB(ref.model, ref.quant).toFixed(1)} GB 权重，因此 ${bwPhrase.zh.split(' ')[0]} GB/s 给出的硬上限约为 ${roof} tok/s。这是两个公开数字的算术结果，不是跑分 —— 实际吞吐会低于它。${measuredNote.zh}`,
      },
    });
  }

  const ceiling = ceilingText(gpu, fits, total);

  // ---- FAQ ----------------------------------------------------------------
  const faqs: GpuFaq[] = [];

  if (biggest) {
    const pick = grow ?? biggest;
    faqs.push({
      q: {
        en: `What is the best local LLM for ${article(gpu.name)} ${gpu.name}?`,
        zh: `${gpu.name} 上最适合本地运行的大模型是哪个？`,
      },
      a: {
        en: `For everyday use, ${pick.model.name} at ${quantLevelKey(pick.quant)} — about ${pick.totalGB.toFixed(1)} GB of the card's ${gpu.vram} GB at 4K context, leaving ${pick.headroomGB.toFixed(1)} GB for a longer window. If you want the largest thing that will load, that is ${biggest.model.name} at ${quantLevelKey(biggest.quant)} (${biggest.totalGB.toFixed(1)} GB, ${biggest.headroomGB.toFixed(1)} GB spare). "Best" here means best fit for the memory budget — this index does not run task benchmarks, so it cannot tell you which model is smarter.`,
        zh: `日常使用推荐 ${pick.model.name}（${quantLevelKey(pick.quant)}）—— 在 4K 上下文下约占这张卡 ${gpu.vram} GB 中的 ${pick.totalGB.toFixed(1)} GB，还剩 ${pick.headroomGB.toFixed(1)} GB 给更长的窗口。如果你要的是能加载的最大模型，那是 ${biggest.model.name}（${quantLevelKey(biggest.quant)}，约 ${biggest.totalGB.toFixed(1)} GB，余量 ${biggest.headroomGB.toFixed(1)} GB）。这里的「最适合」指的是最契合显存预算 —— 本索引不跑任务基准，无法告诉你哪个模型更聪明。`,
      },
    });

    const nextUp = models
      .filter(m => m.params > biggest.model.params)
      .sort((a, b) => a.params - b.params)[0];
    if (nextUp) {
      const best = nextUp.quants
        .map(q => ({ q, gb: calcVRAM({ paramsB: nextUp.params, layers: nextUp.arch.layers, kvHeads: nextUp.arch.kvHeads, headDim: nextUp.arch.headDim, attention: nextUp.arch.attention, bpw: q.bpw, contextLength: GPU_PAGE_CONTEXT, batchSize: 1 }).totalGB }))
        .sort((a, b) => a.gb - b.gb)[0];
      const verdict = getVerdict(best.gb, gpu.vram);
      faqs.push({
        q: {
          en: `Can ${article(gpu.name)} ${gpu.name} run ${nextUp.name}?`,
          zh: `${gpu.name} 能跑 ${nextUp.name} 吗？`,
        },
        a: {
          en: verdict === 'green'
            ? `Yes — at ${quantLevelKey(best.q)} it needs about ${best.gb.toFixed(1)} GB against ${gpu.vram} GB.`
            : verdict === 'yellow'
              ? `Only just. Its smallest build here, ${quantLevelKey(best.q)}, needs about ${best.gb.toFixed(1)} GB against ${gpu.vram} GB — that loads on a card with nothing else on it, with no margin for a longer context window. It is not on the list above, which requires a model to stay inside 88% of the card.`
              : `No. Its smallest build here, ${quantLevelKey(best.q)}, needs about ${best.gb.toFixed(1)} GB and the card has ${gpu.vram} GB — short by ${(best.gb - gpu.vram).toFixed(1)} GB before any context beyond 4K. The largest model this card does clear is ${biggest.model.name}.`,
          zh: verdict === 'green'
            ? `可以 —— 在 ${quantLevelKey(best.q)} 下约需 ${best.gb.toFixed(1)} GB，而这张卡有 ${gpu.vram} GB。`
            : verdict === 'yellow'
              ? `勉强。它在本索引中最小的构建 ${quantLevelKey(best.q)} 约需 ${best.gb.toFixed(1)} GB，而显存为 ${gpu.vram} GB —— 在显卡完全空闲时能加载，但没有任何余量留给更长的上下文。上面的清单里没有它，因为那份清单要求模型占用不超过显存的 88%。`
              : `不能。它在本索引中最小的构建 ${quantLevelKey(best.q)} 约需 ${best.gb.toFixed(1)} GB，而这张卡只有 ${gpu.vram} GB —— 在 4K 之外的上下文还没算上之前就已经差了 ${(best.gb - gpu.vram).toFixed(1)} GB。这张卡能从容运行的最大模型是 ${biggest.model.name}。`,
        },
      });
    }
  }

  if (ref && roof) {
    faqs.push({
      q: {
        en: `How many tokens per second does ${article(gpu.name)} ${gpu.name} do on an 8B model at Q4?`,
        zh: `${gpu.name} 跑 8B 模型的 Q4 量化大概有多少 tok/s？`,
      },
      a: {
        en: `${measured.length
          ? `This index has ${measured.length} measured run${measured.length === 1 ? '' : 's'} on this card — those figures are in the table on this page.`
          : `This index has no measured run on this card, so it does not publish a figure.`} What can be stated from specifications: generating a token requires reading every weight once, ${ref.model.name} at ${quantLevelKey(ref.quant)} is ${weightsGB(ref.model, ref.quant).toFixed(1)} GB of weights, and this card moves ${bwPhrase.en.split(' ')[0]} GB/s — a ceiling near ${roof} tok/s. Batch size, context length, the runtime and how much of the model sits in cache all take you below it.`,
        zh: `${measured.length
          ? `本索引在这张卡上有 ${measured.length} 条实测记录，数据见本页表格。`
          : `本索引没有这张卡的实测记录，因此不公布具体数字。`}可以从规格推出的是：生成一个 token 需要把每个权重都读一遍，${ref.model.name} 在 ${quantLevelKey(ref.quant)} 下权重为 ${weightsGB(ref.model, ref.quant).toFixed(1)} GB，而这张卡的带宽是 ${bwPhrase.zh.split(' ')[0]} GB/s —— 上限约 ${roof} tok/s。批大小、上下文长度、运行时以及缓存命中情况都会把实际值压到这个数以下。`,
      },
    });
  }

  // Same budget first, then the fastest same-budget card, then the nearest
  // card of the same type by capacity. Without the last fallback the top of
  // each range (an M5 Ultra 512G, every CPU entry) has no sibling at all and
  // loses the comparison question entirely.
  const nearest = gpuDatabase
    .filter(g => g.id !== gpu.id && g.type === gpu.type)
    .sort((a, b) => Math.abs(a.vram - gpu.vram) - Math.abs(b.vram - gpu.vram))[0];
  const rival = twin ?? siblings[0] ?? nearest;
  if (rival) {
    const rivalFits = fitsOnGpu(rival).length;
    faqs.push({
      q: {
        en: `${gpu.name} or ${rival.name} for local LLMs?`,
        zh: `本地跑大模型，${gpu.name} 还是 ${rival.name}？`,
      },
      a: {
        en: `They hold the same models: ${gpu.vram} GB against ${rival.vram} GB fits ${fits.length} and ${rivalFits} of ${total} respectively at 4K. ${gpu.bandwidth && rival.bandwidth
          ? `The difference is throughput — ${gbs(gpu.bandwidth)} GB/s against ${gbs(rival.bandwidth)} GB/s, a ${(Math.max(gpu.bandwidth, rival.bandwidth) / Math.min(gpu.bandwidth, rival.bandwidth)).toFixed(1)}× gap in how fast the weights can be read, which is what token generation is bound by. The ${(rival.bandwidth > gpu.bandwidth ? rival : gpu).name} generates faster on any model both can hold.`
          : `Bandwidth is not recorded for both cards here, so this page will not rank them on speed.`}`,
        zh: `两张卡装得下的模型相同：${gpu.vram} GB 与 ${rival.vram} GB 在 4K 下分别可从容运行 ${total} 个中的 ${fits.length} 个与 ${rivalFits} 个。${gpu.bandwidth && rival.bandwidth
          ? `差别在吞吐 —— ${gbs(gpu.bandwidth)} GB/s 对 ${gbs(rival.bandwidth)} GB/s，读取权重的速度相差 ${(Math.max(gpu.bandwidth, rival.bandwidth) / Math.min(gpu.bandwidth, rival.bandwidth)).toFixed(1)} 倍，而 token 生成正是受此限制。两张卡都装得下的模型，${(rival.bandwidth > gpu.bandwidth ? rival : gpu).name} 生成更快。`
          : `本站没有同时记录两张卡的带宽，因此本页不就速度给出排序。`}`,
      },
    });
  }

  return { specLine, rows, ceiling, faqs };
}

/** Slug helper re-exported so the FAQ's rival card can be linked. */
export { gpuSlug };
