import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/community-speed';
import { communitySpeeds, matchingCommunitySpeeds, SPEED_BOUNDS, validateSpeedSubmission, type CommunitySpeed, type SpeedConfiguration } from '../lib/data/community-speed';

const configuration: SpeedConfiguration = {
  modelId: 'qwen3-8b', quant: 'Q4_K_M', gpuIds: ['rtx3060'], context: 4096, batch: 1, kv: 'f16', vision: false,
};
const observation = { runtime: 'llama.cpp', version: 'b12409', prefill: 600.2, decode: 40.3 };
const valid = { ...configuration, ...observation };

assert.deepEqual(validateSpeedSubmission({ ...valid, runtime: ' llama.cpp ', source: 'measured', website: '', note: ' ' }),
  { ...valid, note: undefined, url: undefined });
assert.equal(validateSpeedSubmission({ ...valid, url: 'https://example.com' })?.url, 'https://example.com/');
assert.ok(validateSpeedSubmission({ ...valid, gpuIds: ['rtx3060', 'rtx4090'] }));
assert.ok(validateSpeedSubmission({ ...valid, batch: 3 }));
const cpuRun = { ...valid, gpuIds: ['cpu-32'] };
assert.equal(validateSpeedSubmission({ ...cpuRun, processor: ' Ryzen 9 7950X ' })?.processor, 'Ryzen 9 7950X');
for (const processor of [undefined, '', ' ', 123, 'x'.repeat(81), 'two\nlines']) {
  assert.equal(validateSpeedSubmission({ ...cpuRun, processor }), undefined);
}
assert.equal(validateSpeedSubmission({ ...valid, processor: 'Ryzen 9 7950X' }), undefined);
for (const overrides of [
  { modelId: 'custom' }, { quant: 'bad' }, { gpuIds: [] }, { gpuIds: ['missing'] }, { gpuIds: Array(5).fill('rtx3060') },
  { context: -1 }, { context: 1.5 }, { batch: 17 }, { batch: 1.5 }, { kv: 'other' }, { vision: 'false' },
  { prefill: 0 }, { prefill: SPEED_BOUNDS.prefillMax + 1 }, { decode: SPEED_BOUNDS.decodeMax + 1 },
  { decode: '40.3' }, { decode: Infinity }, { runtime: ' ' }, { version: null }, { website: 'bot' },
  { url: 'javascript:alert(1)' }, { url: 'https://user@example.com' }, { url: 'https:example.com' }, { note: 'x'.repeat(1001) },
]) assert.equal(validateSpeedSubmission({ ...valid, ...overrides }), undefined, JSON.stringify(overrides));

const reviewed: CommunitySpeed = { ...valid, id: '12345678-1234-4000-8000-123456789012', source: 'community' };
assert.deepEqual(matchingCommunitySpeeds(configuration, [reviewed]), [reviewed]);
for (const overrides of [{ modelId: 'other' }, { quant: 'Q8_0' }, { gpuIds: ['rtx4090'] }, { context: 8192 }, { batch: 2 }, { kv: 'q8_0' as const }, { vision: true }]) {
  assert.deepEqual(matchingCommunitySpeeds({ ...configuration, ...overrides }, [reviewed]), []);
}
assert.equal(new Set(communitySpeeds.map(row => row.id)).size, communitySpeeds.length);
for (const row of communitySpeeds) {
  assert.equal(row.source, 'community');
  assert.match(row.id, /^[0-9a-f-]{36}$/);
  assert.equal(validateSpeedSubmission(row)?.url, row.url, 'Approved evidence links must be valid and canonical');
  assert.ok(validateSpeedSubmission(row), row.id);
}

type Context = Parameters<typeof onRequest>[0];
let args: unknown[] = [];
let changes = 1;
const db = { prepare: () => ({ bind: (...values: unknown[]) => {
  args = values;
  return { run: async () => ({ success: true, meta: { changes } }) };
} }) } as unknown as NonNullable<Context['env']['COMMUNITY_SPEED_DB']>;
const env = { COMMUNITY_SPEED_DB: db, COMMUNITY_SPEED_RATE_SECRET: 'local-test' };
const endpoint = 'https://quantized.uk/api/community-speed';
const headers = { Origin: 'https://quantized.uk', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.12' };
const post = (body: string, overrides?: Partial<RequestInit>, bindings: Partial<typeof env> = env) => onRequest({
  request: new Request(endpoint, { method: 'POST', headers, body, ...overrides }),
  env: bindings,
} as unknown as Context);

async function checkEndpoint() {
  assert.equal((await post('', { method: 'GET', body: undefined })).status, 405);
  assert.equal((await post(JSON.stringify(valid), { headers: { ...headers, Origin: 'https://other.example' } })).status, 403);
  assert.equal((await post(JSON.stringify(valid), { headers: { ...headers, 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await post(JSON.stringify(valid), undefined, {})).status, 503);
  assert.equal((await post('{')).status, 400);
  assert.equal((await post(' '.repeat(8193) + JSON.stringify(valid))).status, 400);
  assert.equal((await post(JSON.stringify({ ...valid, website: 'bot' }))).status, 400);
  assert.equal((await post(JSON.stringify(cpuRun))).status, 400);
  assert.equal(args.length, 0);

  const accepted = await post(JSON.stringify({ ...valid, note: 'private test details', source: 'measured' }));
  assert.equal(accepted.status, 201);
  assert.equal(accepted.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await accepted.json(), { ok: true });
  assert.deepEqual(JSON.parse(String(args[4])), { ...valid, note: 'private test details' });
  assert.match(String(args[3]), /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(args).includes(headers['CF-Connecting-IP']));
  assert.equal((await post(JSON.stringify({ ...cpuRun, processor: ' Ryzen 9 7950X ' }))).status, 201);
  assert.equal(JSON.parse(String(args[4])).processor, 'Ryzen 9 7950X');

  changes = 0;
  assert.equal((await post(JSON.stringify(valid))).status, 429);
  console.log('Community speed: validation, moderation separation, and submission responses OK');
}

void checkEndpoint().catch(error => { console.error(error); process.exitCode = 1; });
