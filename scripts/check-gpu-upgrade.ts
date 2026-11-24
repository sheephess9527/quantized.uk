import assert from 'node:assert/strict';
import { gpuDatabase } from '../lib/data/gpus';
import { bestTierBySlug, tierUpgradeBaseline } from '../lib/utils/best-page';
import { fitsOnGpu, formatAllowed, gpuFitMemory, usableCapacityGB } from '../lib/utils/gpu-page';
import { compareGpuUpgrade, defaultGpuUpgrade, gpuUpgradeChoices } from '../lib/utils/gpu-upgrade';
import { qualityRank, quantRankBasis } from '../lib/utils/quality';

const measured = { pplLossPercent: 0 };
assert.equal(quantRankBasis({ pplLossPercent: 1 }, measured), 'publishedLoss');
assert.equal(quantRankBasis(measured, {}), 'partialLoss');
assert.equal(quantRankBasis({}, measured), 'partialLoss');
assert.equal(quantRankBasis({}, {}), 'bpwEstimate');

const current = gpuDatabase.find(g => g.id === 'rtx4060')!;
const candidate = gpuDatabase.find(g => g.id === 'rtx4090')!;
const choices = gpuUpgradeChoices(current);
assert(choices.includes(candidate) && !choices.includes(current) && choices.every(g => !g.isCPU));
const defaultCandidate = defaultGpuUpgrade(current, choices)!;
assert.equal(defaultCandidate.type, current.type);
assert(usableCapacityGB(defaultCandidate) > usableCapacityGB(current));

const apple = tierUpgradeBaseline(bestTierBySlug('mac-apple-silicon')!)!;
assert.equal(apple.id, 'm4-max-36');
assert.equal(apple.vram, 36);
assert.equal(usableCapacityGB(apple), 27);
assert(!gpuUpgradeChoices(apple).includes(apple));

const vram16 = bestTierBySlug('16gb-vram')!;
const tierBaseline = tierUpgradeBaseline(vram16)!;
assert.equal(tierBaseline.id, 'rtx5060ti16');
assert(vram16.cards.includes(tierBaseline));
const rtx5080 = gpuDatabase.find(g => g.id === 'rtx5080')!;
const rtx4060ti16 = gpuDatabase.find(g => g.id === 'rtx4060ti16')!;
const tierUnlocks = compareGpuUpgrade(tierBaseline, rtx5080, 4096, 1).unlocked;
assert.deepEqual(tierUnlocks, compareGpuUpgrade(rtx4060ti16, rtx5080, 4096, 1).unlocked);
assert.equal(tierUnlocks.length, 0);

const vram32 = bestTierBySlug('32gb-vram')!;
const withoutPopular = vram32.cards.filter(card => card.id !== 'rtx5090');
assert.equal(tierUpgradeBaseline({ ...vram32, cards: withoutPopular }), withoutPopular[0]);

const baseline = compareGpuUpgrade(current, candidate, 4096, 1);
assert(baseline.unlocked.length > 0);
assert(baseline.quantGains.length > 0);
assert(baseline.contextGains.length > 0);
assert.deepEqual(compareGpuUpgrade(current, current, 4096, 1), { unlocked: [], quantGains: [], contextGains: [], lostCount: 0 });
assert.equal(compareGpuUpgrade(candidate, current, 4096, 1).lostCount, baseline.unlocked.length);

const concurrent = compareGpuUpgrade(current, candidate, 32768, 4);
assert.notDeepEqual(concurrent, baseline);
for (const [ctx, batch] of [[4096, 1], [32768, 4]]) {
  const result = compareGpuUpgrade(current, candidate, ctx, batch);
  const before = new Map(fitsOnGpu(current, ctx, batch).map(fit => [fit.model.id, fit]));
  const after = fitsOnGpu(candidate, ctx, batch);
  assert.deepEqual(result.unlocked, after.filter(fit => !before.has(fit.model.id)));
  assert.deepEqual(result.quantGains.map(gain => gain.after), after.filter(fit => {
    const original = before.get(fit.model.id);
    return original && qualityRank(fit.quant) < qualityRank(original.quant);
  }));
  assert(result.contextGains.length <= 3);
  for (const { fit, before: oldMax, after: newMax } of result.contextGains) {
    assert.equal(fit.quant, before.get(fit.model.id)?.quant);
    assert(newMax > oldMax && oldMax >= ctx);
    for (const [gpu, max] of [[current, oldMax], [candidate, newMax]] as const) {
      assert(formatAllowed(gpu, fit.quant.format));
      assert(max <= fit.model.contextLength);
      assert.equal(gpuFitMemory(fit.model, gpu, fit.quant, max, batch).verdict, 'green');
      if (max < fit.model.contextLength) assert.notEqual(gpuFitMemory(fit.model, gpu, fit.quant, max + 1, batch).verdict, 'green');
    }
  }
}
console.log('GPU upgrade comparison checked: tier defaults, unlocked models, quant gains, context boundaries, concurrency and lost fits.');
