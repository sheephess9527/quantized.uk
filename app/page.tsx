import HeroSection from '@/components/home/HeroSection';
import HomeMatch from '@/components/home/HomeMatch';
import PopularStarts from '@/components/home/PopularStarts';
import JobPaths from '@/components/home/JobPaths';
import StatsBar from '@/components/home/StatsBar';
import MeasuredCases from '@/components/home/MeasuredCases';
import TodayBoard from '@/components/home/TodayBoard';
import QuickAccess from '@/components/home/QuickAccess';
import ExploreStrip from '@/components/home/ExploreStrip';
import DataChangelog from '@/components/home/DataChangelog';
import DataFreshness from '@/components/home/DataFreshness';
import WeeklyUpdates from '@/components/home/WeeklyUpdates';
import MaintainerNote from '@/components/home/MaintainerNote';
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
      {/*
        Ordered as the reader's questions arrive, not as the site's inventory:

          1. what is this, and what do I put in     — HeroSection
          2. what fits my card                      — HomeMatch
          3. I would rather just click something    — PopularStarts + JobPaths
          4. why should I believe these numbers     — StatsBar + MeasuredCases
          5. is this still maintained               — WeeklyUpdates + TodayBoard
          6. something is wrong, who do I tell      — MaintainerNote

        The format heat index and the six-axis radar used to sit at 4; they are
        editorial context about formats rather than evidence, and now live on
        /formats/ next to the pairwise comparisons. The full changelog stays on
        this page — collapsed — because `#changelog` is linked from the hero,
        the About page and off-site.
      */}
      <HeroSection />
      <HomeMatch />
      <StatsBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-6 pb-16">
        <PopularStarts />
        <JobPaths />

        <MeasuredCases />

        <div className="flex justify-end">
          <DataFreshness />
        </div>
        <WeeklyUpdates />
        <TodayBoard />

        <MaintainerNote />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickAccess />
          </div>
          <div className="lg:col-span-2">
            <ExploreStrip />
          </div>
        </div>

        <DataChangelog />
      </div>
    </>
  );
}
