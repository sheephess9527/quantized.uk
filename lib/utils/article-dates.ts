import type { Article } from '@/lib/data/cookbook';

/**
 * The last date a guide changed: the latest of published, content-updated and
 * commands-re-run. One helper for the visible byline, `dateModified` and the
 * sitemap — the sitemap used to ignore `updatedAt`, so 17 rewritten guides
 * reported their 2025 publish date as their last change.
 */
export function articleModifiedAt(a: Article): string {
  return [a.publishedAt, a.updatedAt, a.verifiedAt]
    .filter((d): d is string => !!d)
    .sort()
    .at(-1)!;
}
