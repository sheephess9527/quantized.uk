import assert from 'node:assert/strict';
import { models } from '../lib/data/models';
import { gpuDatabase } from '../lib/data/gpus';
import { isMoE } from '../lib/utils/model-meta';
import { modelShape, offloadPlan } from '../lib/utils/calc-insights';
import { calcVRAM, quantWeights } from '../lib/utils/vram';

const tagged = models.filter(isMoE);
const missing = tagged.filter(model => !model.arch.moe);
console.log(`MoE coverage: ${tagged.length - missing.length}/${tagged.length}`);
if (missing.length) console.warn('Whole-layer fallback:', missing.map(model => model.id).join(', '));

// Baseline from a001a4d. Displaying host capacity must never change this plan.
const model = models.find(m => m.id === 'qwen3-30b-a3b')!;
const card = gpuDatabase.find(g => g.id === 'rtx3060')!;
const quant = model.quants.find(q => q.level === 'Q4_K_M')!;
const input = { ...modelShape(model, 1), ...quantWeights(quant), contextLength: 4096 };
const result = calcVRAM(input);
assert.equal(result.totalGB, 19.73);
const plan = offloadPlan(input, result, card, 1, 'ddr5-5600', 'GGUF', model);
assert.deepEqual(plan?.moe, { n: 26, all: false, cpuMoeLayers: 26, moeLayers: 48, ramGB: 8.9, gpuGB: 10.9, tokS: 95.2 });
const unknown = { ...model, arch: { ...model.arch, moe: undefined } };
const fallback = offloadPlan(input, result, card, 1, 'ddr5-5600', 'GGUF', unknown);
assert.equal(fallback?.gpuLayers, 26);
assert.equal(fallback?.moe, undefined);
