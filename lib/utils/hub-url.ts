import type { HubFilters } from '@/components/hub/FilterBar';
import { gpuDatabase } from '@/lib/data/gpus';

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
};

const PARAM_RANGES = new Set(['≤3B', '7B', '14B', '32B', '70B+']);
const CATEGORIES = new Set(['general', 'code', 'multimodal', 'instruct']);
const HARDWARE = new Set(['consumer-gpu', 'mac', 'cpu-vps', 'pro-gpu']);
const FORMATS = new Set(['GGUF', 'AWQ', 'EXL2', 'GPTQ', 'HQQ']);

export function parseHubSearchParams(params: URLSearchParams): HubUrlState {
  const gpu = params.get('gpu');
  const gpuFilterId = gpu && gpuDatabase.some(g => g.id === gpu) ? gpu : null;

  const size = params.get('size') ?? '';
  const cat = params.get('cat') ?? '';
  const hw = params.get('hw') ?? '';
  const fmt = params.get('fmt') ?? '';

  return {
    gpuFilterId,
    filters: {
      search: params.get('q') ?? '',
      paramRange: PARAM_RANGES.has(size) ? size : '',
      category: CATEGORIES.has(cat) ? cat : '',
      hardware: HARDWARE.has(hw) ? hw : '',
      format: FORMATS.has(fmt) ? fmt : '',
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
  return p;
}

export function hubShareUrl(gpuFilterId: string | null, filters: HubFilters): string {
  const qs = buildHubSearchParams(gpuFilterId, filters).toString();
  const base = typeof window !== 'undefined'
    ? `${window.location.origin}/quant-hub/`
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
    filters.format
  );
}