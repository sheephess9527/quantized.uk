import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { vramPreview } from '../lib/og/vram-result';
import { sizeAt4K, weightEvidence } from '../lib/utils/quant-source';
import { parseEmbedFit } from '../lib/utils/embed-fit';
import { gpuFitMemory } from '../lib/utils/gpu-page';
import { levelTable } from '../lib/utils/calc-insights';
import { getRecommendations } from '../lib/utils/recommend';
import { calcVRAM, quantWeights } from '../lib/utils/vram';

const model = models.find(m => m.id === 'ernie-4.5-21b-a3b')!;
const quant = model.quants.find(q => q.level === 'Q4_K_M')!;
const source = quant.source!;
const gpu = gpuDatabase.find(g => g.id === 'rtx4060ti16')!;
const settings = { paramsB: model.params, ...model.arch, contextLength: 4096, batchSize: 1 };
const exact = calcVRAM({ ...settings, bpw: 0, weightBytes: source.bytes });
assert.equal(source.bytes, 13_331_015_456);
assert.equal(exact.totalGB, 14.17);
assert.equal(exact.weightAllowanceGB, 0.25);
assert.deepEqual(calcVRAM({ ...settings, ...quantWeights(quant) }), exact);
assert.equal(sizeAt4K(model, quant), exact.totalGB);
assert.equal(gpuFitMemory(model, gpu, quant, 4096).verdict, 'yellow');
assert.equal(weightEvidence(quant), 'file');
const glimmer = models.find(m => m.id === 'muse-glimmer-30b')!;
assert.equal(weightEvidence(glimmer.quants.find(q => q.level === 'Q8_0')!), 'published');
const reverse = getRecommendations(gpu, 4096, 1).find(r => r.quant === quant)!;
assert.equal(reverse.totalGB, exact.totalGB);
assert.equal(reverse.verdict, 'yellow');
assert.equal(levelTable(model, gpu, 4096, 1).find(r => r.quant === quant)?.totalGB, exact.totalGB);
const query = new URLSearchParams({ share: '1', mode: 'forward', ctx: '4096', gpu: gpu.id, model: model.id, quant: quant.level });
assert.equal(parseEmbedFit(query)?.result.totalGB, exact.totalGB);
const imported = new URLSearchParams(query);
Object.entries({ model: 'custom', layers: model.arch.layers, kv: model.arch.kvHeads, hd: model.arch.headDim,
  hfFile: `https://huggingface.co/${source.repo}/blob/main/${source.file}`, hfBytes: source.bytes })
  .forEach(([k, v]) => imported.set(k, String(v)));
for (const lang of ['en', 'zh'] as const) {
  const indexed = vramPreview(query, lang)!;
  assert.equal(indexed.tone, 'yellow');
  assert.match(indexed.answer, /14\.17 GiB/);
  assert.equal(vramPreview(imported, lang)?.answer, indexed.answer);
}
for (const m of models) for (const q of m.quants) {
  const input = { paramsB: m.params, ...m.arch, bpw: q.bpw, contextLength: Math.min(4096, m.contextLength), batchSize: 1 };
  const expected = calcVRAM({ ...input, weightBytes: q.source?.bytes ?? q.publishedBytes });
  assert.equal(sizeAt4K(m, q), expected.totalGB);
  assert.equal(gpuFitMemory(m, gpu, q, input.contextLength).totalGB, expected.totalGB);
}
const small = gpuDatabase.find(g => g.id === 'rtx3060')!;
const rig = getRecommendations(small, 4096, 1, 'quality', true, 2, 1, false, 'text', {}, [gpu]);
assert.equal(rig.find(r => r.quant === quant)?.verdict, 'green');
assert.equal(getRecommendations(small, 4096, 1).find(r => r.quant === quant), undefined);
console.log('Indexed, imported, embedded, reverse, GPU and share estimates agree.');

// A discrete card can be above its full-GPU budget and still receive the
// site's yellow grade. Keep the budget warning alongside the shared grade.
query.set('gpu', 'm3-pro-18');
assert.equal(vramPreview(query, 'en')?.tone, 'yellow');
assert.match(vramPreview(query, 'en')!.answer, /Tight fit.*Over budget/);
