import assert from 'node:assert/strict';
import { gpuDatabase } from '../lib/data/gpus';
import { matchRenderer } from '../lib/utils/gpu-detect';
import { canStack, capacityGB } from '../lib/utils/gpu-page';
import { gpuExplainer } from '../lib/utils/gpu-explainer';

function ids(renderer: string): string[] | null {
  return matchRenderer(renderer)?.candidates.map(g => g.id) ?? null;
}

assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4090', 'rtx4090-48']);
assert.equal(matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, false);
assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4070s']);
assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4070tis']);
assert.deepEqual(ids('ANGLE (AMD, AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rx7900xtx']);
assert.deepEqual(ids('ANGLE (AMD, AMD Radeon RX 7900 XT Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rx7900xt']);
assert.deepEqual(ids('ANGLE (Intel, Intel(R) Arc(TM) B580 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['arc-b580']);

// A single row that names its size (the index's sign of other sizes, e.g. the 8 GB A770) is not certain.
assert.deepEqual(ids('ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['arc-a770-16']);
assert.equal(matchRenderer('ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, false);
assert.equal(matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, false);

for (const [renderer, expected] of [
  ['NVIDIA GeForce GTX 1080 Ti', ['gtx1080ti']],
  ['NVIDIA GeForce RTX 2060', ['rtx2060', 'rtx2060-12']],
  ['NVIDIA GeForce RTX 2070', ['rtx2070']],
  ['NVIDIA GeForce RTX 2070 SUPER', ['rtx2070']],
  ['NVIDIA GeForce RTX 2080 SUPER', ['rtx2080']],
  ['NVIDIA GeForce RTX 2080', ['rtx2080']],
  ['NVIDIA GeForce RTX 2080 Ti', ['rtx2080ti', 'rtx2080ti-22']],
  ['NVIDIA GeForce RTX 3060 Ti', ['rtx3060ti']],
  ['NVIDIA GeForce RTX 3060', ['rtx3060']],
  ['NVIDIA GeForce RTX 3050', ['rtx3050']],
  ['NVIDIA Tesla V100-PCIE-32GB', ['v100-16', 'v100-32']],
  ['NVIDIA Tesla T4', ['t4']],
  ['NVIDIA T4', ['t4']],
  ['NVIDIA RTX A6000', ['rtxa6000']],
  ['NVIDIA RTX 6000 Ada Generation', ['rtx6000-ada']],
  ['AMD Radeon(TM) 8060S Graphics', ['ryzen-ai-max-395-64', 'ryzen-ai-max-395-128']],
] as const) {
  assert.deepEqual(ids(renderer), expected, renderer);
}
for (const renderer of ['NVIDIA GeForce RTX 2060', 'NVIDIA GeForce RTX 2080 Ti', 'NVIDIA GeForce RTX 4090', 'AMD Radeon(TM) 8060S Graphics']) {
  const guess = matchRenderer(renderer)!;
  assert.equal(guess.certain, false, renderer);
  assert.ok(guess.candidates[0].vram < guess.candidates[1].vram, renderer);
}
for (const gpu of gpuDatabase.filter(g => g.isIntegrated)) {
  assert.equal(canStack(gpu), false);
  assert.equal(capacityGB(gpu, 4), gpu.vram);
  assert.ok(gpu.bandwidthNote?.en && gpu.bandwidthNote.zh);
  const wall = gpuExplainer(gpu).ceiling;
  assert.match(wall.en, /generate slowly/);
  assert.match(wall.zh, /生成也可能很慢/);
  assert.match(wall.en, /gfx1151/);
  assert.match(wall.zh, /gfx1151/);
  assert.doesNotMatch(wall.en, /competitive with NVIDIA/);
  const unlisted = gpuExplainer({ ...gpu, id: 'another-integrated-apu', name: 'Another integrated APU', bandwidth: undefined }).ceiling;
  assert.match(unlisted.en, /system memory bandwidth/);
  assert.doesNotMatch(unlisted.zh, /undefined/);
}
assert.match(gpuExplainer(gpuDatabase.find(g => g.id === 'rx7900xtx')!).ceiling.en, /Backend coverage/);
for (const gpu of gpuDatabase.filter(g => g.addedAt === '2026-11-22')) {
  assert.match(gpu.specUrl ?? '', /^https:\/\//, gpu.id);
}

// Same chip, several memory sizes: every size is offered, smallest first, and none is certain.
const ti = matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)');
assert.deepEqual(ti?.candidates.map(g => g.id), ['rtx4060ti', 'rtx4060ti16']);
assert.equal(ti?.certain, false);
assert.equal(ti?.label, 'RTX 4060 Ti');

// A Mac names its chip but not its unified memory, so even one row is not certain.
const mac = matchRenderer('ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)');
assert.equal(mac?.certain, false);
assert.equal(matchRenderer('ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)')?.label, 'Mac M3 Pro');

// The same model number can mean different VRAM on desktop and laptop.
const laptop4090 = matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Laptop GPU (0x00002717) Direct3D11 vs_5_0 ps_5_0, D3D11)');
assert.deepEqual(laptop4090?.candidates.map(g => [g.id, g.vram]), [['rtx4090-laptop', 16]]);
assert.equal(laptop4090?.certain, true);
assert.deepEqual(ids('NVIDIA GeForce RTX 4070 Mobile/PCIe/SSE2'), ['rtx4070-laptop']);
assert.deepEqual(ids('NVIDIA GeForce RTX 3060 with Max-Q Design/PCIe/SSE2'), ['rtx3060-laptop']);
assert.deepEqual(ids('NVIDIA GeForce RTX 5070 Ti Laptop GPU'), ['rtx5070ti-laptop']);
assert.deepEqual(ids('NVIDIA GeForce RTX 3050 Ti Laptop GPU'), ['rtx3050ti-laptop']);
assert.deepEqual(ids('AMD Radeon RX 7700S (radeonsi, navi33, LLVM 19.1.7, DRM 3.61)'), ['rx7700s']);
assert.deepEqual(ids('ANGLE (AMD, AMD Radeon RX 7600M XT Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rx7600mxt']);

for (const [sku, sizes] of [['3050', [4, 6]], ['3080', [8, 16]], ['5070', [8, 12]]] as const) {
  const renderer = `NVIDIA GeForce RTX ${sku} Laptop GPU`;
  const guess = matchRenderer(renderer);
  assert.equal(guess?.label, `RTX ${sku} Laptop GPU`);
  assert.equal(guess?.certain, false);
  assert.deepEqual(guess?.candidates.map(g => g.vram), sizes);
}

for (const gpu of gpuDatabase.filter(g => g.isLaptop)) {
  assert.match(gpu.specUrl ?? '', /^https:\/\//, `${gpu.id} needs a source`);
  assert.ok(matchRenderer(gpu.name)?.candidates.includes(gpu), `${gpu.id} must be detectable`);
  assert.equal(canStack(gpu), false, `${gpu.id} is not an add-in card`);
  assert.equal(capacityGB(gpu, 2), capacityGB(gpu), `${gpu.id} must use one device's VRAM`);
}

// Unsupported laptop parts must never resolve to their desktop equivalents.
assert.equal(ids('NVIDIA GeForce RTX 3090 Mobile'), null);
assert.equal(ids('NVIDIA GeForce RTX 4060 Ti Laptop GPU'), null);
assert.equal(ids('NVIDIA GeForce MX450'), null);
assert.equal(ids('AMD Radeon RX 7800 XT Mobile'), null);
assert.equal(ids('AMD Radeon 780M Graphics'), null);
assert.equal(ids('Apple GPU'), null);
assert.equal(ids('ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)'), null);
assert.equal(ids(''), null);
assert.equal(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)'), null);

console.log('gpu-detect: renderer matching checks out');
