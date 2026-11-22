// Run: npm run check:speed — compares measuredSpeed() with every
// llama.cpp/Ollama GGUF row in matrixData and prints measured ÷ predicted.
import assert from 'node:assert/strict';
import { matrixData } from '../lib/data/benchmarks';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { measuredSpeed, CALIBRATION_ERROR } from '../lib/utils/measured-speed';
import { runPlanSpeed } from '../lib/utils/calc-insights';
import { activeParamsB } from '../lib/utils/model-meta';
import { weightsGB } from '../lib/utils/roofline';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ratios: number[] = [];
for (const r of matrixData) {
  if (!/llama\.cpp|ollama/i.test(r.framework) || !r.quant.startsWith('GGUF')) continue;
  const m = models.find(x => norm(x.name) === norm(r.model)) ?? models.find(x => norm(x.name).includes(norm(r.model)));
  const g = gpuDatabase.find(x => norm(x.name) === norm(r.hardware)) ?? gpuDatabase.find(x => norm(r.hardware).startsWith(norm(x.name))) ?? gpuDatabase.find(x => norm('Mac ' + r.hardware) === norm(x.name));
  const q = m?.quants.find(x => x.format === 'GGUF' && r.quant.endsWith(x.level));
  const p = m && g && q ? measuredSpeed(g, m, q) : undefined;
  console.log(r.model, '|', r.hardware, '|', m?.id, g?.id, q?.level, '| measured', r.speedTokSec, 'pred', p?.tokS, p ? (r.speedTokSec / p.tokS).toFixed(3) : '');
  if (p) ratios.push(r.speedTokSec / p.tokS);
}
console.log('n', ratios.length, 'min', Math.min(...ratios).toFixed(3), 'max', Math.max(...ratios).toFixed(3));
const lo = Math.floor(Math.min(...ratios) * 100) / 100, hi = Math.ceil(Math.max(...ratios) * 100) / 100;
if (lo !== CALIBRATION_ERROR.low || hi !== CALIBRATION_ERROR.high || ratios.length !== CALIBRATION_ERROR.n) {
  console.error('CALIBRATION_ERROR is stale: data says', { low: lo, high: hi, n: ratios.length });
  process.exit(1);
}
console.log('CALIBRATION_ERROR matches the data');

const dense = models.find(m => m.id === 'llama-3.1-8b')!;
const moe = models.find(m => m.id === 'qwen3-30b-a3b')!;
const gguf = (model: typeof dense) => model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M')!;
const rtx4090 = gpuDatabase.find(g => g.id === 'rtx4090')!;
const rtx5090 = gpuDatabase.find(g => g.id === 'rtx5090')!;
const mac = gpuDatabase.find(g => g.id === 'm4-pro-24')!;

assert.deepEqual(runPlanSpeed(rtx4090, 1, [], dense, gguf(dense), 6, 4096), {
  source: 'measured', tokS: 148, runtimeVersion: 'llama.cpp b4217',
});
const calibrated = measuredSpeed(rtx5090, dense, gguf(dense))!;
assert.deepEqual(runPlanSpeed(rtx5090, 1, [], dense, gguf(dense), 6, 4096), {
  source: 'calibrated', low: calibrated.low, high: calibrated.high,
});
assert.deepEqual(runPlanSpeed(rtx4090, 2, [], dense, gguf(dense), 6, 4096), {
  source: 'ceiling', tokS: Math.round(rtx4090.bandwidth! / weightsGB(dense, gguf(dense))),
});
assert.deepEqual(runPlanSpeed(rtx5090, 1, [], moe, gguf(moe), 20, 4096), {
  source: 'ceiling',
  tokS: Math.round(rtx5090.bandwidth! / (weightsGB(moe, gguf(moe)) * activeParamsB(moe)! / moe.params)),
});
assert.equal(runPlanSpeed(mac, 1, [], dense, dense.quants.find(q => q.format === 'EXL2')!, 6, 4096), undefined);
assert.equal(runPlanSpeed(rtx4090, 1, [], dense, gguf(dense), 24.1, 4096), undefined);
assert.equal(runPlanSpeed(rtx4090, 1, [], dense, gguf(dense), 6, dense.contextLength + 1), undefined);
assert.equal(runPlanSpeed({ ...rtx5090, id: 'no-data', bandwidth: undefined }, 1, [], dense, gguf(dense), 6, 4096), undefined);
console.log('Run plan speed source, bounds, and fit guards verified');
