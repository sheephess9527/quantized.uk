export interface RunConfiguration {
  model: string; quant: string; file?: string; hardware: string;
  context: number; sequences: number; kv: string; encoderGiB: number; estimatedGiB: number;
  sizingInput?: string;
}
export const measurementFields = ['engine', 'revision', 'peak', 'scope', 'decodeField', 'prefillField', 'prompt', 'output', 'runs', 'offload', 'speculation', 'notes'] as const;
export type MeasurementField = typeof measurementFields[number];
export type RunMeasurements = Record<MeasurementField, string>;

// A fenced plain-text value prevents commands/logs from becoming Markdown links or HTML.
function literal(value: string): string {
  const fence = '`'.repeat(Math.max(3, ...Array.from(value.matchAll(/`+/g), m => m[0].length + 1)));
  return `${fence}text\n${value}\n${fence}`;
}

/** Generated only after an explicit user action, with the current configuration. */
export function buildRunReport(config: RunConfiguration, measurements: RunMeasurements, outcome: string, labels: Record<MeasurementField | 'reportTitle' | 'configurationTitle' | 'observationsTitle' | 'reportCaveat', string>, unknown: string, pageUrl: string): string {
  const values = Object.entries(config).map(([key, value]) => `### ${key}\n${literal(String(value ?? unknown))}`).join('\n\n');
  const fields = measurementFields.map(key => `### ${labels[key]}\n${literal(measurements[key].trim() || unknown)}`).join('\n\n');
  return `# ${labels.reportTitle}\n\n${literal(pageUrl)}\n\n## ${labels.configurationTitle}\n\n${values}\n\n## ${labels.observationsTitle}\n\n${literal(outcome)}\n\n${fields}\n\n${labels.reportCaveat}\n`;
}
