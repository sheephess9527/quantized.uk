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

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/quant-hub/',
    '/benchmarks/',
    '/cookbook/',
    '/faq/',
    '/best/',
    // `/tools/` and `/changelog/` shipped as real pages (2026-09-11) and were
    // never added here, so two pages existed that the sitemap did not mention.
    // Adding a route means adding it in three places: the route, its `/zh`
    // mirror, and this list.
    '/tools/',
    '/changelog/',
    '/tools/vram-calc/',
    '/tools/cli-gen/',
    '/tools/format-wizard/',
    '/tools/compare/',
    '/legal/',
    '/privacy/',
    '/about/',
    '/gpu/',
    '/formats/',
  ];

  // A sitemap where every URL claims the same lastmod carries no information —
  // crawlers discount it. Each entry reports the date that page's own content
  // actually changed: addedAt for models, verifiedAt (else publishedAt) for
  // guides, and the site-wide data date only for pages driven by it.
  const siteDate = new Date(dataLastUpdated);

  type Entry = { path: string; lastModified: Date; changeFrequency: 'weekly' | 'monthly'; priority: number };

  const entries: Entry[] = [
    ...staticPages.map(path => ({
      path,
      lastModified: siteDate,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : path.startsWith('/tools/') ? 0.9 : 0.7,
    })),
    ...models.map(m => ({
      path: `/quant-hub/${m.id}/`,
      lastModified: m.addedAt ? new Date(m.addedAt) : siteDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    // GPU landing pages: derived entirely from data that already existed, so
    // they carry the site date rather than a date of their own.
    ...gpuDatabase.map(g => ({
      path: `/gpu/${gpuSlug(g)}/`,
      lastModified: siteDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
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
      priority: 0.8,
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