import assert from 'node:assert/strict';
import { articles } from '../lib/data/cookbook';
import { models } from '../lib/data/models';
import { macModelOptions, macModelRepos } from '../lib/data/mac-models';
import { gpuDatabase } from '../lib/data/gpus';
import { calcVRAM } from '../lib/utils/vram';
import { formatAllowed, vllmRocmSupported, fitsOnGpu } from '../lib/utils/gpu-page';
import { getRecommendations } from '../lib/utils/recommend';
import { canOfferOllamaLaunch, generateCLI, type CLIOptions, type Env } from '../lib/utils/cli';
import { licenceClassOf, hasImageInput } from '../lib/utils/model-facts';

for (const gpu of gpuDatabase.filter(g => g.isLaptop && g.type === 'amd')) {
  assert.equal(vllmRocmSupported(gpu.name), false, gpu.name);
  assert.equal(formatAllowed(gpu, 'AWQ'), false, gpu.name);
  assert.equal(formatAllowed(gpu, 'GPTQ'), false, gpu.name);
  assert.equal(formatAllowed(gpu, 'GGUF'), true, gpu.name);
}
const rx7700xt = gpuDatabase.find(g => g.id === 'rx7700xt')!;
assert.equal(formatAllowed(rx7700xt, 'AWQ'), true, rx7700xt.name);

for (const id of ['gtx1080ti', 'v100-16', 'v100-32', 'p100-16', 'p40-24']) {
  const gpu = gpuDatabase.find(g => g.id === id)!;
  assert.ok(gpu.cudaComputeCapability! < 7.5, gpu.name);
  assert.equal(formatAllowed(gpu, 'AWQ'), false, gpu.name);
  assert.equal(formatAllowed(gpu, 'GGUF'), true, gpu.name);
  assert.ok(fitsOnGpu(gpu).every(f => f.quant.format !== 'AWQ'), gpu.name);
  assert.ok(getRecommendations(gpu, 4096, 1).every(r => r.quant.format !== 'AWQ'), gpu.name);
  assert.equal(formatAllowed({ ...gpu, cudaComputeCapability: 7.5 }, 'AWQ'), true);
  assert.equal(formatAllowed({ ...gpu, cudaComputeCapability: undefined }, 'AWQ'), true);
}

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

const bonsai = models.find(m => m.id === 'ternary-bonsai-2-27b')!;
const bonsaiQuant = bonsai.quants[0];
for (const lang of ['en', 'zh'] as const) {
  const input = { ...opts, lang, modelId: bonsai.id, modelName: bonsai.name,
    quantLevel: bonsaiQuant.level, hfRepo: bonsaiQuant.source!.repo, ggufFilename: bonsaiQuant.source!.file };
  assert(generateCLI(input).command.includes('Ternary-Bonsai-2-27B-Q2_0.gguf'));
  const ollama = generateCLI({ ...input, framework: 'ollama' });
  assert(!ollama.command.includes('ollama run') && !ollama.command.includes('ollama pull'));
  assert(ollama.notes.some(note => note.includes('b11556')));
}

const unmapped = generateCLI({ ...opts, hfRepo: 'publisher/original-weights', ggufFilename: undefined });
assert(unmapped.command.includes('<hf-gguf-repo-id>'), 'original-weight repo without file evidence remains unverified');
const fallback = generateCLI({ ...opts, hfRepo: 'publisher/Example-GGUF', ggufFilename: undefined, fileGB: 70 });
assert(fallback.command.includes('Example-Q4_K_M*.gguf'), 'large split wildcard fallback preserved');

