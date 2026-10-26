import type { GPU } from '@/lib/data/gpus';
import { gpuDatabase, POPULAR_GPU_IDS } from '@/lib/data/gpus';
import type { QuantModel } from '@/lib/data/types';
import { homePicks, type HomeUseCase } from '@/lib/utils/home-picks';
import {
  levelTable, contextReach, modelShape, speedCeiling,
  type LevelRow, type ContextReach, type SpeedBound,
} from '@/lib/utils/calc-insights';
import { measuredSpeed, type MeasuredSpeed } from '@/lib/utils/measured-speed';
import { KV_CACHE_TYPES, type KvCacheType } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';

/**
 * The three follow-up questions the calculator answers — how fast, which level,
 * how much context — as static pages (`/tools/speed/`, `/tools/which-quant/`,
 * `/tools/context-length/`). Every figure comes from the calculator's own
 * functions (`levelTable`, `contextReach`, `measuredSpeed`, `speedCeiling`) at
 * the calculator's defaults (4K, batch 1, fp16 cache), so a cell and the
 * calculator link beside it always print the same number. Nothing here sizes a
 * model by itself.
 *
 * Which models a card gets is not a list either: the `capable` and `headroom`
 * picks `homePicks` makes for each use case — the same picks the homepage and
 * `/best/` show for that card. The `fastest` slot is left out; it is almost
 * always a sub-1B model, and none of these three questions is interesting for
 * one.
 */

export const QUESTION_CONTEXT = 4096;
const USE_CASES: HomeUseCase[] = ['chat', 'code', 'multimodal'];

export interface QuestionRow {
  model: QuantModel;
  /** Every level the model ships, smallest first, judged on this card at 4K. */
  levels: LevelRow[];
  /** The calculator's "best fit": highest-quality level that stays green. */
  pick: LevelRow;
  measured?: MeasuredSpeed;
  ceiling?: SpeedBound;
  /** Longest context at the picked level, per KV cache type. */
  reach: Record<KvCacheType, ContextReach>;
  calcHref: string;
}

export function questionCards(): GPU[] {
  return POPULAR_GPU_IDS
    .map(id => gpuDatabase.find(g => g.id === id))
    .filter((g): g is GPU => !!g);
}

export function questionRows(gpu: GPU): QuestionRow[] {
  const seen = new Map<string, QuantModel>();
  for (const uc of USE_CASES) {
    for (const p of homePicks(gpu, uc)) {
      if (p.kind !== 'fastest' && !seen.has(p.model.id)) seen.set(p.model.id, p.model);
    }
  }
  const rows: QuestionRow[] = [];
  for (const model of Array.from(seen.values())) {
    const levels = levelTable(model, gpu, QUESTION_CONTEXT, 1);
    const pick = levels.find(r => r.pick);
    if (!pick) continue; // homePicks only offers green fits, so this does not happen today
    const reach = {} as Record<KvCacheType, ContextReach>;
    for (const kv of Object.keys(KV_CACHE_TYPES) as KvCacheType[]) {
      const bytes = kv === 'f16' ? undefined : KV_CACHE_TYPES[kv];
      reach[kv] = contextReach(modelShape(model, 1, bytes), pick.quant.bpw, gpu, model.contextLength);
    }
    rows.push({
      model,
      levels,
      pick,
      measured: measuredSpeed(gpu, model, pick.quant),
      ceiling: speedCeiling(gpu, model, pick.quant, pick.verdict ?? 'green'),
      reach,
      calcHref: `/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(quantLevelKey(pick.quant))}&gpu=${gpu.id}&ctx=${QUESTION_CONTEXT}`,
    });
  }
  return rows.sort((a, b) => b.model.params - a.model.params);
}

/**
 * Cards whose answer is identical (same rows, same levels, same reach) share
 * one section on the level and context pages — three 16 GB cards printing the
 * same table three times is padding, not information. Speed differs per card,
 * so the speed page never groups.
 */
export function groupedCards(signature: (rows: QuestionRow[]) => string): { cards: GPU[]; rows: QuestionRow[] }[] {
  const groups: { key: string; cards: GPU[]; rows: QuestionRow[] }[] = [];
  for (const gpu of questionCards()) {
    const rows = questionRows(gpu);
    const key = signature(rows);
    const hit = groups.find(g => g.key === key);
    if (hit) hit.cards.push(gpu);
    else groups.push({ key, cards: [gpu], rows });
  }
  return groups;
}

export const levelSignature = (rows: QuestionRow[]) =>
  rows.map(r => `${r.model.id}:${r.levels.map(l => `${l.key}=${l.verdict}`).join(',')}`).join('|');

export const reachSignature = (rows: QuestionRow[]) =>
  rows.map(r => `${r.model.id}:${r.pick.key}:${(Object.values(r.reach) as ContextReach[]).map(c => `${c.comfortable}/${c.tight}`).join(',')}`).join('|');
