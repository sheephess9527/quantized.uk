import type { Metadata } from 'next';
import BestHubContent from '@/components/best/BestHubContent';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/best';
  const url = canonical(path);
  const title = `Best local LLMs by hardware — the 2026 picks | quantized.uk`;
  const description = `What to run at 8, 12, 16, 24 and 32GB and on Apple silicon: one pick per budget for chat, coding and images, from ${models.length} models and ${gpuDatabase.length} GPUs.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

export default function BestHubPage() {
  return <BestHubContent />;
}
