import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importQuantFile, isQuantFileInput, parseQuantFile, quantFileUrl, quantFromFilename, readHubQuantFile } from '@/lib/utils/hf-quant-file';
import { calcVRAM } from '@/lib/utils/vram';
import { vramImageUrl, vramPreview } from '@/lib/og/vram-result';
import { shapeFromConfig } from '@/lib/utils/hf-import';
import { models } from '@/lib/data/models';

const input = 'https://huggingface.co/owner/model/blob/refs%2Fpr%2F2/quant%20files/model-UD-Q4_K_XL-00002-of-00002.gguf?download=true';
const split = { repo: 'owner/model', revision: 'refs/pr/2', path: 'quant files/model-UD-Q4_K_XL-00002-of-00002.gguf' };

test('parse file paths, preserve the revision and reject non-model links', () => {
  assert.deepEqual(parseQuantFile(input), split);
  assert.deepEqual(parseQuantFile(quantFileUrl(split)), split);
  const single = { repo: 'owner/model', revision: 'main', path: 'dir/model.Q4_K_M.gguf' };
  for (const url of [
    'https://hf.co/owner/model/resolve/main/dir/model.Q4_K_M.gguf',
    'huggingface.co/owner/model/blob/main/dir/model.Q4_K_M.gguf',
    'owner/model dir/model.Q4_K_M.gguf',
    'owner/model/dir/model.Q4_K_M.gguf',
  ]) assert.deepEqual(parseQuantFile(url), single);
  for (const url of [
    'owner/model', 'https://example.org/owner/model/blob/main/model.gguf',
    'https://huggingface.co/owner/model/tree/main/model.gguf',
    'https://huggingface.co/owner/model/blob/main/%ZZ.gguf',
    'owner/model dir/mmproj-model-Q8_0.gguf', 'owner/model model.safetensors',
  ]) assert.equal(parseQuantFile(url), null, url);
});

test('identify the filename quant without guessing unknown labels', () => {
  assert.equal(quantFromFilename(split.path), 'UD-Q4_K_XL');
  assert.equal(quantFromFilename('Q8_0-folder/model.q4_k_m.gguf'), 'Q4_K_M');
  assert.equal(quantFromFilename('model-IQ4_NL.gguf'), 'IQ4_NL');
  assert.equal(quantFromFilename('model-f16.gguf'), 'FP16');
  assert.equal(quantFromFilename('model-MXFP4_MOE.gguf'), 'MXFP4_MOE');
  assert.equal(quantFromFilename('model.gguf'), undefined);
});

test('reject auxiliary GGUF files without requesting Hub metadata', async () => {
  for (const path of [
    'dir/mmproj-model-Q8_0.gguf',
    'mtp-google_gemma-4-31B-it-Q4_0.gguf',
    'model-DRAFT-HEAD-Q8_0.gguf',
    'draft/model-Q8_0.gguf',
    'model.imatrix.gguf',
  ]) {
    const url = `https://huggingface.co/owner/model/blob/main/${path}`;
    assert.ok(isQuantFileInput(url));
    assert.equal(parseQuantFile(url), null);
    assert.equal(readHubQuantFile(new URLSearchParams({ hfFile: url, hfBytes: '100' })), undefined);
    assert.deepEqual(await importQuantFile(url, async () => assert.fail(url)), { ok: false, error: 'auxiliaryFile' });
  }
  assert.ok(parseQuantFile('owner/imatrix-model model-Q4_K_M.gguf'));
});

test('sum all parts even when the pasted URL points to a later part', async () => {
  const first = split.path.replace('00002-of-', '00001-of-');
  const sizes = [{ path: split.path, size: 1_000_000_000 }, { path: first, size: 2_000_000_000 }];
  const fetcher = (missing = false): typeof fetch => async (url, options) => {
    switch (String(url)) {
      case 'https://huggingface.co/api/models/owner/model/paths-info/refs%2Fpr%2F2':
        assert.equal(options?.method, 'POST');
        assert.deepEqual((options.body as URLSearchParams).getAll('paths'), [first, split.path]);
        return Response.json((missing ? sizes.slice(0, 1) : sizes).map(row => ({ ...row, type: 'file' })));
      case 'https://huggingface.co/api/models/owner/model/revision/refs%2Fpr%2F2':
        return Response.json({ cardData: { base_model: 'owner/base' } });
      case 'https://huggingface.co/owner/model/resolve/refs%2Fpr%2F2/config.json':
        return new Response(null, { status: 404 });
      case 'https://huggingface.co/owner/base/resolve/main/config.json':
        return Response.json({ num_hidden_layers: 24, num_key_value_heads: 4, head_dim: 128 });
      default:
        assert.fail(String(url));
    }
  };
  const result = await importQuantFile(input, fetcher());
  assert.ok(result.ok);
  assert.deepEqual(result.file, { ...split, bytes: 3_000_000_000 });
  assert.equal(result.shape?.layers, 24);
  assert.equal(result.shape?.configRepo, 'owner/base');
  assert.deepEqual(await importQuantFile(input, fetcher(true)), { ok: false, error: 'missingShards' });
  assert.deepEqual(await importQuantFile(input, async () => new Response(null, { status: 403 })), { ok: false, error: 'notFound' });
});

