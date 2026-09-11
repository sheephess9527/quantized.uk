import { articles, type Article } from '@/lib/data/cookbook';
import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { sameBudgetCards } from '@/lib/utils/gpu-page';
import { formatById, FORMAT_PAGES } from '@/lib/utils/format-page';
import { BEST_TIERS } from '@/lib/utils/best-page';
import type { QuantModel } from '@/lib/data/types';

/**
 * "What this guide uses" — the cookbook's links out to the rest of the site.
 *
 * Measured: a guide page emitted 3–8 non-template links and one had two
 * inbound. Guides are where the traffic lands, so they were the section least
 * connected to the thing the traffic is for.
 *
 * Everything comes from fields the guide already carries for its own tooling
 * (`gpuPreset`, `relatedModelIds`), so nothing here can name a model or a card
 * the guide is not actually about. The related-guides row is computed for
 * **every** guide, including the five infrastructure ones that carry no model
 * metadata at all — otherwise those stay orphaned.
 */

export interface GuideReferences {
  gpu?: GPU;
  siblings: GPU[];
  models: QuantModel[];
  formats: { id: string; name: string }[];
  bestTier?: { slug: string; label: string };
  related: Article[];
}

/**
 * Guides worth reading next.
 *
 * Scored on what the data already knows they share — a model, a card, a
 * capacity — with title words as the last resort so an infrastructure guide
 * with no model metadata still has neighbours. Never a hand-kept list.
 */
function relatedGuides(article: Article, limit = 3): Article[] {
  const ownModels = new Set(article.relatedModelIds ?? []);
  const ownGpu = article.gpuPreset?.gpuId;
  const ownVram = ownGpu ? gpuDatabase.find(g => g.id === ownGpu)?.vram : undefined;
  const stop = new Set(['the', 'a', 'and', 'for', 'with', 'on', 'in', 'to', 'your', 'guide', 'how']);
  const words = (s: string) =>
    new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stop.has(w)));
  const ownWords = words(article.title);

  return articles
    .filter(a => a.id !== article.id)
    .map(a => {
      let score = 0;
      for (const id of a.relatedModelIds ?? []) if (ownModels.has(id)) score += 4;
      if (ownGpu && a.gpuPreset?.gpuId === ownGpu) score += 3;
      else if (ownVram !== undefined && a.gpuPreset) {
        const v = gpuDatabase.find(g => g.id === a.gpuPreset!.gpuId)?.vram;
        if (v === ownVram) score += 2;
      }
      Array.from(words(a.title)).forEach(w => { if (ownWords.has(w)) score += 1; });
      return { a, score };
    })
    .filter(x => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(x => x.a);
}

/**
 * Guides nobody links back to, adopted by their strongest neighbour.
 *
 * The score is **asymmetric**: a guide carrying `relatedModelIds` and a
 * `gpuPreset` earns 4 and 3 points from its peers, while an infrastructure
 * guide with neither can only earn title-word points — so
 * \`windows-ollama-native\` named three neighbours and was named by none. It had
 * two inbound links on the whole site.
 *
 * Computed once over every guide, so the rule is "no guide is left without an
 * inbound link from the section whose job is connecting them", not a list of
 * exceptions.
 */
const ADOPTED: Map<string, Article[]> = (() => {
  const base = new Map(articles.map(a => [a.id, relatedGuides(a)]));
  const linked = new Set<string>();
  base.forEach(list => list.forEach(a => linked.add(a.id)));

  const extra = new Map<string, Article[]>();
  for (const orphan of articles) {
    if (linked.has(orphan.id)) continue;
    // Its own top two neighbours, because one host leaves the orphan on two
    // inbound links — itself plus the section index — and a page reachable
    // only from the list it belongs to is still effectively orphaned.
    const hosts = (base.get(orphan.id) ?? []).slice(0, 2);
    if (hosts.length === 0) continue;
    for (const host of hosts) extra.set(host.id, [...(extra.get(host.id) ?? []), orphan]);
    linked.add(orphan.id);
  }
  return extra;
})();

export function guideReferences(article: Article): GuideReferences {
  const gpu = article.gpuPreset ? gpuDatabase.find(g => g.id === article.gpuPreset!.gpuId) : undefined;
  const related = (article.relatedModelIds ?? [])
    .map(id => models.find(m => m.id === id))
    .filter((m): m is QuantModel => Boolean(m));

  // The format the guide actually uses, matched from the runtime it names.
  //
  // Deriving it from the related models' formats instead looked reasonable and
  // was useless: most models ship GGUF, AWQ and EXL2, so fifteen guides all
  // printed the same three formats regardless of what they are about. A guide
  // names its runtime in the title or in `verifiedStack`, and each format row
  // in `formats.ts` names the runtimes that read it — matching those gives the
  // one or two formats the guide is really written against.
  // Punctuation-insensitive on both sides: the guide slug says `llamacpp`
  // while the format row says `llama.cpp`, and matching them literally missed
  // every guide named after its runtime. The format's own name counts too —
  // `deepseek-r1-exl2-vs-gguf` names two formats and no runtime.
  const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const haystack = flat([article.id, article.title, article.verifiedStack ?? ''].join(' '));
  const byRuntime = FORMAT_PAGES.filter(f =>
    [f.name, ...f.framework.split('·')]
      .map(x => flat(x))
      .some(token => token.length > 2 && haystack.includes(token)),
  );
  // Fall back to the models' formats only when no runtime is named at all, and
  // only when they agree on fewer than three — three is "everything".
  const modelFormats: string[] = Array.from(
    new Set(related.flatMap(m => m.quants.map(q => q.format as string))),
  );
  const fallback =
    modelFormats.length > 0 && modelFormats.length < 3
      ? modelFormats
          .map(name => formatById(name.toLowerCase()))
          .filter((f): f is NonNullable<typeof f> => Boolean(f))
      : [];
  const formats = (byRuntime.length > 0 ? byRuntime : fallback).map(f => ({ id: f.id, name: f.name }));

  const tier = gpu
    ? BEST_TIERS.find(t => (t.kind === 'apple' ? gpu.type === 'apple' : t.cards.some(c => c.id === gpu.id)))
    : undefined;

  return {
    gpu,
    siblings: gpu ? sameBudgetCards(gpu).slice(0, 2) : [],
    models: related,
    formats,
    bestTier: tier
      ? { slug: tier.slug, label: tier.kind === 'apple' ? 'Apple silicon' : `${tier.vram}GB` }
      : undefined,
    // Adopted guides are appended after the cap, never truncated by it: two
    // orphans both chose `docker-llm-compose` as a host, the first filled the
    // fourth slot and the second was silently sliced away — which is how
    // `windows-ollama-native` stayed on two inbound links through two fixes.
    related: [...relatedGuides(article).slice(0, 3), ...(ADOPTED.get(article.id) ?? [])],
  };
}

export { gpuSlug };
