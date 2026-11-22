import assert from 'node:assert/strict';
import { matrixData } from '../lib/data/benchmarks';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { dataLastUpdated } from '../lib/data/meta';
import { performanceReports, performanceReportProblems, relatedReports } from '../lib/data/performance-reports';
import { buildRunReport, measurementFields, type RunMeasurements } from '../lib/utils/run-report';
import { calibrationRows, memoryAccuracy } from '../lib/utils/bench-calibration';
import { translations } from '../lib/i18n/translations';

const modelIds = new Set(models.map(m => m.id));
const gpuIds = new Set(gpuDatabase.map(g => g.id));
assert.deepEqual(performanceReportProblems(modelIds, gpuIds, dataLastUpdated), []);
const seed = performanceReports[0];
assert(performanceReportProblems(modelIds, gpuIds, dataLastUpdated, [{ ...seed, modelId: 'missing' }]).length);
assert(performanceReportProblems(modelIds, gpuIds, dataLastUpdated, [{ ...seed, gpuId: 'missing' }]).length);
assert(performanceReportProblems(modelIds, gpuIds, dataLastUpdated, [{ ...seed, checkedAt: '2099-01-01' }]).length);
assert(performanceReportProblems(modelIds, gpuIds, dataLastUpdated, [{ ...seed, decodeTokS: NaN }]).length);
assert(performanceReportProblems(modelIds, gpuIds, dataLastUpdated, [{ ...seed, url: 'javascript:alert(1)' }]).length);
assert.equal(relatedReports('qwen3-8').length, 0, 'family prefixes must not match');
assert.equal(relatedReports(seed.modelId, 'rtx4090')[0].gpuId, seed.gpuId, 'other GPU remains related, never a same-GPU claim');
assert.deepEqual(Object.keys(translations.en.evidence), Object.keys(translations.zh.evidence));
assert.deepEqual(Object.keys(translations.en.methodology), Object.keys(translations.zh.methodology));

const calibration = calibrationRows();
assert(calibration.length > 0 && calibration.length === matrixData.length);
assert(calibration.every(({ row, estimateGB }) =>
  Number.isFinite(estimateGB) && Number.isFinite(row.vramUsedGB) && row.vramUsedGB > 0),
'all measured rows need an estimate and positive recorded memory');
assert.equal(memoryAccuracy().compared, matrixData.length);

const sample = calibration[0];
assert.deepEqual(memoryAccuracy([
  { ...sample, row: { ...sample.row, vramUsedGB: 10 }, estimateGB: 9.75 },
  { ...sample, row: { ...sample.row, vramUsedGB: 10 }, estimateGB: 10.75 },
  { ...sample, estimateGB: undefined },
]), { total: 3, compared: 2, hardware: 1, meanAbsoluteError: 0.5, maxAbsoluteError: 0.75 });
assert.equal(memoryAccuracy([]).meanAbsoluteError, null);

const fields = Object.fromEntries(measurementFields.map(k => [k, ''])) as RunMeasurements;
fields.notes = '```\n[example](https://example.com)\n```';
const config = { model: 'Test', quant: 'GGUF Q4_K_M', hardware: '2 × RTX 3090', context: 8192, sequences: 2, kv: 'q8_0', encoderGiB: 0.5, estimatedGiB: 24 };
const report = buildRunReport(config, fields, 'Out of memory', translations.en.evidence, 'Not provided', 'https://quantized.uk/tools/vram-calc/');
assert(report.includes('8192') && report.includes('q8_0') && report.includes('2 × RTX 3090'));
assert(report.includes('### peak\n') === false, 'use readable field labels');
assert(report.includes('### Measured peak memory (GiB)\n```text\nNot provided'));
assert(report.includes('````text\n```'), 'logs cannot close their enclosing fence');
assert(report.includes('No error percentage is inferred'));
assert.equal(report.includes('122.4'), false, 'related speed must not leak into reader measurements');
const changed = buildRunReport({ ...config, context: 32768 }, fields, 'Ran successfully', translations.en.evidence, 'Not provided', 'https://quantized.uk/');
assert(changed.includes('32768') && !changed.includes('8192'), 'exports follow current settings');
console.log('Calculator evidence checks passed: references, memory calibration, language keys, strict related matching and honest report export.');
