import { articles, type Article } from '@/lib/data/cookbook';

/**
 * Split from `related.ts` (2026-11-12): model pages import `getSimilarModels` from there, and
 * sharing a module with this function put every guide's full text into each model page's bundle.
 */
function relatedScore(current: Article, other: Article): number {
  if (current.id === other.id) return -1;
  let score = 0;
  if (current.category === other.category) score += 5;
  score += current.tags.filter(t => other.tags.includes(t)).length * 2;
  if (current.difficulty === other.difficulty) score += 1;
  return score;
}

export function getRelatedArticles(articleId: string, limit = 3): Article[] {
  const current = articles.find(a => a.id === articleId);
  if (!current) return [];

  return articles
    .map(a => ({ article: a, score: relatedScore(current, a) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}
