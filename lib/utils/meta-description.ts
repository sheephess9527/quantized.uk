import type { QuantModel } from '@/lib/data/types';
import type { GPU } from '@/lib/data/gpus';
import type { Article } from '@/lib/data/cookbook';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { DESCRIPTION_BUDGET, displayWidth, extendDescription, fitDescription, modelPageDescription } from '@/lib/seo';
import { isSuperseded } from '@/lib/utils/model-meta';
import { referenceQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { sizeAt, REF_CONTEXT, cardsFitting } from '@/lib/utils/model-explainer';
import { countModelsFitting, gpuPageDescription } from '@/lib/utils/gpu-page';

/**
 * Meta descriptions for the three derived page sets, lengthened with facts the
 * page itself states when the editorial text alone is short. Each extra is
 * computed from the same functions the page renders from, so the snippet
 * cannot say something the page does not.
 */

type Lang = 'en' | 'zh';

/** 262144 → "256K", 1048576 → "1M". */
function contextLabel(tokens: number): string {
  const k = tokens / 1024;
  return k >= 1024 ? `${+(k / 1024).toFixed(1)}M` : `${Math.round(k)}K`;
}

export function modelMetaDescription(model: QuantModel, lang: Lang): string {
  const ref = referenceQuant(model.quants);
  const total = sizeAt(model, ref.bpw, REF_CONTEXT).totalGB;
  const smallest = cardsFitting(total, ref.format)[0];
  const level = quantLevelKey(ref);
  const ctx = contextLabel(model.contextLength);
  const fitted = modelPageDescription(model.description[lang], isSuperseded(model), lang);
  // `fitDescription` keeps whole sentences, so a first sentence that is itself over the budget comes
  // back too long and failed the build on two model batches (2026-11-10, 11-12). Lead with a derived
  // sentence instead of asking whoever adds the model to re-write its description for the meta tag.
  const base = displayWidth(fitted) <= DESCRIPTION_BUDGET
    ? fitted
    : lang === 'zh'
      ? `${model.name} 是 ${model.family} 系列的 ${model.paramLabel} 模型。`
      : `${model.name} is a ${model.paramLabel} model in the ${model.family} family.`;
  return lang === 'zh'
    ? extendDescription(base, [
        `在 ${level}、4K 上下文下约需 ${total.toFixed(1)} GB。`,
        smallest ? `能从容运行它的最小显卡：${smallest.name}。` : '本索引中没有单卡能从容运行它。',
        `原生上下文 ${ctx}。`,
      ], 'zh')
    : extendDescription(base, [
        `About ${total.toFixed(1)} GB at ${level} with 4K context.`,
        smallest ? `Smallest card that runs it comfortably: ${smallest.name}.` : 'No single card in this index runs it comfortably.',
        `Native context ${ctx}.`,
      ], 'en');
}

export function gpuMetaDescription(gpu: GPU, lang: Lang): string {
  const comfortable = countModelsFitting(gpu, 'comfortable');
  const tight = countModelsFitting(gpu, 'tight') - comfortable;
  const extras: string[] = [];
  if (tight > 0) extras.push(lang === 'zh' ? `另有 ${tight} 个勉强能装下。` : `${tight} more fit only tightly.`);
  if (gpu.bandwidth) {
    extras.push(lang === 'zh'
      ? `显存带宽 ${gpu.bandwidth} GB/s，决定生成速度的上限。`
      : `Its ${gpu.bandwidth} GB/s bandwidth sets the speed ceiling.`);
  }
  return extendDescription(gpuPageDescription(gpu, lang), extras, lang);
}

function listNames(names: string[], lang: Lang): string {
  if (lang === 'zh') return names.join('、');
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function articleMetaDescription(article: Article, lang: Lang): string {
  const base = fitDescription(lang === 'zh' ? article.descriptionZh : article.description, lang);
  const extras: (string | string[])[] = [];

  const card = article.gpuPreset && gpuDatabase.find(g => g.id === article.gpuPreset!.gpuId);
  if (card) extras.push(lang === 'zh' ? `按 ${card.name} 计算。` : card.isCPU ? `Sized for ${card.name}.` : `Sized for the ${card.name}.`);

  const names = (article.relatedModelIds ?? [])
    .map(id => models.find(m => m.id === id)?.name)
    .filter((n): n is string => !!n);
  if (names.length) {
    // Longest list first; fall back to fewer names when the budget is tight.
    extras.push([3, 2, 1].filter(n => n <= names.length).map(n =>
      lang === 'zh' ? `涉及 ${listNames(names.slice(0, n), lang)}。` : `Covers ${listNames(names.slice(0, n), lang)}.`));
  }

  if (article.verifiedStack) {
    extras.push(lang === 'zh' ? `基于 ${article.verifiedStack.zh} 编写。` : `Written against ${article.verifiedStack.en}.`);
  }

  const faqs = article.faqs?.length ?? 0;
  if (faqs > 0) extras.push(lang === 'zh' ? `附 ${faqs} 个常见问题。` : `Includes ${faqs} FAQs.`);

  return extendDescription(base, extras, lang);
}
