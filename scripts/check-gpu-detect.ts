import assert from 'node:assert/strict';
import { gpuDatabase } from '../lib/data/gpus';
import { matchRenderer } from '../lib/utils/gpu-detect';
import { canStack, capacityGB } from '../lib/utils/gpu-page';

function ids(renderer: string): string[] | null {
  return matchRenderer(renderer)?.candidates.map(g => g.id) ?? null;
}

assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4090']);
assert.equal(matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, true);
assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4070s']);
assert.deepEqual(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rtx4070tis']);
assert.deepEqual(ids('ANGLE (AMD, AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rx7900xtx']);
assert.deepEqual(ids('ANGLE (AMD, AMD Radeon RX 7900 XT Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['rx7900xt']);
assert.deepEqual(ids('ANGLE (Intel, Intel(R) Arc(TM) B580 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['arc-b580']);

// A single row that names its size (the index's sign of other sizes, e.g. the 8 GB A770) is not certain.
assert.deepEqual(ids('ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'), ['arc-a770-16']);
assert.equal(matchRenderer('ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, false);
assert.equal(matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)')?.certain, false);

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

console.log('gpu-detect: renderer matching checks out');
