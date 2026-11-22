import HomeContent from '@/components/home/HomeContent';
import type { Metadata } from 'next';
import { canonical, defaultRobots, feedAlternates, languageAlternates, MODEL_COUNT, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

/**
 * The English homepage needs its own metadata. It used to fall through to the
 * root layout, which sets `alternates.canonical` but no `languages` — so `/`
 * was the one page on the site with no hreflang at all, while `/zh/` pointed
 * at it. A one-way pair reads as duplicate content, not a translation.
 */
export const metadata: Metadata = {
  // Written as the question a reader types, not as a description of the site.
  // It was `quantized.uk — AI Quantization Intelligence`: brand first, and
  // "AI Quantization Intelligence" is a phrase nobody searches for. The `<h1>`
  // has asked "what fits your hardware" since the homepage was restructured;
  // the title now says the same thing.
  title: `What LLM fits my GPU? — ${MODEL_COUNT}-model VRAM index | quantized.uk`,
  description: `Pick your graphics card and see which of ${MODEL_COUNT} quantized LLMs actually fit it — at which quant level, with how much VRAM spare, and the command to run each.`,
  alternates: { canonical: canonical('/'), languages: languageAlternates('/'), ...feedAlternates('/') },
  robots: defaultRobots,
  openGraph: {
    title: `What LLM can my GPU run? — quantized.uk`,
    description: `Which of ${MODEL_COUNT} quantized models fit your card, at what quant level, with how much VRAM to spare.`,
    url: canonical('/'),
    siteName: SITE_NAME,
    type: 'website',
    images: [OG_IMAGE],
    ...ogLocale('/'),
  },
};

export default function HomePage() {
  return <HomeContent lang="en" />;
}
