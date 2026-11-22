import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEmbedFit, buildEmbedSnippets } from '../lib/utils/embed-fit';
import { calcVRAM, getVerdict } from '../lib/utils/vram';
import { capacityGB, tightCeiling } from '../lib/utils/gpu-page';
import { quantLevelKey } from '../lib/utils/recommend';
import { models } from '../lib/data/models';
import { referenceQuant } from '../lib/utils/quality';

const parse = (s: string) => parseEmbedFit(new URLSearchParams(s));
assert.equal(parseEmbedFit(null), null);
for (const query of ['', 'model=unknown&gpu=rtx4090', 'model=qwen3-8b', ...['quant=bogus', 'ctx=0', 'ctx=NaN', 'ctx=999999999', 'ctx=1.5', 'batch=-1', 'cache=constructor', 'cards=99', 'mmproj=Infinity', 'extra=bogus'].map(s => `model=qwen3-8b&gpu=rtx4090&${s}`)]) assert.equal(parse(query), null, query);
for (const [modelId, gpuId] of [['qwen3-8b', 'rtx4090'], ['qwen3-32b', 'rtx3060'], ['qwen3-8b', 'rtx3060']]) {
  const fit = parse(`model=${modelId}&gpu=${gpuId}`);
  assert.ok(fit);
  const model = models.find(m => m.id === modelId)!;
  assert.equal(quantLevelKey(fit.quant), quantLevelKey(referenceQuant(model.quants)));
  const expected = calcVRAM({ paramsB: model.params, ...model.arch, bpw: fit.quant.bpw, contextLength: 4096, batchSize: 1 });
  assert.equal(fit.result.totalGB, expected.totalGB);
  assert.equal(fit.verdict, getVerdict(expected.totalGB, capacityGB(fit.gpu), tightCeiling(fit.gpu)));
  for (const lang of ['en', 'zh'] as const) {
    const s = buildEmbedSnippets(fit, lang);
    const prefix = `https://quantized.uk${lang === 'zh' ? '/zh' : ''}`;
    assert.ok(s.html.startsWith(`<iframe src="${prefix}/embed/fit/?`));
    assert.ok(s.html.includes('&amp;gpu='));
    assert.ok(s.html.includes('width="360" height="160"'));
    assert.ok(s.html.includes('loading="lazy"'));
    assert.ok(s.markdown.includes(`${prefix}/tools/vram-calc/?`));
    assert.ok(s.markdown.includes(s.verdict));
    assert.ok(s.calculator.includes('utm_source=embed'));
    assert.ok(parse(new URL(s.src).search.slice(1)));
  }
}
const headers = readFileSync('public/_headers', 'utf8');
const advanced = parse('model=qwen3-8b&gpu=rtx4090&ctx=8192&batch=2&cache=q8_0&cards=2&extra=rtx3060&mmproj=1.5');
assert.ok(advanced);
assert.equal(advanced.result.totalGB, calcVRAM({ paramsB: advanced.model.params, ...advanced.model.arch, bpw: advanced.quant.bpw, contextLength: 8192, batchSize: 2, kvBytesPerValue: 34 / 32, extraGB: 1.5 }).totalGB);
assert.equal(advanced.capacity, capacityGB(advanced.gpu, 2, [parse('model=qwen3-8b&gpu=rtx3060')!.gpu]));
assert.equal(parse('model=qwen3-8b&gpu=rtx4090&extra=rx7900xtx'), null);
for (const path of ['/embed/*', '/zh/embed/*']) assert.ok(headers.includes(`${path}\n  ! X-Frame-Options\n  ! Content-Security-Policy\n  Content-Security-Policy: frame-ancestors *`));
assert.ok(headers.includes("X-Frame-Options: DENY\n  Content-Security-Policy: frame-ancestors 'none'"));
console.log('Embed fit checks passed: validation, calculator parity, bilingual snippets and framing exceptions.');
