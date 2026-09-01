#!/usr/bin/env node
/**
 * Post-export pass over `out/` for the Chinese tree.
 *
 * Two jobs, both of which exist because a Next.js App Router project has a
 * single root layout: `<html lang>` is a compile-time constant shared by every
 * page, and nothing at build time can tell a `/zh` render from a `/` one.
 *
 *  1. Rewrite `lang="en"` → `lang="zh-Hans"` on every `out/zh/**` page.
 *     Without this the 113 Chinese pages ship English `lang` in the HTML a
 *     crawler actually reads — which defeats the point of prerendering Chinese
 *     at all, and makes screen readers pronounce the page with an English
 *     voice. The runtime script in app/layout.tsx only fixes it after parse.
 *
 *  2. Fail the build if any Chinese page links to the English version of a
 *     real page. Components are shared across both trees, so one bare
 *     `next/link` silently exiles every Chinese reader who clicks it. That is
 *     invisible in review and invisible in `next build`; it is only visible
 *     here, in the exported HTML.
 *
 * Runs as `postbuild`, so `npm run build` stays the single gate.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname.replace(/\/$/, '');
const ZH = join(OUT, 'zh');

if (!existsSync(ZH)) {
  console.log('localize-export: no out/zh — nothing to do');
  process.exit(0);
}

function htmlFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const files = htmlFiles(ZH);

// ---------------------------------------------------------------- 1. lang
let patched = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const next = html.replace(/(<html[^>]*\s)lang="en"/, '$1lang="zh-Hans"');
  if (next !== html) {
    writeFileSync(file, next);
    patched += 1;
  }
}

// ------------------------------------------------------- 2. link leakage
// A leak is a root-relative href, outside /zh, that resolves to a page this
// export actually produced. Absolute URLs (hreflang alternates legitimately
// point at the English tree), assets and /_next chunks are not links a reader
// can follow into the wrong language.
const ASSET = /\.[a-z0-9]{2,5}$/i;
const leaks = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (href === '/zh' || href.startsWith('/zh/') || href.startsWith('/_next') || ASSET.test(href)) continue;
    const target = join(OUT, href, 'index.html');
    if (existsSync(target)) leaks.push({ page: relative(OUT, file), href });
  }
}

// --------------------------------------------- 3. missing zh translations
// `translations.ts` is keyed en/zh, and a key present in `en` but missing in
// `zh` does not fail the type-check — it renders the string "undefined" to
// Chinese readers. That is only ever visible in the exported markup.
// Inline <script> blocks legitimately contain the token `undefined` (minified
// React/Next payloads), so they are stripped before looking at rendered text.
function rendersUndefined(html) {
  const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  return /(?:^|>)[^<]*\bundefined\b/.test(text);
}
const undefinedPages = files.filter(file => rendersUndefined(readFileSync(file, 'utf8')));

console.log(`localize-export: lang="zh-Hans" on ${patched}/${files.length} Chinese pages`);

if (undefinedPages.length) {
  console.error(`\nlocalize-export: "undefined" rendered on ${undefinedPages.length} Chinese page(s):\n`);
  for (const file of undefinedPages.slice(0, 10)) console.error(`  ${relative(OUT, file)}`);
  console.error('\nA key exists in `en` but not in `zh` (lib/i18n/translations.ts), or a data\nrecord is missing its zh field. Both render as the literal text "undefined".\n');
  process.exit(1);
}

if (leaks.length) {
  const byPage = new Map();
  for (const { page, href } of leaks) {
    if (!byPage.has(page)) byPage.set(page, new Set());
    byPage.get(page).add(href);
  }
  console.error(`\nlocalize-export: ${leaks.length} link(s) escape the Chinese tree:\n`);
  for (const [page, hrefs] of byPage) {
    console.error(`  ${page}`);
    for (const href of hrefs) console.error(`    → ${href}`);
  }
  console.error(
    '\nUse @/components/i18n/LocalLink instead of next/link in anything rendered\n' +
      'inside both trees (see CLAUDE.md § Conventions).\n'
  );
  process.exit(1);
}

console.log('localize-export: no links escape the Chinese tree');
