import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { countModelsFitting } from '@/lib/utils/gpu-page';
import { modelsWithFormat } from '@/lib/utils/format-compare';
import { getSiteStats } from '@/lib/stats';
import { quantLevelKey } from '@/lib/utils/recommend';
import { benchmarkMethodology, dataLastUpdated } from '@/lib/data/meta';
import type { QuantModel } from '@/lib/data/types';

/**
 * The site's questions, answered from the site's own index.
 *
 * `/faq/` was a 404 and only the four tool pages carried `FAQPage`, which left
 * the largest single gap for AI engines: this site holds the data to answer
 * "how much VRAM does a 7B need" precisely, and had it only as a calculator
 * input, never as a question with a self-contained answer.
 *
 * **Every figure is computed here, never typed.** That is the structural
 * advantage over a hand-written FAQ: change a model row and the answer moves
 * with it, so the FAQ cannot drift from the calculator the way the cookbook
 * guides did. Where the index genuinely cannot answer (whether quantization
 * hurts coding more than chat; whether an official QAT build beats a community
 * one) the answer says so instead of guessing — a confident wrong answer is the
 * worst thing to hand an engine that will quote it.
 *
 * The Chinese half is **re-drafted, not translated**: the questions people type
 * in Chinese are phrased differently ("4060Ti 16G 能跑什么模型" rather than
 * "how much VRAM do I need"), and a translated question matches nothing.
 */

export interface FaqItem {
  id: string;
  q: { en: string; zh: string };
  a: { en: string; zh: string };
  /** Every answer ends somewhere on this site. */
  link: { href: string; label: { en: string; zh: string } };
}

export interface FaqGroup {
  id: string;
  heading: { en: string; zh: string };
  items: FaqItem[];
}

const CTX = 4096;
const LONG_CTX = 32768;

