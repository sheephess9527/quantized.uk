/**
 * IndexNow: tell Bing (and the other engines sharing api.indexnow.org) which
 * pages changed in this deploy, instead of waiting for them to re-crawl.
 *
 * Runs last in `postbuild`, on Cloudflare Pages production builds only
 * (`CF_PAGES_BRANCH === 'main'`). Which URLs: every sitemap entry whose
 * `lastmod` is today's UTC date. Sitemap lastmods are each page's real
 * content-change date (model `addedAt`, `articleModifiedAt()`, the data ship
 * date for derived pages), so "lastmod == today" is exactly "changed in a
 * ship dated today" — a push on a later day with no data ship submits
 * nothing. `--all` / `INDEXNOW_ALL=1` submits every URL (first use).
 *
 * Like `fetch-hf-stats.mjs`, this never fails the build: the build runs
 * before the deploy goes live, and a network problem here says nothing about
 * whether the export is good. It also checks the key file is already served
 * before submitting — on the very first deploy it is not live yet, so that
 * run skips and the next ship submits.
 *
 * Flags: --dry-run (print the selection, send nothing), --all.
 * Env:   INDEXNOW_FORCE=1 runs outside a Cloudflare production build.
 */
import { readFileSync } from 'node:fs';

const HOST = 'quantized.uk';
const KEY = '1ff374a1f4ca010beaf5f65b4eb3b8f8';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const all = args.has('--all') || process.env.INDEXNOW_ALL === '1';
const log = msg => console.log(`indexnow: ${msg}`);

function sitemapEntries() {
  const xml = readFileSync('out/sitemap.xml', 'utf8');
  return Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g)).map(([, body]) => ({
    loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1],
    day: body.match(/<lastmod>(\d{4}-\d{2}-\d{2})/)?.[1],
  })).filter(e => e.loc?.startsWith(`https://${HOST}/`));
}

async function main() {
  const production = process.env.CF_PAGES_BRANCH === 'main';
  if (!production && !process.env.INDEXNOW_FORCE && !dryRun) {
    log('not a Cloudflare production build — skipped');
    return;
  }

  const entries = sitemapEntries();
  const today = new Date().toISOString().slice(0, 10);
  const urls = all ? entries.map(e => e.loc) : entries.filter(e => e.day === today).map(e => e.loc);
  log(`${urls.length} of ${entries.length} sitemap URLs selected (${all ? 'all' : `lastmod ${today}`})`);
  if (dryRun) {
    urls.slice(0, 5).forEach(u => log(`  ${u}`));
    return;
  }
  if (urls.length === 0) return;

  const live = await fetch(KEY_LOCATION, { signal: AbortSignal.timeout(15000) })
    .then(r => (r.ok ? r.text() : ''))
    .catch(() => '');
  if (live.trim() !== KEY) {
    log(`key file not live at ${KEY_LOCATION} yet — skipped (the next deploy will submit)`);
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls.slice(0, 10000) }),
    signal: AbortSignal.timeout(30000),
  });
  // 200 = accepted, 202 = accepted pending key validation; anything else is logged, not fatal.
  const body = res.ok ? '' : ` — ${(await res.text()).slice(0, 200)}`;
  log(`submitted ${urls.length} URLs: HTTP ${res.status}${body}`);
}

main().catch(err => log(`failed, build unaffected: ${err.message}`));
