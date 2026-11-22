import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import {
  pairData,
  pairPages,
  pairHref,
  pairSize,
} from '../lib/utils/pair-pages';
import {
  gpuSlug,
  usableCapacityGB,
  formatAllowed,
} from '../lib/utils/gpu-page';
import { measuredRowsFor } from '../lib/utils/measured-runs';
import { sameModel } from '../lib/utils/speed-label';
import { calcVRAM } from '../lib/utils/vram';

const pages = pairPages();
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
