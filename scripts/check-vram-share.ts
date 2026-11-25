import assert from 'node:assert/strict';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { vramImageUrl, vramPreview } from '@/lib/og/vram-result';
import { vramSvg } from '@/lib/og/vram-svg';
import { modelShape } from '@/lib/utils/calc-insights';
import { getRecommendations, readRecommendationFilters } from '@/lib/utils/recommend';
import { calcVRAM, KV_CACHE_TYPES, quantWeights } from '@/lib/utils/vram';
import { readVramAttention, snapshotVramLink } from '@/lib/utils/vram-link';

const forward = new URL('https://quantized.uk/tools/vram-calc/?mode=forward&ctx=8192&batch=2&cache=q8_0&quant=Q4_K_M#result');
const copied = new URL(snapshotVramLink(forward, forward.searchParams, {
  mode: 'forward', modelId: 'qwen3-8b', gpuId: 'rtx4090', lang: 'en',
}));
assert.equal(copied.hash, '');
assert.equal(copied.searchParams.get('gpu'), 'rtx4090');
assert.equal(copied.searchParams.get('model'), 'qwen3-8b');
const model = models.find(m => m.id === 'qwen3-8b')!;
const quant = model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M')!;
const sizing = calcVRAM({ ...modelShape(model, 2, KV_CACHE_TYPES.q8_0), ...quantWeights(quant), contextLength: 8192 });
const english = vramPreview(copied.searchParams, 'en')!;
assert.equal(english.title, model.name);
assert.match(english.details, /Q4_K_M · 8,192 tokens · batch 2 · q8_0 KV/);
assert.equal(english.answer, `${sizing.totalGB.toFixed(2)} GiB estimated · Comfortable fit`);
assert.equal(english.hardware, 'RTX 4090');
const chinese = vramPreview(copied.searchParams, 'zh')!;
assert.match(chinese.details, /8,192 词元 · 并发 2/);
assert.match(chinese.answer, /从容运行/);
assert.notEqual(vramSvg(english), vramSvg(chinese));

const update = (base: URLSearchParams, fields: Record<string, string>) =>
  new URLSearchParams({ ...Object.fromEntries(base), ...fields });
const ctxOver = vramPreview(update(copied.searchParams, { ctx: String(model.contextLength + 1) }), 'en')!;
assert.match(ctxOver.answer, /Context exceeds model limit/);
assert.doesNotMatch(ctxOver.answer, /Comfortable fit/);
const rig = vramPreview(update(copied.searchParams, { cards: '2', extra: 'rtx3060' }), 'en')!;
assert.match(rig.hardware!, /^2× RTX 4090 \+ RTX 3060/);
const mixedRig = update(copied.searchParams, { cards: '2', extra: 'rtx3060,rtx4090,rtx3060,rx7900xt,rx7900gre,rx7900xtx' });
const copiedRig = new URL(snapshotVramLink(forward, mixedRig, {
  mode: 'forward', modelId: 'qwen3-8b', gpuId: 'rx7900xtx', lang: 'en',
}));
assert.equal(copiedRig.searchParams.get('extra'), 'rx7900xt,rx7900gre');
assert.match(vramPreview(copiedRig.searchParams, 'en')!.hardware!, /^2× Radeon RX 7900 XTX \+ Radeon RX 7900 XT \+ Radeon RX 7900 GRE$/);

const noGpu = new URL(snapshotVramLink(forward, copied.searchParams, { mode: 'forward', modelId: 'qwen3-8b', gpuId: '', lang: 'en' }));
assert.equal(noGpu.searchParams.get('gpu'), 'none');
assert.equal(vramPreview(noGpu.searchParams, 'en')?.hardware, undefined);
assert.equal(vramPreview(noGpu.searchParams, 'en')?.answer, `${sizing.totalGB.toFixed(2)} GiB estimated`);

