import type { HubFilters } from '@/components/hub/FilterBar';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';

export interface HubUrlState {
  gpuFilterId: string | null;
  filters: HubFilters;
}

export const EMPTY_HUB_FILTERS: HubFilters = {
  search: '',
  paramRange: '',
  category: '',
  hardware: '',
  format: '',
  recency: '',
};

const PARAM_RANGES = new Set(['≤3B', '7B', '14B', '32B', '70B+']);
const CATEGORIES = new Set(['general', 'code', 'multimodal', 'instruct']);
const HARDWARE = new Set(['consumer-gpu', 'mac', 'cpu-vps', 'pro-gpu']);
/**
 * Formats that at least one indexed model actually ships — derived, not typed
 * out, so the filter vocabulary cannot drift from the data. It did: `HQQ` was
 * a hardcoded chip matching zero of 79 models, i.e. a filter whose only
 * possible outcome was an empty result set.
 */
export const SHIPPED_FORMATS: string[] = Array.from(
  new Set(models.flatMap(m => m.quants.map(q => q.format))),
).sort();

const FORMATS = new Set(SHIPPED_FORMATS);

export function parseHubSearchParams(params: URLSearchParams): HubUrlState {
  const gpu = params.get('gpu');
  const gpuFilterId = gpu && gpuDatabase.some(g => g.id === gpu) ? gpu : null;

  const size = params.get('size') ?? '';
  const cat = params.get('cat') ?? '';
  const hw = params.get('hw') ?? '';
  const fmt = params.get('fmt') ?? '';

  const recency = params.get('recency') ?? '';

  return {
    gpuFilterId,
    filters: {
      search: params.get('q') ?? '',
      paramRange: PARAM_RANGES.has(size) ? size : '',
      category: CATEGORIES.has(cat) ? cat : '',
      hardware: HARDWARE.has(hw) ? hw : '',
      format: FORMATS.has(fmt) ? fmt : '',
      recency: recency === 'recent' ? 'recent' : '',
    },
  };
}

export function buildHubSearchParams(
  gpuFilterId: string | null,
  filters: HubFilters,
): URLSearchParams {
  const p = new URLSearchParams();
  if (gpuFilterId) p.set('gpu', gpuFilterId);
  if (filters.search) p.set('q', filters.search);
  if (filters.paramRange) p.set('size', filters.paramRange);
  if (filters.category) p.set('cat', filters.category);
  if (filters.hardware) p.set('hw', filters.hardware);
  if (filters.format) p.set('fmt', filters.format);
  if (filters.recency) p.set('recency', filters.recency);
  return p;
}

export function hubShareUrl(gpuFilterId: string | null, filters: HubFilters): string {
  const qs = buildHubSearchParams(gpuFilterId, filters).toString();
  // Share the page the reader is actually on. Hardcoding `/quant-hub/` handed
  // a Chinese reader an English URL to pass on — the same leak as a bare
  // `next/link`, but in a clipboard string, where no markup check can see it.
  const base = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://quantized.uk/quant-hub/';
  return qs ? `${base}?${qs}` : base;
}

export function hasActiveHubFilters(
  gpuFilterId: string | null,
  filters: HubFilters,
): boolean {
  return !!(
    gpuFilterId ||
    filters.search ||
    filters.paramRange ||
    filters.category ||
    filters.hardware ||
    filters.format ||
    filters.recency
  );
}