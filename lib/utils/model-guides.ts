import type { QuantModel } from '@/lib/data/types';
import { articles } from '@/lib/data/cookbook';

/**
 * Minimal guide shape passed from the (server) model page into the client
 * component. Deliberately NOT the full `Article` — that carries every section
 * body and code block, and shipping 23 guides' worth of prose into all 79
 * model page bundles would dwarf the pages themselves.
 */
export interface GuideLink {
  id: string;
  title: string;
  titleZh: string;
  readTime: number;
  difficulty: string;
  /** true when a guide names this model explicitly via relatedModelIds */
  exact: boolean;
}

/** Hardware tag → guides that are genuinely about running things on it. */
const HARDWARE_GUIDES: Record<string, string[]> = {
  mac: ['mac-ollama-setup', 'mac-m3-pro-limits', 'm1-8gb-ollama-limits'],
  'cpu-vps': ['llama-vps-llamacpp', 'cpu-inference-optimization'],
  'consumer-gpu': ['8gb-gpu-starter-guide', 'rtx4060ti-what-to-run', 'wsl2-ollama-gpu'],
  'pro-gpu': ['dual-gpu-70b-llamacpp', 'rtx4090-vllm-api', 'vllm-awq-production'],
};

function toLink(id: string, exact: boolean): GuideLink | null {
  const a = articles.find(x => x.id === id);
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    titleZh: a.titleZh,
    readTime: a.readTime,
    difficulty: a.difficulty,
    exact,
  };
}

/**
 * Guides worth showing on a model page, most relevant first.
 *
 * Exact matches (a guide that names this model) always come first and are
 * never dropped. Hardware-tag matches fill the remainder — they are a
 * reasonable "how do I run this class of model on my kind of machine"
 * suggestion, not a claim that the guide covers this specific model.
 */
export function guideLinksForModel(model: QuantModel, limit = 4): GuideLink[] {
  const out: GuideLink[] = [];
  const seen = new Set<string>();

  // Most-specific first: a guide that names two models is more about this one
  // than a guide that names five. Without this, article file order decides
  // which exact matches survive `limit` — which dropped the dedicated
  // gpt-oss guide from the GPT-OSS pages.
  const exact = articles
    .filter(a => a.relatedModelIds?.includes(model.id))
    .sort((a, b) => (a.relatedModelIds?.length ?? 0) - (b.relatedModelIds?.length ?? 0));

  for (const a of exact) {
    if (seen.has(a.id)) continue;
    const link = toLink(a.id, true);
    if (link) { out.push(link); seen.add(a.id); }
  }

  for (const tag of model.hardwareTags) {
    for (const id of HARDWARE_GUIDES[tag] ?? []) {
      if (out.length >= limit) break;
      if (seen.has(id)) continue;
      const link = toLink(id, false);
      if (link) { out.push(link); seen.add(id); }
    }
  }

  return out.slice(0, limit);
}
