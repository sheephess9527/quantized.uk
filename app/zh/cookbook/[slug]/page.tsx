import type { Metadata } from 'next';
import { articles } from '@/lib/data/cookbook';
import { canonical, defaultRobots, languageAlternates, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export { generateStaticParams, default } from '../../../cookbook/[slug]/page';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(a => a.id === params.slug);
  if (!article) return { title: '未找到该指南 | quantized.uk' };
  const path = `/zh/cookbook/${article.id}`;
  const url = canonical(path);
  return {
    title: `${article.titleZh} | quantized.uk Cookbook`,
    description: article.descriptionZh,
    alternates: { canonical: url, languages: languageAlternates(path) },
    robots: defaultRobots,
    openGraph: {
      title: article.titleZh,
      description: article.descriptionZh,
      url,
      siteName: SITE_NAME,
      type: 'article',
      images: [OG_IMAGE],
    },
  };
}
