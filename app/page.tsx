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
import HomeFaq from '@/components/home/HomeFaq';
import MaintainerNote from '@/components/home/MaintainerNote';
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
  description: `Pick your graphics card and see which of ${MODEL_COUNT} quantized LLMs actually fit it — at which quant level, with how much VRAM to spare, and the command to run each one.`,
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
  return (
    <>
      {/*
        Ordered as the reader's questions arrive, not as the site's inventory:

          1. what is this, and what do I put in     — HeroSection
          2. what fits my card                      — HomeMatch
          3. I would rather just click something    — PopularStarts + JobPaths
          4. why should I believe these numbers     — StatsBar + MeasuredCases
          5. is this still maintained               — WeeklyUpdates + TodayBoard
          5b. the thing I actually came to ask     — HomeFaq
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

        <HomeFaq />

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
