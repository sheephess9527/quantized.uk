/**
 * Fetches live download/like stats from Hugging Face API at build time.
 * Merges with existing hf-stats.json so failed/gated repos keep prior data.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { hfRepoMap } from '../lib/data/hf-repos.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../lib/data/hf-stats.json');

function loadExisting() {
  if (!fs.existsSync(OUT)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    return data.models ?? {};
  } catch {
    return {};
  }
}

export async function fetchRepo(repo, { fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`https://huggingface.co/api/models/${repo}`, {
      headers: { 'User-Agent': 'quantized.uk-build/1.0' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HF API ${res.status} for ${repo}`);
    const data = await res.json();
    return {
      repo,
      downloads: data.downloads ?? 0,
      likes: data.likes ?? 0,
      lastModified: data.lastModified ?? null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchStats(repoMap, existing, fetchModel = fetchRepo) {
  const models = { ...existing };
  const entries = Object.entries(repoMap);
  const results = new Array(entries.length);
  let next = 0;
  let ok = 0;
  let fail = 0;
  let kept = 0;

  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (next < entries.length) {
      const index = next++;
      const [modelId, repo] = entries[index];
      try {
        results[index] = await fetchModel(repo);
        ok++;
        process.stderr.write(`  ✓ ${modelId}\n`);
      } catch (err) {
        fail++;
        if (existing[modelId]) {
          kept++;
          process.stderr.write(`  ↷ ${modelId}: ${err.message} (kept cached)\n`);
        } else {
          process.stderr.write(`  ✗ ${modelId}: ${err.message}\n`);
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }));

  for (let i = 0; i < entries.length; i++) {
    if (results[i]) models[entries[i][0]] = results[i];
  }
  return { models, ok, fail, kept };
}

async function main() {
  const existing = loadExisting();
  const { models, ok, fail, kept } = await fetchStats(hfRepoMap, existing);

  const output = {
    fetchedAt: new Date().toISOString(),
    source: 'https://huggingface.co/api/models',
    modelCount: Object.keys(models).length,
    models,
  };

  if (ok === 0 && Object.keys(existing).length > 0) {
    console.log('All fetches failed — keeping existing hf-stats.json');
    process.exit(0);
  }

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUT} (${ok} ok, ${fail} failed, ${kept} kept from cache)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(err => {
  console.error('fetch-hf-stats failed:', err.message);
  if (fs.existsSync(OUT)) {
    console.log('Keeping existing hf-stats.json');
    process.exit(0);
  }
  process.exit(1);
});