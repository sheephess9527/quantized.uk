import assert from 'node:assert/strict';
import { commonQuantLevels, changedAdvancedSettings, type AdvancedSettings } from '../lib/utils/calc-simplify';
import { quantGroups } from '../lib/utils/vram';

const defaults: AdvancedSettings = { cards: 1, extraIds: [], kvType: 'f16', batchSize: 1, mmprojGB: '', reverseInput: 'text', sortBy: 'quality', includeYellow: true, bestPerModel: true };
for (const mode of ['forward', 'reverse'] as const) {
  assert.equal(changedAdvancedSettings(mode, defaults), 0);
  for (const patch of [{ cards: 2 }, { extraIds: ['rtx3090'] }, { kvType: 'q8_0' }, { kvType: 'q4_0' }, { batchSize: 4 }]) {
    assert.equal(changedAdvancedSettings(mode, { ...defaults, ...patch }), 1);
  }
}
for (const patch of [{ reverseInput: 'image' }, { sortBy: 'speed' }, { sortBy: 'vram' }, { includeYellow: false }, { bestPerModel: false }]) {
  assert.equal(changedAdvancedSettings('reverse', { ...defaults, ...patch }), 1);
}
assert.equal(changedAdvancedSettings('forward', { ...defaults, mmprojGB: '0.5' }), 1);
assert.equal(changedAdvancedSettings('forward', { ...defaults, mmprojGB: '0' }), 0);
assert.equal(changedAdvancedSettings('forward', { ...defaults, mmprojGB: 'invalid' }), 0);
assert.equal(changedAdvancedSettings('reverse', { ...defaults, cards: 2, kvType: 'q8_0', batchSize: 4, reverseInput: 'image', sortBy: 'speed', includeYellow: false, bestPerModel: false, extraIds: ['rtx3090'] }), 8);
assert.equal(changedAdvancedSettings('finetune', { ...defaults, cards: 2 }), 0);
assert.deepEqual(commonQuantLevels(''), ['Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0']);
const fullList = Object.values(quantGroups).flat();
assert.equal(fullList.length, new Set(fullList).size);
for (const selected of fullList) {
  for (const reference of [...fullList, undefined]) {
    const common = commonQuantLevels(selected, reference);
    assert(common.includes(selected));
    if (reference) assert(common.includes(reference));
    assert.equal(common.length, new Set(common).size);
    assert(common.every(q => fullList.includes(q)), 'common choices remain reachable in the complete format groups');
    assert(Object.values(quantGroups).some(levels => levels.includes(selected)), 'every level remains selectable via the full format list');
  }
}
console.log('Calculator simplification checks passed: advanced defaults, changed settings, common quant deduplication and full quant reachability.');
