'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import ModelCard from '@/components/hub/ModelCard';
import FilterBar, { HubFilters } from '@/components/hub/FilterBar';
import Link from 'next/link';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { getRecommendations } from '@/lib/utils/recommend';
import { cn } from '@/lib/utils/cn';

export default function QuantHubPage() {
  const { t, lang } = useLanguage();
  const { gpu, hasProfile } = useHardwareProfile();
  const [applyProfileFilter, setApplyProfileFilter] = useState(true);
  const [filters, setFilters] = useState<HubFilters>({
    search: '', paramRange: '', category: '', hardware: '', format: '',
  });

  const profileModelIds = useMemo(() => {
    if (!gpu) return null;
    const recs = getRecommendations(gpu.vram, 4096, 1, 'quality', true);
    return new Set(recs.map(r => r.model.id));
  }, [gpu]);

  const compatibleCount = profileModelIds?.size ?? models.length;

  const filtered = useMemo(() => {
    const useProfile = applyProfileFilter && profileModelIds;
    return models.filter(m => {
      if (useProfile && !profileModelIds!.has(m.id)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.family.toLowerCase().includes(q)) return false;
      }
      if (filters.paramRange) {
        const p = m.params;
        if (filters.paramRange === '≤3B'  && p > 3)   return false;
        if (filters.paramRange === '7B'   && (p <= 3 || p > 9))   return false;
        if (filters.paramRange === '14B'  && (p <= 9 || p > 20))  return false;
        if (filters.paramRange === '32B'  && (p <= 20 || p > 50)) return false;
        if (filters.paramRange === '70B+' && p <= 50) return false;
      }
      if (filters.category && !m.categories.includes(filters.category)) return false;
      if (filters.hardware && !m.hardwareTags.includes(filters.hardware)) return false;
      if (filters.format  && !m.quants.some(q => q.format === filters.format)) return false;
      return true;
    });
  }, [filters, profileModelIds, applyProfileFilter]);

  const total = models.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.hub.title}</h1>
        <p className="text-slate-400">
          {t.hub.subtitle}
          <span className="text-slate-500"> · </span>
          <span className="text-violet-400/80">{t.hub.indexedCount.replace('{total}', String(total))}</span>
        </p>
      </div>

      {hasProfile && gpu && (
        <div className="mb-6 glass rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {applyProfileFilter
              ? t.hub.profileFilter
                  .replace('{count}', String(compatibleCount))
                  .replace('{total}', String(total))
                  .replace('{gpu}', gpu.name)
              : t.hub.profileFilterAll.replace('{total}', String(total))}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setApplyProfileFilter(v => !v)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                applyProfileFilter
                  ? 'text-slate-400 border-white/[0.08] hover:text-slate-200 hover:border-white/15'
                  : 'bg-violet-500/15 text-violet-300 border-violet-500/25'
              )}
            >
              {applyProfileFilter
                ? t.hub.showAllModels.replace('{total}', String(total))
                : t.hub.showGpuMatches}
            </button>
            <Link
              href={`/tools/vram-calc/?mode=reverse&gpu=${gpu.id}&ctx=4096&sort=quality`}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {t.hub.profileLink} →
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          count={filtered.length}
          total={total}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-lg mb-2">{t.hub.noResults}</p>
          <button
            onClick={() => setFilters({ search: '', paramRange: '', category: '', hardware: '', format: '' })}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            {t.hub.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(model => (
            <ModelCard key={model.id} model={model} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}