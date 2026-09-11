import { models } from '@/lib/data/models';
import { quantFormats, type QuantFormat } from '@/lib/data/formats';
import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';
import { modelsWithFormat, formatPairs } from '@/lib/utils/format-compare';
import { calcVRAM } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { gpuDatabase } from '@/lib/data/gpus';
import { getVerdict } from '@/lib/utils/vram';
import { article } from '@/lib/utils/gpu-explainer';
import type { QuantModel } from '@/lib/data/types';

/**
 * One page per format the index actually ships.
 *
 * `/formats/` compares formats **against each other**; there was nowhere that
 * simply explained one — so "what is AWQ" had no landing page on a site named
 * after quantization, and the 53 models shipping it had no shared parent.
 *
 * Deliberately only the four in `SHIPPED_FORMATS`. The audit asked for NVFP4
 * and FP8/W4A16 pages too: no model in this index carries either, and a page
 * about a format the Hub cannot return a single result for is the HQQ mistake
 * with a new name (see CLAUDE.md). They become pages the day a model ships one.
 *
 * MXFP4 is **not** a fifth page for a different reason — it is not a container
 * format. GPT-OSS's native 4-bit weights are distributed *as GGUF*, which is
 * how they are stored here (`format: 'GGUF', level: 'MXFP4'`), so it belongs on
 * the GGUF page as a level, and that is where it is surfaced.
 */

const REF_CONTEXT = 4096;

export const FORMAT_PAGES: QuantFormat[] = quantFormats.filter(f => SHIPPED_FORMATS.includes(f.name));

export function formatById(id: string): QuantFormat | undefined {
  return FORMAT_PAGES.find(f => f.id === id);
}

export interface FormatLevel {
  level: string;
  key: string;
  count: number;
  bpwLow: number;
  bpwHigh: number;
  medianLoss: number | null;
  lossSample: number;
}

export interface FormatSection {
  heading: { en: string; zh: string };
  body: { en: string; zh: string };
}

export interface FormatFaq {
  q: { en: string; zh: string };
  a: { en: string; zh: string };
}

