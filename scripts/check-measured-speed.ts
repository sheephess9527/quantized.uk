// Run: npm run check:speed — compares measuredSpeed() with every
// llama.cpp/Ollama GGUF row in matrixData and prints measured ÷ predicted.
import assert from 'node:assert/strict';
import { matrixData } from '../lib/data/benchmarks';
import { speedQuote } from '../lib/utils/speed-label';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { measuredSpeed, CALIBRATION_ERROR } from '../lib/utils/measured-speed';
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

const referenceModel = models.find(m => m.id === 'llama-3.1-8b')!;
const referenceQuant = referenceModel.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M')!;
assert.ok(referenceQuant.speedRTX4090);
for (const gpu of gpuDatabase.filter(g => g.isLaptop)) {
  const quote = speedQuote(gpu, referenceModel, referenceQuant, 4096);
  assert.notEqual(quote.source, 'other-card', gpu.id);
  if (!gpu.bandwidth) assert.equal(quote.point, undefined, gpu.id);
}
const rx7800m = gpuDatabase.find(g => g.id === 'rx7800m')!;
assert.equal(speedQuote(rx7800m, referenceModel, referenceQuant, 4096).source, 'ceiling');
const desktop5050 = gpuDatabase.find(g => g.id === 'rtx5050')!;
assert.equal(speedQuote(desktop5050, referenceModel, referenceQuant, 4096).source, 'other-card');

console.log('CALIBRATION_ERROR matches the data');
