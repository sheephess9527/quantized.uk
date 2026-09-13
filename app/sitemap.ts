import { MetadataRoute } from 'next';
import { models } from '@/lib/data/models';
import { articles } from '@/lib/data/cookbook';
import { dataLastUpdated } from '@/lib/data/meta';
import { gpuDatabase } from '@/lib/data/gpus';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { formatPairs } from '@/lib/utils/format-compare';
import { FORMAT_PAGES } from '@/lib/utils/format-page';
import { BEST_TIERS } from '@/lib/utils/best-page';
import { canonical, languageAlternates } from '@/lib/seo';
import { toZhPath } from '@/lib/i18n/routing';

// `/tools/`, `/changelog/`, `/faq/` shipped as real pages and were never added
// here, so pages existed that the sitemap did not mention. Adding a route
// means adding it in three places: the route, its `/zh` mirror, and the
// entries below.
export default function sitemap(): MetadataRoute.Sitemap {
  // A sitemap where every URL claims the same lastmod carries no information —
  // crawlers discount it. Each entry reports the date that page's own content
  // actually changed: addedAt for models, verifiedAt (else publishedAt) for
  // guides, and the site-wide data date only for pages driven by it.
  const siteDate = new Date(dataLastUpdated);

  // `/legal/` and `/privacy/` are hand-written pages that do not move with a
  // data ship — they should not claim `siteDate` just because the site
  // rebuilt. Real last-touched dates (from `git log -1` on each source file);
  // bump the date here, not `siteDate`, when the page's own text changes.
  const LEGAL_LASTMOD = new Date('2026-08-18');
  const PRIVACY_LASTMOD = new Date('2026-08-18');

  type Entry = { path: string; lastModified: Date; changeFrequency: 'yearly' | 'monthly' | 'weekly'; priority: number };

  // QTZ-027: priority/changefreq tiers, checked against the page's own weight
  // in the site rather than left uniform. Google treats both as a weak signal
  // at best, but a sitemap where every URL claims the same values is the same
  // "carries no information" problem as a uniform lastmod.
  const HUB_INDEX: Entry[] = [
    { path: '/quant-hub/', lastModified: siteDate, changeFrequency: 'weekly', priority: 0.9 },
    { path: '/gpu/', lastModified: siteDate, changeFrequency: 'weekly', priority: 0.9 },
    { path: '/best/', lastModified: siteDate, changeFrequency: 'weekly', priority: 0.9 },
  ];
  const CONTENT_INDEX: Entry[] = [
    { path: '/benchmarks/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/cookbook/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/faq/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/formats/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools/vram-calc/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools/cli-gen/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools/format-wizard/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools/compare/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const entries: Entry[] = [
    { path: '', lastModified: siteDate, changeFrequency: 'weekly', priority: 1 },
    ...HUB_INDEX,
    ...CONTENT_INDEX,
    { path: '/changelog/', lastModified: siteDate, changeFrequency: 'weekly', priority: 0.5 },
    { path: '/about/', lastModified: siteDate, changeFrequency: 'monthly', priority: 0.4 },
    { path: '/legal/', lastModified: LEGAL_LASTMOD, changeFrequency: 'yearly', priority: 0.2 },
    { path: '/privacy/', lastModified: PRIVACY_LASTMOD, changeFrequency: 'yearly', priority: 0.2 },
    ...models.map(m => ({
      path: `/quant-hub/${m.id}/`,
      lastModified: m.addedAt ? new Date(m.addedAt) : siteDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // GPU landing pages: derived entirely from data that already existed, so
    // they carry the site date rather than a date of their own.
    ...gpuDatabase.map(g => ({
      path: `/gpu/${gpuSlug(g)}/`,
      lastModified: siteDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Both kinds of page under /formats/: the pairwise comparisons and the
    // single-format explainers. They share one dynamic route, so it is easy to
    // add one and list only the other — which is exactly what happened.
    ...BEST_TIERS.map(t => ({
      path: `/best/${t.slug}/`,
      lastModified: siteDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...FORMAT_PAGES.map(f => ({
      path: `/formats/${f.id}/`,
      lastModified: siteDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...formatPairs.map(p => ({
      path: `/formats/${p.slug}/`,
      lastModified: siteDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...articles.map(a => ({
      path: `/cookbook/${a.id}/`,
      lastModified: new Date(a.verifiedAt ?? a.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  // Both language trees are listed, and every entry carries the full hreflang
  // set. Listing only one side makes the other look like an orphan duplicate.
  return entries.flatMap(e => {
    const languages = languageAlternates(e.path);
    const common = {
      lastModified: e.lastModified,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
      alternates: { languages },
    };
    return [
      { url: canonical(e.path), ...common },
      { url: canonical(toZhPath(e.path || '/')), ...common },
    ];
  });
}