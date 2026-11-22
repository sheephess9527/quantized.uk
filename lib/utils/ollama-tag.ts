import { models } from '@/lib/data/models';
import { ollamaLibrary } from '@/lib/data/ollama-tags';
import { quantGroups } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';

export type OllamaTagResult =
  | { kind: 'match'; tag: string; modelId: string; level: string; quantFromTag: boolean; newerCheckpoint: boolean }
  | { kind: 'unknownLibrary'; tag: string; name: string }
  | { kind: 'unknownTag'; tag: string; name: string; known: string[] }
  | { kind: 'unknownQuant'; tag: string; quant: string }
  | { kind: 'community'; tag: string }
  | { kind: 'hfNotIndexed'; tag: string; repo: string }
  | { kind: 'hfNeedsQuant'; tag: string; repo: string };

const LEVELS = new Set(Object.values(quantGroups).flat());
const QUANT_SUFFIX = /^(?:(.*)-)?(iq\d[a-z0-9_]*|q\d[a-z0-9_]*|fp16|f16|bf16|fp32|f32|mxfp4)$/i;
const PREFIXES: RegExp[] = [
  /^ollama\s+(?:run|pull|show)\s+/i,
  /^https?:\/\//i,
  /^(?:www\.)?ollama\.com\/(?:library\/)?/i,
  /^registry\.ollama\.ai\/(?:library\/)?/i,
];

export function normalizeOllamaQuant(raw: string): string {
  const u = raw.toUpperCase();
  if (u === 'F16' || u === 'FP16') return 'FP16';
  if (u === 'F32' || u === 'FP32') return 'FP32';
  return u;
}

/** Reads text from the model search box as an Ollama tag. Plain search words return null. */
export function resolveOllamaTag(input: string): OllamaTagResult | null {
  let text = input.trim();
  let explicit = false;
  for (const p of PREFIXES) {
    if (p.test(text)) {
      text = text.replace(p, '');
      explicit = true;
    }
  }
  if (explicit) text = text.split(/\s+/)[0] ?? '';
  else if (/\s/.test(text)) return null;
  if (!text) return null;

  const hf = text.match(/^(?:hf\.co|huggingface\.co)\/([\w.-]+\/[\w.-]+)(?::(\S+))?$/i);
  if (hf) return resolveHf(text, hf[1], hf[2]);

  const m = text.match(/^([a-z0-9][\w.-]*(?:\/[\w.-]+)?)(?::([\w.-]+))?$/i);
  if (!m || (!explicit && m[2] === undefined)) return null;
  const tag = text;
  const name = m[1].toLowerCase();
  if (name.includes('/')) return { kind: 'community', tag };
  const entry = ollamaLibrary.find(e => e.name === name);
  if (!entry) return { kind: 'unknownLibrary', tag, name };
  const known = entry.rows.flatMap(r => r.tags).map(t => t || 'latest');

  let part = (m[2] ?? 'latest').toLowerCase();
  if (part === 'latest') {
    if (entry.latest === undefined) return { kind: 'unknownTag', tag, name, known };
    part = entry.latest;
  }
  const bareRow = entry.rows.find(r => r.tags.includes(part));
  if (bareRow) {
    return { kind: 'match', tag, modelId: bareRow.modelId, level: bareRow.level, quantFromTag: false, newerCheckpoint: !!bareRow.bareIsNewer };
  }
  const q = part.match(QUANT_SUFFIX);
  if (q) {
    const stem = q[1] ?? '';
    const row = entry.rows.find(r => r.quantStems.includes(stem));
    if (row) {
      const level = normalizeOllamaQuant(q[2]);
      if (!LEVELS.has(level)) return { kind: 'unknownQuant', tag, quant: q[2] };
      return { kind: 'match', tag, modelId: row.modelId, level, quantFromTag: true, newerCheckpoint: false };
    }
  }
  return { kind: 'unknownTag', tag, name, known };
}

function resolveHf(tag: string, repoRaw: string, tail?: string): OllamaTagResult {
  const repo = repoRaw.toLowerCase();
  const candidates = models
    .map(model => ({ model, quants: model.quants.filter(qv => qv.source?.repo.toLowerCase() === repo) }))
    .filter(c => c.quants.length > 0);
  if (candidates.length === 0) return { kind: 'hfNotIndexed', tag, repo: repoRaw };

  let level: string | null = null;
  if (tail && /\.gguf$/i.test(tail)) {
    for (const c of candidates) {
      const hit = c.quants.find(qv => qv.source?.file?.toLowerCase() === tail.toLowerCase());
      if (hit) return { kind: 'match', tag, modelId: c.model.id, level: quantLevelKey(hit), quantFromTag: true, newerCheckpoint: false };
    }
    return { kind: 'hfNeedsQuant', tag, repo: repoRaw };
  }
  if (tail) {
    level = normalizeOllamaQuant(tail);
    if (!LEVELS.has(level)) return { kind: 'unknownQuant', tag, quant: tail };
  }
  // Without a tag Ollama downloads the repository's Q4_K_M file.
  const wanted = level ?? 'Q4_K_M';
  const owners = candidates.filter(c => c.quants.some(qv => quantLevelKey(qv) === wanted));
  const pick = owners.length === 1 ? owners[0] : candidates.length === 1 && level ? candidates[0] : null;
  if (!pick) return { kind: 'hfNeedsQuant', tag, repo: repoRaw };
  return { kind: 'match', tag, modelId: pick.model.id, level: wanted, quantFromTag: !!level, newerCheckpoint: false };
}
