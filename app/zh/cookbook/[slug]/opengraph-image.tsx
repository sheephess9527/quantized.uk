import { articles } from '@/lib/data/cookbook';
import { readingMinutes } from '@/lib/utils/reading-time';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk 部署指南';
export const size = OG_SIZE;
export const contentType = 'image/png';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高阶',
};

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.id }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.id === params.slug);
  if (!article) {
    return renderOgImage({ eyebrow: '指南', title: '未找到', stats: [] });
  }
  const minutes = readingMinutes(article, 'zh');
  return renderOgImage({
    eyebrow: '指南',
    title: article.titleZh,
    stats: [
      `${DIFFICULTY_LABEL[article.difficulty]} · ${minutes} 分钟阅读`,
      ...(article.tags[0] ? [article.tags[0]] : []),
    ],
  });
}
