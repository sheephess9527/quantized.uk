import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import FormatComparePage from '../../../formats/[slug]/page';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { modelsWithFormat, pairBySlug } from '@/lib/utils/format-compare';
import { formatById } from '@/lib/utils/format-page';

export { generateStaticParams } from '../../../formats/[slug]/page';

export default function ZhFormatComparePage({ params }: { params: { slug: string } }) {
  return <FormatComparePage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const single = formatById(params.slug);
  if (single) {
    const path = `/zh/formats/${params.slug}`;
    const url = canonical(path);
    const owning = modelsWithFormat(single.name).length;
    const title = `${single.name} 量化格式详解 —— 它是什么、谁能读、要多少显存 | quantized.uk`;
    const description = `${single.name} 需要 ${single.hardwareReq}，由 ${single.framework} 读取。本页说明这个格式是什么、本索引收录了哪些量化档位、显存开销如何，并列出 ${models.length} 个模型中提供该格式的全部 ${owning} 个。`;
    return {
      title,
      description,
      alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
      robots: defaultRobots,
      openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
    };
  }
  const pair = pairBySlug(params.slug);
  if (!pair) return { title: '未找到该对比 | quantized.uk' };
  const path = `/zh/formats/${params.slug}`;
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
