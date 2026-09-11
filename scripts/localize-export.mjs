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

// Anchors are matched whole, not by href alone, because one kind of
// cross-language link is deliberate: the language switcher in the Navbar and
// the Footer is the *only* way a crawler can walk between the two trees, and
// it is marked `rel="alternate"` with an `hreflang` matching the head. Those
// are exempt. Everything else pointing out of /zh is still a bug — a shared
// component that forgot `LocalLink`.
const ANCHOR = /<a\b[^>]*>/gi;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [tag] of html.matchAll(ANCHOR)) {
    const href = (tag.match(/\shref="(\/[^"#?]*)"/) ?? [])[1];
    if (!href) continue;
    if (href === '/zh' || href.startsWith('/zh/') || href.startsWith('/_next') || ASSET.test(href)) continue;
    if (/\srel="alternate"/i.test(tag) && /\shreflang="/i.test(tag)) continue;
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

// ------------------------------------------- 4. trailing-slash on internal links
// `trailingSlash: true` makes every canonical and every exported directory end
// in a slash, but `next/link` used to quietly disagree: its
// `normalizePathTrailingSlash` treats any last path segment containing a dot as
// a filename and strips the slash back off. Every model id with a version
// number in it — `llama-3.1-8b`, `qwen2.5-7b`, `phi-3.5-mini` — hit that rule,
// so 46 URLs shipped 2,101 internal links that all 308-redirected, and 27 model
// pages had no direct link to their own canonical URL at all.
//
// `skipTrailingSlashRedirect: true` in next.config.js turns that normalisation
// off. The trade is that Next no longer *adds* a missing slash either, so an
// href written without one now stays wrong — which is exactly what this gate is
// for. It runs over every exported page, both trees.
const allFiles = htmlFiles(OUT);
const slashMisses = new Map();
for (const file of allFiles) {
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    // Wider than ASSET: that one caps the extension at 5 characters, which is
    // right for the leak check but treats `/site.webmanifest` as a page.
    if (href === '/' || href.startsWith('/_next') || /\.[a-z0-9]{2,12}$/i.test(href)) continue;
    if (href.endsWith('/')) continue;
    if (!slashMisses.has(href)) slashMisses.set(href, relative(OUT, file));
  }
}
if (slashMisses.size) {
  console.error(`\nlocalize-export: ${slashMisses.size} internal link(s) missing a trailing slash:\n`);
  for (const [href, page] of [...slashMisses].slice(0, 15)) console.error(`  ${href}   (e.g. ${page})`);
  console.error(
    '\nEvery internal href must end in "/" — the canonical and the exported\n' +
      'directory both do, so one without it costs a 308 on every crawl.\n'
  );
  process.exit(1);
}
console.log(`localize-export: all internal links end in "/" (${allFiles.length} pages checked)`);

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

/* ---------------------------------------------------------------------------
 * Redirect table gate.
 *
 * `_redirects` is the only redirect mechanism that works in a static export —
 * `next.config.js` `redirects()` needs a Next server and is silently inert
 * here, which is exactly the kind of thing that looks done and does nothing.
 *
 * Because the file is hand-written while the pages it refers to are derived
 * from the model index, both halves are checked: a source that still exports a
 * page has a dead redirect shadowed by the real file, and a target that does
 * not export one is a redirect into a 404. Either is worse than no redirect.
 * ------------------------------------------------------------------------- */
const redirectsFile = join(OUT, '_redirects');
if (existsSync(redirectsFile)) {
  const lines = readFileSync(redirectsFile, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  const isPage = p => existsSync(join(OUT, p.replace(/^\/|\/$/g, ''), 'index.html'));
  const problems = [];
  for (const line of lines) {
    const [from, to, code] = line.split(/\s+/);
    if (!from || !to || !code) {
      problems.push(`malformed rule: "${line}"`);
      continue;
    }
    if (isPage(from)) problems.push(`${from} is still an exported page — the redirect can never fire`);
    if (!isPage(to)) problems.push(`${from} → ${to}, but ${to} is not an exported page`);
  }

  if (problems.length) {
    console.error('localize-export: redirect table is out of step with the export:');
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }
  console.log(`localize-export: ${lines.length} redirects check out`);
}
