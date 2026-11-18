import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { calcVRAM } from '../lib/utils/vram';
import { generateCLI, type CLIOptions, type Env } from '../lib/utils/cli';
import { licenceClassOf, hasImageInput } from '../lib/utils/model-facts';

const twil = models.find(m => m.id === 'twil-8b-balanced')!;
const arete = models.find(m => m.id === 'arete-27b')!;
assert(twil && arete);
assert.equal(licenceClassOf(twil.id), 'noncommercial');
assert.equal(licenceClassOf(arete.id), 'commercial');
assert(hasImageInput(arete.id));
assert(!hasImageInput(twil.id));
assert.equal(twil.quants.length, 1, 'do not silently mix verbose weights into balanced');

const q = twil.quants[0];
const filename = q.source!.file!;
const opts: CLIOptions = {
  framework: 'llamacpp', env: 'linux', modelId: twil.id, modelName: twil.name,
  quantLevel: q.level, hfRepo: q.source!.repo, ggufFilename: filename,
  fileGB: q.source!.bytes / 1e9, gpuLayers: 99, contextLen: 4096, threads: 8, port: 8080,
};
for (const env of ['linux', 'windows', 'mac', 'docker', 'compose'] as Env[]) {
  for (const lang of ['en', 'zh'] as const) {
    for (const framework of ['llamacpp', 'ollama'] as const) {
      const out = generateCLI({ ...opts, env, lang, framework });
      const text = [out.command, out.compose, ...out.notes].join('\n');
      assert(text.includes(filename), `${env}/${lang}/${framework}: preserve exact variant filename`);
      assert(!text.includes('TwIL-8B-Q4_K_M.gguf'), 'inferred nonexistent filename must not leak');
      assert(!text.includes('verbose'), 'balanced must not select verbose');
      assert(!text.includes('<hf-gguf-repo-id>'), 'verified file admits an original repo');
      if (framework === 'ollama') assert(text.includes(`hf.co/${q.source!.repo}:${filename}`));
    }
  }
}
for (const env of ['linux', 'windows', 'mac'] as const) {
  const launch = generateCLI({ ...opts, env, framework: 'ollama', ollamaSetContext: true, contextLen: 8192 });
  assert(launch.command.includes(`FROM hf.co/${q.source!.repo}:${filename}`));
  assert(launch.command.includes('PARAMETER num_ctx 8192'));
  assert(launch.command.includes('ollama run quantized-twil-8b-balanced:q4_k_m-ctx8192'));
  const standalone = generateCLI({ ...opts, env, framework: 'ollama' });
  assert(!standalone.command.includes('PARAMETER num_ctx'));
}

const unmapped = generateCLI({ ...opts, hfRepo: 'publisher/original-weights', ggufFilename: undefined });
assert(unmapped.command.includes('<hf-gguf-repo-id>'), 'original-weight repo without file evidence remains unverified');
const fallback = generateCLI({ ...opts, hfRepo: 'publisher/Example-GGUF', ggufFilename: undefined, fileGB: 70 });
assert(fallback.command.includes('Example-Q4_K_M*.gguf'), 'large split wildcard fallback preserved');

for (const m of [arete, twil]) for (const quant of m.quants) {
  const source = quant.source!;
  const result = calcVRAM({ paramsB: m.params, ...m.arch, bpw: quant.bpw, contextLength: 8192, batchSize: 1 });
  assert(Math.abs(result.modelWeightsGB - Number((source.bytes / 1024 ** 3 * 1.02).toFixed(2))) < 1e-9, `${m.id}: exact bytes determine weight estimate`);
}
const a = calcVRAM({ paramsB: arete.params, ...arete.arch, bpw: arete.quants[0].bpw, contextLength: 8192, batchSize: 1 });
assert.equal(a.kvCacheGB, 0.5, 'Arete has 16 growing-cache layers, not 64');
console.log('CLI source checks passed: both languages, five environments, llama.cpp/Ollama exact variants, unknown-source/split fallbacks and new-model evidence.');
