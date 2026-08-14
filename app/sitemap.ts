import { MetadataRoute } from 'next';
import { models } from '@/lib/data/models';
import { articles } from '@/lib/data/cookbook';
import { dataLastUpdated } from '@/lib/data/meta';
import { canonical, languageAlternates } from '@/lib/seo';
import { toZhPath } from '@/lib/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/quant-hub/',
    '/benchmarks/',
    '/cookbook/',
    '/tools/vram-calc/',
    '/tools/cli-gen/',
    '/tools/format-wizard/',
    '/tools/compare/',
    '/legal/',
    '/privacy/',
    '/about/',
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