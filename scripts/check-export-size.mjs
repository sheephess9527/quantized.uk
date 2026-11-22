#!/usr/bin/env node
/**
 * Fails the build when out/ nears Cloudflare Pages' 20,000-file limit on the
 * Free plan. A deployment over the limit fails, so the gate trips at 15,000 to
 * leave room for the next few models and GPUs.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname;
const LIMIT = 15000;

function count(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true }))
    n += entry.isDirectory() ? count(join(dir, entry.name)) : 1;
  return n;
}

const files = count(OUT);
if (files > LIMIT) {
  console.error(`check-export-size: out/ has ${files} files, over the ${LIMIT} budget (Cloudflare Pages Free allows 20,000).`);
  process.exit(1);
}
console.log(`check-export-size: ${files} files (budget ${LIMIT}, Cloudflare limit 20,000)`);
