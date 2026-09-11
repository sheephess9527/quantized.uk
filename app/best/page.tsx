import type { Metadata } from 'next';
import BestHubContent from '@/components/best/BestHubContent';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/best';
  const url = canonical(path);
  const title = `Best local LLMs by hardware — the 2026 picks | quantized.uk`;
  const description = `One recommendation per memory budget, computed from an index of ${models.length} quantized models and ${gpuDatabase.length} GPUs: the model to run for general use, coding and images at 8, 12, 16, 24 and 32GB, and on Apple silicon — with the VRAM each one needs.`;
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
