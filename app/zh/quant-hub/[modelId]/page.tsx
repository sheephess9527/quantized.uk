import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import { canonical, defaultRobots, languageAlternates, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export { generateStaticParams, default } from '../../../quant-hub/[modelId]/page';

export function generateMetadata({ params }: { params: { modelId: string } }): Metadata {
  const model = models.find(m => m.id === params.modelId);
  if (!model) return { title: '未找到该模型 | quantized.uk' };
  const path = `/zh/quant-hub/${model.id}`;
  const url = canonical(path);
  return {
    title: `${model.name} — 量化版本与显存占用 | quantized.uk`,
    description: model.description.zh,
    alternates: { canonical: url, languages: languageAlternates(path) },
    robots: defaultRobots,
    openGraph: {
      title: `${model.name} | quantized.uk`,
      description: model.description.zh,
      url,
      siteName: SITE_NAME,
      images: [OG_IMAGE],
    },
  };
}
