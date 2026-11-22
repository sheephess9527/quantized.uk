import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import {
  pairData,
  pairPages,
  pairHref,
  pairSize,
  pairAnswer,
} from '../lib/utils/pair-pages';
import {
  gpuSlug,
  usableCapacityGB,
  formatAllowed,
} from '../lib/utils/gpu-page';
import { measuredRowsFor } from '../lib/utils/measured-runs';
import { sameModel } from '../lib/utils/speed-label';
import { calcVRAM } from '../lib/utils/vram';
import { matrixData } from '../lib/data/benchmarks';

for (const row of matrixData) {
  const matches = models.filter(model => sameModel(model.name, row.model));
  assert.equal(matches.length, 1, `Benchmark model must map exactly once: ${row.model}`);
}

const pages = pairPages();
for (const { model, gpu } of pages) {
  const answer = pairAnswer(model, gpu)!;
  assert.equal(answer.quant, pairData(model, gpu).recommended.quant);
  assert(answer.contextLength <= model.contextLength);
  if (answer.contextLength) {
    assert.equal(answer.memory.verdict, 'green');
    assert(answer.memory.totalGB <= answer.comfortableLimitGB);
    assert.deepEqual(answer.memory, pairSize(model, gpu, answer.quant, answer.contextLength));
  }
  if (answer.contextLength < model.contextLength)
    assert.notEqual(pairSize(model, gpu, answer.quant, answer.contextLength + 1).verdict, 'green');
}
const sample = models.find(m => m.id === 'llama-3.1-8b')!;
const card = gpuDatabase.find(g => g.id === 'rtx4090')!;
assert.equal(pairAnswer({ ...sample, quants: [] }, card), undefined);
const tiny = pairAnswer(sample, { ...card, vram: 0.01 })!;
assert.equal(tiny.contextLength, 0);
assert.equal(tiny.anyQuantFits, false);
const singleQuant = { ...sample, quants: [sample.quants[0]] };
const oneToken = pairSize(singleQuant, card, singleQuant.quants[0], 1);
const tightCard = { ...card, vram: oneToken.totalGB / 0.95 };
const tightAnswer = pairAnswer(singleQuant, tightCard)!;
assert.equal(tightAnswer.contextLength, 0);
assert.equal(tightAnswer.anyQuantFits, true);
assert.equal(tightAnswer.memory.verdict, 'yellow');
assert.equal(pairAnswer(sample, { ...card, vram: 100000 })!.contextLength, sample.contextLength);
for (const attention of [
  { fullLayers: 4, windowLayers: 8, windowTokens: 1024, fullKvHeads: 2, fullHeadDim: 256 },
  { fullLayers: 0 },
]) {
  const model = { ...sample, arch: { ...sample.arch, attention } };
  const answer = pairAnswer(model, card)!;
  assert.deepEqual(answer.memory, pairSize(model, card, answer.quant, answer.workedContext));
  assert.equal(answer.kvFormula.includes(' + '), !!attention.windowLayers);
}
assert.equal(new Set(gpuDatabase.map(gpuSlug)).size, gpuDatabase.length);
assert.equal(
  new Set(pages.map(p => pairHref(p.model, p.gpu))).size,
  pages.length
);
assert(existsSync('app/zh/quant-hub/[modelId]/[gpuId]/page.tsx'));
for (const gpu of gpuDatabase)
  for (const model of models) {
    const pair = pairData(model, gpu);
    if (measuredRowsFor(gpu).some(row => sameModel(model.name, row.model)))
      assert(pair.eligible, `Missing measured ${model.id}/${gpu.id}`);
    if (!pair.eligible) continue;
    assert(pages.some(p => p.model.id === model.id && p.gpu.id === gpu.id));
    if (!pair.measured.length) {
      assert.notEqual(pair.recommended.verdict, 'red');
      assert(pair.recommended.quant.source);
      assert(pair.recommended.totalGB >= usableCapacityGB(gpu) * 0.25);
    }
    assert.equal(
      pair.rows.length,
      model.quants.filter(q => formatAllowed(gpu, q.format)).length
    );
    for (const row of pair.rows)
      for (const contextLength of [4096, 16384, 32768, 131072].filter(
        c => c <= model.contextLength
      )) {
        const expected = calcVRAM({
          paramsB: model.params,
          layers: model.arch.layers,
          kvHeads: model.arch.kvHeads,
          headDim: model.arch.headDim,
          attention: model.arch.attention,
          bpw: row.quant.bpw,
          contextLength,
          batchSize: 1,
        });
        assert.equal(
          pairSize(model, gpu, row.quant, contextLength).totalGB,
          expected.totalGB
        );
      }
  }
assert(pages.some(p => p.model.id === 'qwen3-32b' && p.gpu.id === 'rtx4090'));
assert(
  !pairData(models[0], {
    ...gpuDatabase[0],
    id: 'empty-test',
    name: 'Unknown',
    vram: 0.01,
    bandwidth: undefined,
  }).eligible
);
console.log(
  `Pair pages: ${pages.length} eligible pairs, ${pages.length * 2} bilingual pages; measured coverage, slugs, sizing and zh mirror OK.`
);
