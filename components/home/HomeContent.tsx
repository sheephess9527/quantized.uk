import HeroSection from '@/components/home/HeroSection';
import { changelog } from '@/lib/data/changelog';
import { articles } from '@/lib/data/cookbook';
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
import type { Lang } from '@/lib/i18n/translations';

export default function HomeContent({ lang }: { lang: Lang }) {
  return (
    <>
      {/*
        Ordered as the reader's questions arrive, not as the site's inventory:

          1. what is this, and what do I put in     — HeroSection
          2. what fits my card                      — HomeMatch
          2b. what is new since I last looked       — WeeklyUpdates (models + hardware)
          3. I would rather just click something    — PopularStarts + JobPaths
          4. why should I believe these numbers     — StatsBar + MeasuredCases
          5. is this still maintained               — TodayBoard
          5b. the thing I actually came to ask     — HomeFaq
          6. something is wrong, who do I tell      — MaintainerNote

        The format heat index and the six-axis radar used to sit at 4; they are
        editorial context about formats rather than evidence, and now live on
        /formats/ next to the pairwise comparisons. The full changelog stays on
        this page — collapsed — because `#changelog` is linked from the hero,
        the About page and off-site.
      */}
      <HeroSection latestDate={changelog[0]?.date} lang={lang} />
      <HomeMatch />
      <StatsBar lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-12 pb-16">
        {/* Act 1: Freshness & Latest Index Additions + Editor's Picks side-by-side on wide screens */}
        <div className="space-y-4">
          <div className="flex justify-end">
            <DataFreshness lang={lang} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <div className="xl:col-span-7">
              <WeeklyUpdates lang={lang} />
            </div>
            <div className="xl:col-span-5">
              <TodayBoard lang={lang} />
            </div>
          </div>
        </div>

        {/* Act 2: Curated Hardware & Task Entry Points */}
        <div className="space-y-6 pt-4 border-t border-white/[0.05]">
          <PopularStarts lang={lang} />
          <JobPaths />
        </div>

        {/* Act 3: Measured Hardware Evidence */}
        <div className="pt-4 border-t border-white/[0.05]">
          <MeasuredCases lang={lang} />
        </div>

        {/* Act 4: Core FAQs & Site Navigation */}
        <div className="space-y-6 pt-4 border-t border-white/[0.05]">
          <HomeFaq lang={lang} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <QuickAccess lang={lang} />
            </div>
            <div className="lg:col-span-2">
              <ExploreStrip guideCount={articles.length} lang={lang} />
            </div>
          </div>
        </div>

        {/* Act 5: Transparency, Contact & Changelog */}
        <div className="space-y-6 pt-4 border-t border-white/[0.05]">
          <MaintainerNote />
          <DataChangelog latest={changelog[0]} total={changelog.length} lang={lang} />
        </div>
      </div>
    </>
  );
}
