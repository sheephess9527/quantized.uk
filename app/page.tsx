import HeroSection from '@/components/home/HeroSection';
import JobPaths from '@/components/home/JobPaths';
import StatsBar from '@/components/home/StatsBar';
import TodayBoard from '@/components/home/TodayBoard';
import FormatHeatmap from '@/components/home/FormatHeatmap';
import QuickAccess from '@/components/home/QuickAccess';
import FormatRadar from '@/components/home/FormatRadarLazy';
import ExploreStrip from '@/components/home/ExploreStrip';
import DataChangelog from '@/components/home/DataChangelog';
import DataFreshness from '@/components/home/DataFreshness';
import WeeklyUpdates from '@/components/home/WeeklyUpdates';
import type { Metadata } from 'next';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

/**
 * The English homepage needs its own metadata. It used to fall through to the
 * root layout, which sets `alternates.canonical` but no `languages` — so `/`
 * was the one page on the site with no hreflang at all, while `/zh/` pointed
 * at it. A one-way pair reads as duplicate content, not a translation.
 */
export const metadata: Metadata = {
  title: 'quantized.uk — AI Quantization Intelligence',
  description:
    'Bridge the gap between research papers and real-world LLM deployment. VRAM calculator, CLI script generator, quantized model hub, and benchmarks.',
  alternates: { canonical: canonical('/'), languages: languageAlternates('/'), ...feedAlternates('/') },
  robots: defaultRobots,
  openGraph: {
    title: 'quantized.uk — AI Quantization Intelligence',
    description: 'Run state-of-the-art LLMs on consumer hardware. VRAM calculator, CLI generator, model hub.',
    url: canonical('/'),
    siteName: SITE_NAME,
    type: 'website',
    images: [OG_IMAGE],
    ...ogLocale('/'),
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <JobPaths />
      <StatsBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-6 pb-16">
        <div className="flex justify-end">
          <DataFreshness />
        </div>

        <WeeklyUpdates />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodayBoard />
          </div>
          <div className="lg:col-span-1">
            <FormatHeatmap />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickAccess />
          </div>
          <div className="lg:col-span-2">
            <FormatRadar />
          </div>
        </div>

        <ExploreStrip />
        <DataChangelog />
      </div>
    </>
  );
}
