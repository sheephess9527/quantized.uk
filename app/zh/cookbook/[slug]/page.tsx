import type { Metadata } from 'next';
import { articles } from '@/lib/data/cookbook';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';
import { readingMinutes } from '@/lib/utils/reading-time';
import CookbookArticlePage from '../../../cookbook/[slug]/page';

export { generateStaticParams } from '../../../cookbook/[slug]/page';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高阶',
};

/** Same component as the English route, told which language it is rendering in. */
export default function ZhCookbookArticlePage({ params }: { params: { slug: string } }) {
  return <CookbookArticlePage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(a => a.id === params.slug);
  if (!article) return { title: '未找到该指南 | quantized.uk' };
  const path = `/zh/cookbook/${article.id}`;
  const url = canonical(path);
  const ogAlt = `${article.titleZh}：${DIFFICULTY_LABEL[article.difficulty]}，${readingMinutes(article, 'zh')} 分钟阅读 | quantized.uk`;
  return {
    title: `${article.titleZh} | quantized.uk`,
    description: article.descriptionZh,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: {
      title: article.titleZh,
      description: article.descriptionZh,
      url,
      siteName: SITE_NAME,
      type: 'article',
      images: [pageOgImage(path, ogAlt)],
      ...ogLocale(path),
    },
  };
}
