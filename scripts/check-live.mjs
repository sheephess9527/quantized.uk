import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const origin = 'https://quantized.uk';
const timeout = 15000;
const calculator = '/tools/vram-calc/';
const pair = '/quant-hub/qwen3-32b/rtx-4090/';
const pages = [
  ['/', /Will it fit/i, /这张显卡/],
  ['/quant-hub/', /Quant Hub/i, /量化模型库/],
  ['/gpu/', /What can each GPU run/i, /每张显卡能跑什么/],
  ['/benchmarks/', /Benchmarks/i, /基准测试/],
  ['/cookbook/', /Deployment Cookbook/i, /实战部署指南/],
  ['/tools/', /Tools/i, /工具/],
  ['/tools/compare/', /Model A vs B/i, /模型 A vs B/],
  [pair, /RTX 4090.*Qwen3 32B/i, /RTX 4090.*Qwen3 32B/],
];
const locales = [
  { lang: 'en', prefix: '', htmlLang: 'en', estimate: /Estimated ([\d.]+) GiB/, preview: 'VRAM estimate', tokens: 'tokens' },
  { lang: 'zh', prefix: '/zh', htmlLang: 'zh-Hans', estimate: /预计占用 ([\d.]+) GiB/, preview: '显存预估', tokens: '词元' },
];
const config = { mode: 'forward', model: 'qwen3-8b', gpu: 'rtx4090', quant: 'Q4_K_M', ctx: '4096' };

async function get(path, type) {
  const url = new URL(path, origin);
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(timeout) });
  assert.equal(response.status, 200, `${url.pathname}: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type')?.split(';')[0];
  assert.equal(contentType, type, `${url.pathname}: expected ${type}, got ${contentType}`);
  return response;
}

async function checkPage(path, lang, heading) {
  const html = await (await get(path, 'text/html')).text();
  assert.equal(html.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1], lang, 'wrong HTML language');
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ');
  assert(heading.test(h1 ?? ''), `unexpected heading: ${h1 ?? '(missing)'}`);
}

function calcUrl(prefix, params) {
  return `${origin}${prefix}${calculator}?${new URLSearchParams(params)}`;
}

async function checkCalculator(browser, { prefix, estimate }) {
  const page = await browser.newPage();
  try {
    await page.route('**/*', route => new URL(route.request().url()).origin === origin
      ? route.continue() : route.abort());
    const response = await page.goto(calcUrl(prefix, config), { waitUntil: 'domcontentloaded', timeout });
    assert.equal(response?.status(), 200, 'calculator document did not return 200');
    const plan = page.getByTestId('run-plan');
    async function readEstimate(context) {
      await plan.getByText(new RegExp(`Qwen3 8B.*Q4_K_M.*${context}K`)).waitFor({ timeout });
      const text = await plan.getByText(estimate).innerText({ timeout });
      const value = Number(text.match(estimate)?.[1]);
      assert(Number.isFinite(value) && value > 0, `invalid memory estimate: ${text}`);
      return value;
    }
    const first = await readEstimate(4);
    await page.getByRole('button', { name: '8K (8,192 tokens)', exact: true }).click({ timeout });
    const second = await readEstimate(8);
    assert(second > first, `estimate failed to grow with context: ${first} → ${second} GiB`);
    return `4K → 8K: ${first.toFixed(2)} → ${second.toFixed(2)} GiB`;
  } finally {
    await page.close();
  }
}

async function checkShare(browser, { lang, prefix, preview, tokens }) {
  const share = { ...config, share: '1', ctx: '8192' };
  const url = calcUrl(prefix, share);
  const page = await browser.newPage({ javaScriptEnabled: false });
  let meta;
  try {
    await page.route('**/*', route => route.request().resourceType() === 'document'
      ? route.continue() : route.abort());
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    assert.equal(response?.status(), 200, 'share document did not return 200');
    meta = await page.locator('head meta[property^="og:"]').evaluateAll(tags =>
      Object.fromEntries(tags.map(tag => [tag.getAttribute('property'), tag.content])));
  } finally {
    await page.close();
  }
  assert.equal(meta['og:url'], url, 'Open Graph URL does not reflect the share link');
  assert.match(meta['og:title'] ?? '', new RegExp(`Qwen3 8B.*${preview}`));
  assert.match(meta['og:description'] ?? '', new RegExp(`Q4_K_M.*8,192 ${tokens}.*[\\d.]+ GiB.*RTX 4090`));
  const imageUrl = new URL(meta['og:image']);
  assert.equal(imageUrl.origin, origin);
  assert.equal(imageUrl.pathname, '/api/vram-share.png');
  for (const [key, value] of Object.entries({ ...share, lang }))
    assert.equal(imageUrl.searchParams.get(key), value, `incorrect image parameter ${key}`);
  const image = Buffer.from(await (await get(imageUrl, 'image/png')).arrayBuffer());
  assert(image.length > 33 && image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'invalid PNG signature');
  assert.equal(image.toString('ascii', 12, 16), 'IHDR', 'missing PNG header');
  assert.equal(image.readUInt32BE(16), 600, 'incorrect PNG width');
  assert.equal(image.readUInt32BE(20), 315, 'incorrect PNG height');
  return `${meta['og:description']}; PNG 600×315`;
}

async function checkSitemap() {
  const xml = await (await get('/sitemap.xml', 'application/xml')).text();
  assert.match(xml, /<urlset\b[^>]*http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9/);
  assert.match(xml, /<\/urlset>\s*$/);
  const urls = new Set([...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => match[1]));
  for (const { prefix } of locales)
    for (const path of ['/', calculator, pair])
      assert(urls.has(`${origin}${prefix}${path}`), `sitemap missing ${prefix}${path}`);
  return `${urls.size} distinct URLs`;
}

async function checkLlms(prefix) {
  const text = await (await get(`${prefix}/llms.txt`, 'text/plain')).text();
  assert.match(text, /^# quantized\.uk\s*$/m);
  assert.match(text, /^## \S/m, 'missing sections');
  for (const path of ['/quant-hub/', calculator])
    assert(text.includes(`${origin}${prefix}${path}`), `llms.txt missing ${prefix}${path}`);
}

let passed = 0;
let failed = 0;
async function check(name, run) {
  try {
    const detail = await run();
    console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
    passed++;
  } catch (error) {
    console.error(`FAIL ${name} — ${error.message}`);
    failed++;
  }
}

console.log(`Live checks for ${origin} at ${new Date().toISOString()}`);
const httpChecks = [check('/sitemap.xml', checkSitemap)];
for (const { prefix, htmlLang } of locales) {
  httpChecks.push(check(`${prefix}/llms.txt`, () => checkLlms(prefix)));
  for (const [path, en, zh] of pages)
    httpChecks.push(check(`${prefix}${path}`, () => checkPage(prefix + path, htmlLang, prefix ? zh : en)));
}

await Promise.all(httpChecks);
const executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : { channel: 'chrome' }), timeout })
  .catch(error => {
    console.error(`Chromium launch failed — ${error.message}`);
  });
try {
  for (const locale of locales) {
    for (const [name, run] of [['calculator', checkCalculator], ['share preview', checkShare]]) {
      await check(`${locale.lang} ${name}`, () => {
        assert(browser, 'Chromium could not start');
        return run(browser, locale);
      });
    }
  }
} finally {
  await browser?.close();
}

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
