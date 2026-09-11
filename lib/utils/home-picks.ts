import type { GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { fitsOnGpu, type GpuFit } from '@/lib/utils/gpu-page';
import { qualityRank } from '@/lib/utils/quality';

/**
 * Use cases are matched against `model.categories`, which the index already
 * carries. Deliberately not "API serving" — that is a deployment mode, not a
 * property of a model, and picking models by it would be inventing a signal.
 */
export type HomeUseCase = 'chat' | 'code' | 'multimodal';

const CATEGORY_FOR: Record<HomeUseCase, string[]> = {
  chat: ['general', 'instruct'],
  code: ['code'],
  multimodal: ['multimodal'],
};

/**
 * Three picks from the models that fit the reader's card comfortably at 4K
 * context (`fitsOnGpu` — a green verdict, at most 88% of the card).
 *
 * `capable`  — the largest model that fits. The reader's actual question.
 * `headroom` — the largest that fits in 60% of the card, so context or batch
 *              can grow without re-planning.
 * `fastest`  — highest measured tok/s among the models that fit.
 *
 * **The obvious criteria were the wrong ones.** "Most headroom left" and
 * "highest tok/s" both rank the *smallest* model in the index first, so the
 * first version of this handed a 24 GB RTX 4090 the same 0.5B model it handed
 * an 8 GB 4060 Ti — the picker looked like it was ignoring the input, because
 * on two of three cards it effectively was. Ranking by size against a
 * VRAM-derived ceiling is what makes an answer move when the hardware moves.
 *
 * `fastest` still lands on a small model, and that is the honest answer to
 * "what is fastest" — the card says so rather than dressing it up.
 *
 * Slots fill in the order capable → headroom → fastest, each taking the best
 * candidate its criterion can still claim, so no model appears twice. A slot is
 * omitted rather than filled without evidence: `fastest` requires a measured
 * tok/s figure, and all three are dropped when nothing fits.
 */
export interface HomePick {
  kind: 'capable' | 'headroom' | 'fastest';
  model: QuantModel;
  quant: QuantVariant;
  totalGB: number;
  headroomGB: number;
}

/**
 * The share of the card the `headroom` pick is allowed to use. 60% against
 * `fitsOnGpu`'s 88% leaves roughly a third of the card free — enough to take
 * 4K context to 32K on a 7–14B model without moving to a smaller quant.
 */
export const HEADROOM_BUDGET = 0.6;

export function homePicks(gpu: GPU, useCase: HomeUseCase): HomePick[] {
  const wanted = CATEGORY_FOR[useCase];
  const fits: GpuFit[] = fitsOnGpu(gpu).filter(f =>
    f.model.categories.some(c => wanted.includes(c)),
  );
  if (fits.length === 0) return [];

  const picks: HomePick[] = [];
  const used = new Set<string>();

  /** Best still-unclaimed candidate from an already-ranked list. */
  const take = (kind: HomePick['kind'], ranked: GpuFit[]) => {
    const candidate = ranked.find(f => !used.has(f.model.id));
    if (!candidate) return;
    used.add(candidate.model.id);
    picks.push({ kind, model: candidate.model, quant: candidate.quant, totalGB: candidate.totalGB, headroomGB: candidate.headroomGB });
  };

  // Largest first, ties broken by quality — `fitsOnGpu` already sorts by
  // params descending and already chose each model's best-quality quant.
  const bySize = [...fits].sort(
    (a, b) => b.model.params - a.model.params || qualityRank(a.quant) - qualityRank(b.quant),
  );

  take('capable', bySize);
  take('headroom', bySize.filter(f => f.totalGB <= gpu.vram * HEADROOM_BUDGET));
  take('fastest', [...fits]
    .filter(f => f.quant.speedRTX4090 != null)
    .sort((a, b) => (b.quant.speedRTX4090 ?? 0) - (a.quant.speedRTX4090 ?? 0)));

  const order: HomePick['kind'][] = ['capable', 'headroom', 'fastest'];
  return picks.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}
