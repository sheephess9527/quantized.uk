import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import { canonical, defaultRobots, feedAlternates, languageAlternates, modelPageDescription, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';
import { isSuperseded } from '@/lib/utils/model-meta';
import { bestQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { sizeAt, REF_CONTEXT } from '@/lib/utils/model-explainer';
import ModelDetailPage from '../../../quant-hub/[modelId]/page';

export { generateStaticParams } from '../../../quant-hub/[modelId]/page';

/** Same component as the English route, told which language it is rendering in. */
export default function ZhModelDetailPage({ params }: { params: { modelId: string } }) {
  return <ModelDetailPage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { modelId: string } }): Metadata {
  const model = models.find(m => m.id === params.modelId);
  if (!model) return { title: '未找到该模型 | quantized.uk' };
  const path = `/zh/quant-hub/${model.id}`;
  const url = canonical(path);
  const description = modelPageDescription(model.description.zh, isSuperseded(model), 'zh');
  const quant = bestQuant(model.quants);
  const { totalGB } = sizeAt(model, quant.bpw, REF_CONTEXT);
  const retainedPart = quant.pplLossPercent === undefined ? '' : `，保留 ${(100 - quant.pplLossPercent).toFixed(1)}% 精度`;
  const ogAlt = `${model.name}：${model.paramLabel}，${quantLevelKey(quant)}，${totalGB.toFixed(1)} GB${retainedPart} | quantized.uk`;
  return {
    title: `${model.name} — 量化版本与显存占用 | quantized.uk`,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: {
      title: `${model.name} | quantized.uk`,
      description,
      url,
      siteName: SITE_NAME,
      images: [pageOgImage(path, ogAlt)],
      ...ogLocale(path),
    },
  };
}
