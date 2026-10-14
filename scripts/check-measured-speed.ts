// Run: npx tsx scripts/check-measured-speed.ts — compares measuredSpeed() with every
// llama.cpp/Ollama GGUF row in matrixData and prints measured ÷ predicted.
import { matrixData } from '../lib/data/benchmarks';
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
console.log('CALIBRATION_ERROR matches the data');
