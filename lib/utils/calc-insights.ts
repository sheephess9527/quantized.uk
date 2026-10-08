import type { QuantModel, QuantVariant } from '@/lib/data/models';
import type { GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict, type CalcInput } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { usableCapacityGB, formatAllowed, tightCeiling, canStack, capacityGB, MAX_CARDS } from '@/lib/utils/gpu-page';
export { canStack, capacityGB, MAX_CARDS };
import { qualityRank } from '@/lib/utils/quality';
import { rooflineTokS, moeRooflineTokS } from '@/lib/utils/roofline';
import { isMoE, activeParamsB } from '@/lib/utils/model-meta';

/**
 * The calculator's second-order answers — the questions a reader asks once
 * they have one number: which file should I download, how far can I push the
 * context, how fast can it possibly go. Each is computed from the same
 * `calcVRAM` / `getVerdict` / `usableCapacityGB` the rest of the site uses, so
 * none of them can disagree with a GPU page or the reverse mode.
 */

export type Verdict = 'green' | 'yellow' | 'red';

export function verdictOn(totalGB: number, gpu: GPU, cards = 1): Verdict {
  return getVerdict(totalGB, capacityGB(gpu, cards), tightCeiling(gpu));
}

export interface LevelRow {
  quant: QuantVariant;
  key: string;
  totalGB: number;
  /** Undefined when no card is chosen. */
  verdict?: Verdict;
  /** False when the card's backend cannot load this format at any size. */
  formatOk: boolean;
  /** Highest-quality level that fits the card comfortably — the one to fetch. */
  pick: boolean;
}

type Shape = Omit<CalcInput, 'bpw' | 'contextLength'>;

export function modelShape(model: QuantModel, batchSize: number, kvBytesPerValue?: number): Shape {
  return {
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    batchSize,
    kvBytesPerValue,
  };
}

/** Every level the model ships, sized at the reader's settings, smallest first. */
export function levelTable(
  model: QuantModel,
  gpu: GPU | undefined,
  contextLength: number,
  batchSize: number,
  kvBytesPerValue?: number,
  cards = 1,
): LevelRow[] {
  const shape = modelShape(model, batchSize, kvBytesPerValue);
  const rows: LevelRow[] = model.quants.map(quant => {
    const { totalGB } = calcVRAM({ ...shape, bpw: quant.bpw, contextLength });
    const formatOk = !gpu || formatAllowed(gpu, quant.format);
    const verdict = gpu
      ? formatOk ? verdictOn(totalGB, gpu, cards) : 'red'
      : undefined;
    return { quant, key: quantLevelKey(quant), totalGB, verdict, formatOk, pick: false };
  });
  if (gpu) {
    const best = rows
      .filter(r => r.verdict === 'green')
      .sort((a, b) => qualityRank(a.quant) - qualityRank(b.quant) || a.totalGB - b.totalGB)[0];
    if (best) best.pick = true;
  }
  return rows.sort((a, b) => a.totalGB - b.totalGB);
}

export interface ContextReach {
  /** Longest context (tokens, multiple of 1024) that stays green; 0 if none. */
  comfortable: number;
  /** Longest that is at most tight; 0 if none. */
  tight: number;
  /** The model's own window — the search never goes past it. */
  limit: number;
}

const STEP = 1024;

/**
 * Longest context that fits, by binary search over `calcVRAM` itself rather
 * than an inverted formula: the cache is piecewise linear in context once
 * sliding-window layers saturate, and inverting that by hand is exactly the
 * kind of second implementation that drifts from the first.
 */
export function contextReach(
  shape: Shape,
  bpw: number,
  gpu: GPU,
  limit: number,
  cards = 1,
): ContextReach {
  const verdictAt = (ctx: number) => verdictOn(calcVRAM({ ...shape, bpw, contextLength: ctx }).totalGB, gpu, cards);
  const longest = (ok: (v: Verdict) => boolean) => {
    const maxSteps = Math.floor(limit / STEP);
    if (maxSteps < 1 || !ok(verdictAt(STEP))) return 0;
    if (ok(verdictAt(limit))) return limit;
    let lo = 1, hi = maxSteps; // ok(lo) holds; find the largest step that does
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (ok(verdictAt(mid * STEP))) lo = mid; else hi = mid - 1;
    }
    return lo * STEP;
  };
  return {
    comfortable: longest(v => v === 'green'),
    tight: longest(v => v !== 'red'),
    limit,
  };
}

