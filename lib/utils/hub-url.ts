import type { HubFilters } from '@/components/hub/FilterBar';
import { gpuDatabase } from '@/lib/data/gpus';
import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';
import { PARAM_RANGES } from '@/lib/utils/param-buckets';

export { SHIPPED_FORMATS };

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
  input: '',
  licence: '',
  recency: '',
  showLegacy: '',
};

const PARAM_RANGE_KEYS = new Set<string>(PARAM_RANGES);
const CATEGORIES = new Set(['general', 'code', 'multimodal', 'instruct']);
const HARDWARE = new Set(['consumer-gpu', 'mac', 'cpu-vps', 'pro-gpu']);
const FORMATS = new Set(SHIPPED_FORMATS);
const INPUTS = new Set(['text', 'multimodal']);
const LICENCE_CLASSES = new Set(['commercial', 'restricted', 'noncommercial']);

export function parseHubSearchParams(params: URLSearchParams): HubUrlState {
  const gpu = params.get('gpu');
  const gpuFilterId = gpu && gpuDatabase.some(g => g.id === gpu) ? gpu : null;

  const size = params.get('size') ?? '';
  const cat = params.get('cat') ?? '';
  const hw = params.get('hw') ?? '';
  const fmt = params.get('fmt') ?? '';

  const recency = params.get('recency') ?? '';
  const legacy = params.get('legacy') ?? '';
  const input = params.get('input') ?? '';
  const licence = params.get('lic') ?? '';

  return {
    gpuFilterId,
    filters: {
      search: params.get('q') ?? '',
      paramRange: PARAM_RANGE_KEYS.has(size) ? size : '',
      category: CATEGORIES.has(cat) ? cat : '',
      hardware: HARDWARE.has(hw) ? hw : '',
      format: FORMATS.has(fmt) ? fmt : '',
      input: INPUTS.has(input) ? input : '',
      licence: LICENCE_CLASSES.has(licence) ? licence : '',
      recency: recency === 'recent' ? 'recent' : '',
      showLegacy: legacy === 'show' ? 'show' : '',
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
  if (filters.input) p.set('input', filters.input);
  if (filters.licence) p.set('lic', filters.licence);
  if (filters.recency) p.set('recency', filters.recency);
  if (filters.showLegacy) p.set('legacy', filters.showLegacy);
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
    filters.input ||
    filters.licence ||
    filters.recency ||
    filters.showLegacy
  );
}