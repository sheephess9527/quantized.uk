import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { ollamaLibrary } from '../lib/data/ollama-tags';
import { resolveOllamaTag } from '../lib/utils/ollama-tag';
import { quantGroups } from '../lib/utils/vram';

const levels = new Set(Object.values(quantGroups).flat());
const ids = new Set(models.map(m => m.id));
const names = new Set<string>();
for (const entry of ollamaLibrary) {
  assert.ok(!names.has(entry.name), `duplicate library ${entry.name}`);
  names.add(entry.name);
  const tags = entry.rows.flatMap(r => r.tags);
  const stems = entry.rows.flatMap(r => r.quantStems);
  assert.equal(new Set(tags).size, tags.length, `${entry.name}: a tag maps to two models`);
  assert.equal(new Set(stems).size, stems.length, `${entry.name}: a quant stem maps to two models`);
  if (entry.latest !== undefined) assert.ok(tags.includes(entry.latest), `${entry.name}: latest is not a listed tag`);
  for (const r of entry.rows) {
    assert.ok(ids.has(r.modelId), `${entry.name}: unknown model ${r.modelId}`);
    assert.ok(levels.has(r.level), `${entry.name}: ${r.level} is not a calculator quant`);
  }
}

function match(input: string, modelId: string, level: string) {
  const r = resolveOllamaTag(input);
  assert.equal(r?.kind, 'match', `${input} → ${JSON.stringify(r)}`);
  if (r?.kind === 'match') assert.deepEqual([r.modelId, r.level], [modelId, level], input);
  return r;
}
function kind(input: string, expected: string | null) {
  assert.equal(resolveOllamaTag(input)?.kind ?? null, expected, input);
}

match('qwen3:8b-q4_K_M', 'qwen3-8b', 'Q4_K_M');
match('qwen3:8b-q8_0', 'qwen3-8b', 'Q8_0');
match('llama3.1:8b', 'llama-3.1-8b', 'Q4_K_M');
match('llama3.1:8b-instruct-q6_K', 'llama-3.1-8b', 'Q6_K');
match('  ollama run gpt-oss:20b --verbose', 'gpt-oss-20b', 'MXFP4');
match('ollama pull qwen3', 'qwen3-8b', 'Q4_K_M');
match('qwen3:latest', 'qwen3-8b', 'Q4_K_M');
match('https://ollama.com/library/gemma3:12b-it-q8_0', 'gemma-3-12b-it', 'Q8_0');
match('Qwen3:30B', 'qwen3-30b-a3b', 'Q4_K_M');
match('llama3.2:1b', 'llama-3.2-1b', 'Q8_0');
match('glm-4.7-flash:q8_0', 'glm-4.7-flash', 'Q8_0');
match('gemma4:e4b-it-bf16', 'gemma-4-e4b', 'BF16');
match('phi4:14b-fp16', 'phi-4', 'FP16');
assert.equal((resolveOllamaTag('qwen3:4b') as { newerCheckpoint?: boolean }).newerCheckpoint, true);
assert.equal((resolveOllamaTag('qwen3:4b-q4_K_M') as { newerCheckpoint?: boolean }).newerCheckpoint, false);
assert.equal((resolveOllamaTag('qwen3:8b') as { quantFromTag?: boolean }).quantFromTag, false);

// Never a wrong guess: other checkpoints, unknown sizes and unknown quants are refused.
kind('deepseek-r1:8b', 'unknownTag');
kind('olmo-3:7b', 'unknownTag');
kind('devstral:24b', 'unknownLibrary');
kind('qwen3.6:27b-q8_0', 'unknownTag');
kind('gemma4:26b-a4b-it-q4_K_M', 'unknownTag');
kind('qwen3:3b', 'unknownTag');
kind('llama3.1', null);
kind('ollama run llama3.1', 'unknownTag');
kind('qwen3:8b-q5_1', 'unknownQuant');
kind('qwen3:8b-mxfp4', 'unknownTag');
kind('qwen3:8b-iq4_xs', 'unknownTag');
kind('nosuch:1b', 'unknownLibrary');
kind('someone/model:7b', 'community');
kind('hf.co/nobody/Nothing-GGUF:Q4_K_M', 'hfNotIndexed');
// Ordinary search text stays a search.
kind('qwen 27b', null);
kind('gpt-oss', null);
kind('qwen3', null);
kind('', null);

// hf.co tags resolve through the indexed source repository.
const hfModel = models.find(m => m.quants.some(q => q.source?.repo && q.source.file && q.format === 'GGUF'));
assert.ok(hfModel);
const hfQuant = hfModel.quants.find(q => q.source?.repo && q.source.file && q.format === 'GGUF')!;
match(`hf.co/${hfQuant.source!.repo}:${hfQuant.source!.file}`, hfModel.id, hfQuant.level);

// Mixed-precision keys keep their canonical spelling; a quant the repo is not indexed with is refused.
match('hf.co/tencent/Hy-Memory-30B-A3B-GGUF:Q8_0-expsIQ2_XXS', 'hy-memory-30b-a3b', 'Q8_0-expsIQ2_XXS');
match('hf.co/tencent/Hy-Memory-30B-A3B-GGUF:q8_0-expsiq1_m', 'hy-memory-30b-a3b', 'Q8_0-expsIQ1_M');
kind('hf.co/tencent/Hy-Memory-30B-A3B-GGUF:Q2_K', 'hfNeedsQuant');

console.log(`check-ollama-tags: ${ollamaLibrary.length} libraries, ${ollamaLibrary.reduce((n, e) => n + e.rows.length, 0)} rows OK`);
