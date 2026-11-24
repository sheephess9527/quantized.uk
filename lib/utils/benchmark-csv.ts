import { matrixData, type MatrixRow } from '@/lib/data/benchmarks';
import { canonical, SITE_NAME } from '@/lib/site';

export const benchmarkFilterFields = ['hardware', 'model', 'framework', 'quant'] as const;
export type BenchmarkFilters = Partial<Record<typeof benchmarkFilterFields[number], string>>;

export const benchmarkFilterOptions = {
  hardware: optionsFor('hardware'),
  model: optionsFor('model'),
  framework: optionsFor('framework'),
  quant: optionsFor('quant'),
};

function optionsFor(field: typeof benchmarkFilterFields[number]) {
  return Array.from(new Set(matrixData.map(row => row[field]))).sort();
}

export function filterBenchmarks(filters: BenchmarkFilters) {
  return matrixData.filter(row => benchmarkFilterFields.every(
    field => !filters[field] || row[field] === filters[field],
  ));
}

export const BENCHMARK_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

function csvCell(value: string | number) {
  const cell = String(value);
  return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function benchmarkCsv(rows: readonly MatrixRow[], lang: 'en' | 'zh') {
  const source = canonical(lang === 'zh' ? '/zh/benchmarks/' : '/benchmarks/');
  const header = 'model,hardware,framework,runtime_version,quant,speed_tok_s,vram_used_gb,first_published_at,notes,attribution,source_url,license,license_url';
  const lines = rows.map(row => [
    row.model, row.hardware, row.framework, row.runtimeVersion, row.quant, row.speedTokSec,
    row.vramUsedGB, row.firstPublishedAt, row.notes[lang], SITE_NAME, source, 'CC BY 4.0', BENCHMARK_LICENSE_URL,
  ].map(csvCell).join(','));
  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`;
}