/** Levels this index carries for a format, most used first. */
export function levelsFor(format: QuantFormat): FormatLevel[] {
  const rows = models.flatMap(m => m.quants).filter(q => q.format === format.name);
  const byLevel = new Map<string, typeof rows>();
  for (const q of rows) byLevel.set(q.level, [...(byLevel.get(q.level) ?? []), q]);

  return Array.from(byLevel.entries())
    .map(([level, qs]) => {
      const losses = qs
        .filter(q => q.pplLossPercent !== undefined)
        .map(q => q.pplLossPercent as number)
        .sort((a, b) => a - b);
      const bpws = qs.map(q => q.bpw).sort((a, b) => a - b);
      return {
        level,
        key: quantLevelKey(qs[0]),
        count: qs.length,
        bpwLow: bpws[0],
        bpwHigh: bpws[bpws.length - 1],
        medianLoss: losses.length ? losses[Math.floor(losses.length / 2)] : null,
        lossSample: losses.length,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** The model this page quotes its worked example against: closest to 8B. */
function referenceModel(format: QuantFormat): QuantModel | undefined {
  return modelsWithFormat(format.name).sort(
    (a, b) => Math.abs(a.params - 8) - Math.abs(b.params - 8),
  )[0];
}

function sizeOf(model: QuantModel, bpw: number) {
  return calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw,
    contextLength: REF_CONTEXT,
    batchSize: 1,
  });
}

export function formatPage(format: QuantFormat): {
  owning: QuantModel[];
  levels: FormatLevel[];
  sections: FormatSection[];
  faqs: FormatFaq[];
} {
  const owning = modelsWithFormat(format.name).sort((a, b) => b.params - a.params);
  const levels = levelsFor(format);
  const total = models.length;
  const ref = referenceModel(format);
  const main = levels[0];

  // The worked example: what the most-used level of this format costs on the
  // index's own 8B-class model, and the smallest card that clears it.
  //
  // `main.bpwLow` is the minimum across every model shipping that level and is
  // **not** this model's bpw — quoting it beside this model's name would put two
  // bases in one sentence, which is the fault the compare tool already shipped
  // once. The reference model's own row is what is priced here.
  const refQuant = ref?.quants.find(q => q.format === format.name && q.level === main?.level);
  const example = ref && refQuant ? sizeOf(ref, refQuant.bpw) : undefined;
  const smallestCard = example
    ? gpuDatabase
        .filter(g => getVerdict(example.totalGB, g.vram) === 'green')
        .sort((a, b) => a.vram - b.vram)[0]
    : undefined;

  const pairs = formatPairs.filter(p => p.a.id === format.id || p.b.id === format.id);
  const isLegacy = owning.length < total * 0.1;
  const hasNative = format.name === 'GGUF' && levels.some(l => l.level === 'MXFP4');

  const sections: FormatSection[] = [];

  sections.push({
    heading: { en: `What ${format.name} is`, zh: `${format.name} 是什么` },
    body: {
      en:
        `${format.description.en} ${owning.length} of the ${total} models in this index ship in it` +
        (levels.length
          ? `, across ${levels.length} quant level${levels.length === 1 ? '' : 's'} — ${levels.map(l => l.level).join(', ')}.`
          : '.') +
        (isLegacy
          ? ` At ${owning.length} of ${total} it is the thinnest coverage of any format here; treat it as a format you may meet rather than one to target.`
          : ''),
      zh:
        `${format.description.zh} 本索引的 ${total} 个模型中有 ${owning.length} 个提供该格式` +
        (levels.length
          ? `，共 ${levels.length} 个量化档位 —— ${levels.map(l => l.level).join('、')}。`
          : '。') +
        (isLegacy
          ? ` ${total} 个里只有 ${owning.length} 个，是本站收录最少的格式；把它看作「你可能会遇到」的格式，而不是优先选择的格式。`
          : ''),
    },
  });

  sections.push({
    heading: { en: 'What reads it', zh: '什么运行时能读它' },
    body: {
      en: `${format.framework}. Hardware: ${format.hardwareReq}. Best suited to: ${format.bestFor.en}. Where it is strong: ${format.strengths.en.join('; ')}. Where it is not: ${format.weaknesses.en.join('; ')}.`,
      zh: `${format.framework}。硬件要求：${format.hardwareReq}。最擅长的场景：${format.bestFor.zh}。强项：${format.strengths.zh.join('；')}。短板：${format.weaknesses.zh.join('；')}。`,
    },
  });

  if (ref && main && example && refQuant) {
    sections.push({
      heading: { en: 'What it costs', zh: '它要多少显存' },
      body: {
        en:
          `${ref.name} at ${main.key} is ${refQuant.bpw} bits per weight, which works out to ${example.modelWeightsGB.toFixed(1)} GB of weights plus ${example.kvCacheGB.toFixed(1)} GB of KV cache at ${REF_CONTEXT / 1024}K context and a ${example.activationsGB.toFixed(1)} GB activation buffer — ${example.totalGB.toFixed(1)} GB in total` +
          (smallestCard ? `. The smallest card in this index that clears that comfortably is ${article(smallestCard.name)} ${smallestCard.name}.` : '.') +
          (main.medianLoss !== null
            ? ` Across the ${main.lossSample} models here with a published perplexity figure at this level, the median loss against FP16 is ${main.medianLoss.toFixed(1)}%.`
            : ` No model here has a published perplexity figure at this level, so this page does not quote one.`),
        zh:
          `${ref.name} 在 ${main.key} 下为每权重 ${refQuant.bpw} 比特，折合权重 ${example.modelWeightsGB.toFixed(1)} GB，加上 ${REF_CONTEXT / 1024}K 上下文的 KV 缓存 ${example.kvCacheGB.toFixed(1)} GB 与激活缓冲 ${example.activationsGB.toFixed(1)} GB —— 合计 ${example.totalGB.toFixed(1)} GB` +
          (smallestCard ? `；本索引中能从容装下它的最小显卡是 ${smallestCard.name}（${smallestCard.vram} GB）。` : '。') +
          (main.medianLoss !== null
            ? ` 在本站有该档位公开困惑度数据的 ${main.lossSample} 个模型中，相对 FP16 的损失中位数为 ${main.medianLoss.toFixed(1)}%。`
            : ` 本站没有任何模型公布该档位的困惑度数据，因此本页不给出数字。`),
      },
    });
  }

  if (hasNative) {
    const mx = levels.find(l => l.level === 'MXFP4')!;
    sections.push({
      heading: { en: 'MXFP4 is a GGUF level, not a rival format', zh: 'MXFP4 是 GGUF 的一个档位，不是另一种格式' },
      body: {
        en: `${mx.count} model${mx.count === 1 ? '' : 's'} here ship${mx.count === 1 ? 's' : ''} weights that were released at 4 bits rather than converted down to them, distributed as GGUF at ${mx.bpwLow} bpw. That is why you will not find MXFP4 in the format filter: it is a quantization scheme inside this container, not a different container, and the file you download is a GGUF file. It also means there is no FP16 original to measure a perplexity loss against — the released checkpoint *is* the quantized one — and re-quantizing it to Q4_K_M costs quality for no memory saving.`,
        zh: `本站有 ${mx.count} 个模型的权重是以 4-bit 发布的，而不是从更高精度转换下来的，以 GGUF 形式分发，每权重 ${mx.bpwLow} 比特。这也是格式筛选器里找不到 MXFP4 的原因：它是这个容器内部的量化方案，不是另一种容器，你下载到的就是 GGUF 文件。这同时意味着没有一个 FP16 原版可以拿来计算困惑度损失 —— 发布出来的检查点本身就是量化后的 —— 而把它再量化成 Q4_K_M 只会损失质量，省不下显存。`,
      },
    });
  }

  // ---- FAQ ----------------------------------------------------------------
  const faqs: FormatFaq[] = [];

  faqs.push({
    q: { en: `What is ${format.name}?`, zh: `${format.name} 是什么？` },
    a: {
      en: `${format.description.en} It is read by ${format.framework}, needs ${format.hardwareReq}, and ${owning.length} of the ${total} models in this index ship in it.`,
      zh: `${format.description.zh} 它由 ${format.framework} 读取，硬件要求为 ${format.hardwareReq}，本索引 ${total} 个模型中有 ${owning.length} 个提供该格式。`,
    },
  });

  if (ref && main && example && refQuant) {
    faqs.push({
      q: {
        en: `How much VRAM does ${ref.name} need in ${format.name}?`,
        zh: `${ref.name} 用 ${format.name} 需要多少显存？`,
      },
      a: {
        en: `About ${example.totalGB.toFixed(1)} GB at ${main.key} with a ${REF_CONTEXT / 1024}K context window — ${example.modelWeightsGB.toFixed(1)} GB of that is the weights themselves${smallestCard ? `, so ${article(String(smallestCard.vram))} ${smallestCard.vram} GB card clears it comfortably` : ''}. Longer context adds KV cache on top; the calculator will size any combination.`,
        zh: `在 ${main.key}、${REF_CONTEXT / 1024}K 上下文下约 ${example.totalGB.toFixed(1)} GB，其中权重本身占 ${example.modelWeightsGB.toFixed(1)} GB${smallestCard ? `，因此 ${smallestCard.vram} GB 的显卡可以从容运行` : ''}。上下文更长会额外增加 KV 缓存；计算器可以算任意组合。`,
      },
    });
  }

  if (levels.length > 1) {
    const best = levels.reduce((x, y) => (y.bpwHigh > x.bpwHigh ? y : x));
    const small = levels.reduce((x, y) => (y.bpwLow < x.bpwLow ? y : x));
    faqs.push({
      q: { en: `Which ${format.name} level should I download?`, zh: `${format.name} 该下载哪个档位？` },
      a: {
        en: `This index carries ${levels.map(l => `${l.level} (${l.count} model${l.count === 1 ? '' : 's'})`).join(', ')}. ${main.level} is the one most models here ship and the usual starting point. ${small.level} at ${small.bpwLow} bpw is the smallest and ${best.level} at ${best.bpwHigh} bpw the largest — the rule that matters is to take the highest level that still leaves headroom on your card, not the smallest one that loads.`,
        zh: `本索引收录了 ${levels.map(l => `${l.level}（${l.count} 个模型）`).join('、')}。${main.level} 是最多模型提供的档位，通常也是起点。最小的是 ${small.level}（${small.bpwLow} bpw），最大的是 ${best.level}（${best.bpwHigh} bpw）—— 真正的原则是：在显卡仍有余量的前提下取最高档位，而不是取「能加载的最小档位」。`,
      },
    });
  }

  faqs.push({
    q: {
      en: isLegacy ? `Is ${format.name} still worth using in 2026?` : `${format.name} or something else?`,
      zh: isLegacy ? `2026 年还值得用 ${format.name} 吗？` : `该用 ${format.name} 还是别的格式？`,
    },
    a: {
      en:
        (isLegacy
          ? `It still works, and ${format.framework.split('·')[0].trim()} still reads it. But ${owning.length} of ${total} models here ship it against ${models.filter(m => m.quants.some(q => q.format === 'GGUF')).length} for GGUF, and that ratio is the honest answer: it is maintained rather than developed. `
          : `Depends on what reads it — this one belongs where the job is ${format.bestFor.en.replace(/^./, c => c.toLowerCase())}. `) +
        (pairs.length
          ? `This site compares it directly against ${pairs.map(p => (p.a.id === format.id ? p.b.name : p.a.name)).join(', ')}, using only the models that ship both formats — the only place the comparison is measurable rather than editorial.`
          : `No other format here shares enough models with it for a measurable comparison.`),
      zh:
        (isLegacy
          ? `它仍然能用，${format.framework.split('·')[0].trim()} 依然支持。但本站 ${total} 个模型中只有 ${owning.length} 个提供它，而 GGUF 有 ${models.filter(m => m.quants.some(q => q.format === 'GGUF')).length} 个 —— 这个比例就是诚实的答案：它处于维护状态，而非发展状态。`
          : `取决于你用什么来跑：这个格式的位置是「${format.bestFor.zh}」。`) +
        (pairs.length
          ? `本站把它与 ${pairs.map(p => (p.a.id === format.id ? p.b.name : p.a.name)).join('、')} 做了直接对比，且只用同时提供两种格式的模型 —— 只有那里的对比是可测量的，而不是编辑观点。`
          : `本站没有其他格式与它有足够多的共同模型来做可测量的对比。`),
    },
  });

  return { owning, levels, sections, faqs };
}
