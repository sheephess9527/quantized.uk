import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchRepo, fetchStats } from './fetch-hf-stats.mjs';

test('HF requests parse counts and default missing fields', async () => {
  const stats = await fetchRepo('owner/model', {
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://huggingface.co/api/models/owner/model');
      assert.equal(options.signal.aborted, false);
      return { ok: true, json: async () => ({ downloads: 12, likes: 3, lastModified: '2026-11-21' }) };
    },
  });
  assert.deepEqual(stats, { repo: 'owner/model', downloads: 12, likes: 3, lastModified: '2026-11-21' });
  assert.deepEqual(await fetchRepo('empty', {
    fetchImpl: async () => ({ ok: true, json: async () => ({}) }),
  }), { repo: 'empty', downloads: 0, likes: 0, lastModified: null });
});

test('HF requests reject HTTP/JSON errors and abort a stalled request or body', async () => {
  await assert.rejects(fetchRepo('private', {
    fetchImpl: async () => ({ ok: false, status: 401 }),
  }), /HF API 401/);
  await assert.rejects(fetchRepo('broken', {
    fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }),
  }), /invalid JSON/);
  for (const stalledBody of [false, true]) {
    await assert.rejects(fetchRepo('stalled', {
      timeoutMs: 10,
      fetchImpl: async (_url, { signal }) => {
        const stalled = () => new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
        });
        return stalledBody ? { ok: true, json: stalled } : stalled();
      },
    }), /aborted/);
  }
});

test('HF refresh bounds concurrency, preserves cache and source order', async () => {
  const entries = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`model-${i}`, `repo-${i}`]));
  const cached = { downloads: 99 };
  let active = 0;
  let peak = 0;
  const result = await fetchStats(entries, { 'model-1': cached, legacy: cached }, async repo => {
    active++;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, repo === 'repo-0' ? 20 : 1));
    active--;
    if (repo === 'repo-1' || repo === 'repo-2') throw new Error('offline');
    return { repo, downloads: 1 };
  });
  assert.equal(peak, 4);
  assert.equal(result.ok, 7);
  assert.equal(result.fail, 2);
  assert.equal(result.kept, 1);
  assert.equal(result.models['model-1'], cached);
  assert.equal(result.models.legacy, cached);
  assert.equal(result.models['model-2'], undefined);
  assert.deepEqual(Object.keys(result.models), ['model-1', 'legacy', 'model-0', ...Array.from({ length: 6 }, (_, i) => `model-${i + 3}`)]);
});

test('HF refresh handles empty input and complete failure without discarding cache', async () => {
  const existing = { cached: { downloads: 42 } };
  const unexpected = async () => { throw new Error('must not fetch'); };
  assert.deepEqual(await fetchStats({}, existing, unexpected), { models: existing, ok: 0, fail: 0, kept: 0 });
  assert.deepEqual(await fetchStats({ cached: 'repo' }, existing, unexpected), { models: existing, ok: 0, fail: 1, kept: 1 });
  assert.deepEqual(existing, { cached: { downloads: 42 } });
});
