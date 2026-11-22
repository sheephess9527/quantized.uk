import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import {
  PARAM_RANGES, PARAM_RANGE_BOUNDS, PARAM_RANGE_LABEL, matchesParamRange, paramBucketCounts, type ParamRange,
} from '../lib/utils/param-buckets';
import { gpuRequirementsTable } from '../lib/utils/gpu-requirements';
import { groupedModels } from '../lib/utils/model-groups';

// Models whose published size label is not their total parameter count, with the reason.
const NAME_SIZE_EXCEPTIONS: Record<string, string> = {
  'k2-horizon-3-7b': '"3.7B" leaves out the 250K-vocabulary input/output tables; 5.06B total',
  'llama-4-scout-17b': '"17B" is active parameters per token; 109B total',
  'llama-4-maverick-17b': '"17B" is active parameters per token; 400B total',
};

const problems: string[] = [];

// 1. Bounds tile [0, ∞) with no gap or overlap, smallest first.
assert.equal(PARAM_RANGE_BOUNDS[PARAM_RANGES[0]][0], 0);
assert.equal(PARAM_RANGE_BOUNDS[PARAM_RANGES[PARAM_RANGES.length - 1]][1], Infinity);
PARAM_RANGES.slice(1).forEach((r, i) => {
  assert.equal(PARAM_RANGE_BOUNDS[r][0], PARAM_RANGE_BOUNDS[PARAM_RANGES[i]][1], `${r} must start where ${PARAM_RANGES[i]} ends`);
});

// 2. Each reader-facing label states its bounds, read back from the label text.
function labelRange(label: string): [number, number] {
  let m = label.match(/^<(\d+(?:\.\d+)?)B$/);
  if (m) return [0, Number(m[1])];
  m = label.match(/^(\d+(?:\.\d+)?)B\+$/);
  if (m) return [Number(m[1]), Infinity];
  m = label.match(/^(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)B$/);
  if (m) return [Number(m[1]), Number(m[2])];
  throw new Error(`unreadable bucket label "${label}"`);
}
for (const r of PARAM_RANGES) {
  assert.deepEqual(labelRange(PARAM_RANGE_LABEL[r]), [...PARAM_RANGE_BOUNDS[r]], `label "${PARAM_RANGE_LABEL[r]}" disagrees with ${r} bounds`);
}

/** Leading size in a label like "3.8B", "16B-A2.4B" or "17B (16E)"; undefined for names such as "E2B". */
function statedSize(label: string): number | undefined {
  const m = label.match(/(?<![A-Za-z0-9.x])(\d+(?:\.\d+)?)B\b/);
  return m ? Number(m[1]) : undefined;
}

function checkPlacement(where: string, m: (typeof models)[number], r: ParamRange) {
  const [min, max] = PARAM_RANGE_BOUNDS[r];
  const label = PARAM_RANGE_LABEL[r];
  if (!(m.params >= min && m.params < max)) problems.push(`${where}: ${m.id} (${m.params}B) is under "${label}"`);
  if (NAME_SIZE_EXCEPTIONS[m.id]) return;
  // Published sizes are rounded, so the label's upper figure is inclusive here ("InternLM2 20B" at 19.9B is 10–20B).
  for (const text of [m.paramLabel, m.name]) {
    const size = statedSize(text);
    if (size !== undefined && !(size >= min && size <= max)) {
      problems.push(`${where}: ${m.id} is called "${text}" but sits under "${label}" — fix the bounds or add a reasoned NAME_SIZE_EXCEPTIONS entry`);
    }
  }
}

// 3. Every model is in exactly one bucket, and its stated size agrees with that bucket.
for (const m of models) {
  const hits = PARAM_RANGES.filter(r => matchesParamRange(m.params, r));
  if (hits.length !== 1) { problems.push(`${m.id} (${m.params}B) matches ${hits.length} buckets`); continue; }
  checkPlacement('index', m, hits[0]);
}
for (const id of Object.keys(NAME_SIZE_EXCEPTIONS)) {
  if (!models.some(m => m.id === id)) problems.push(`NAME_SIZE_EXCEPTIONS lists unknown model ${id}`);
}
const counts = paramBucketCounts(models);
assert.equal(counts.small + counts.mid7 + counts.mid14 + counts.large32 + counts.xl, models.length);

// 4. Rendered groupings: the GPU requirements table and the model pickers.
const { buckets, rows } = gpuRequirementsTable();
assert.ok(rows.length > 0, 'requirements table has no rows');
for (const { gpu, cells } of rows) {
  cells.forEach((fit, i) => { if (fit) checkPlacement(`requirements ${gpu.id}`, fit.model, buckets[i]); });
}
for (const group of groupedModels()) {
  assert.equal(group.label, PARAM_RANGE_LABEL[group.bucket]);
  for (const m of group.models) checkPlacement(`picker ${group.label}`, m, group.bucket);
}

if (problems.length) {
  console.error(`param buckets: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`param buckets ok: ${models.length} models in ${PARAM_RANGES.map(r => PARAM_RANGE_LABEL[r]).join(' / ')}; ${rows.length} requirement rows`);
