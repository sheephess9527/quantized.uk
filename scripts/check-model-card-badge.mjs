import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';

// Run against the completed static export. Fulfill requests locally so QA sends no analytics.
const origin = 'https://preview.example';
const production = 'https://quantized.uk';
const query = 'utm_source=huggingface&utm_medium=referral&utm_campaign=hf_model_card_badge';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

try {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const path = resolve('out', '.' + decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
    if (!path.startsWith(resolve('out') + sep)) return route.abort();
    try {
      await route.fulfill({ path });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await route.fulfill({ status: 404 });
    }
  });
  const page = await context.newPage();
  for (const model of ['qwen3-8b', 'qwen3-14b']) {
    for (const prefix of ['', '/zh']) {
      const path = prefix + '/quant-hub/' + model + '/';
      const alt = prefix ? '在 quantized.uk 查看显存与量化详情' : 'View VRAM and quantization details on quantized.uk';
      const expected = `[![${alt}](${production}/model-card-badge.svg)](${production}${path}?${query})`;
      let cleanMetadata;
      for (const tagged of [false, true]) {
        const response = await page.goto(origin + path + (tagged ? '?' + query : ''));
        assert.equal(response.status(), 200);
        const canonical = page.locator('link[rel="canonical"]');
        assert.equal(await canonical.count(), 1);
        assert.equal(await canonical.getAttribute('href'), production + path);
        const metadata = await page.locator('meta[name="robots"], link[hreflang]').evaluateAll(
          elements => elements.map(el => el.outerHTML)
        );
        assert.ok(metadata.length);
        if (tagged) assert.deepEqual(metadata, cleanMetadata);
        else cleanMetadata = metadata;
      }
      const badge = page.locator('section[aria-labelledby="model-card-badge-title"]');
      const image = badge.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      assert.equal(await image.getAttribute('src'), '/model-card-badge.svg');
      await badge.getByRole('button').click();
      await badge.getByRole('button', { name: prefix ? '已复制 Markdown' : 'Markdown copied' }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
      await page.evaluate(() => {
        navigator.clipboard.writeText = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
      });
      await badge.getByRole('button').click();
      assert.equal(await badge.locator('textarea').inputValue(), expected);
      console.log('Passed badge and metadata checks for', path);
    }
  }
  assert.doesNotMatch(await readFile('out/sitemap.xml', 'utf8'), /utm_(source|campaign|medium)=/);
} finally {
  await browser.close();
}
