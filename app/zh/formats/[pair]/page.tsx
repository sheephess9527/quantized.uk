import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import FormatComparePage from '../../../formats/[pair]/page';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { pairBySlug } from '@/lib/utils/format-compare';

export { generateStaticParams } from '../../../formats/[pair]/page';

export default function ZhFormatComparePage({ params }: { params: { pair: string } }) {
  return <FormatComparePage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { pair: string } }): Metadata {
  const pair = pairBySlug(params.pair);
  if (!pair) return { title: '未找到该对比 | quantized.uk' };
  const path = `/zh/formats/${params.pair}`;
  const url = canonical(path);
  const title = `${pair.a.name} 与 ${pair.b.name} 该选哪个量化格式？| quantized.uk`;
  const description = `从硬件支持、运行时、质量与 ${models.length} 个模型的索引实际收录情况对比 ${pair.a.name} 与 ${pair.b.name}，并列出同时提供两种格式的模型。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
  };
}
