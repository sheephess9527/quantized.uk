/**
 * Fetches live download/like stats from Hugging Face API at build time.
 * Falls back to existing hf-stats.json if network fails.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../lib/data/hf-stats.json');

const hfRepoMap = {
  'llama-3.1-8b': 'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF',
  'llama-3.1-70b': 'bartowski/Meta-Llama-3.1-70B-Instruct-GGUF',
  'llama-3.2-3b': 'bartowski/Llama-3.2-3B-Instruct-GGUF',
  'llama-3.2-1b': 'bartowski/Llama-3.2-1B-Instruct-GGUF',
  'llama-3.3-70b': 'unsloth/Llama-3.3-70B-Instruct-GGUF',
  'qwen2.5-7b': 'Qwen/Qwen2.5-7B-Instruct-GGUF',
  'qwen2.5-14b': 'Qwen/Qwen2.5-14B-Instruct-GGUF',
  'qwen2.5-32b': 'Qwen/Qwen2.5-32B-Instruct-GGUF',
  'qwen2.5-72b': 'Qwen/Qwen2.5-72B-Instruct-GGUF',
  'qwen2.5-3b': 'Qwen/Qwen2.5-3B-Instruct-GGUF',
  'qwen2.5-coder-7b': 'Qwen/Qwen2.5-Coder-7B-Instruct-GGUF',
  'qwen2.5-coder-32b': 'bartowski/Qwen2.5-Coder-32B-Instruct-GGUF',
  'deepseek-r1-distill-qwen-14b': 'bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF',
  'deepseek-r1-distill-llama-70b': 'bartowski/DeepSeek-R1-Distill-Llama-70B-GGUF',
  'deepseek-coder-v2-lite': 'bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF',
  'phi-3.5-mini': 'bartowski/Phi-3.5-mini-instruct-GGUF',
  'mistral-nemo-12b': 'bartowski/Mistral-Nemo-Instruct-2407-GGUF',
  'mistral-small-24b': 'bartowski/Mistral-Small-Instruct-2409-GGUF',
  'gemma-2-9b': 'bartowski/gemma-2-9b-it-GGUF',
  'mixtral-8x7b': 'bartowski/Mixtral-8x7B-Instruct-v0.1-GGUF',
  'codestral-22b': 'bartowski/Codestral-22B-v0.1-GGUF',
  'nous-hermes-3-llama-3.1-8b': 'bartowski/Nous-Hermes-3-Llama-3.1-8B-GGUF',
  'granite-3.1-8b': 'bartowski/granite-3.1-8b-instruct-GGUF',
  'llama-3.2-11b-vision': 'bartowski/Llama-3.2-11B-Vision-Instruct-GGUF',
  'qwen2-vl-7b': 'Qwen/Qwen2-VL-7B-Instruct-GGUF',
  'gemma-2-2b': 'bartowski/gemma-2-2b-it-GGUF',
  'gemma-2-27b': 'bartowski/gemma-2-27b-it-GGUF',
  'qwen2.5-0.5b': 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
  'qwen2.5-1.5b': 'Qwen/Qwen2.5-1.5B-Instruct-GGUF',
  'phi-3-medium-14b': 'bartowski/Phi-3-medium-14b-instruct-GGUF',
  'phi-4-mini': 'bartowski/Phi-4-mini-instruct-GGUF',
  'mistral-7b-v0.3': 'bartowski/Mistral-7B-Instruct-v0.3-GGUF',
  'deepseek-v2-lite': 'bartowski/DeepSeek-V2-Lite-Chat-GGUF',
  'deepseek-r1-distill-qwen-7b': 'bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF',
  'deepseek-r1-distill-qwen-32b': 'bartowski/DeepSeek-R1-Distill-Qwen-32B-GGUF',
  'llama-3.2-90b-vision': 'bartowski/Llama-3.2-90B-Vision-Instruct-GGUF',
  'olmo-2-7b': 'bartowski/OLMo-2-1124-7B-Instruct-GGUF',
  'internlm2-7b': 'bartowski/internlm2_5-7b-chat-GGUF',
  'internlm2-20b': 'bartowski/internlm2_5-20b-chat-GGUF',
  'aya-23-8b': 'bartowski/aya-23-8B-GGUF',
  'openchat-3.6-8b': 'bartowski/OpenChat-3.6-8B-GGUF',
  'zephyr-7b-beta': 'bartowski/zephyr-7b-beta-GGUF',
  'stablelm-2-12b': 'bartowski/stablelm-2-12b-chat-GGUF',
  'falcon-3-10b': 'bartowski/Falcon3-10B-Instruct-GGUF',
  'jamba-1.5-mini': 'bartowski/jamba-1.5-mini-GGUF',
  'qwen3-8b': 'Qwen/Qwen3-8B-GGUF',
  'qwen3-14b': 'Qwen/Qwen3-14B-GGUF',
  'gemma-3-4b-it': 'bartowski/gemma-3-4b-it-GGUF',
  'gemma-3-12b-it': 'bartowski/gemma-3-12b-it-GGUF',
  'llama-4-scout-17b': 'unsloth/Llama-4-Scout-17B-16E-Instruct-GGUF',
  'llama-4-maverick-17b': 'unsloth/Llama-4-Maverick-17B-128E-Instruct-GGUF',
  'llama-3.1-405b': 'bartowski/Meta-Llama-3.1-405B-Instruct-GGUF',
  'qwen3-32b': 'Qwen/Qwen3-32B-GGUF',
  'qwen3-30b-a3b': 'Qwen/Qwen3-30B-A3B-GGUF',
  'qwen3-235b-a22b': 'Qwen/Qwen3-235B-A22B-GGUF',
  'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
  'deepseek-r1': 'deepseek-ai/DeepSeek-R1',
};

async function fetchRepo(repo) {
  const res = await fetch(`https://huggingface.co/api/models/${repo}`, {
    headers: { 'User-Agent': 'quantized.uk-build/1.0' },
  });
  if (!res.ok) throw new Error(`HF API ${res.status} for ${repo}`);
  const data = await res.json();
  return {
    repo,
    downloads: data.downloads ?? 0,
    likes: data.likes ?? 0,
    lastModified: data.lastModified ?? null,
  };
}

async function main() {
  const models = {};
  let ok = 0;
  let fail = 0;

  for (const [modelId, repo] of Object.entries(hfRepoMap)) {
    try {
      models[modelId] = await fetchRepo(repo);
      ok++;
      process.stdout.write(`  ✓ ${modelId}\n`);
    } catch (err) {
      fail++;
      process.stderr.write(`  ✗ ${modelId}: ${err.message}\n`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    source: 'https://huggingface.co/api/models',
    modelCount: ok,
    models,
  };

  if (ok === 0 && fs.existsSync(OUT)) {
    console.log('All fetches failed — keeping existing hf-stats.json');
    process.exit(0);
  }

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUT} (${ok} ok, ${fail} failed)`);
}

main().catch(err => {
  console.error('fetch-hf-stats failed:', err.message);
  if (fs.existsSync(OUT)) {
    console.log('Keeping existing hf-stats.json');
    process.exit(0);
  }
  process.exit(1);
});