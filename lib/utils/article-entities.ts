import type { Article } from '@/lib/data/cookbook';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { canonical } from '@/lib/seo';

/**
 * `about` and `mentions` for a cookbook guide's Article schema.
 *
 * Built only from `relatedModelIds` and `gpuPreset` — the two fields the guide
 * already uses to render its own links — so the entity list cannot claim the
 * page is about something it never names. A guide with neither gets neither
 * property rather than an empty array.
 *
 * `about` is the subject; `mentions` are the things named in passing. Here the
 * hardware a guide targets is its subject (these are deployment guides for a
 * class of machine) and the models it routes readers to are mentions.
 */
export function articleEntities(article: Article, lang: 'en' | 'zh') {
  const prefix = lang === 'zh' ? '/zh' : '';

  const gpu = article.gpuPreset ? gpuDatabase.find(g => g.id === article.gpuPreset!.gpuId) : undefined;
  const about = gpu
    ? [{ '@type': 'Product', name: gpu.name, category: 'Computer hardware' }]
    : undefined;

  const mentioned = (article.relatedModelIds ?? [])
    .map(id => models.find(m => m.id === id))
    .filter((m): m is (typeof models)[number] => m !== undefined)
    .map(m => ({
      '@type': 'SoftwareApplication',
      name: m.name,
      applicationCategory: 'DeveloperApplication',
      url: canonical(`${prefix}/quant-hub/${m.id}`),
    }));

  return {
    ...(about ? { about } : {}),
    ...(mentioned.length ? { mentions: mentioned } : {}),
  };
}
