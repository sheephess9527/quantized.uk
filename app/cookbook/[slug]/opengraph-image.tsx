import { articles } from '@/lib/data/cookbook';
import { readingMinutes } from '@/lib/utils/reading-time';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk cookbook guide';
export const size = OG_SIZE;
export const contentType = 'image/png';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.id }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.id === params.slug);
  if (!article) {
    return renderOgImage({ eyebrow: 'Guide', title: 'Not found', stats: [] });
  }
  const minutes = readingMinutes(article, 'en');
  return renderOgImage({
    eyebrow: 'Guide',
    title: article.title,
    stats: [
      `${DIFFICULTY_LABEL[article.difficulty]} · ${minutes} min read`,
      ...(article.tags[0] ? [article.tags[0]] : []),
    ],
  });
}
