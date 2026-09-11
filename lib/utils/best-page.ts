import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { fitsOnGpu, gpuSlug, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { homePicks, type HomeUseCase } from '@/lib/utils/home-picks';
import { quantLevelKey } from '@/lib/utils/recommend';
import { formatLoss } from '@/lib/utils/quality';
import { article } from '@/lib/utils/gpu-explainer';
import type { QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * "Best local LLM for {N}GB" — the question the data could always answer and
 * no page did.
 *
 * `/gpu/{card}/` answers "what fits this card" with a list; `/quant-hub/`
 * answers "what exists" with another list. What people actually search for is a
 * **recommendation**, and the site was handing that query to blogs with no
 * measurements while holding precise VRAM figures itself.
 *
 * **What "best" is allowed to mean here.** This index runs no task benchmarks,
 * so it cannot say which model is smarter and does not try. "Best" means the
 * best fit for a memory budget: the largest model in its category that clears
 * the card comfortably, with its quant level, its real cost and its published
 * perplexity loss printed beside it. Every page says so in as many words.
 *
 * Nothing is written per tier. The picks come from `homePicks`, the same
 * function behind the homepage hero — one ranking implementation, so a tier
 * page and the homepage cannot recommend different models for the same card.
 * Adding a model to the index changes these pages with no edit.
 */

const LONG_CONTEXTS = [16384, 32768];

export interface BestTier {
  slug: string;
  kind: 'vram' | 'apple';
  /** Representative capacity the picks are computed against. */
  vram: number;
  /** Every card in the index at this capacity. */
  cards: GPU[];
}

/**
 * Tiers are the capacities the index actually has several cards at. 10 GB and
 * 20 GB have exactly one card each and would produce a page about a single
 * product; the datacentre tiers are not what "best local LLM for my card" is
 * asking about.
 */
const VRAM_TIERS = [8, 12, 16, 24, 32];

/** Apple tiers the picks ladder across — real configurations, not round numbers. */
export const APPLE_LADDER = [16, 24, 36, 48, 64, 128];

export const BEST_TIERS: BestTier[] = [
  ...VRAM_TIERS.map(vram => ({
    slug: `${vram}gb-vram`,
    kind: 'vram' as const,
    vram,
    cards: gpuDatabase.filter(g => g.vram === vram && g.type !== 'apple' && !g.isCPU),
  })).filter(t => t.cards.length > 0),
  {
    slug: 'mac-apple-silicon',
    kind: 'apple' as const,
    // The mainstream Mac an LLM reader is most likely holding; the page shows
    // the whole ladder below the picks rather than pretending one figure covers
    // an 8 GB Air and a 512 GB Studio.
    vram: 36,
    cards: gpuDatabase.filter(g => g.type === 'apple'),
  },
];

export function bestTierBySlug(slug: string): BestTier | undefined {
  return BEST_TIERS.find(t => t.slug === slug);
}

export interface BestPick {
  /**
   * The jobs this row answers. Usually one, but a model tagged both `general`
   * and `code` can genuinely be the largest that fits in both — printing it as
   * two identical rows looked like a bug and wasted a third of the table, so
   * the row carries every use case it wins.
   */
  useCases: HomeUseCase[];
  useCase: HomeUseCase;
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  headroomGB: number;
  /** Contexts at which this pick still clears the tier. */
  holdsAt: number[];
  why: { en: string; zh: string };
}

export interface BestFaq {
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

/**
 * A capacity-only stand-in: `fitsOnGpu` reads nothing but `vram`.
 *
 * **`tier.vram` wins, not the first card's.** Returning `tier.cards[0]` was a
 * real bug on the Apple page, where the first entry is a 512 GB Mac Studio: the
 * picks came back as a 675B model needing 429 GB while the same page's context
 * ladder was computed against the declared 36 GB tier. One tier, two capacities.
 */
function tierCard(tier: BestTier): GPU {
  const base = tier.cards[0];
  return base
    ? { ...base, vram: tier.vram }
    : { id: 'synthetic', name: `${tier.vram}GB`, vram: tier.vram, type: 'nvidia-consumer', icon: '' };
}

const USE_CASES: HomeUseCase[] = ['chat', 'code', 'multimodal'];

/**
 * The one sentence per pick that is a judgement rather than a restatement.
 *
 * Conditional on facts that differ per pick — whether it is the largest thing
 * that fits at all, how much room is left, whether it is the only model in its
 * category that clears the tier, whether a perplexity figure exists, whether it
 * survives a long context. The audit suggested writing 18 of these by hand;
 * hand-written sentences stop being true the moment the index moves, which is
 * the same reason `readTime` was deleted.
 */
function whyFor(
  pick: { model: QuantModel; quant: QuantVariant; totalGB: number; headroomGB: number },
  opts: { tier: BestTier; isLargestOverall: boolean; categorySize: number; holdsAt: number[] },
): { en: string; zh: string } {
  const { tier, isLargestOverall, categorySize, holdsAt } = opts;
  const loss = pick.quant.pplLossPercent;
  const en: string[] = [];
  const zh: string[] = [];

  if (categorySize === 1) {
    en.push(`The only model in this category that clears ${tier.vram} GB at all.`);
    zh.push(`本类别中唯一能装进 ${tier.vram} GB 的模型。`);
  } else if (isLargestOverall) {
    en.push(`The largest model of any kind that fits this budget.`);
    zh.push(`这个显存预算下能装进的最大模型（不分类别）。`);
  } else {
    en.push(`The largest in its category that still leaves headroom.`);
    zh.push(`本类别中仍留有余量的最大模型。`);
  }

  if (loss !== undefined) {
    en.push(`At ${quantLevelKey(pick.quant)} it gives up ${loss.toFixed(1)}% perplexity against FP16.`);
    zh.push(`在 ${quantLevelKey(pick.quant)} 下相对 FP16 损失 ${loss.toFixed(1)}% 困惑度。`);
  } else {
    en.push(`Its quantizer published no perplexity figure, so none is quoted.`);
    zh.push(`该量化版本没有公开困惑度数据，因此这里不给数字。`);
  }

  const longest = holdsAt[holdsAt.length - 1];
  if (longest && longest >= 32768) {
    en.push(`It still fits at ${longest / 1024}K context, which is what the headroom is for.`);
    zh.push(`在 ${longest / 1024}K 上下文下依然装得下 —— 余量就是留给这个的。`);
  } else if (longest) {
    en.push(`Past ${longest / 1024}K context the KV cache pushes it over.`);
    zh.push(`上下文超过 ${longest / 1024}K 后，KV 缓存会让它超出显存。`);
  } else {
    en.push(`Only at ${GPU_PAGE_CONTEXT / 1024}K context — a longer window does not fit.`);
    zh.push(`仅限 ${GPU_PAGE_CONTEXT / 1024}K 上下文 —— 更长的窗口装不下。`);
  }

  return { en: en.join(' '), zh: zh.join('') };
}

export interface BestPageData {
  picks: BestPick[];
  cards: GPU[];
  /** The nearest model that does not fit, and by how much. */
  nearMiss?: { model: QuantModel; quant: QuantVariant; totalGB: number; overBy: number };
  /** How many models clear the tier at each context length. */
  ladder: { context: number; count: number }[];
  /** Apple only: largest model that fits at each unified-memory tier. */
  appleLadder?: { vram: number; model?: QuantModel; quant?: QuantVariant; totalGB?: number; count: number }[];
  fitCount: number;
  faqs: BestFaq[];
}

export function bestPage(tier: BestTier): BestPageData {
  const card = tierCard(tier);
  const allFits = fitsOnGpu(card);
  const fitCount = allFits.length;
  const largestOverall = allFits[0];

  const picks: BestPick[] = [];
  for (const useCase of USE_CASES) {
    const [top] = homePicks(card, useCase);
    if (!top) continue;
    const categorySize = allFits.filter(f =>
      f.model.categories.some(c =>
        useCase === 'chat' ? ['general', 'instruct'].includes(c) : useCase === 'code' ? c === 'code' : c === 'multimodal',
      ),
    ).length;
    const holdsAt = LONG_CONTEXTS.filter(
      ctx => getVerdict(sizeAt(top.model, top.quant.bpw, ctx).totalGB, tier.vram) === 'green',
    );
    const already = picks.find(p => p.model.id === top.model.id);
    if (already) {
      already.useCases.push(useCase);
      continue;
    }
    picks.push({
      useCases: [useCase],
      useCase,
      model: top.model,
      quant: top.quant,
      totalGB: top.totalGB,
      headroomGB: top.headroomGB,
      holdsAt,
      why: whyFor(top, {
        tier,
        isLargestOverall: top.model.id === largestOverall?.model.id,
        categorySize,
        holdsAt,
      }),
    });
  }

  // The nearest thing that does not fit. Naming the boundary is the half of
  // the answer a list never gives, and it is the part an engine will quote.
  let nearMiss: BestPageData['nearMiss'];
  const fittingIds = new Set(allFits.map(f => f.model.id));
  for (const model of models) {
    if (fittingIds.has(model.id)) continue;
    const cheapest = [...model.quants]
      .map(q => ({ q, gb: sizeAt(model, q.bpw, GPU_PAGE_CONTEXT).totalGB }))
      .sort((a, b) => a.gb - b.gb)[0];
    if (!cheapest) continue;
    const overBy = cheapest.gb - tier.vram;
    if (overBy <= 0) continue;
    if (!nearMiss || overBy < nearMiss.overBy) {
      nearMiss = { model, quant: cheapest.q, totalGB: cheapest.gb, overBy };
    }
  }

  const ladder = [GPU_PAGE_CONTEXT, ...LONG_CONTEXTS].map(context => ({
    context,
    count: models.filter(m =>
      m.quants.some(q => getVerdict(sizeAt(m, q.bpw, context).totalGB, tier.vram) === 'green'),
    ).length,
  }));

  let appleLadder: BestPageData['appleLadder'];
  if (tier.kind === 'apple') {
    appleLadder = APPLE_LADDER.map(vram => {
      const fits = fitsOnGpu({ ...card, vram });
      return { vram, model: fits[0]?.model, quant: fits[0]?.quant, totalGB: fits[0]?.totalGB, count: fits.length };
    });
  }

  const chat = picks.find(p => p.useCase === 'chat');
  const label = tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram} GB`;
  const labelZh = tier.kind === 'apple' ? 'Apple 芯片' : `${tier.vram} GB`;

  const faqs: BestFaq[] = [];

  if (chat) {
    faqs.push({
      q: {
        en: `What is the best local LLM for ${label}${tier.kind === 'apple' ? '' : ' of VRAM'} in 2026?`,
        zh: `2026 年 ${labelZh}${tier.kind === 'apple' ? '' : '显存'}最适合跑哪个本地大模型？`,
      },
      a: {
        en: `${chat.model.name} at ${quantLevelKey(chat.quant)} for general use — ${chat.totalGB.toFixed(1)} GB of ${tier.vram} GB, leaving ${chat.headroomGB.toFixed(1)} GB. ${picks.filter(p => p.useCase !== 'chat').map(p => `${p.model.name} if you want ${p.useCase === 'code' ? 'code' : 'images'}`).join(', ')}. "Best" here means the largest model in its category that clears the card with headroom — this index measures memory and published perplexity, not task quality, so it cannot rank models on how well they answer.`,
        zh: `通用场景选 ${chat.model.name}（${quantLevelKey(chat.quant)}）—— ${tier.vram} GB 中占 ${chat.totalGB.toFixed(1)} GB，剩 ${chat.headroomGB.toFixed(1)} GB。${picks.filter(p => p.useCase !== 'chat').map(p => `要${p.useCase === 'code' ? '写代码' : '处理图像'}就选 ${p.model.name}`).join('，')}。这里的「最好」指的是本类别中能留有余量装进这张卡的最大模型 —— 本索引衡量的是显存与已公开的困惑度，不是任务质量，因此无法就「答得好不好」给模型排名。`,
      },
    });
  }

  faqs.push({
    q: {
      en: `How many models fit ${label}?`,
      zh: `${labelZh} 能装下多少个模型？`,
    },
    a: {
      en: `${fitCount} of the ${models.length} models in this index clear it comfortably at ${GPU_PAGE_CONTEXT / 1024}K context — comfortably meaning the estimate uses at most 88% of the memory, so there is margin for the display and the runtime. ${ladder[1] ? `At ${ladder[1].context / 1024}K that falls to ${ladder[1].count}, and at ${ladder[2].context / 1024}K to ${ladder[2].count}: the KV cache is what moves, not the weights.` : ''}`,
      zh: `本索引 ${models.length} 个模型中有 ${fitCount} 个能在 ${GPU_PAGE_CONTEXT / 1024}K 上下文下从容装下 —— 「从容」指估算占用不超过显存的 88%，给显示输出和运行时留出余量。${ladder[1] ? `到 ${ladder[1].context / 1024}K 时降到 ${ladder[1].count} 个，${ladder[2].context / 1024}K 时是 ${ladder[2].count} 个：变化的是 KV 缓存，不是权重。` : ''}`,
    },
  });

  if (nearMiss) {
    faqs.push({
      q: {
        en: `What will not run on ${label}?`,
        zh: `${labelZh} 跑不了什么？`,
      },
      a: {
        en: `The nearest miss is ${nearMiss.model.name}: its smallest build here, ${quantLevelKey(nearMiss.quant)}, needs about ${nearMiss.totalGB.toFixed(1)} GB — ${nearMiss.overBy.toFixed(1)} GB over, before any context beyond ${GPU_PAGE_CONTEXT / 1024}K. Offloading part of it to system RAM will load it, at a speed set by your RAM rather than your ${tier.kind === 'apple' ? 'chip' : 'card'}; that is a different machine, not a smaller quant.`,
        zh: `最接近的是 ${nearMiss.model.name}：它在本站最小的构建 ${quantLevelKey(nearMiss.quant)} 约需 ${nearMiss.totalGB.toFixed(1)} GB —— 超出 ${nearMiss.overBy.toFixed(1)} GB，而且这还没算 ${GPU_PAGE_CONTEXT / 1024}K 以外的上下文。把一部分权重卸载到系统内存确实能加载，但速度将由内存决定而不是由你的${tier.kind === 'apple' ? '芯片' : '显卡'}决定；那是另一台机器，不是换个更小的量化档位。`,
      },
    });
  }

  if (tier.cards.length > 1) {
    faqs.push({
      q: {
        en: `Do all ${label} cards run the same models?`,
        zh: `所有 ${labelZh} 的卡跑的模型都一样吗？`,
      },
      a: {
        en: `They hold the same models — what fits is decided by capacity alone, so all ${tier.cards.length} cards at this tier return this same list. What differs is how fast they read the weights: token generation reads the whole weight set once per token, so memory bandwidth sets the ceiling, and two cards with identical memory can be more than 2.5× apart on it. Each card's own page states its bandwidth and what that implies.`,
        zh: `装得下的模型是一样的 —— 能不能装下完全由容量决定，所以这一档的 ${tier.cards.length} 张卡返回的是同一份清单。不同的是读取权重的速度：每生成一个 token 都要把整套权重读一遍，所以显存带宽决定了上限，而显存相同的两张卡在这一项上可以相差 2.5 倍以上。每张卡自己的页面都标注了带宽及其含义。`,
      },
    });
  }

  return { picks, cards: tier.cards, nearMiss, ladder, appleLadder, fitCount, faqs };
}

/** Hub-page summary line per tier. */
export function tierSummary(tier: BestTier, lang: 'en' | 'zh'): string {
  const { picks, fitCount } = bestPage(tier);
  const chat = picks.find(p => p.useCase === 'chat');
  const label = tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram} GB`;
  if (!chat) {
    return lang === 'zh'
      ? `${label}：本索引中没有模型能在 ${GPU_PAGE_CONTEXT / 1024}K 上下文下从容装下。`
      : `${label}: nothing in this index clears it comfortably at ${GPU_PAGE_CONTEXT / 1024}K context.`;
  }
  return lang === 'zh'
    ? `${fitCount} 个模型装得下，通用场景首选 ${chat.model.name}（${quantLevelKey(chat.quant)}，约 ${chat.totalGB.toFixed(1)} GB）。`
    : `${fitCount} models fit; ${chat.model.name} at ${quantLevelKey(chat.quant)} (${chat.totalGB.toFixed(1)} GB) is the general-purpose pick.`;
}

export { gpuSlug, formatLoss, article };
