import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { bestQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { gpuSlug, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { BEST_TIERS, bestPage } from '@/lib/utils/best-page';
import { formatById } from '@/lib/utils/format-page';
import { formatPairs } from '@/lib/utils/format-compare';
import type { QuantModel, QuantVariant } from '@/lib/data/types';

/**
 * "Where this model fits" — the model page's links out to the rest of the site.
 *
 * Measured before building this: the site's internal link graph ran almost
 * entirely through the header and footer. Fourteen hub URLs appeared on every
 * page; the four single-format pages had **one** inbound link each (from
 * `/formats/`), eight GPU pages had fewer than three, and a model page emitted
 * only 7–9 non-template links — to similar models and guides, never to a
 * format page, a hardware page or a recommendation.
 *
 * 81 model pages are the biggest lever on that graph, and every relationship
 * needed already exists in the data: the fit calculation, the model's own
 * format list, the `/best/` tier picks. **Nothing here is a hand-maintained
 * list of links** — which is also why it cannot rot.
 *
 * Anchor text is the target's own name and capacity ("RTX 5070 Ti · 16GB",
 * "GGUF", "Best local LLM for 16GB"), never "here" or "this page".
 */

export interface PlacedCard {
  gpu: GPU;
  totalGB: number;
  headroomGB: number;
  /** How far over the card it is, for the cards that miss. */
  overBy?: number;
}

export interface ModelPlacement {
  quant: QuantVariant;
  comfortable: PlacedCard[];
  tight: PlacedCard[];
  misses: PlacedCard[];
  formats: { id: string; name: string }[];
  /** Comparison pages covering the formats this model actually ships. */
  pairs: { slug: string; label: string }[];
  /** `/best/` tiers where this model is one of the picks. */
  bestTiers: { slug: string; label: string }[];
  calcHref: string;
  cliHref: string;
}

/** Cards worth naming: consumer and Apple, cheapest capacity first. */
function candidateCards(): GPU[] {
  return gpuDatabase.filter(g => !g.isCPU).sort((a, b) => a.vram - b.vram);
}

export function modelPlacement(model: QuantModel): ModelPlacement {
  // The same reference `modelExplainer` uses: GGUF Q4_K_M when the model ships
  // it, because that is the level every other surface on this site sizes
  // against. `bestQuant` would pick Q8_0 here — the highest-quality level, but
  // not the one the GPU pages, `/best/` and the homepage quote, so this module
  // would have listed a different set of cards from the page it links to.
  const quant =
    model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M') ?? bestQuant(model.quants);
  const key = quantLevelKey(quant);

  const sized = candidateCards().map(gpu => {
    const { totalGB } = calcVRAM({
      paramsB: model.params,
      layers: model.arch.layers,
      kvHeads: model.arch.kvHeads,
      headDim: model.arch.headDim,
      attention: model.arch.attention,
      bpw: quant.bpw,
      contextLength: GPU_PAGE_CONTEXT,
      batchSize: 1,
    });
    return {
      gpu,
      totalGB,
      headroomGB: Math.round((gpu.vram - totalGB) * 10) / 10,
      verdict: getVerdict(totalGB, gpu.vram),
    };
  });

  // Cheapest capacity first, so the list answers "what is the least I need"
  // rather than listing the flagships a reader already knows will work.
  const comfortable = sized.filter(s => s.verdict === 'green').slice(0, 5);
  const tight = sized.filter(s => s.verdict === 'yellow').slice(0, 3);
  const misses = sized
    .filter(s => s.verdict === 'red')
    .slice(-2)
    .map(s => ({ ...s, overBy: Math.round((s.totalGB - s.gpu.vram) * 10) / 10 }));

  const formatNames: string[] = Array.from(new Set(model.quants.map(q => q.format as string)));
  const formats = formatNames
    .map(name => {
      const f = formatById(name.toLowerCase());
      return f ? { id: f.id, name: f.name } : undefined;
    })
    .filter((f): f is { id: string; name: string } => !!f);

  // Only pairs where this model ships BOTH formats — the comparison is
  // measurable for this model rather than generic.
  const pairs = formatPairs
    .filter(p => formatNames.includes(p.a.name as string) && formatNames.includes(p.b.name as string))
    .map(p => ({ slug: p.slug, label: `${p.a.name} vs ${p.b.name}` }));

  const bestTiers = BEST_TIERS.filter(t =>
    bestPage(t).picks.some(p => p.model.id === model.id),
  ).map(t => ({
    slug: t.slug,
    label: t.kind === 'apple' ? 'Apple silicon' : `${t.vram}GB`,
  }));

  return {
    quant,
    comfortable,
    tight,
    misses,
    formats,
    pairs,
    bestTiers,
    calcHref: `/tools/vram-calc/?model=${model.id}&quant=${encodeURIComponent(key)}`,
    cliHref: `/tools/cli-gen/?model=${model.id}&quant=${encodeURIComponent(key)}`,
  };
}

export { gpuSlug };
