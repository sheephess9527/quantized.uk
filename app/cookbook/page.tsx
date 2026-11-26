import { articles } from '@/lib/data/cookbook';
import { readingMinutes } from '@/lib/utils/reading-time';
import CookbookIndexContent, { type CookbookCardSummary } from '@/components/cookbook/CookbookIndexContent';

const ITEMS: CookbookCardSummary[] = articles.map(a => ({
  id: a.id,
  title: a.title,
  titleZh: a.titleZh,
  description: a.description,
  descriptionZh: a.descriptionZh,
  category: a.category,
  difficulty: a.difficulty,
  tags: a.tags,
  readMin: {
    en: readingMinutes(a, 'en'),
    zh: readingMinutes(a, 'zh'),
  },
}));

export default function CookbookPage() {
  return <CookbookIndexContent items={ITEMS} />;
}