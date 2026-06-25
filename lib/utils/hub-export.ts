import type { QuantModel } from '@/lib/data/models';
import type { HubFilters } from '@/components/hub/FilterBar';
import { gpuDatabase } from '@/lib/data/gpus';

const SITE = 'https://quantized.uk';

interface ExportLabels {
  title: string;
  generated: string;
  models: string;
  gpu: string;
  search: string;
  params: string;
  category: string;
  hardware: string;
  format: string;
  colModel: string;
  colParams: string;
  colMinVram: string;
  colBestQuant: string;
  colLink: string;
  categoryLabels: Record<string, string>;
  hardwareLabels: Record<string, string>;
}

function bestQuant(model: QuantModel) {
  const q = model.quants.reduce((best, cur) =>
    cur.pplLossPercent < best.pplLossPercent ? cur : best,
  model.quants[0]);
  return `${q.format} ${q.level}`;
}

function minVram(model: QuantModel) {
  return Math.min(...model.quants.map(q => q.vramGB));
}

function filterSummary(
  gpuFilterId: string | null,
  filters: HubFilters,
  labels: ExportLabels,
): string[] {
  const parts: string[] = [];
  if (gpuFilterId) {
    const gpu = gpuDatabase.find(g => g.id === gpuFilterId);
    if (gpu) parts.push(`${labels.gpu}: ${gpu.name}`);
  }
  if (filters.search) parts.push(`${labels.search}: ${filters.search}`);
  if (filters.paramRange) parts.push(`${labels.params}: ${filters.paramRange}`);
  if (filters.category) parts.push(`${labels.category}: ${labels.categoryLabels[filters.category] ?? filters.category}`);
  if (filters.hardware) parts.push(`${labels.hardware}: ${labels.hardwareLabels[filters.hardware] ?? filters.hardware}`);
  if (filters.format) parts.push(`${labels.format}: ${filters.format}`);
  return parts;
}

export function buildHubMarkdown(
  models: QuantModel[],
  gpuFilterId: string | null,
  filters: HubFilters,
  labels: ExportLabels,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const filters_ = filterSummary(gpuFilterId, filters, labels);
  const lines: string[] = [
    `# ${labels.title}`,
    '',
    `> ${models.length} ${labels.models}${filters_.length ? ` · ${filters_.join(' · ')}` : ''}`,
    `>`,
    `> ${labels.generated}: ${date} · [quantized.uk](${SITE}/quant-hub/)`,
    '',
    `| ${labels.colModel} | ${labels.colParams} | ${labels.colMinVram} | ${labels.colBestQuant} | ${labels.colLink} |`,
    '| --- | --- | --- | --- | --- |',
  ];

  for (const m of models) {
    const url = `${SITE}/quant-hub/${m.id}/`;
    lines.push(
      `| ${m.name} | ${m.paramLabel} | ${minVram(m).toFixed(1)} GB | ${bestQuant(m)} | [${m.id}](${url}) |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}