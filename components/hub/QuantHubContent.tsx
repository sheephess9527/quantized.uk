'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link2, FileDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import ModelCard from '@/components/hub/ModelCard';
import FilterBar, { HubFilters } from '@/components/hub/FilterBar';
import HubScaleStats from '@/components/hub/HubScaleStats';
import GpuQuickChips from '@/components/hub/GpuQuickChips';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { getRecommendations } from '@/lib/utils/recommend';
import {
  parseHubSearchParams,
  buildHubSearchParams,
  hubShareUrl,
  hasActiveHubFilters,
  EMPTY_HUB_FILTERS,
} from '@/lib/utils/hub-url';
import { buildHubMarkdown } from '@/lib/utils/hub-export';
import { cn } from '@/lib/utils/cn';

const HUB_STATS = (() => {
  const families = new Set(models.map(m => m.family)).size;
  const formats = new Set(models.flatMap(m => m.quants.map(q => q.format))).size;
  const buckets = {
    small: models.filter(m => m.params <= 3).length,
    mid7: models.filter(m => m.params > 3 && m.params <= 9).length,
    mid14: models.filter(m => m.params > 9 && m.params <= 20).length,
    large32: models.filter(m => m.params > 20 && m.params <= 50).length,
    xl: models.filter(m => m.params > 50).length,
  };
  return { families, formats, buckets };
})();

