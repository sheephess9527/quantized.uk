import { MetadataRoute } from 'next';
import { models } from '@/lib/data/models';
import { articles } from '@/lib/data/cookbook';

const BASE = 'https://quantized.uk';

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
  ];

  const modelPages = models.map(m => `/quant-hub/${m.id}/`);
  const cookbookPages = articles.map(a => `/cookbook/${a.id}/`);

  return [...staticPages, ...modelPages, ...cookbookPages].map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date('2026-06-24'),
    changeFrequency: path.includes('quant-hub/') && path !== '/quant-hub/'
      ? 'weekly' as const
      : path.startsWith('/cookbook/') && path !== '/cookbook/'
        ? 'monthly' as const
        : 'monthly' as const,
    priority: path === '' ? 1 : path.startsWith('/tools/') ? 0.9 : path.startsWith('/cookbook/') ? 0.8 : 0.7,
  }));
}