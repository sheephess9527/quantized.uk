import { gpuDatabase } from '@/lib/data/gpus';

/**
 * Site constants that client components need, kept apart from `lib/seo.ts` on purpose:
 * `seo.ts` imports the whole model index (for `MODEL_COUNT` and the description helpers), and the
 * Footer — on every page — imported `FEEDBACK_EMAIL` from it, which put all 135 models' data into
 * every page's JavaScript (about 290 kB of first-load JS on /about/, 2026-11-12). Anything rendered
 * in the layout imports from here; `seo.ts` re-exports these for server code.
 */

/** Same rule as `MODEL_COUNT`: the GPU count was typed into five more strings. */
/**
 * Cards and Macs only. `gpuDatabase` also carries four CPU-only RAM rows
 * (`isCPU`), which let the calculator answer "no GPU" but are not GPUs — every
 * surface that says "N GPUs" / "N 张显卡" uses this. List lengths that must
 * match the rows actually rendered (the /gpu/ ItemList, the calculator's
 * show-all) keep `gpuDatabase.length`.
 */
export const GPU_COUNT = gpuDatabase.filter(g => !g.isCPU).length;
export const CPU_ROW_COUNT = gpuDatabase.length - GPU_COUNT;

export const SITE_URL = 'https://quantized.uk';
export const SITE_NAME = 'quantized.uk';
/**
 * The one contact address on the site — Footer, /about/, the 404 page, the run-feedback mailto,
 * JSON-LD `contactPoint` and /llms.txt all use it. The site owner's own mailbox (2026-10-03); the
 * earlier `hello@` was never confirmed to receive mail, so it was retired rather than kept beside it.
 */
export const FEEDBACK_EMAIL = 'zjy@quantized.uk';
/** Owner-confirmed official X account. Keep all public references in sync. */
export const X_HANDLE = 'toquantized';
export const X_URL = `https://x.com/${X_HANDLE}`;
/** Related RAG tool operated by the same owner; cross-links preserve language. */
export const RERANKER_URL = 'https://reranker.uk';

export function canonical(path = ''): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized.endsWith('/') ? normalized : `${normalized}/`}`;
}