const granite = models.find(m => m.id === 'granite-switch-4.1-8b')!;
const graniteQuant = granite.quants.find(q => q.level === 'Q4_K_M')!;
const graniteSource = graniteQuant.source!;
assert(!canOfferOllamaLaunch(granite.id));
assert(!canOfferOllamaLaunch('granite-switch-4.1-30b'));
assert(!canOfferOllamaLaunch(undefined, 'ibm-granite/granite-switch-4.1-30b-GGUF'));
assert(!canOfferOllamaLaunch(undefined, graniteSource.repo));
for (const lang of ['en', 'zh'] as const) {
  const input = { ...opts, lang, modelId: granite.id, modelName: granite.name,
    quantLevel: graniteQuant.level, hfRepo: graniteSource.repo, ggufFilename: graniteSource.file };
  assert(generateCLI({ ...input, env: 'windows' }).command.includes(graniteSource.file!));
  const ollama = generateCLI({ ...input, framework: 'ollama' });
  assert(!/ollama (run|pull)/.test(ollama.command));
  assert(ollama.notes.some(note => note.includes('Granite Switch')));
}
const graniteFit = calcVRAM({ paramsB: granite.params, ...granite.arch, bpw: graniteQuant.bpw, contextLength: 16384, batchSize: 1 });
assert.equal(graniteFit.kvCacheGB, 2.51, 'Granite includes the single-head router cache for all tokens');

for (const m of [arete, twil]) for (const quant of m.quants) {
  const source = quant.source!;
  const result = calcVRAM({ paramsB: m.params, ...m.arch, bpw: quant.bpw, contextLength: 8192, batchSize: 1 });
  assert(Math.abs(result.modelWeightsGB - Number((source.bytes / 1024 ** 3 * 1.02).toFixed(2))) < 1e-9, `${m.id}: exact bytes determine weight estimate`);
}
const a = calcVRAM({ paramsB: arete.params, ...arete.arch, bpw: arete.quants[0].bpw, contextLength: 8192, batchSize: 1 });
assert.equal(a.kvCacheGB, 0.5, 'Arete has 16 growing-cache layers, not 64');

const vulkan = articles.find(guide => guide.id === 'amd-rocm-llamacpp')!.content.find(section => section.heading === 'Vulkan fallback on Windows or Linux')!.code;
assert(Array.isArray(vulkan));
assert.deepEqual(vulkan.map(block => block.lang), ['powershell', 'bash']);
assert.match(vulkan[0].content, /Invoke-WebRequest/);
assert.doesNotMatch(vulkan[0].content, /sudo apt|^cmake/m);
assert.match(vulkan[1].content, /sudo apt/);
assert.doesNotMatch(vulkan[1].content, /Invoke-WebRequest/);

const wslChecks = articles.find(guide => guide.id === 'wsl2-ollama-gpu')!.content[0].code;
assert(wslChecks && !Array.isArray(wslChecks));
assert.equal(wslChecks.lang, 'powershell');
assert.match(wslChecks.content, /^wsl\.exe -l -v$/m);
assert.match(wslChecks.content, /^wsl\.exe -d \$Distro --exec \/usr\/lib\/wsl\/lib\/nvidia-smi$/m);
assert.match(wslChecks.content, /^wsl\.exe -d \$Distro --exec ollama ps$/m);
assert.doesNotMatch(wslChecks.content, /^ollama ps/m);

for (const [modelId, repo] of Object.entries(macModelRepos)) {
  assert(models.some(model => model.id === modelId), `Unknown Mac model: ${modelId}`);
  assert.match(repo!, /^mlx-community\/[\w.-]+-4bit$/);
}
assert.deepEqual(macModelOptions('qwen3-4b'), {
  repo: 'mlx-community/Qwen3-4B-4bit',
  repoUrl: 'https://huggingface.co/mlx-community/Qwen3-4B-4bit',
  command: 'mlx_lm.generate --model mlx-community/Qwen3-4B-4bit --prompt "Hello"',
  studioUrl: 'lmstudio://open_from_hf?model=mlx-community/Qwen3-4B-4bit',
});
assert.equal(macModelOptions('gemma-3-4b-it'), undefined, 'unverified Mac entries stay hidden');

console.log('CLI source checks passed: both languages, five environments, llama.cpp/Ollama exact variants, unknown-source/split fallbacks and new-model evidence.');
