import statsJson from './hf-stats.json';

export interface HFModelStats {
  repo: string;
  downloads: number;
  likes: number;
  lastModified: string | null;
}

export interface HFStatsFile {
  fetchedAt: string;
  source: string;
  modelCount: number;
  models: Record<string, HFModelStats>;
}

export const hfStats = statsJson as HFStatsFile;

export function getHFStats(modelId: string): HFModelStats | null {
  return hfStats.models[modelId] ?? null;
}

export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}