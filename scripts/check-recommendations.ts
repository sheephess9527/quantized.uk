/** Run: npm run check:recommendations */
import { matrixData } from '../lib/data/benchmarks';
import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { calcVRAM, KV_CACHE_TYPES } from '../lib/utils/vram';
import { fitsOnGpu, countModelsFitting, nextStepUp, GPU_CONTEXT_PRESETS, GPU_BATCH_PRESETS } from '../lib/utils/gpu-page';
import { homePicks } from '../lib/utils/home-picks';
import { getRecommendations, recommendationSpeed } from '../lib/utils/recommend';
import { hasToolCalling } from '../lib/utils/model-facts';
import { hasImageInput } from '../lib/utils/model-facts';
import { modelShape, contextReach, offloadPlan } from '../lib/utils/calc-insights';
import { sourceBpw } from '../lib/utils/quant-source';
import { dataProblems } from '../lib/data/validate';
import { measuredSpeed } from '../lib/utils/measured-speed';
import { matchingSpeedRun } from '../lib/utils/measured-runs';

const gpu = gpuDatabase.find(g => g.id === 'rtx4090')!;
const baseline = getRecommendations(gpu, 4096, 1);
for (const row of baseline) {
  const run = matchingSpeedRun(gpu, row.model, row.quant);
  const estimate = measuredSpeed(gpu, row.model, row.quant);
  assert.deepEqual(recommendationSpeed(gpu, row.model, row.quant), run ? { tokS: run.speedTokSec, source: 'measured' } : estimate ? { tokS: estimate.tokS, source: 'estimated' } : undefined);
  assert.equal(recommendationSpeed(gpu, row.model, row.quant, 2), undefined);
}
assert.deepEqual(getRecommendations(gpu, 4096, 1, 'quality', true, undefined, 1, false, 'text', {}), baseline);
const filtered = (filters: { minTok?: number; tools?: boolean; code?: boolean }) =>
  getRecommendations(gpu, 4096, 1, 'quality', true, undefined, 1, false, 'text', filters);
assert.deepEqual(filtered({ minTok: 40 }), baseline.filter(r => (recommendationSpeed(gpu, r.model, r.quant)?.tokS ?? -1) >= 40));
assert.ok(filtered({ minTok: 40 }).length > 0 && filtered({ minTok: 40 }).length < baseline.length);
assert.equal(getRecommendations({ ...gpu, id: 'unknown-card', name: 'Unknown card' }, 4096, 1, 'quality', true, undefined, 1, false, 'text', { minTok: 10 }).length, 0);
assert.deepEqual(getRecommendations(gpu, 4096, 1, 'quality', true, undefined, 2, false, 'text', { minTok: 10 }), getRecommendations(gpu, 4096, 1, 'quality', true, undefined, 2));
assert.deepEqual(filtered({ tools: true }), baseline.filter(r => hasToolCalling(r.model.id)));
assert.ok(filtered({ tools: true }).length > 0);
assert.deepEqual(filtered({ code: true }), baseline.filter(r => r.model.categories.includes('code')));
assert.ok(filtered({ code: true }).length > 0);
assert.deepEqual(filtered({ tools: true, code: true }), baseline.filter(r => hasToolCalling(r.model.id) && r.model.categories.includes('code')));
assert.equal(filtered({ minTok: Number.MAX_VALUE }).length, 0);
assert.deepEqual(filtered({ minTok: NaN }), baseline);
assert.deepEqual(filtered({ minTok: -1 }), baseline);
const imageTools = getRecommendations(gpu, 4096, 1, 'quality', true, undefined, 1, false, 'image', { tools: true });
assert.ok(imageTools.every(r => hasImageInput(r.model.id) && hasToolCalling(r.model.id) && r.extraGB! > 0));
const laptop = gpuDatabase.find(g => g.id === 'rx7700s')!;
const qwen32b = models.find(m => m.id === 'qwen3-32b')!;
const gguf32b = qwen32b.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M')!;
const laptopShape = { ...modelShape(qwen32b, 1), bpw: gguf32b.bpw, contextLength: 4096 };
const laptopResult = calcVRAM(laptopShape);
const laptopOffload = offloadPlan(laptopShape, laptopResult, laptop, 2, 'ddr5-5600', gguf32b.format, qwen32b);
assert.ok(laptopOffload && laptopOffload.gpuLayers > 0 && laptopOffload.gpuLayers < laptopShape.layers);
assert.equal(laptopOffload.gpuBudgetGB, laptop.vram - laptopOffload.reserveGB);
assert.equal(laptopOffload.reserveGB, 1);
assert.ok(laptopOffload.ramGB > 0);
assert.equal(laptopOffload.tokS, undefined);
const laptop4060 = gpuDatabase.find(g => g.id === 'rtx4060-laptop')!;
assert.ok(offloadPlan(laptopShape, laptopResult, laptop4060, 1, 'ddr5-5600', 'GGUF'));
assert.equal(offloadPlan(laptopShape, laptopResult, laptop4060, 1, 'ddr5-5600', 'AWQ'), undefined);
assert.equal(offloadPlan(laptopShape, laptopResult, laptop4060, 1, 'ddr5-5600', undefined), undefined);

