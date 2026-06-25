import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import TodayBoard from '@/components/home/TodayBoard';
import FormatHeatmap from '@/components/home/FormatHeatmap';
import QuickAccess from '@/components/home/QuickAccess';
import FormatRadar from '@/components/home/FormatRadar';
import ExploreStrip from '@/components/home/ExploreStrip';
import DataChangelog from '@/components/home/DataChangelog';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-6 pb-16">
        {/* Row 1: Today feed + Format heat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodayBoard />
          </div>
          <div className="lg:col-span-1">
            <FormatHeatmap />
          </div>
        </div>

        {/* Row 2: Quick tools + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickAccess />
          </div>
          <div className="lg:col-span-2">
            <FormatRadar />
          </div>
        </div>

        {/* Row 3: Site explore */}
        <ExploreStrip />

        {/* Row 4: Data changelog */}
        <DataChangelog />
      </div>
    </>
  );
}
