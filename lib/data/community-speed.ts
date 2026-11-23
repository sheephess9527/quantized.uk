import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { backendFor, canStack, MAX_CARDS } from '@/lib/utils/gpu-page';
import { quantLevelKey } from '@/lib/utils/recommend';
import type { KvCacheType } from '@/lib/utils/vram';

export interface SpeedConfiguration {
  modelId: string;
  quant: string;
  gpuIds: string[];
  context: number;
  batch: number;
  kv: KvCacheType;
  encoderGiB: number;
}

interface SpeedObservation {
  processor?: string;
  runtime: string;
  version: string;
  prefill: number;
  decode: number;
}

interface SpeedSubmission extends SpeedConfiguration, SpeedObservation {
  note?: string;
  url?: string;
}

export interface CommunitySpeed extends SpeedConfiguration, SpeedObservation {
  id: string;
  source: 'community';
  url?: string;
}

export const communitySpeeds: readonly CommunitySpeed[] = [];
export const COMMUNITY_SPEED_ENABLED = false;

export const SPEED_BOUNDS = { min: 0.01, prefillMax: 10_000_000, decodeMax: 100_000 } as const;

export function speedConfigurationKey(c: SpeedConfiguration): string {
  const projectorSize = c.encoderGiB > 0 ? c.encoderGiB.toFixed(2) : null;
  return JSON.stringify([c.modelId, c.quant, c.gpuIds, c.context, c.batch, c.kv, projectorSize]);
}

export function matchingCommunitySpeeds(c: SpeedConfiguration, rows = communitySpeeds): CommunitySpeed[] {
  const key = speedConfigurationKey(c);
  return rows.filter(row => row.source === 'community' && speedConfigurationKey(row) === key);
}

function limitedText(input: unknown, max: number): string | undefined {
  if (typeof input !== 'string' || input.length > max) return;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 9 || code === 11 || code === 12 || (code > 13 && code < 32) || code === 127) return;
  }
  return input.trim();
}

function inBounds(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export function validateSpeedSubmission(input: unknown): SpeedSubmission | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return;
  const { modelId, quant, gpuIds, context, batch, kv, encoderGiB, processor = '', runtime, version, prefill, decode, note = '', url = '', website = '' } = input as Record<string, unknown>;
  if (website !== '' || typeof modelId !== 'string' || typeof quant !== 'string') return;
  const model = models.find(m => m.id === modelId);
  if (!model?.quants.some(q => quantLevelKey(q) === quant)) return;
  if (!Array.isArray(gpuIds) || gpuIds.length < 1 || gpuIds.length > MAX_CARDS) return;
  const devices = gpuIds.map(id => gpuDatabase.find(g => g.id === id));
  const primary = devices[0];
  if (!primary || devices.some(g => !g || (devices.length > 1 && (!canStack(g) || backendFor(g) !== backendFor(primary))))) return;
  const cleanProcessor = limitedText(processor, 80);
  if (primary.type === 'cpu' ? !cleanProcessor || /[\r\n\t]/.test(cleanProcessor) : processor !== '') return;
  if (!inBounds(context, 1, 10_000_000) || !Number.isInteger(context)) return;
  if (!inBounds(batch, 1, 16) || !Number.isInteger(batch)) return;
  if ((kv !== 'f16' && kv !== 'q8_0' && kv !== 'q4_0') || !inBounds(encoderGiB, 0, Number.MAX_SAFE_INTEGER)) return;
  if (!inBounds(prefill, SPEED_BOUNDS.min, SPEED_BOUNDS.prefillMax)
    || !inBounds(decode, SPEED_BOUNDS.min, SPEED_BOUNDS.decodeMax)) return;
  const cleanRuntime = limitedText(runtime, 80);
  const cleanVersion = limitedText(version, 80);
  const cleanNote = limitedText(note, 1000);
  const cleanUrl = limitedText(url, 500);
  if (!cleanRuntime || !cleanVersion || cleanNote === undefined || cleanUrl === undefined) return;
  let evidenceUrl: string | undefined;
  if (cleanUrl) {
    try {
      const link = new URL(cleanUrl);
      if (!/^https:\/\//i.test(cleanUrl) || link.protocol !== 'https:' || link.username || link.password || link.href.length > 500) return;
      evidenceUrl = link.href;
    } catch { return; }
  }
  return { modelId, quant, gpuIds: devices.map(g => g!.id), context, batch, kv, encoderGiB,
    ...(cleanProcessor ? { processor: cleanProcessor } : {}),
    runtime: cleanRuntime, version: cleanVersion, prefill, decode, note: cleanNote || undefined, url: evidenceUrl };
}
