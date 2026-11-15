/** Small, manually reviewed link index. Figures describe the source run only. */
export interface PerformanceReport {
  id: string;
  modelId: string;
  gpuId: string;
  gpuCount: number;
  url: string;
  reportedAt: string;
  checkedAt: string;
  decodeTokS: number;
  prefillTokS: number;
  configuration: { en: string; zh: string };
  limitations: { en: string; zh: string };
}

export const performanceReports: PerformanceReport[] = [{
  id: 'llamaperf-3f2eaf9e',
  modelId: 'qwen3-8-27b',
  gpuId: 'rtx5070ti',
  gpuCount: 1,
  url: 'https://llamaperf.com/report/3f2eaf9e-db10-4585-be9c-6faf513045b3',
  reportedAt: '2026-11-13',
  checkedAt: '2026-11-15',
  decodeTokS: 122.4,
  prefillTokS: 2642.5,
  configuration: {
    en: 'GSQ 3-bit · capy-flash 0.11.2 · int8 KV · MTP on (3 draft tokens) · fully on GPU. Median of 5 runs; 613 prompt / 256 output tokens.',
    zh: 'GSQ 3-bit · capy-flash 0.11.2 · int8 KV · 开启 MTP（3 个草稿 token）· 全部在 GPU。5 次运行的中位数；输入 613 / 输出 256 token。',
  },
  limitations: {
    en: 'Different quantization and decoding setup from standard GGUF. Configured context, concurrency, exact weight revision and peak memory are unknown.',
    zh: '量化与解码方式不同于常规 GGUF。配置的上下文长度、并发数、权重确切版本与峰值内存未知。',
  },
}];

/** Match exact model ids only; a related run never validates the selected config. */
export function relatedReports(modelId: string, gpuId?: string): PerformanceReport[] {
  return performanceReports.filter(r => r.modelId === modelId)
    .sort((a, b) => Number(b.gpuId === gpuId) - Number(a.gpuId === gpuId)).slice(0, 3);
}

export function performanceReportProblems(
  modelIds: ReadonlySet<string>, gpuIds: ReadonlySet<string>, latest: string,
  reports: readonly PerformanceReport[] = performanceReports,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const r of reports) {
    if (ids.has(r.id)) errors.push(`duplicate performance report: ${r.id}`);
    ids.add(r.id);
    if (!modelIds.has(r.modelId) || !gpuIds.has(r.gpuId)) errors.push(`unknown report model/GPU: ${r.id}`);
    if (!/^https:\/\/llamaperf\.com\/report\/[a-f0-9-]+$/.test(r.url)) errors.push(`invalid report URL: ${r.id}`);
    if (![r.reportedAt, r.checkedAt].every(d => /^\d{4}-\d{2}-\d{2}$/.test(d)) || r.reportedAt > r.checkedAt || r.checkedAt > latest) errors.push(`invalid report dates: ${r.id}`);
    if (![r.decodeTokS, r.prefillTokS, r.gpuCount].every(n => Number.isFinite(n) && n > 0) || !Number.isInteger(r.gpuCount)) errors.push(`invalid report numbers: ${r.id}`);
    if (!r.configuration.en || !r.configuration.zh || !r.limitations.en || !r.limitations.zh) errors.push(`missing report translation: ${r.id}`);
  }
  return errors;
}