const reverse = new URL('https://quantized.uk/zh/what-llm-can-i-run-locally/?mode=reverse&ctx=4096&batch=1&cards=2&cache=q4_0&sort=speed&yellow=0&input=image');
const imageShare = new URL(snapshotVramLink(reverse, reverse.searchParams, { mode: 'reverse', modelId: '', gpuId: 'rtx4090', lang: 'zh' }));
assert.equal(imageShare.pathname, '/zh/tools/vram-calc/');
const gpu = gpuDatabase.find(g => g.id === 'rtx4090')!;
const imageRows = getRecommendations(gpu, 4096, 1, 'speed', false, KV_CACHE_TYPES.q4_0, 2, true, 'image');
assert.ok(imageRows.length > 0);
const imagePreview = vramPreview(imageShare.searchParams, 'zh')!;
assert.equal(imagePreview.answer, `${imageRows.length} 个兼容配置`);
assert.match(imagePreview.details, /图像输入/);
assert.match(imagePreview.hardware!, /2× · 48.00 GiB 可用/);

const reverseFilterCases: Record<string, string>[] = [
  { minTok: '20', feat: 'tools' },
  { minTok: '40', feat: 'tools,code' },
  { minTok: 'garbage', feat: 'unknown' },
  { minTok: '20', feat: 'tools', cards: '2' },
  { minTok: '20', feat: 'tools', extra: 'rtx3060' },
];
for (const fields of reverseFilterCases) {
  const params = new URLSearchParams({ share: '1', mode: 'reverse', gpu: 'rtx4090', ctx: '4096', batch: '1', ...fields });
  const filters = readRecommendationFilters(params);
  if (params.get('cards') === '2' || params.has('extra')) filters.minTok = 0;
  const rows = getRecommendations(gpu, 4096, 1, 'quality', true, KV_CACHE_TYPES.f16, Number(params.get('cards') ?? 1), true, 'text', filters, gpuDatabase.filter(g => g.id === fields.extra));
  assert.equal(vramPreview(params, 'en')!.answer, `${rows.length} compatible configs`);
  assert.equal(vramPreview(params, 'zh')!.answer, `${rows.length} 个兼容配置`);
  const imageUrl = vramImageUrl(new URL(`https://quantized.uk/tools/vram-calc/?${params}`), 'en');
  assert.equal(imageUrl.searchParams.get('minTok'), fields.minTok);
  assert.equal(imageUrl.searchParams.get('feat'), fields.feat);
  assert.equal(vramPreview(imageUrl.searchParams, 'en')!.answer, `${rows.length} compatible configs`);
  const snapshot = new URL(snapshotVramLink(new URL('https://quantized.uk/tools/vram-calc/'), params, { mode: 'reverse', modelId: '', gpuId: 'rtx4090', lang: 'en' }));
  assert.equal(vramPreview(snapshot.searchParams, 'en')!.answer, `${rows.length} compatible configs`);
}
assert.notEqual(vramPreview(new URLSearchParams('share=1&mode=reverse&gpu=rtx4090&ctx=4096&minTok=20&feat=tools'), 'en')!.answer,
  vramPreview(new URLSearchParams('share=1&mode=reverse&gpu=rtx4090&ctx=4096'), 'en')!.answer);

const custom = new URLSearchParams('share=1&mode=forward&gpu=none&model=custom&quant=Q4_K_M&ctx=4096&params=4&layers=24&kv=8&hd=128&full=0&mmproj=1.25&repo=some/repo');
assert.deepEqual(readVramAttention(custom), { fullLayers: 0 });
const customCard = vramPreview(custom, 'en')!;
assert.equal(customCard.title, 'Custom model');
assert.notEqual(vramPreview(update(custom, { full: '24' }), 'en')?.answer, customCard.answer);
assert.doesNotMatch(vramSvg(customCard), /some\/repo/);
noGpu.search = custom.toString();
assert.equal(vramImageUrl(noGpu, 'zh').searchParams.get('lang'), 'zh');
assert.equal(vramImageUrl(noGpu, 'zh').searchParams.has('repo'), false);
assert.equal(vramImageUrl(noGpu, 'zh').searchParams.get('mmproj'), '1.25');

const invalid: Record<string, string>[] = [
  { share: '0' }, { ctx: 'Infinity' }, { ctx: '-1' }, { batch: '0' }, { cache: 'unknown' },
  { gpu: 'unknown' }, { model: 'unknown' }, { quant: 'constructor' }, { mode: 'finetune' },
];
for (const bad of invalid) {
  assert.equal(vramPreview(update(copied.searchParams, bad), 'en'), undefined, JSON.stringify(bad));
}

console.log('VRAM share snapshot and preview checks passed');
