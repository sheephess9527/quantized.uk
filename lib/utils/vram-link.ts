import type { ModelArch } from '@/lib/data/types';
import { gpuDatabase } from '@/lib/data/gpus';
import { localizeHref } from '@/lib/i18n/routing';
import type { Lang } from '@/lib/i18n/translations';
import { canStack, rigExtras } from '@/lib/utils/calc-insights';

export const VRAM_SHARE_PARAM = 'share';
export const NO_SHARE_GPU = 'none';

export function readVramAttention(params: URLSearchParams): ModelArch['attention'] {
  const full = Number(params.get('full'));
  const window = Number(params.get('win'));
  const tokens = Number(params.get('wt'));
  const hasWindow = Number.isSafeInteger(window) && window > 0 && Number.isSafeInteger(tokens) && tokens > 0;
  if ((!params.has('full') && !hasWindow) || !Number.isSafeInteger(full) || full < 0) return;
  return { fullLayers: full, ...(hasWindow ? { windowLayers: window, windowTokens: tokens } : {}) };
}

export function readVramEncoder(raw: string | null): number | undefined {
  const gib = Number(raw);
  return Number.isFinite(gib) && gib > 0 ? gib : undefined;
}

export function snapshotVramLink(
  url: URL,
  params: URLSearchParams,
  { mode, modelId, gpuId, lang }: { mode: 'forward' | 'reverse' | 'finetune'; modelId: string; gpuId: string; lang: Lang },
): string {
  const snapshot = new URLSearchParams(params);
  // Only an explicit copy includes an example model or a detected/example card.
  if (mode === 'forward' && modelId) {
    snapshot.set(VRAM_SHARE_PARAM, '1');
    snapshot.set('model', modelId);
    snapshot.set('gpu', gpuId || NO_SHARE_GPU);
    const gpu = gpuDatabase.find(g => g.id === gpuId) ?? null;
    const cards = gpu && canStack(gpu) ? Number(snapshot.get('cards') ?? '1') : 1;
    const extras = rigExtras(gpu, (snapshot.get('extra') ?? '').split(','), cards);
    if (extras.length) snapshot.set('extra', extras.map(g => g.id).join(','));
    else snapshot.delete('extra');
  } else if (mode === 'reverse' && gpuId) {
    snapshot.set(VRAM_SHARE_PARAM, '1');
    snapshot.set('gpu', gpuId);
    snapshot.delete('extra');
  }
  if (snapshot.has(VRAM_SHARE_PARAM)) url.pathname = localizeHref('/tools/vram-calc/', lang);
  url.search = snapshot.toString();
  url.hash = '';
  return url.href;
}
