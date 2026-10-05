import type { QuantModel } from '@/lib/data/types';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { RECENCY_ANCHOR, RECENT_DAYS } from '@/lib/utils/model-meta';

/**
 * The homepage "Latest additions" list: new models *and* new hardware, newest
 * first. It listed models only, so a machine added the week people were
 * searching for it (DGX Spark) had no way onto the homepage at all.
 *
 * Hardware rows added on the same day and of the same `type` collapse into one
 * entry — four Arc cards would otherwise fill most of a six-slot list with one
 * announcement. On a tie in date, hardware goes first: a new machine is the
 * rarer event and the one a returning reader cannot find from the Hub.
 */
export type LatestEntry =
  | { kind: 'model'; date: string; model: QuantModel }
  | { kind: 'hardware'; date: string; gpus: GPU[] };

const valid = (d?: string): d is string => !!d && !Number.isNaN(Date.parse(d));

export function latestEntries(models: QuantModel[], n: number, gpus: GPU[] = gpuDatabase): LatestEntry[] {
  const groups = new Map<string, GPU[]>();
  for (const g of gpus) {
    if (!valid(g.addedAt)) continue;
    const key = `${g.addedAt}|${g.type}`;
    groups.set(key, [...(groups.get(key) ?? []), g]);
  }
  const hw: LatestEntry[] = Array.from(groups.values()).map(gs => ({ kind: 'hardware', date: gs[0].addedAt!, gpus: gs }));
  const md: LatestEntry[] = models
    .filter(m => valid(m.addedAt))
    .map(m => ({ kind: 'model', date: m.addedAt!, model: m }));
  return [...hw, ...md]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || (a.kind === b.kind ? 0 : a.kind === 'hardware' ? -1 : 1))
    .slice(0, n);
}

/** Same window and anchor as `isRecentModel`, so the NEW badge means one thing. */
export function isRecentDate(date: string, now = RECENCY_ANCHOR): boolean {
  const t = Date.parse(date);
  return !Number.isNaN(t) && now - t <= RECENT_DAYS * 24 * 60 * 60 * 1000;
}
