'use client';

import { Suspense, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, FileDown, LayoutGrid, Table2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/routing';
import { models } from '@/lib/data/models';
import { gpuDatabase, gpuDisplayName } from '@/lib/data/gpus';
import ModelCard from '@/components/hub/ModelCard';
import ModelTable from '@/components/hub/ModelTable';
import QueryNoindex from '@/components/seo/QueryNoindex';
import FilterBar, { HubSearch, type HubFilters } from '@/components/hub/FilterBar';
import HubScaleStats from '@/components/hub/HubScaleStats';
import GpuQuickChips from '@/components/hub/GpuQuickChips';
import HubQueryObserver from '@/components/hub/HubQueryObserver';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from '@/components/i18n/LocalLink';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { getRecommendations } from '@/lib/utils/recommend';
import { referenceQuant } from '@/lib/utils/quality';
import { sizeAt4K } from '@/lib/utils/quant-source';
import {
  parseHubSearchParams,
  buildHubSearchParams,
  hubShareUrl,
  hasActiveHubFilters,
  EMPTY_HUB_FILTERS,
} from '@/lib/utils/hub-url';
import { buildHubMarkdown } from '@/lib/utils/hub-export';
import { matchesParamRange, paramBucketCounts, type ParamRange } from '@/lib/utils/param-buckets';
import { isRecentModel, isSuperseded } from '@/lib/utils/model-meta';
import { cn } from '@/lib/utils/cn';
import { trackEvent } from '@/lib/analytics';
import DataFreshness from '@/components/home/DataFreshness';
import { modelMatchesQuery } from '@/lib/utils/model-search';
import { hasImageInput, licenceClassOf } from '@/lib/utils/model-facts';

type HubSort = 'default' | 'newest' | 'params' | 'vram' | 'speed';

const HUB_STATS = (() => {
  const families = new Set(models.map(m => m.family)).size;
  const formats = new Set(models.flatMap(m => m.quants.map(q => q.format))).size;
  const legacyCount = models.filter(isSuperseded).length;
  return { families, formats, buckets: paramBucketCounts(models), legacyCount };
})();

export default function QuantHubContent() {
  const { t, lang } = useLanguage();
  const { gpu: profileGpu, hasProfile } = useHardwareProfile();
  const router = useRouter();
  const hydrated = useRef(false);

  const [gpuFilterId, setGpuFilterId] = useState<string | null>(null);
  const [filters, setFilters] = useState<HubFilters>(EMPTY_HUB_FILTERS);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<HubSort>('default');
  const [linkCopied, setLinkCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const applyQuery = useCallback((query: string) => {
    const parsed = parseHubSearchParams(new URLSearchParams(query));
    setGpuFilterId(parsed.gpuFilterId);
    setFilters(parsed.filters);
    hydrated.current = true;
  }, []);

  const syncUrl = useCallback((gpu: string | null, f: HubFilters) => {
    if (!hydrated.current) return;
    const qs = buildHubSearchParams(gpu, f).toString();
    // Through localizeHref: a bare '/quant-hub/' here moved every Chinese reader
    // to the English Hub the moment they touched a filter.
    router.replace(localizeHref(qs ? `/quant-hub/?${qs}` : '/quant-hub/', lang), { scroll: false });
  }, [router, lang]);

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
    const recs = getRecommendations(filterGpu, 4096, 1, 'quality', true);
    return new Set(recs.map(r => r.model.id));
  }, [filterGpu]);

  const compatibleCount = gpuFilterModelIds?.size ?? models.length;
  const total = models.length;

  const filtered = useMemo(() => {
    return models.filter(m => {
      if (filters.showLegacy !== 'show' && isSuperseded(m)) return false;
      if (gpuFilterModelIds && !gpuFilterModelIds.has(m.id)) return false;
      if (filters.search) {
        // Name, family, id, size, categories, tags, formats and levels, plus
        // the alias map — one matcher shared with the calculator's search.
        if (!modelMatchesQuery(m, filters.search)) return false;
      }
      if (filters.paramRange && !matchesParamRange(m.params, filters.paramRange as ParamRange)) return false;
      if (filters.recency === 'recent' && !isRecentModel(m)) return false;
      if (filters.category && !m.categories.includes(filters.category)) return false;
      if (filters.hardware && !m.hardwareTags.includes(filters.hardware)) return false;
      if (filters.format  && !m.quants.some(q => q.format === filters.format)) return false;
      // Input kind and licence come from lib/data/model-facts.ts, not from
      // `categories` — a model tagged `general` can still take images (three Qwen
      // models did) and `categories` says nothing about terms at all.
      if (filters.input === 'text' && hasImageInput(m.id)) return false;
      if (filters.input === 'multimodal' && !hasImageInput(m.id)) return false;
      if (filters.licence && licenceClassOf(m.id) !== filters.licence) return false;
      return true;
    });
  }, [filters, gpuFilterModelIds]);

  const hiddenByGpu = gpuFilterModelIds ? total - compatibleCount : 0;
  const filtersActive = hasActiveHubFilters(gpuFilterId, filters);
  const effectiveTotal = filters.showLegacy === 'show' ? total : total - HUB_STATS.legacyCount;

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(hubShareUrl(gpuFilterId, filters));
      setLinkCopied(true);
      trackEvent('Hub Share');
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
      input: t.hub.filters.input,
      licence: t.hub.filters.licence,
      colModel: t.hub.export.colModel,
      colParams: t.hub.export.colParams,
      colMinVram: t.hub.export.colMinVram,
      colBestQuant: t.hub.export.colBestQuant,
      colLink: t.hub.export.colLink,
      categoryLabels: t.hub.categories,
      hardwareLabels: t.hub.hardware,
      inputLabels: t.hub.input,
      licenceLabels: t.hub.licenceClasses,
    }, lang);
    try {
      await navigator.clipboard.writeText(md);
      setExportCopied(true);
      trackEvent('Hub Export MD', { count: filtered.length });
      setTimeout(() => setExportCopied(false), 2000);
    } catch { /* denied */ }
  };

  /**
   * Escape hatches for an empty result, built from the index so each one is
   * guaranteed to return something. Picked to cover the ways a search misses:
   * a family name, a size, a task and a format.
   */
  const suggestions = useMemo(() => {
    const biggestFamily = Array.from(
      models.reduce((acc, m) => acc.set(m.family, (acc.get(m.family) ?? 0) + 1), new Map<string, number>()),
    ).sort((a, b) => b[1] - a[1])[0]?.[0];
    const out: { label: string; filters: Partial<HubFilters> }[] = [];
    if (biggestFamily) out.push({ label: biggestFamily, filters: { search: biggestFamily } });
    out.push({ label: t.hub.filters.params + ' 7B', filters: { paramRange: '7B' } });
    if (models.some(m => m.categories.includes('code'))) {
      out.push({ label: t.hub.categories.code, filters: { category: 'code' } });
    }
    if (models.some(m => m.categories.includes('multimodal'))) {
      out.push({ label: t.hub.categories.multimodal, filters: { category: 'multimodal' } });
    }
    out.push({ label: 'GGUF', filters: { format: 'GGUF' } });
    return out;
  }, [t]);

  const clearAll = () => {
    setFilters(EMPTY_HUB_FILTERS);
    setGpuFilterId(null);
    router.replace(localizeHref('/quant-hub/', lang), { scroll: false });
  };

  const searchProps = { filters, onChange: handleFiltersChange, gpuFilterId };
  const scaleStats = <HubScaleStats total={total} families={HUB_STATS.families} formats={HUB_STATS.formats} buckets={HUB_STATS.buckets} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Suspense fallback={null}>
        <HubQueryObserver onChange={applyQuery} />
      </Suspense>
      <QueryNoindex />
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.quantHub },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-sm:w-full">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.hub.title}</h1>
          <div className="mb-3 sm:hidden">
            <HubSearch {...searchProps} id="hub-search-mobile" />
          </div>
          <p className="text-slate-400">
            {t.hub.subtitle}
            <span className="hidden sm:inline">
              <span className="text-slate-500"> · </span>
              <span className="text-sky-400/80 font-medium">{t.hub.indexedCount.replace('{total}', String(total))}</span>
            </span>
          </p>
          <nav aria-label={lang === 'zh' ? '常用入口' : 'Common destinations'} className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link className="text-cyan-300 hover:underline" href="/quant-hub/qwen3-8b/">Qwen3 8B</Link>
            <Link className="text-cyan-300 hover:underline" href="/tools/vram-calc/">{t.nav.vramCalc}</Link>
            <Link className="text-cyan-300 hover:underline" href="/gpu/rtx-4090/">RTX 4090</Link>
          </nav>
          <DataFreshness className="mt-1.5" lang={lang} />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-300 border border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/20 transition-all"
            >
              <Link2 size={12} />
              {linkCopied ? t.hub.shareCopied : t.hub.shareLink}
            </button>
          )}
        </div>
      </div>

      <div className="hidden sm:flow-root">{scaleStats}</div>

      <GpuQuickChips selectedGpuId={gpuFilterId} onSelect={handleGpuSelect} />

      {filterGpu && (
        <div className="mb-6 glass rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-emerald-500/20 bg-emerald-500/[0.04]">
          <div>
            <p className="text-sm text-emerald-200/90">
              {t.hub.profileFilter
                .replace('{count}', String(compatibleCount))
                .replace('{total}', String(total))
                .replace('{gpu}', gpuDisplayName(filterGpu, lang))}
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/25 hover:bg-sky-500/25 transition-all"
            >
              {t.hub.showAllModels.replace('{total}', String(total))}
            </button>
            <Link
              href={`/tools/vram-calc/?mode=reverse&gpu=${filterGpu.id}&ctx=4096&sort=quality`}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              {t.hub.profileLink} →
            </Link>
          </div>
        </div>
      )}

      {hasProfile && profileGpu && !gpuFilterId && (
        <div className="mb-6 glass rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {t.hub.profileFilterOff}
          </p>
          <button
            onClick={() => handleGpuSelect(profileGpu.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-ink/[0.08] hover:text-slate-200 hover:border-ink/15 transition-all"
          >
            {t.hub.filterByMyGpu
              .replace('{gpu}', gpuDisplayName(profileGpu, lang))
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
          legacyCount={HUB_STATS.legacyCount}
          desktopSearch={<HubSearch {...searchProps} id="hub-search" />}
          mobileStats={scaleStats}
        />
      </div>

      {/* Results summary + Sort + [Cards | Table] view switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className={cn(
          'text-sm',
          filtered.length === effectiveTotal ? 'text-sky-400/80' : 'text-slate-500',
        )}>
          {filtered.length === effectiveTotal
            ? t.hub.resultsAll.replace('{total}', String(effectiveTotal))
            : t.hub.resultsFiltered
                .replace('{visible}', String(filtered.length))
                .replace('{total}', String(effectiveTotal))}
        </p>

        {filtered.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as HubSort)}
              aria-label={t.hub.tableView.sortDefault}
              className="appearance-none px-3 py-1.5 rounded-lg text-xs font-medium bg-ink/[0.03] text-slate-300 border border-ink/[0.08] hover:border-ink/[0.15] cursor-pointer"
            >
              <option value="default">{t.hub.tableView.sortDefault}</option>
              <option value="newest">{t.hub.tableView.sortNewest}</option>
              <option value="params">{t.hub.tableView.sortParamsDesc}</option>
              <option value="vram">{t.hub.tableView.sortVramAsc}</option>
              <option value="speed">{t.hub.tableView.sortSpeedDesc}</option>
            </select>

            <div className="inline-flex rounded-lg bg-ink/[0.03] p-0.5 border border-ink/[0.08]">
              <button
                type="button"
                aria-pressed={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'cards' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <LayoutGrid size={12} aria-hidden />
                {t.hub.tableView.cards}
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'table'}
                onClick={() => setViewMode('table')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <Table2 size={12} aria-hidden />
                {t.hub.tableView.table}
              </button>
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400 mb-1">
            {filters.search
              ? t.hub.noResultsFor.replace('{q}', filters.search)
              : t.hub.noResults}
          </p>
          <p className="text-sm text-slate-500 mb-4">{t.hub.noResultsTry}</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
            {suggestions.map(sug => (
              <button
                key={sug.label}
                onClick={() => handleFiltersChange({ ...EMPTY_HUB_FILTERS, ...sug.filters })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-sky-300 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors min-h-[44px]"
              >
                {sug.label}
              </button>
            ))}
          </div>
          <button
            onClick={clearAll}
            className="block mx-auto mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors min-h-[44px]"
          >
            {t.hub.browseAll.replace('{n}', String(total))}
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <ModelTable models={sortHubModels(filtered, sortBy)} lang={lang} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortHubModels(filtered, sortBy).map(model => (
            <ModelCard key={model.id} model={model} lang={lang} />
          ))}
        </div>
      )}
      <Link href="/pending/" className="inline-flex items-center min-h-[44px] mt-6 text-sm text-sky-400 hover:text-sky-300">
        {t.pending.hubLink}
      </Link>
    </div>
  );
}

function sortHubModels(list: typeof models, sortBy: HubSort): typeof models {
  if (sortBy === 'default') return list;
  const copy = [...list];
  if (sortBy === 'newest') {
    return copy.sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''));
  }
  if (sortBy === 'params') {
    return copy.sort((a, b) => b.params - a.params);
  }
  if (sortBy === 'vram') {
    return copy.sort((a, b) => sizeAt4K(a, referenceQuant(a.quants)) - sizeAt4K(b, referenceQuant(b.quants)));
  }
  if (sortBy === 'speed') {
    return copy.sort((a, b) => (referenceQuant(b.quants).speedRTX4090 ?? -1) - (referenceQuant(a.quants).speedRTX4090 ?? -1));
  }
  return copy;
}

function countModelsForGpu(gpuId: string): number {
  const gpu = gpuDatabase.find(g => g.id === gpuId);
  if (!gpu) return 0;
  const recs = getRecommendations(gpu, 4096, 1, 'quality', true);
  return new Set(recs.map(r => r.model.id)).size;
}
