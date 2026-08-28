import { models } from '@/lib/data/models';
import type { QuantConfidence, QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * Quant formats at least one indexed model actually ships — derived, never
 * typed out, so no surface can advertise a format the index cannot show.
 * `lib/data/formats.ts` documents one more (HQQ) as reference material; that is
 * editorial content, not inventory, and the two must not be conflated.
 */
export const SHIPPED_FORMATS: string[] = Array.from(
  new Set(models.flatMap(m => m.quants.map(q => q.format))),
).sort();

/** Models with published site-side speed / matrix numbers → default measured for VRAM/speed fields. */
const MEASURED_MODEL_IDS = new Set([
  'llama-3.1-8b',
  'qwen2.5-7b',
  'qwen2.5-32b',
  'qwen3-4b',
  'qwen3-8b',
  'qwen3-14b',
  'qwen3-32b',
  'qwen3-30b-a3b',
  'qwen3-coder-30b-a3b',
  'deepseek-r1-distill-qwen-14b',
]);

/** Consider "recent" if added within this many days. */
export const RECENT_DAYS = 45;

export function quantConfidence(modelId: string, q: QuantVariant): QuantConfidence {
  if (q.confidence) return q.confidence;
  if (MEASURED_MODEL_IDS.has(modelId) && q.speedRTX4090 != null) return 'measured';
  return 'estimated';
}

export function isSuperseded(m: QuantModel): boolean {
  return m.status === 'superseded';
}

export function isRecentModel(m: QuantModel, now = Date.now()): boolean {
  if (!m.addedAt) return false;
  const t = Date.parse(m.addedAt);
  if (Number.isNaN(t)) return false;
  return now - t <= RECENT_DAYS * 24 * 60 * 60 * 1000;
}

export function getModelById(models: QuantModel[], id: string | undefined): QuantModel | undefined {
  if (!id) return undefined;
  return models.find(m => m.id === id);
}