test('use exact bytes instead of bits per weight in the estimate and shared preview', () => {
  const weightBytes = 2 * 1024 ** 3;
  const result = calcVRAM({ paramsB: 7, layers: 24, kvHeads: 4, headDim: 128, bpw: 4.85,
    contextLength: 4096, batchSize: 1, weightBytes });
  assert.equal(result.modelWeightsGB, 2);
  const params = new URLSearchParams({ share: '1', mode: 'forward', model: 'custom', gpu: 'none',
    ctx: '4096', layers: '24', kv: '4', hd: '128', hfFile: quantFileUrl(split), hfBytes: String(weightBytes) });
  assert.deepEqual(readHubQuantFile(params), { ...split, bytes: weightBytes });
  const preview = vramPreview(params, 'en')!;
  assert.match(preview.details, /^UD-Q4_K_XL/);
  assert.equal(preview.answer, `${result.totalGB.toFixed(2)} GiB estimated`);
  const image = vramImageUrl(new URL(`https://quantized.uk/tools/vram-calc/?${params}`), 'zh');
  assert.match(vramPreview(image.searchParams, 'zh')!.answer, /^2\.41 GiB 预估/);
  params.set('mctx', '2048');
  params.set('gpu', 'rtx4090');
  const overContext = vramPreview(params, 'en');
  assert.match(overContext!.answer, /Context exceeds model limit/);
  assert.doesNotMatch(overContext!.answer, /fit|budget/i);
  assert.equal(overContext!.tone, 'yellow');
  params.delete('layers');
  assert.equal(vramPreview(params, 'en'), undefined);
});

test('Gemma 4 31B exact-file sizing and shared preview use separate global and window KV layouts', () => {
  const text_config = {
    num_hidden_layers: 60, head_dim: 256, global_head_dim: 512,
    num_key_value_heads: 16, num_global_key_value_heads: 4, sliding_window: 1024,
    layer_types: Array.from({ length: 60 }, (_, i) => i % 6 === 5 ? 'full_attention' : 'sliding_attention'),
  };
  const { layers, kvHeads, headDim, attention } = shapeFromConfig({ text_config });
  const indexed = models.find(m => m.id === 'gemma-4-31b')!.arch;
  assert.equal(layers, indexed.layers);
  assert.equal(kvHeads, indexed.kvHeads);
  assert.equal(headDim, indexed.headDim);
  assert.deepEqual(attention, {
    fullLayers: indexed.attention?.fullLayers, windowLayers: indexed.attention?.windowLayers,
    windowTokens: indexed.attention?.windowTokens, fullKvHeads: indexed.attention?.fullKvHeads,
    fullHeadDim: indexed.attention?.fullHeadDim,
  });
  const unknown = shapeFromConfig({ text_config: { ...text_config, layer_types: undefined } });
  assert.equal(unknown.kvHeads, undefined);
  assert.equal(unknown.headDim, undefined);
  const weightBytes = 19_598_489_952;
  const result = calcVRAM({ paramsB: 30.7, layers: 60, kvHeads: 16, headDim: 256, attention,
    bpw: 0, contextLength: 65536, batchSize: 1, weightBytes });
  assert.equal(result.kvCacheGB, 6.17);
  const params = new URLSearchParams({ share: '1', mode: 'forward', model: 'custom', gpu: 'none',
    ctx: '65536', layers: '60', kv: '16', hd: '256', full: '10', win: '50', wt: '1536', fkv: '4', fhd: '512',
    hfFile: 'https://huggingface.co/owner/gguf/blob/main/gemma-4-31B-it-Q4_K_M.gguf', hfBytes: String(weightBytes) });
  const image = vramImageUrl(new URL(`https://quantized.uk/tools/vram-calc/?${params}`), 'en');
  assert.equal(vramPreview(image.searchParams, 'en')?.answer, `${result.totalGB.toFixed(2)} GiB estimated`);
});
