import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { articles } from '@/lib/data/cookbook';
import { localizeHref } from '@/lib/i18n/routing';
import type { Lang } from '@/lib/i18n/translations';

/** Standard edit-distance DP — every candidate slug here is under 30 characters, so this is cheap. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[n];
}

export interface NotFoundSuggestion {
  label: string;
  href: string;
}

interface Candidate {
  label: string;
  href: string;
  slug: string;
}

/**
 * QTZ-030: a missing page's last path segment is usually an almost-right
 * guess at a real slug (`/quant-hub/qwen3-8` for `qwen3-8b`), not a random
 * string. Matched against every model, GPU and guide slug this index has —
 * language only changes the label shown, never what is compared, since
 * slugs themselves are not translated.
 */
export function notFoundSuggestions(requestedPath: string, lang: Lang): NotFoundSuggestion[] {
  const segments = requestedPath.split('/').filter(Boolean);
  const slug = (segments[segments.length - 1] ?? '').toLowerCase();
  if (slug.length < 2) return [];

  const candidates: Candidate[] = [
    ...models.map(m => ({ label: m.name, href: `/quant-hub/${m.id}/`, slug: m.id })),
    ...gpuDatabase.map(g => ({ label: g.name, href: `/gpu/${gpuSlug(g)}/`, slug: gpuSlug(g) })),
    ...articles.map(a => ({ label: lang === 'zh' ? a.titleZh : a.title, href: `/cookbook/${a.id}/`, slug: a.id })),
  ];

  const threshold = Math.max(2, Math.ceil(slug.length * 0.45));
  return candidates
    .map(c => ({ ...c, dist: levenshtein(slug, c.slug.toLowerCase()) }))
    .filter(c => c.dist <= threshold)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map(c => ({ label: c.label, href: localizeHref(c.href, lang) }));
}
