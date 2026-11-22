import assert from 'node:assert/strict';
import { matchRenderer } from '../lib/utils/gpu-detect';

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

// Same chip, several memory sizes: every size is offered, smallest first, and none is certain.
const ti = matchRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)');
assert.deepEqual(ti?.candidates.map(g => g.id), ['rtx4060ti', 'rtx4060ti16']);
assert.equal(ti?.certain, false);
assert.equal(ti?.label, 'RTX 4060 Ti');

// A Mac names its chip but not its unified memory, so even one row is not certain.
const mac = matchRenderer('ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)');
assert.equal(mac?.certain, false);
assert.equal(matchRenderer('ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)')?.label, 'Mac M3 Pro');

// Laptop parts share desktop names but not desktop memory; masked or integrated renderers have no row.
assert.equal(ids('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)'), null);
assert.equal(ids('Apple GPU'), null);
assert.equal(ids('ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)'), null);
assert.equal(ids(''), null);

console.log('gpu-detect: renderer matching checks out');
