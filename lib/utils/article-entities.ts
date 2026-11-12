import type { Article } from '@/lib/data/cookbook';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { canonical } from '@/lib/site';

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
 *
 * Both are plain `Thing`s. They were `Product` / `SoftwareApplication`, and
 * Google treats any Product as a product-snippet candidate that must carry
 * offers, review or aggregateRating — Search Console flagged it (2026-10-31).
 * This site sells nothing and has no ratings, so the honest type is the
 * untyped one; the postbuild gate now fails on either without them.
 */
export function articleEntities(article: Article, lang: 'en' | 'zh') {
  const prefix = lang === 'zh' ? '/zh' : '';

  const gpu = article.gpuPreset ? gpuDatabase.find(g => g.id === article.gpuPreset!.gpuId) : undefined;
  const about = gpu
    ? [{ '@type': 'Thing', name: gpu.name, description: 'Computer hardware' }]
    : undefined;

  const mentioned = (article.relatedModelIds ?? [])
    .map(id => models.find(m => m.id === id))
    .filter((m): m is (typeof models)[number] => m !== undefined)
    .map(m => ({
      '@type': 'Thing',
      name: m.name,
      url: canonical(`${prefix}/quant-hub/${m.id}`),
    }));

  return {
    ...(about ? { about } : {}),
    ...(mentioned.length ? { mentions: mentioned } : {}),
  };
}