const qwen = models.find(m => m.id === 'qwen3-8-27b')!;
const solar = models.find(m => m.id === 'solar-10.7b')!;
assert.ok(solar);
assert.ok(getRecommendations(gpu, solar.contextLength, 1).some(r => r.model === solar));
assert.ok(!getRecommendations(gpu, solar.contextLength + 1, 1).some(r => r.model === solar));

for (const card of gpuDatabase) {
  assert.deepEqual(fitsOnGpu(card), fitsOnGpu(card, 4096, 1));
  for (const ctx of GPU_CONTEXT_PRESETS) {
    for (const batch of GPU_BATCH_PRESETS) {
      const fits = fitsOnGpu(card, ctx, batch);
      assert.equal(countModelsFitting(card, 'comfortable', ctx, batch), fits.length);
      for (const fit of fits) {
        assert.ok(fit.model.contextLength >= ctx, `${fit.model.id}: GPU page context exceeded`);
        assert.equal(fit.totalGB, calcVRAM({
          ...modelShape(fit.model, batch), bpw: fit.quant.bpw, contextLength: ctx,
        }).totalGB);
      }
    }
  }
}
assert.ok(fitsOnGpu(gpu, solar.contextLength, 1).some(r => r.model === solar));
assert.ok(!fitsOnGpu(gpu, solar.contextLength + 1, 1).some(r => r.model === solar));
assert.deepEqual(homePicks(gpu, 'chat'), homePicks(gpu, 'chat', 4096, 1));
for (const ctx of [NaN, Infinity, 0, -1]) assert.deepEqual(fitsOnGpu(gpu, ctx, 1), []);
for (const batch of [NaN, Infinity, 0, -1]) assert.deepEqual(fitsOnGpu(gpu, 4096, batch), []);
assert.deepEqual(fitsOnGpu(gpu, 131072, 1e9), []);
assert.deepEqual(homePicks(gpu, 'chat', 131072, 1e9), []);
for (const pick of homePicks(gpu, 'chat', 32768, 4)) {
  assert.ok(fitsOnGpu(gpu, 32768, 4).some(f => f.model === pick.model && f.quant === pick.quant));
}
const step = nextStepUp(gpu, fitsOnGpu(gpu, 32768, 4).length, 32768, 4);
if (step) assert.equal(step.extraModels, fitsOnGpu(step.gpu, 32768, 4).length - fitsOnGpu(gpu, 32768, 4).length);
console.log('GPU/home fits: preset contexts and concurrency, native windows, default parity, empty and invalid inputs checked.');

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
