import { MetadataRoute } from 'next';
import { models } from '@/lib/data/models';

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
  ];

  const modelPages = models.map(m => `/quant-hub/${m.id}/`);

  return [...staticPages, ...modelPages].map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date('2026-06-24'),
    changeFrequency: path.includes('quant-hub/') && path !== '/quant-hub/' ? 'weekly' as const : 'monthly' as const,
    priority: path === '' ? 1 : path.startsWith('/tools/') ? 0.9 : path.includes('[modelId]') ? 0.8 : 0.7,
  }));
}