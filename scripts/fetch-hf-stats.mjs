/**
 * Fetches live download/like stats from Hugging Face API at build time.
 * Merges with existing hf-stats.json so failed/gated repos keep prior data.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hfRepoMap } from '../lib/data/hf-repos.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../lib/data/hf-stats.json');

const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN;

function loadExisting() {
  if (!fs.existsSync(OUT)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    return data.models ?? {};
  } catch {
    return {};
  }
}

async function fetchRepo(repo) {
  const headers = { 'User-Agent': 'quantized.uk-build/1.0' };
  if (HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;

  const res = await fetch(`https://huggingface.co/api/models/${repo}`, { headers });
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
  const existing = loadExisting();
  const models = { ...existing };
  let ok = 0;
  let fail = 0;
  let kept = 0;

  for (const [modelId, repo] of Object.entries(hfRepoMap)) {
    try {
      models[modelId] = await fetchRepo(repo);
      ok++;
      process.stdout.write(`  ✓ ${modelId}\n`);
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
  if (fail > 0 && !HF_TOKEN) {
    console.log('Tip: set HF_TOKEN for gated Hugging Face repos');
  }
}

main().catch(err => {
  console.error('fetch-hf-stats failed:', err.message);
  if (fs.existsSync(OUT)) {
    console.log('Keeping existing hf-stats.json');
    process.exit(0);
  }
  process.exit(1);
});