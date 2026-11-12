import { models, type QuantModel } from '@/lib/data/models';

function paramBucket(params: number): string {
  if (params <= 3.5) return 'small';
  if (params <= 8.5) return '7B';
  if (params <= 16) return '14B';
  if (params <= 40) return '32B';
  return '70B+';
}

function similarityScore(a: QuantModel, b: QuantModel): number {
  if (a.id === b.id) return -1;
  let score = 0;
  if (a.family === b.family) score += 10;
  if (paramBucket(a.params) === paramBucket(b.params)) score += 5;
  score += a.categories.filter(c => b.categories.includes(c)).length * 2;
  score += a.hardwareTags.filter(h => b.hardwareTags.includes(h)).length;
  return score;
}

export function getSimilarModels(modelId: string, limit = 4): QuantModel[] {
  const current = models.find(m => m.id === modelId);
  if (!current) return [];

  return models
    .map(m => ({ model: m, score: similarityScore(current, m) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ model }) => model);
}