export default function QuantHubContent() {
  const { t, lang } = useLanguage();
  const { gpu: profileGpu, hasProfile } = useHardwareProfile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hydrated = useRef(false);

  const [gpuFilterId, setGpuFilterId] = useState<string | null>(null);
  const [filters, setFilters] = useState<HubFilters>(EMPTY_HUB_FILTERS);
  const [linkCopied, setLinkCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  useEffect(() => {
    const parsed = parseHubSearchParams(searchParams);
    setGpuFilterId(parsed.gpuFilterId);
    setFilters(parsed.filters);
    hydrated.current = true;
  }, [searchParams]);

  const syncUrl = useCallback((gpu: string | null, f: HubFilters) => {
    if (!hydrated.current) return;
    const qs = buildHubSearchParams(gpu, f).toString();
    router.replace(qs ? `/quant-hub/?${qs}` : '/quant-hub/', { scroll: false });
  }, [router]);

  const handleGpuSelect = useCallback((id: string | null) => {
    setGpuFilterId(id);
    syncUrl(id, filters);
  }, [filters, syncUrl]);

  const handleFiltersChange = useCallback((f: HubFilters) => {
    setFilters(f);
    syncUrl(gpuFilterId, f);
  }, [gpuFilterId, syncUrl]);

  const filterGpu = useMemo(
    () => (gpuFilterId ? gpuDatabase.find(g => g.id === gpuFilterId) ?? null : null),
    [gpuFilterId],
  );

  const gpuFilterModelIds = useMemo(() => {
    if (!filterGpu) return null;
    const recs = getRecommendations(filterGpu.vram, 4096, 1, 'quality', true);
    return new Set(recs.map(r => r.model.id));
  }, [filterGpu]);

  const compatibleCount = gpuFilterModelIds?.size ?? models.length;
  const total = models.length;

  const filtered = useMemo(() => {
    return models.filter(m => {
      if (gpuFilterModelIds && !gpuFilterModelIds.has(m.id)) return false;
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
  }, [filters, gpuFilterModelIds]);

  const hiddenByGpu = gpuFilterModelIds ? total - compatibleCount : 0;
  const filtersActive = hasActiveHubFilters(gpuFilterId, filters);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(hubShareUrl(gpuFilterId, filters));
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* denied */ }
  };

  const exportMarkdown = async () => {
    const md = buildHubMarkdown(filtered, gpuFilterId, filters, {
      title: t.hub.export.title,
      generated: t.hub.export.generated,
      models: t.hub.export.models,
      gpu: t.hub.export.gpu,
      search: t.hub.export.search,
      params: t.hub.filters.params,
      category: t.hub.filters.category,
      hardware: t.hub.filters.hardware,
      format: t.hub.filters.format,
      colModel: t.hub.export.colModel,
      colParams: t.hub.export.colParams,
      colMinVram: t.hub.export.colMinVram,
      colBestQuant: t.hub.export.colBestQuant,
      colLink: t.hub.export.colLink,
      categoryLabels: t.hub.categories,
      hardwareLabels: t.hub.hardware,
    });
    try {
      await navigator.clipboard.writeText(md);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    } catch { /* denied */ }
  };

  const clearAll = () => {
    setFilters(EMPTY_HUB_FILTERS);
    setGpuFilterId(null);
    router.replace('/quant-hub/', { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.quantHub },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.hub.title}</h1>
          <p className="text-slate-400">
            {t.hub.subtitle}
            <span className="text-slate-500"> · </span>
            <span className="text-violet-400/80 font-medium">{t.hub.indexedCount.replace('{total}', String(total))}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {filtered.length > 0 && (
            <button
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 border border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all"
            >
              <FileDown size={12} />
              {exportCopied ? t.hub.export.copied : t.hub.export.copy}
            </button>
          )}
          {filtersActive && (
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-300 border border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20 transition-all"
            >
              <Link2 size={12} />
              {linkCopied ? t.hub.shareCopied : t.hub.shareLink}
            </button>
          )}
        </div>
      </div>

      <HubScaleStats
        total={total}
        families={HUB_STATS.families}
        formats={HUB_STATS.formats}
        buckets={HUB_STATS.buckets}
      />

      <GpuQuickChips selectedGpuId={gpuFilterId} onSelect={handleGpuSelect} />

      {filterGpu && (
        <div className="mb-6 glass rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-emerald-500/20 bg-emerald-500/[0.04]">
          <div>
            <p className="text-sm text-emerald-200/90">
              {t.hub.profileFilter
                .replace('{count}', String(compatibleCount))
                .replace('{total}', String(total))
                .replace('{gpu}', filterGpu.name)}
            </p>
            {hiddenByGpu > 0 && (
              <p className="text-xs text-emerald-200/50 mt-0.5">
                {t.hub.gpuFilterHiding.replace('{hidden}', String(hiddenByGpu))}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGpuSelect(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-all"
            >
              {t.hub.showAllModels.replace('{total}', String(total))}
            </button>
            <Link
              href={`/tools/vram-calc/?mode=reverse&gpu=${filterGpu.id}&ctx=4096&sort=quality`}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {t.hub.profileLink} →
            </Link>
          </div>
        </div>
      )}

      {hasProfile && profileGpu && !gpuFilterId && (
        <div className="mb-6 glass rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {t.hub.profileFilterAll.replace('{total}', String(total))}
          </p>
          <button
            onClick={() => handleGpuSelect(profileGpu.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-white/[0.08] hover:text-slate-200 hover:border-white/15 transition-all"
          >
            {t.hub.filterByMyGpu
              .replace('{gpu}', profileGpu.name)
              .replace('{count}', String(countModelsForGpu(profileGpu.id)))}
          </button>
        </div>
      )}

      <div className="mb-4">
        <FilterBar
          filters={filters}
          onChange={handleFiltersChange}
          count={filtered.length}
          total={total}
          profileFilterActive={!!gpuFilterModelIds}
        />
      </div>

      <p className={cn(
        'text-sm mb-6',
        filtered.length === total ? 'text-violet-400/80' : 'text-slate-500',
      )}>
        {filtered.length === total
          ? t.hub.resultsAll.replace('{total}', String(total))
          : t.hub.resultsFiltered
              .replace('{visible}', String(filtered.length))
              .replace('{total}', String(total))}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-lg mb-2">{t.hub.noResults}</p>
          <button
            onClick={clearAll}
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

function countModelsForGpu(gpuId: string): number {
  const gpu = gpuDatabase.find(g => g.id === gpuId);
  if (!gpu) return 0;
  const recs = getRecommendations(gpu.vram, 4096, 1, 'quality', true);
  return new Set(recs.map(r => r.model.id)).size;
}