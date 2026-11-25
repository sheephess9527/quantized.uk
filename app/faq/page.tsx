import type { Metadata } from 'next';
import FaqView from '@/components/faq/FaqView';
import { models } from '@/lib/data/models';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/faq';
  const url = canonical(path);
  const title = 'Local LLM FAQ: VRAM and quantization | quantized.uk';
  const description = `Before downloading a 20GB model: how much VRAM you need, what Q4 costs in quality, and which format your runtime reads — computed from ${models.length} models.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

export default function FaqPage() {
  return <FaqView lang="en" />;
}