function size(model: QuantModel, bpw: number, ctx: number) {
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

/** The indexed model closest to a target size that ships GGUF Q4_K_M. */
function nearest(targetB: number) {
  const m = models
    .filter(x => x.quants.some(q => q.format === 'GGUF' && q.level === 'Q4_K_M'))
    .sort((a, b) => Math.abs(a.params - targetB) - Math.abs(b.params - targetB))[0];
  const q = m.quants.find(x => x.format === 'GGUF' && x.level === 'Q4_K_M')!;
  return { model: m, quant: q };
}

const one = (n: number) => n.toFixed(1);

export function faqGroups(): FaqGroup[] {
  const stats = getSiteStats();
  const total = models.length;
  const gpuCount = gpuDatabase.length;

  const b7 = nearest(7);
  const s7 = size(b7.model, b7.quant.bpw, CTX);
  const s7long = size(b7.model, b7.quant.bpw, LONG_CTX);

  const b24 = nearest(24);
  const s24 = size(b24.model, b24.quant.bpw, CTX);
  const awq24 = b24.model.quants.find(q => q.format === 'AWQ');
  const s24awq = awq24 ? size(b24.model, awq24.bpw, CTX) : undefined;

  const b70 = nearest(70);
  const s70 = size(b70.model, b70.quant.bpw, CTX);
  const small70 = [...b70.model.quants].sort((a, b) => a.bpw - b.bpw)[0];
  const s70small = size(b70.model, small70.bpw, CTX);
  const cards70 = gpuDatabase.filter(g => getVerdict(s70.totalGB, g.vram) === 'green');
  const consumer70 = cards70.filter(g => g.type === 'nvidia-consumer' || /^Radeon RX/.test(g.name));

  const card8 = gpuDatabase.find(g => g.id === 'rtx4060')!;
  const card16 = gpuDatabase.find(g => g.id === 'rtx4060ti16')!;
  const card32 = gpuDatabase.find(g => g.id === 'rtx5090')!;
  const fits8 = countModelsFitting(card8, 'comfortable');
  const fits16 = countModelsFitting(card16, 'comfortable');
  const fits32 = countModelsFitting(card32, 'comfortable');

  const gguf = modelsWithFormat('GGUF').length;
  const awq = modelsWithFormat('AWQ').length;
  const exl2 = modelsWithFormat('EXL2').length;

  // "Consumer" has to mean cards a person buys for a desktop. Filtering on
  // `type` alone is not enough: 'amd' also covers the Radeon PRO W7900 and the
  // Instinct MI100, and picking by capacity handed a workstation card back as
  // the answer to "what should I buy".
  const isConsumer = (g: (typeof gpuDatabase)[number]) =>
    g.type === 'nvidia-consumer' || /^Radeon RX/.test(g.name);
  const biggestConsumer = gpuDatabase
    .filter(isConsumer)
    .sort((a, b) => b.vram - a.vram || (b.bandwidth ?? 0) - (a.bandwidth ?? 0))[0];

  const mxfp4 = models.filter(m => m.quants.some(q => q.level === 'MXFP4'));

  return [
    {
      id: 'sizing',
      heading: { en: 'Sizing and VRAM', zh: '显存与体积' },
      items: [
        {
          id: 'vram-7b',
          q: {
            en: 'How much VRAM do I need to run a 7B model?',
            zh: '跑一个 7B 模型需要多少显存？',
          },
          a: {
            en: `About ${one(s7.totalGB)} GB at Q4_K_M with a ${CTX / 1024}K context window — ${one(s7.modelWeightsGB)} GB of weights, ${one(s7.kvCacheGB)} GB of KV cache and a ${one(s7.activationsGB)} GB activation buffer, measured on ${b7.model.name} (${b7.model.paramLabel}). Every 8 GB card in this index clears that with room left. The figure rises with context, not with how hard you use the model: the same file at ${LONG_CTX / 1024}K needs about ${one(s7long.totalGB)} GB, because the KV cache grows to ${one(s7long.kvCacheGB)} GB.`,
            zh: `在 Q4_K_M、${CTX / 1024}K 上下文下约 ${one(s7.totalGB)} GB —— 权重 ${one(s7.modelWeightsGB)} GB、KV 缓存 ${one(s7.kvCacheGB)} GB、激活缓冲 ${one(s7.activationsGB)} GB，以 ${b7.model.name}（${b7.model.paramLabel}）实算。本索引中每一张 8 GB 显卡都能从容跑下，还有余量。这个数字随上下文增长，而不是随你用得多不多：同一个文件在 ${LONG_CTX / 1024}K 下约需 ${one(s7long.totalGB)} GB，因为 KV 缓存涨到了 ${one(s7long.kvCacheGB)} GB。`,
          },
          link: { href: '/tools/vram-calc/', label: { en: 'Size your exact combination', zh: '算你自己的组合' } },
        },
        {
          id: 'vram-24b-16gb',
          q: {
            en: 'Can I run a 24B model on a 16GB card?',
            zh: '16G 显卡能跑 24B 的模型吗？',
          },
          a: {
            en:
              (s24awq
                ? `At 4 bits and short context, yes — ${b24.model.name} at ${quantLevelKey(awq24!)} needs about ${one(s24awq.totalGB)} GB of 16 GB, leaving ${one(16 - s24awq.totalGB)} GB. `
                : '') +
              `The level matters more than the parameter count: the same model at Q4_K_M is ${one(s24.totalGB)} GB, which is ${Math.round((s24.totalGB / 16) * 100)}% of the card — it loads on a card with nothing else on it and has no margin for a longer window. A 16 GB card runs ${fits16} of the ${total} models here comfortably.`,
            zh:
              (s24awq
                ? `在 4-bit、短上下文下可以 —— ${b24.model.name} 在 ${quantLevelKey(awq24!)} 下约需 16 GB 中的 ${one(s24awq.totalGB)} GB，还剩 ${one(16 - s24awq.totalGB)} GB。`
                : '') +
              `档位比参数量更关键：同一个模型在 Q4_K_M 下是 ${one(s24.totalGB)} GB，占这张卡的 ${Math.round((s24.totalGB / 16) * 100)}% —— 在显卡完全空闲时能加载，但没有余量留给更长的窗口。16 GB 显卡能从容运行本索引 ${total} 个模型中的 ${fits16} 个。`,
          },
          link: { href: `/gpu/rtx-4060-ti-16g/`, label: { en: 'See everything a 16GB card runs', zh: '看 16G 显卡能跑的全部模型' } },
        },
        {
          id: 'os-overhead',
          q: {
            en: 'Does the operating system eat into my VRAM?',
            zh: '系统和显示会占掉显存吗？',
          },
          a: {
            en: `Yes. On a card that is also driving a desktop, subtract roughly 0.5–1.5 GB before comparing against any figure here — more with a browser open. That is why the calculator's "comfortable" verdict stops at 88% of the card rather than 100%: the last eighth is the margin that keeps a model from failing to allocate on a machine you are also using. The looser 105% rule is shown separately and always named.`,
            zh: `会。如果这张卡同时还在驱动桌面，请先减去约 0.5–1.5 GB 再和本站的数字比较 —— 开着浏览器还要更多。这也是计算器把「从容运行」的界线划在显存的 88% 而不是 100% 的原因：最后这八分之一，正是让模型在你同时还在用的机器上不至于分配失败的余量。更宽松的 105% 规则单独显示，而且每次都会写明。`,
          },
          link: { href: '/tools/vram-calc/', label: { en: 'How the verdict is calculated', zh: '判定是怎么算的' } },
        },
        {
          id: 'same-level-different-size',
          q: {
            en: 'Why does the same quant level give different file sizes for different models?',
            zh: '为什么同一个量化档位，不同模型的体积差很多？',
          },
          a: {
            en: `Because a level like Q4_K_M is a recipe, not a fixed bit width — it quantizes different tensors to different precisions, and the mix depends on the model's shape. Across the ${gguf} models here that ship Q4_K_M the effective rate runs from ${one(Math.min(...models.flatMap(m => m.quants.filter(q => q.level === 'Q4_K_M').map(q => q.bpw))))} to ${one(Math.max(...models.flatMap(m => m.quants.filter(q => q.level === 'Q4_K_M').map(q => q.bpw))))} bits per weight. This site stores each model's own measured rate rather than one table value, which is why two 8B models at the same level can differ by several hundred megabytes.`,
            zh: `因为 Q4_K_M 这类档位是一套「配方」，不是固定位宽 —— 它把不同的张量量化到不同精度，具体配比取决于模型结构。在本站提供 Q4_K_M 的 ${gguf} 个模型中，实际每权重比特从 ${one(Math.min(...models.flatMap(m => m.quants.filter(q => q.level === 'Q4_K_M').map(q => q.bpw))))} 到 ${one(Math.max(...models.flatMap(m => m.quants.filter(q => q.level === 'Q4_K_M').map(q => q.bpw))))} 不等。本站记录的是每个模型自己的实测值，而不是查表的统一数字 —— 这就是两个同为 8B、同一档位的模型体积能差几百 MB 的原因。`,
          },
          link: { href: '/formats/gguf/', label: { en: 'GGUF levels in this index', zh: '本索引收录的 GGUF 档位' } },
        },
        {
          id: 'context-cost',
          q: {
            en: 'How much VRAM does context actually cost?',
            zh: '上下文拉长到底多吃多少显存？',
          },
          a: {
            en: `It depends on the model's attention shape, not on its parameter count. ${b7.model.name} goes from ${one(s7.kvCacheGB)} GB of KV cache at ${CTX / 1024}K to ${one(s7long.kvCacheGB)} GB at ${LONG_CTX / 1024}K — roughly linear, because every layer keeps a cache that grows with the window. 2026 hybrid-attention models break that: a model running only a fraction of its layers on full attention keeps a fixed-size recurrent state on the rest, so its cache barely moves. The calculator accounts for both.`,
            zh: `取决于模型的注意力结构，而不是参数量。${b7.model.name} 的 KV 缓存从 ${CTX / 1024}K 时的 ${one(s7.kvCacheGB)} GB 涨到 ${LONG_CTX / 1024}K 时的 ${one(s7long.kvCacheGB)} GB —— 基本是线性的，因为每一层都维护一份随窗口增长的缓存。2026 年的混合注意力模型打破了这一点：只有一部分层跑完整注意力，其余层保持固定大小的循环状态，缓存几乎不涨。计算器对两种情况都做了处理。`,
          },
          link: { href: '/tools/vram-calc/', label: { en: 'Try a longer window', zh: '试试更长的窗口' } },
        },
      ],
    },
    {
      id: 'quality',
      heading: { en: 'Quantization quality', zh: '量化掉点' },
      items: [
        {
          id: 'quality-4bit',
          q: {
            en: 'How much quality do you lose at 4-bit?',
            zh: 'Q4 量化掉点严重吗？',
          },
          a: {
            en: `At Q4_K_M the median published perplexity loss across the ${stats.q4SampleSize} models here that report one is ${(100 - Number(stats.q4Retention.replace('%', ''))).toFixed(1)}% — ${stats.q4Retention} retained — with the range running ${one(stats.q4Range[0])}% to ${one(stats.q4Range[1])}%. Two caveats that matter more than the median: smaller models lose more than larger ones at the same level, and perplexity is a language-modelling measure, not a measure of whether the model still does your task. Models without a published figure are shown as a dash here rather than assumed to be lossless.`,
            zh: `在 Q4_K_M 下，本站有公开困惑度数据的 ${stats.q4SampleSize} 个模型，损失中位数为 ${(100 - Number(stats.q4Retention.replace('%', ''))).toFixed(1)}% —— 即保留 ${stats.q4Retention} —— 区间从 ${one(stats.q4Range[0])}% 到 ${one(stats.q4Range[1])}%。有两点比中位数更重要：同一档位下，小模型掉得比大模型多；而且困惑度衡量的是语言建模能力，不等于「它还能不能做好你的任务」。没有公开数据的模型在本站显示为短横线，而不是当作零损失。`,
          },
          link: { href: '/quant-hub/', label: { en: 'Per-model figures', zh: '逐个模型的数据' } },
        },
        {
          id: 'what-is-q4km',
          q: {
            en: 'What does Q4_K_M actually mean?',
            zh: 'Q4_K_M 这个名字是什么意思？',
          },
          a: {
            en: `Q4 is the nominal bit width, K is llama.cpp's k-quant family, and M is the medium variant of it (there are S and L siblings). The K family does not quantize every tensor the same way — attention and feed-forward tensors get different treatment, and some stay at higher precision — which is why the effective rate lands above 4 bits. In this index Q4_K_M is the level every one of the ${gguf} GGUF models ships, which is why it is the level the site quotes its headline quality figure against.`,
            zh: `Q4 是名义位宽，K 指 llama.cpp 的 k-quant 家族，M 是其中的中档（还有 S 和 L 两个兄弟）。K 家族不会对所有张量一视同仁 —— 注意力和前馈张量处理方式不同，有些还保持更高精度 —— 这就是实际每权重比特会高于 4 的原因。在本索引中，${gguf} 个 GGUF 模型全部提供 Q4_K_M，所以本站的质量指标也统一以这个档位为准。`,
          },
          link: { href: '/formats/gguf/', label: { en: 'All GGUF levels here', zh: '本站收录的全部 GGUF 档位' } },
        },
        {
          id: 'q5-worth-it',
          q: {
            en: 'Is Q5 worth the extra VRAM over Q4?',
            zh: 'Q5 比 Q4 多吃的显存值得吗？',
          },
          a: (() => {
            // Paired, not two separate medians. The 16 models publishing a
            // Q5_K_M figure are not the 79 publishing a Q4_K_M one, so
            // subtracting one median from the other compares two different
            // populations and calls the difference a quantization effect —
            // the same fault as the old homepage "average accuracy" stat. Only
            // models reporting BOTH levels can answer this question.
            const paired = models
              .map(m => ({
                q4: m.quants.find(q => q.level === 'Q4_K_M' && q.pplLossPercent !== undefined),
                q5: m.quants.find(q => q.level === 'Q5_K_M' && q.pplLossPercent !== undefined),
              }))
              .filter((x): x is { q4: NonNullable<typeof x.q4>; q5: NonNullable<typeof x.q5> } => !!x.q4 && !!x.q5);
            const deltas = paired
              .map(x => x.q4.pplLossPercent! - x.q5.pplLossPercent!)
              .sort((a, b) => a - b);
            const medDelta = deltas.length ? deltas[Math.floor(deltas.length / 2)] : undefined;
            const sizeDelta = paired.length
              ? paired.map(x => x.q5.bpw / x.q4.bpw - 1).reduce((a, b) => a + b, 0) / paired.length
              : 0;
            return {
              en:
                medDelta === undefined
                  ? `Not enough paired figures here to say. Answering it needs models that publish a perplexity number at **both** levels, and this index has none — comparing a median over the models reporting Q4_K_M against a median over the different models reporting Q5_K_M would describe the two groups, not the two levels.`
                  : `On the ${paired.length} models here that publish a figure at both levels, moving Q4_K_M → Q5_K_M recovers a median of ${one(medDelta)} percentage points of perplexity loss for about ${Math.round(sizeDelta * 100)}% more file. Paired deliberately: the models reporting Q5 are not the same set as those reporting Q4, so two separate medians would compare the groups rather than the levels. In practice the decision is usually made for you by what fits — take the higher level when your card has the headroom, and do not drop below Q4 to squeeze in a bigger model without trying both.`,
              zh:
                medDelta === undefined
                  ? `本站的成对数据不足以下结论。要回答它，需要同时公布两个档位困惑度的模型，而本索引一个也没有 —— 拿「公布 Q4_K_M 的那批模型」的中位数去比「公布 Q5_K_M 的另一批模型」的中位数，描述的是两组模型，不是两个档位。`
                  : `在本站同时公布两个档位数据的 ${paired.length} 个模型上，从 Q4_K_M 升到 Q5_K_M 可以挽回的困惑度损失中位数为 ${one(medDelta)} 个百分点，代价是体积增加约 ${Math.round(sizeDelta * 100)}%。这里刻意做了配对：公布 Q5 数据的模型和公布 Q4 的并不是同一批，分别取中位数比较的是两组模型而不是两个档位。实际上这个选择通常由「装不装得下」决定 —— 显存有余量就取更高档位，而在没有实际对比过之前，不要为了塞进更大的模型而降到 Q4 以下。`,
            };
          })(),
          link: { href: '/tools/compare/', label: { en: 'Compare two configurations', zh: '对比两个配置' } },
        },
        {
          id: 'coding-vs-chat',
          q: {
            en: 'Does quantization hurt coding more than chat?',
            zh: '量化对写代码的影响比聊天更大吗？',
          },
          a: {
            en: `This index cannot tell you. Every quality figure here is perplexity on ${benchmarkMethodology.dataset}, which measures next-token prediction on general prose — it is not a coding benchmark, and a site that cannot run task evaluations should not convert one into a claim about another. The widely reported pattern is that tasks with a single correct answer degrade more visibly than open-ended ones, but that is not something measured here, so it is not stated here as a number.`,
            zh: `本索引回答不了这个问题。本站所有质量数字都是 ${benchmarkMethodology.dataset} 上的困惑度，衡量的是通用文本上的下一个 token 预测 —— 它不是代码基准，而一个跑不了任务评测的站点，不该把一种指标换算成另一种结论。业界普遍观察到「只有唯一正确答案的任务」比开放式任务退化得更明显，但那不是本站测出来的，所以本站不把它写成数字。`,
          },
          link: { href: '/benchmarks/', label: { en: 'What is actually measured here', zh: '本站到底测了什么' } },
        },
        {
          id: 'official-qat',
          q: {
            en: 'Is an official QAT quant better than a community one?',
            zh: '官方 QAT 量化比社区量化更好吗？',
          },
          a: {
            en: `Usually yes at the same bit width, and the reason is mechanical: quantization-aware training runs the quantization in the forward pass during fine-tuning, so the weights adapt to it, where a community post-training quantization compresses a finished model and can only minimise the damage. What this site cannot yet tell you is which build you are looking at — the index records the format and level of each quant but not its publisher, so there is no "official" flag on any row here. That is a known gap, not a judgement that it does not matter.`,
            zh: `在相同位宽下通常是的，原因是机制上的：量化感知训练（QAT）在微调时就把量化放进前向计算，权重会去适应它；而社区的训练后量化（PTQ）是把一个已经训练完的模型压下来，只能尽量减少损伤。本站目前还回答不了的是「你看到的是哪一种」—— 索引记录了每个量化的格式和档位，但没有记录发布者，所以本站任何一行都没有「官方」标记。这是一个已知的缺口，而不是认为它不重要。`,
          },
          link: { href: '/formats/', label: { en: 'What this index does track', zh: '本索引确实跟踪的内容' } },
        },
      ],
    },
    {
      id: 'formats',
      heading: { en: 'Formats and runtimes', zh: '格式与运行时' },
      items: [
        {
          id: 'gguf-or-awq',
          q: { en: 'GGUF or AWQ — which should I use?', zh: 'GGUF 和 AWQ 有什么区别，该用哪个？' },
          a: {
            en: `GGUF unless you are running a server. GGUF runs on anything — CPU, NVIDIA, AMD, Apple — and ${gguf} of the ${total} models here ship it, against ${awq} for AWQ. AWQ's case is throughput under vLLM with batched requests on an NVIDIA card; for one person talking to one model, it buys you nothing GGUF does not already do. ${modelsWithFormat('GGUF').filter(m => m.quants.some(q => q.format === 'AWQ')).length} models here ship both, which is the only set where the two can be compared on the same weights.`,
            zh: `除非你是在跑服务端，否则选 GGUF。GGUF 什么硬件都能跑 —— CPU、NVIDIA、AMD、Apple —— 本站 ${total} 个模型中有 ${gguf} 个提供它，而 AWQ 是 ${awq} 个。AWQ 的价值在于 NVIDIA 显卡上用 vLLM 做批量请求时的吞吐；如果只是你一个人和一个模型对话，它给不了 GGUF 给不了的东西。本站有 ${modelsWithFormat('GGUF').filter(m => m.quants.some(q => q.format === 'AWQ')).length} 个模型同时提供两种格式，那也是唯一能在同一份权重上比较它们的集合。`,
          },
          link: { href: '/formats/gguf-vs-awq/', label: { en: 'GGUF vs AWQ, on the models that ship both', zh: '在同时提供两者的模型上对比' } },
        },
        {
          id: 'convert-gguf',
          q: { en: 'Can I convert a GGUF to AWQ?', zh: 'GGUF 能转成 AWQ 吗？' },
          a: {
            en: `Not usefully. Both are lossy compressions of the original FP16 weights, so converting one to the other stacks a second round of loss on top of the first — you would be quantizing an already-quantized model. The path is to go back to the original weights and quantize those, which is what the people publishing each format already did. If a model has no build in the format you need, that is a real gap, not something a conversion fixes.`,
            zh: `没有实际意义。两者都是对原始 FP16 权重的有损压缩，把一个转成另一个等于在第一次损失之上再叠一次 —— 你是在量化一个已经量化过的模型。正确的路径是回到原始权重再做量化，而这正是各个格式的发布者已经做过的事。如果某个模型没有你需要的格式，那是一个真实的缺口，不是转换能补上的。`,
          },
          link: { href: '/tools/format-wizard/', label: { en: 'Find the format your setup can read', zh: '看你的环境该用哪种格式' } },
        },
        {
          id: 'requantize-mxfp4',
          q: {
            en: 'Why should I not re-quantize an MXFP4 model?',
            zh: 'MXFP4 的模型为什么不要再量化一次？',
          },
          a: {
            en: `Because it is already 4-bit — the released checkpoint is itself the quantized one. ${mxfp4.length === 1 ? 'The model' : `The ${mxfp4.length} models`} here shipping MXFP4 ${mxfp4.length === 1 ? 'was' : 'were'} released at 4 bits rather than converted down, so there is no FP16 original sitting behind ${mxfp4.length === 1 ? 'it' : 'them'} to recover. Re-quantizing to Q4_K_M costs quality and saves nothing: both land near the same size, and you have added a lossy step for it.`,
            zh: `因为它本来就是 4-bit —— 发布出来的检查点本身就是量化后的。本站提供 MXFP4 的 ${mxfp4.length} 个模型是直接以 4-bit 发布的，不是从高精度转换下来的，背后没有一个 FP16 原版可以回溯。再量化成 Q4_K_M 会掉质量而省不下东西：两者体积接近，你只是白白多加了一道有损步骤。`,
          },
          link: { href: '/cookbook/gpt-oss-mxfp4-local/', label: { en: 'Running MXFP4 weights locally', zh: '本地跑 MXFP4 权重' } },
        },
        {
          id: 'mac-format',
          q: { en: 'Which format runs on a Mac?', zh: 'Mac 上用哪种格式？' },
          a: {
            en: `GGUF, through llama.cpp or Ollama with the Metal backend — ${gguf} of the ${total} models here. AWQ, EXL2 and GPTQ all require CUDA and will not run on Apple silicon at all, so three of the four formats this index tracks are unavailable to you before you start. The practical constraint on a Mac is not the format but how much of the unified memory the GPU is allowed to wire down, which is below the number on the box.`,
            zh: `用 GGUF，通过 llama.cpp 或 Ollama 的 Metal 后端 —— 本站 ${total} 个模型中有 ${gguf} 个提供。AWQ、EXL2、GPTQ 都需要 CUDA，在 Apple 芯片上根本跑不起来 —— 本索引跟踪的四种格式里，有三种在你开始之前就已经不可用。Mac 上真正的限制不是格式，而是 GPU 能锁定多少统一内存 —— 那个数字低于机器标称的内存容量。`,
          },
          link: { href: '/gpu/mac-m3-max-48g/', label: { en: 'What a Mac actually runs', zh: 'Mac 实际能跑什么' } },
        },
        {
          id: 'amd-format',
          q: { en: 'Which format runs on an AMD card?', zh: 'A 卡（AMD）能用哪种格式？' },
          a: {
            en: `GGUF via llama.cpp's ROCm or Vulkan backend is the reliable answer. vLLM also ships official ROCm builds, so AWQ is not off the table the way it is on a Mac — but EXL2 and GPTQ are CUDA-only. The thing that actually decides whether an AMD setup works is not the format but whether your kernel and card have a working ROCm build, which is a setup question rather than a hardware ceiling.`,
            zh: `可靠的答案是 GGUF，走 llama.cpp 的 ROCm 或 Vulkan 后端。vLLM 也有官方 ROCm 构建，所以 AWQ 不像在 Mac 上那样完全无解 —— 但 EXL2 和 GPTQ 只支持 CUDA。真正决定一套 A 卡环境能不能用的不是格式，而是你的内核和显卡有没有可用的 ROCm 构建，这是配置问题，不是硬件天花板。`,
          },
          link: { href: '/cookbook/amd-rocm-llamacpp/', label: { en: 'AMD + llama.cpp, step by step', zh: 'AMD + llama.cpp 实操' } },
        },
      ],
    },
    {
      id: 'hardware',
      heading: { en: 'Hardware', zh: '硬件' },
      items: [
        {
          id: 'best-gpu',
          q: { en: 'What is the best GPU for local LLMs in 2026?', zh: '2026 年本地跑大模型该买什么显卡？' },
          a: {
            en: `Whichever one has the most memory in your budget — capacity decides what you can run at all, and nothing else does. Of the ${gpuCount} cards in this index the largest consumer option is the ${biggestConsumer.name} at ${biggestConsumer.vram} GB${biggestConsumer.bandwidth ? ` and ${biggestConsumer.bandwidth.toLocaleString('en-US')} GB/s` : ''}, which runs ${countModelsFitting(biggestConsumer, 'comfortable')} of the ${total} models here comfortably against ${fits8} for an 8 GB card. Bandwidth is the second question, not the first: it sets how fast a model that already fits will generate, and two cards with the same memory can differ by more than 2.5× on it.`,
            zh: `预算内显存最大的那张 —— 能不能跑得起来完全由容量决定，别的都不决定。本索引的 ${gpuCount} 张卡里，消费级容量最大的是 ${biggestConsumer.name}，${biggestConsumer.vram} GB${biggestConsumer.bandwidth ? `、${biggestConsumer.bandwidth.toLocaleString('en-US')} GB/s` : ''}，能从容运行本站 ${total} 个模型中的 ${countModelsFitting(biggestConsumer, 'comfortable')} 个，而 8 GB 的卡是 ${fits8} 个。带宽是第二个问题而不是第一个：它决定已经装得下的模型生成有多快，同样显存的两张卡在这一项上可以差 2.5 倍以上。`,
          },
          link: { href: '/gpu/', label: { en: `Compare all ${gpuCount} cards`, zh: `对比全部 ${gpuCount} 张卡` } },
        },
        {
          id: 'is-8gb-enough',
          q: { en: 'Is 8GB enough for local LLMs?', zh: '8G 显存够用吗？' },
          a: {
            en: `For a large part of what people actually run, yes — ${fits8} of the ${total} models in this index fit an 8 GB card comfortably at ${CTX / 1024}K context, including 7B-class models at Q4_K_M (${one(s7.totalGB)} GB). What 8 GB does not give you is headroom: a long context window, a second process, or a model above about 13B. The step to 16 GB takes you from ${fits8} models to ${fits16}.`,
            zh: `对大多数人实际会跑的东西来说，够 —— 本索引 ${total} 个模型中有 ${fits8} 个能在 ${CTX / 1024}K 上下文下从容装进 8 GB，包括 Q4_K_M 的 7B 级模型（${one(s7.totalGB)} GB）。8 GB 给不了的是余量：长上下文、第二个进程，或者 13B 以上的模型。升到 16 GB 能把可跑数量从 ${fits8} 个提到 ${fits16} 个。`,
          },
          link: { href: '/cookbook/8gb-gpu-starter-guide/', label: { en: 'The 8GB starter guide', zh: '8G 显卡入门指南' } },
        },
        {
          id: 'mac-unified',
          q: { en: "Does a Mac's unified memory count as VRAM?", zh: 'Mac 的统一内存算显存吗？' },
          a: {
            en: `Mostly, but not all of it. The GPU addresses the same pool as the CPU, so a 64 GB Mac can hold models a 24 GB discrete card cannot — that part is real. What is not real is treating the whole number as available: macOS reserves part of the pool for the system and caps how much a single process may wire down. Budget meaningfully below the figure on the box, and remember bandwidth differs by tier far more than capacity suggests.`,
            zh: `大部分算，但不是全部。GPU 和 CPU 共享同一块内存池，所以 64 GB 的 Mac 能装下 24 GB 独显装不下的模型 —— 这部分是真的。不真的是把标称数字当成可用量：macOS 会为系统保留一部分，并限制单个进程能锁定多少。请按明显低于标称的容量来规划，另外记住不同档位之间带宽的差距比容量看起来的差距大得多。`,
          },
          link: { href: '/cookbook/mac-m3-pro-limits/', label: { en: 'What a Mac actually does with memory', zh: 'Mac 的内存实际是怎么用的' } },
        },
        {
          id: 'two-cards',
          q: { en: 'Two 16GB cards or one 32GB card?', zh: '两张 16G 还是一张 32G？' },
          a: {
            en: `One 32 GB card, for a single model. Splitting a model across two cards means every token crosses the bus between them, and the layers on the second card wait on the first — you get the capacity but not the throughput, and the setup is materially harder. Two cards earn their place when you want to run two things at once, or when a 32 GB card is not in the budget. A 32 GB card runs ${fits32} of the ${total} models here comfortably against ${fits16} for a single 16 GB card.`,
            zh: `跑单个模型的话，选一张 32 GB。把模型拆到两张卡上意味着每个 token 都要跨卡传输，第二张卡上的层要等第一张算完 —— 容量拿到了，吞吐没拿到，而且配置明显更麻烦。两张卡真正有价值的场景是你要同时跑两个东西，或者 32 GB 的卡超出预算。一张 32 GB 的卡能从容运行本站 ${total} 个模型中的 ${fits32} 个，单张 16 GB 是 ${fits16} 个。`,
          },
          link: { href: '/cookbook/dual-gpu-70b-llamacpp/', label: { en: 'When two cards do make sense', zh: '什么时候双卡才划算' } },
        },
        {
          id: 'can-i-run-70b',
          q: { en: 'Can I run a 70B model at all on consumer hardware?', zh: '消费级硬件到底能不能跑 70B？' },
          a: {
            en: `Not on a consumer graphics card, no. ${b70.model.name} at Q4_K_M needs about ${one(s70.totalGB)} GB, and ${consumer70.length === 0 ? 'no consumer GPU in this index has that much memory' : `only ${consumer70.map(g => g.name).join(', ')} clears it`} — the cards that do are ${cards70.length - consumer70.length} datacentre, Apple and CPU entries. Its smallest build here, ${quantLevelKey(small70)}, still needs ${one(s70small.totalGB)} GB. The realistic routes are a large-memory Mac, system RAM with CPU inference and the speed that implies, or two cards.`,
            zh: `用消费级显卡的话，不能。${b70.model.name} 在 Q4_K_M 下约需 ${one(s70.totalGB)} GB，${consumer70.length === 0 ? '本索引中没有任何一张消费级显卡有这么大显存' : `只有 ${consumer70.map(g => g.name).join('、')} 装得下`} —— 真正装得下的是 ${cards70.length - consumer70.length} 个数据中心卡、Mac 和纯 CPU 条目。它在本站最小的构建 ${quantLevelKey(small70)} 也要 ${one(s70small.totalGB)} GB。现实的路径是大内存 Mac、用系统内存跑 CPU 推理（并接受相应的速度），或者双卡。`,
          },
          link: { href: '/quant-hub/?size=70B%2B', label: { en: 'Every 70B-class model here', zh: '本站全部 70B 级模型' } },
        },
      ],
    },
    {
      id: 'data',
      heading: { en: 'About this data', zh: '关于这些数据' },
      items: [
        {
          id: 'where-from',
          q: { en: 'Where do these numbers come from?', zh: '这些数字是哪来的？' },
          a: {
            en: `Three sources, kept apart. Model architecture (layer count, KV heads, head dimension) comes from each model's own published config and drives the VRAM arithmetic. Perplexity figures are the ones the quantizers published; models without one show a dash rather than a guess. Speed figures are runs recorded on ${benchmarkMethodology.model} against ${benchmarkMethodology.dataset} on a named stack — and only on hardware that stack actually ran on. Everything else on the site, including every VRAM number, is calculated rather than observed, and labelled as such.`,
            zh: `三个来源，彼此分开。模型架构（层数、KV 头数、head 维度）来自各模型自己公布的 config，是显存计算的输入。困惑度是量化发布者公布的数字；没有公布的模型显示短横线，而不是猜一个。速度数据是在指定软件栈上、以 ${benchmarkMethodology.model} 跑 ${benchmarkMethodology.dataset} 的实测记录 —— 而且只记录那套软件栈真正跑过的硬件。站上其余内容，包括每一个显存数字，都是计算出来的而非实测，并且都有标注。`,
          },
          link: { href: '/benchmarks/', label: { en: 'Methodology in full', zh: '完整方法说明' } },
        },
        {
          id: 'measured-vs-estimated',
          q: {
            en: 'What is the difference between "measured" and "estimated" here?',
            zh: '本站的「实测」和「估算」差在哪？',
          },
          a: {
            en: `Measured means someone ran it and recorded the number on named hardware with a named runtime version. Estimated means it was computed from the model's architecture and quant level using the same formula the calculator uses. The site labels which is which on every surface that shows a figure, and a hardware page with no runs on it says so rather than letting its estimates read as measurements. Removing a row is preferred to adjusting one — three benchmark rows were deleted after arithmetic showed the card they named could not physically reach the speed claimed.`,
            zh: `「实测」是指有人在指定硬件、指定运行时版本上跑过并记录了数字。「估算」是指用计算器同一套公式、从模型架构和量化档位算出来的。本站在每一个展示数字的界面上都标注属于哪一种；没有实测记录的硬件页面会直接说明，而不是让估算值看起来像实测。宁可删掉一行也不修改数值 —— 曾有三条基准数据在算完后发现它们所标的显卡物理上达不到那个速度，于是被删除而非调整。`,
          },
          link: { href: '/changelog/', label: { en: 'What changed and when', zh: '改了什么、什么时候改的' } },
        },
        {
          id: 'update-frequency',
          q: { en: 'How often is the index updated?', zh: '索引多久更新一次？' },
          a: {
            en: `The data carries its own date — it currently reads ${dataLastUpdated} — and every change that alters what the site says is written into a changelog entry on the same day. The rhythm is a data refresh most weeks and a batch of new models every couple of weeks, weighted toward models a constrained setup can actually run rather than toward whatever launched loudest.`,
            zh: `数据自带日期 —— 当前是 ${dataLastUpdated} —— 而每一次改变站点说法的改动，都会在同一天写进变更记录。节奏大致是每周做一次数据刷新，每两周补一批新模型，选择上偏向「受限配置真的跑得动」的模型，而不是发布声量最大的那些。`,
          },
          link: { href: '/changelog/', label: { en: 'The full changelog', zh: '完整变更记录' } },
        },
        {
          id: 'number-mismatch',
          q: {
            en: 'A number here does not match my hardware — what now?',
            zh: '这里的数字和我机器上的对不上怎么办？',
          },
          a: {
            en: `Check three things first: the context length (the default here is ${CTX / 1024}K and the KV cache grows with it), whether your card is also driving a display, and whether your build is the same quant level rather than the same nominal bit width. If it still disagrees, that is worth reporting — a figure that does not survive contact with real hardware is a figure this site would rather fix than defend, and three benchmark rows have already been removed for exactly that reason.`,
            zh: `先检查三件事：上下文长度（本站默认 ${CTX / 1024}K，KV 缓存随它增长）、你的显卡是不是同时还在驱动显示器、以及你下载的构建是不是同一个量化档位（而不只是同一个名义位宽）。如果仍然对不上，那值得反馈 —— 一个经不起真实硬件检验的数字，本站宁愿改掉也不愿辩护，此前已经有三条基准数据正是因此被删除。`,
          },
          link: { href: '/about/', label: { en: 'How to report it', zh: '怎么反馈' } },
        },
      ],
    },
  ];
}

/** The four broadest questions, for the homepage block. */
export function homeFaqIds(): string[] {
  return ['vram-7b', 'vram-24b-16gb', 'quality-4bit', 'gguf-or-awq'];
}
