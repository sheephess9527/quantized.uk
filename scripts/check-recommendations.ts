/** Run: npm run check:recommendations */
import { matrixData } from '../lib/data/benchmarks';
import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { calcVRAM, KV_CACHE_TYPES } from '../lib/utils/vram';
import { getRecommendations } from '../lib/utils/recommend';
import { hasImageInput } from '../lib/utils/model-facts';
import { modelShape, contextReach } from '../lib/utils/calc-insights';
import { sourceBpw } from '../lib/utils/quant-source';
import { dataProblems } from '../lib/data/validate';

const gpu = gpuDatabase.find(g => g.id === 'rtx4090')!;
const qwen = models.find(m => m.id === 'qwen3-8-27b')!;
const solar = models.find(m => m.id === 'solar-10.7b')!;
assert.ok(solar);
assert.ok(getRecommendations(gpu, solar.contextLength, 1).some(r => r.model === solar));
assert.ok(!getRecommendations(gpu, solar.contextLength + 1, 1).some(r => r.model === solar));

let checked = 0;
for (const card of gpuDatabase) {
  for (const ctx of [4096, 32768, 131072]) {
    for (const input of ['text', 'image'] as const) {
      const rows = getRecommendations(card, ctx, 1, 'quality', true, KV_CACHE_TYPES.f16, 1, false, input);
      for (const r of rows) {
        assert.ok(r.model.contextLength >= ctx, `${r.model.id}: context exceeded`);
        if (input === 'image') {
          assert.ok(hasImageInput(r.model.id));
          assert.equal(r.quant.format, 'GGUF');
          assert.ok(r.quant.source!.mmprojBytes! > 0);
          assert.equal(r.extraGB, r.quant.source!.mmprojBytes! / 1024 ** 3);
        } else assert.equal(r.extraGB, undefined);
        const sized = calcVRAM({ ...modelShape(r.model, 1, KV_CACHE_TYPES.f16, r.extraGB), bpw: r.quant.bpw, contextLength: ctx });
        assert.equal(r.totalGB, sized.totalGB, 'reverse/forward memory mismatch');
        checked++;
      }
    }
  }
}

const get = (input: 'text' | 'image', card = gpu) => getRecommendations(card, 4096, 1, 'quality', true, undefined, 1, false, input)
  .find(r => r.model === qwen && r.quant.level === 'Q4_K_M')!;
const text = get('text'), image = get('image');
assert.ok(image.totalGB > text.totalGB);
const boundaryCard = { ...gpu, vram: text.totalGB / 0.875 };
assert.equal(get('text', boundaryCard).verdict, 'green');
assert.equal(get('image', boundaryCard).verdict, 'yellow');
const imageReach = contextReach(modelShape(qwen, 1, 2, image.extraGB), image.quant.bpw, gpu, qwen.contextLength);
assert.ok(imageReach.comfortable <= contextReach(modelShape(qwen, 1), text.quant.bpw, gpu, qwen.contextLength).comfortable);

// Missing projector data must remove a row, not silently turn it into a text-size fit.
const source = image.quant.source!;
const original = source.mmprojBytes;
try {
  delete source.mmprojBytes;
  assert.equal(get('image'), undefined);
  assert.ok(get('text'));
} finally { source.mmprojBytes = original; }
try {
  source.mmprojBytes = -1;
  assert.ok(dataProblems().some(problem => problem.includes('mmprojBytes must be a positive integer')));
} finally { source.mmprojBytes = original; }
assert.deepEqual(dataProblems(), []);
const benchmark = matrixData.find(row => row.hardware === 'M2 Ultra 192G')!;
const savedBenchmark = { ...benchmark };
try {
  benchmark.runtimeVersion = '';
  assert.ok(dataProblems().some(problem => problem.includes('missing runtime version')));
  benchmark.runtimeVersion = savedBenchmark.runtimeVersion;
  for (const date of ['', '2026-02-30', 'not-a-date', '2099-01-01']) {
    benchmark.firstPublishedAt = date;
    assert.ok(dataProblems().some(problem => problem.includes('invalid first-publication date')));
  }
  benchmark.firstPublishedAt = savedBenchmark.firstPublishedAt;
  benchmark.framework = 'llama.cpp';
  assert.ok(dataProblems().some(problem => problem.includes('framework llama.cpp disagrees with speedBenchmarks Ollama')));
} finally { Object.assign(benchmark, savedBenchmark); }
assert.deepEqual(dataProblems(), []);

for (const ctx of [NaN, Infinity, 0, -1]) assert.deepEqual(getRecommendations(gpu, ctx, 1), []);
for (const batch of [NaN, Infinity, 0, -1]) assert.deepEqual(getRecommendations(gpu, 4096, batch), []);

const added = ['lfm2-5-1-2b', 'lfm2-5-8b-a1b', 'ministral-3-3b', 'ministral-3-14b'];
for (const id of added) {
  const model = models.find(m => m.id === id)!;
  assert.ok(model && model.quants.length >= 2);
  for (const quant of model.quants) assert.ok(Math.abs(sourceBpw(model, quant.source!) - quant.bpw) < 0.02);
  assert.ok(getRecommendations(gpu, 4096, 1).some(r => r.model === model));
}
console.log(`Recommendations checked: ${checked} fits across ${gpuDatabase.length} hardware profiles; context limits, image accounting, fit boundaries, missing-source rejection and four new models pass.`);
