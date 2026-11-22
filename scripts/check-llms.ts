import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { buildLlms } from '../lib/llms';
import { GET as english } from '../app/llms.txt/route';
import { GET as chinese } from '../app/zh/llms.txt/route';
import { dataLastUpdated } from '../lib/data/meta';

async function check() {
  const en = buildLlms('en');
  const zh = buildLlms('zh');
  const keyUrls = (body: string) => body.split(/## Key URLs|## 主要链接/)[1].split('##')[0];
  const urls = (body: string) => Array.from(body.matchAll(/https:\/\/quantized\.uk[^\s,)]+/g), m => m[0]);
  assert.deepEqual(urls(keyUrls(zh)).map(url => url.replace('/zh/', '/')), urls(keyUrls(en)));
  for (const url of urls(keyUrls(zh))) {
    const path = new URL(url).pathname;
    if (path === '/sitemap.xml' || path.startsWith('/data/')) continue;
    assert(path.startsWith('/zh/'), `${path} must stay in Chinese`);
    const route = `app${path}`;
    assert(existsSync(`${route}page.tsx`) || existsSync(`${route}/route.ts`), `${path} must have a route`);
  }
  assert.deepEqual(zh.match(/\d+/g), en.match(/\d+/g), 'counts, dates and methodology numbers must match');
  for (const [body, response] of [[en, english()], [zh, chinese()]] as const) {
    assert(body.includes(dataLastUpdated));
    assert(body.includes('https://quantized.uk/zh/llms.txt'));
    assert(body.includes('https://quantized.uk/llms.txt'));
    assert(!/undefined|null/.test(body));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'text/plain; charset=utf-8');
    assert.equal(await response.text(), body);
  }
  assert(zh.includes('显存数值为**计算值**'));
  console.log('LLM summary checks passed: bilingual URL parity, existing Chinese routes, numeric parity and static text responses.');
}

check().catch(error => { console.error(error); process.exit(1); });
