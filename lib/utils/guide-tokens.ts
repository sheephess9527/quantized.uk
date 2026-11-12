import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { countModelsFitting } from '@/lib/utils/gpu-page';

/**
 * Counts inside guide prose are written as tokens and filled from the index, so
 * a model batch no longer means re-typing 28 sentences by hand (and getting one
 * wrong — the 4060 Ti guide once drifted by 10):
 *
 *   {{models}}            models in the index
 *   {{fit:<gpuId>}}       models that fit that card comfortably at 4K (green)
 *   {{load:<gpuId>}}      models that load at all on it at 4K (green + tight)
 *   {{ships:<level>}}     models shipping that GGUF level, or `AWQ` for the format
 *
 * `lib/data/cookbook.ts` resolves every string of every guide once, at module
 * load. An unknown token or card id throws, which fails the build.
 */
const cache = new Map<string, number>();

function value(token: string): number {
  const hit = cache.get(token);
  if (hit !== undefined) return hit;
  const [kind, arg] = token.split(':');
  let n: number;
  if (kind === 'models' && !arg) {
    n = models.length;
  } else if ((kind === 'fit' || kind === 'load') && arg) {
    const gpu = gpuDatabase.find(g => g.id === arg);
    if (!gpu) throw new Error(`guide token {{${token}}}: no card '${arg}' in gpuDatabase`);
    n = countModelsFitting(gpu, kind === 'fit' ? 'comfortable' : 'tight');
  } else if (kind === 'ships' && arg) {
    n = arg === 'AWQ'
      ? models.filter(m => m.quants.some(q => q.format === 'AWQ')).length
      : models.filter(m => m.quants.some(q => q.format === 'GGUF' && q.level === arg)).length;
    if (n === 0) throw new Error(`guide token {{${token}}}: no model ships '${arg}'`);
  } else {
    throw new Error(`guide token {{${token}}}: unknown token`);
  }
  cache.set(token, n);
  return n;
}

export function resolveGuideTokens(text: string): string {
  return text.includes('{{') ? text.replace(/\{\{([^{}]+)\}\}/g, (_, t: string) => String(value(t.trim()))) : text;
}

/** Resolves tokens in every string of a guide, however deeply nested. */
export function resolveGuideTokensDeep<T>(node: T): T {
  if (typeof node === 'string') return resolveGuideTokens(node) as unknown as T;
  if (Array.isArray(node)) return node.map(resolveGuideTokensDeep) as unknown as T;
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = resolveGuideTokensDeep(v);
    return out as T;
  }
  return node;
}