export interface SpeedBound {
  tokS: number;
  /** `moe`: computed over the active parameters only, and approximate. */
  basis: 'dense' | 'moe';
  activeB?: number;
}

/**
 * Token-generation upper bound on this card: bandwidth over the weight bytes
 * read per token. With several cards on the default layer split the cards
 * take turns on each token (pipeline parallel), so the bound is still one
 * card's bandwidth. Undefined for a card without a verified bandwidth, and
 * whenever the model does not fit — then part of it runs from system RAM and
 * `offloadPlan` is the estimate that applies.
 */
export function speedCeiling(gpu: GPU, model: QuantModel, quant: QuantVariant, verdict: Verdict): SpeedBound | undefined {
  if (verdict === 'red' || !formatAllowed(gpu, quant.format)) return undefined;
  if (isMoE(model)) {
    const tokS = moeRooflineTokS(gpu, model, quant);
    return tokS === undefined ? undefined : { tokS, basis: 'moe', activeB: activeParamsB(model) };
  }
  const tokS = rooflineTokS(gpu, model, quant);
  return tokS === undefined ? undefined : { tokS, basis: 'dense' };
}

/**
 * Theoretical peak bandwidth of common desktop memory setups: transfer rate ×
 * 8 bytes per channel × channels (DDR4-3200 dual = 3200 × 8 × 2 = 51.2 GB/s).
 * Spec arithmetic, not a measurement — sustained reads land well below it.
 */
export const RAM_SETUPS = {
  'ddr4-3200': { label: 'DDR4-3200 ×2', gbs: 51.2 },
  'ddr5-5600': { label: 'DDR5-5600 ×2', gbs: 89.6 },
  'ddr5-5600-x4': { label: 'DDR5-5600 ×4', gbs: 179.2 },
} as const;
export type RamSetup = keyof typeof RAM_SETUPS;

/** llama.cpp's `--fit` leaves this much free per device (common.h). */
const FIT_MARGIN_GB = 1;

export interface OffloadPlan {
  gpuLayers: number;
  layers: number;
  /** System RAM the CPU-side layers need (weights + their KV share). */
  ramGB: number;
  /** Approximate token-generation bound with this split, if knowable. */
  tokS?: number;
}

/**
 * What happens when it does not fit: llama.cpp/Ollama keep as many whole
 * layers on the card as fit and run the rest from system RAM. Each layer is
 * costed at an even share of the estimate (weights, cache and buffer alike),
 * and the card keeps `--fit`'s 1 GiB free — the same rule `-ngl auto` uses.
 * The speed bound adds the two halves' read times: the GPU's share of the
 * weights over its bandwidth, the CPU's over the RAM's. For MoE only the
 * active share is read. Undefined when nothing needs offloading, when the
 * card is not discrete, or when the format has no layer offload here (only
 * GGUF runtimes split this way).
 */
export function offloadPlan(
  input: CalcInput,
  result: { totalGB: number; modelWeightsGB: number },
  gpu: GPU,
  cards: number,
  ram: RamSetup,
  model?: QuantModel,
  format?: string,
): OffloadPlan | undefined {
  if (!canStack(gpu) || (format && format !== 'GGUF')) return undefined;
  const layers = input.layers;
  const perLayer = result.totalGB / layers;
  const n = canStack(gpu) ? Math.max(1, Math.min(MAX_CARDS, cards)) : 1;
  const budget = n * (usableCapacityGB(gpu) - FIT_MARGIN_GB);
  const gpuLayers = Math.max(0, Math.min(layers, Math.floor(budget / perLayer)));
  if (gpuLayers >= layers) return undefined;
  const ramGB = Math.round((layers - gpuLayers) * perLayer * 10) / 10;
  let tokS: number | undefined;
  if (gpu.bandwidth) {
    const activeShare = model && isMoE(model) ? (activeParamsB(model) ?? model.params) / model.params : 1;
    const read = result.modelWeightsGB * activeShare;
    const gpuPart = read * (gpuLayers / layers);
    const cpuPart = read - gpuPart;
    tokS = Math.round(10 / (gpuPart / gpu.bandwidth + cpuPart / RAM_SETUPS[ram].gbs)) / 10;
  }
  return { gpuLayers, layers, ramGB, tokS };
}
