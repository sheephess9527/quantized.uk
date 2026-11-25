import assert from 'node:assert/strict';
import { buildFeed } from '../lib/feed/build';
import { models } from '../lib/data/models';

const newestModelDate = models.flatMap(model => model.addedAt ? [model.addedAt] : []).sort().at(-1);
assert(newestModelDate, 'the catalog has dated additions');
const latestModels = models.filter(model => model.addedAt === newestModelDate).slice(0, 20);

for (const lang of ['en', 'zh'] as const) {
  const xml = buildFeed(lang);
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g), m => m[1]);
  assert.equal(items.length, 32);
  const dates = items.map(item => Date.parse(item.match(/<pubDate>(.*?)<\/pubDate>/)![1]));
  assert(dates.every(Number.isFinite));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a), 'updates and models must share a descending timeline');
  assert(dates.every(date => new Date(date).getUTCHours() === 0), 'date-only source dates are serialized at UTC day start, never arbitrary noon');
  const ids = items.map(item => item.match(/<guid[^>]*>(.*?)<\/guid>/)![1]);
  assert.equal(new Set(ids).size, ids.length);
  const base = `https://quantized.uk${lang === 'zh' ? '/zh' : ''}/`;
  for (const item of items) {
    assert(item.match(/<link>(.*?)<\/link>/)![1].startsWith(base));
    assert(item.includes('<description>'));
  }
  for (const model of latestModels) {
    assert(ids.includes(`${base}quant-hub/${model.id}/`), `latest model missing from ${lang} feed: ${model.id}`);
  }
  assert.equal(buildFeed(lang), xml, 'feed generation must be deterministic');
}
console.log('RSS checks passed: mixed chronology, date-only publication semantics, stable IDs, both languages and new models.');
