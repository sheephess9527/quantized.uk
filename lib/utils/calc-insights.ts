import type { QuantModel, QuantVariant } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { calcVRAM, getVerdict, type CalcInput } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { usableCapacityGB, formatAllowed, tightCeiling, canStack, hasDedicatedVram, capacityGB, rigDevices, MAX_CARDS, backendFor } from '@/lib/utils/gpu-page';
export { canStack, capacityGB, rigDevices, MAX_CARDS };
import { qualityRank } from '@/lib/utils/quality';
import { rooflineTokS, moeRooflineTokS } from '@/lib/utils/roofline';
import { isMoE, activeParamsB } from '@/lib/utils/model-meta';
import { measuredSpeed } from '@/lib/utils/measured-speed';
import { matchingSpeedRun } from '@/lib/utils/speed-label';

/**
 * The calculator's second-order answers — the questions a reader asks once
 * they have one number: which file should I download, how far can I push the
 * context, how fast can it possibly go. Each is computed from the same
 * `calcVRAM` / `getVerdict` / `usableCapacityGB` the rest of the site uses, so
 * none of them can disagree with a GPU page or the reverse mode.
 */

export type Verdict = 'green' | 'yellow' | 'red';

export function verdictOn(totalGB: number, gpu: GPU, cards = 1, extra: GPU[] = []): Verdict {
  return getVerdict(totalGB, capacityGB(gpu, cards, extra), tightCeiling(gpu));
}

/** A format has to load on every device of a rig, not just the first. */
export function rigFormatAllowed(gpu: GPU, extra: GPU[], format: Parameters<typeof formatAllowed>[1]): boolean {
  return formatAllowed(gpu, format) && extra.every(g => formatAllowed(g, format));
}

export function rigExtras(gpu: GPU | null, extraIds: string[], cards: number): GPU[] {
  if (!gpu || !canStack(gpu)) return [];
  return extraIds.map(id => gpuDatabase.find(g => g.id === id))
    .filter((g): g is GPU => !!g && canStack(g) && backendFor(g) === backendFor(gpu))
    .slice(0, Math.max(0, MAX_CARDS - cards));
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

export function modelShape(model: QuantModel, batchSize: number, kvBytesPerValue?: number, extraGB?: number): Shape {
  return {
    extraGB,
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
  extra: GPU[] = [],
  extraGB?: number,
): LevelRow[] {
  const shape = modelShape(model, batchSize, kvBytesPerValue, extraGB);
  const rows: LevelRow[] = model.quants.map(quant => {
    const { totalGB } = calcVRAM({ ...shape, bpw: quant.bpw, contextLength });
    const formatOk = !gpu || rigFormatAllowed(gpu, extra, quant.format);
    const verdict = gpu
      ? formatOk ? verdictOn(totalGB, gpu, cards, extra) : 'red'
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
  extra: GPU[] = [],
): ContextReach {
  const verdictAt = (ctx: number) => verdictOn(calcVRAM({ ...shape, bpw, contextLength: ctx }).totalGB, gpu, cards, extra);
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
 * The same bound for a rig of different cards. On the layer split each card
 * holds a share of the weights proportional to its memory and the cards take
 * turns on every token, so the read times add: 1 / Σ(share_i / tokS_i). For
 * identical cards that is one card's figure, as above. Undefined if any card
 * lacks a verified bandwidth.
 */
export function rigSpeedCeiling(
  gpu: GPU, cards: number, extra: GPU[], model: QuantModel, quant: QuantVariant, verdict: Verdict,
): SpeedBound | undefined {
  const first = speedCeiling(gpu, model, quant, verdict);
  if (!first || extra.length === 0) return first;
  const devices = rigDevices(gpu, cards, extra);
  const total = devices.reduce((s, g) => s + usableCapacityGB(g), 0);
  let time = 0;
  for (const g of devices) {
    const b = speedCeiling(g, model, quant, verdict);
    if (!b) return undefined;
    time += usableCapacityGB(g) / total / b.tokS;
  }
  return { ...first, tokS: Math.round(10 / time) / 10 };
}

export function runPlanSpeed(
  gpu: GPU, cards: number, extra: GPU[], model: QuantModel, quant: QuantVariant,
  totalGB: number, contextLength: number,
) {
  if (totalGB > capacityGB(gpu, cards, extra) || contextLength > model.contextLength
    || !rigFormatAllowed(gpu, extra, quant.format)) return undefined;

  if (cards === 1 && extra.length === 0) {
    const run = matchingSpeedRun(gpu, model, quant);
    if (run) return { source: 'measured' as const, tokS: run.speedTokSec, runtimeVersion: run.runtimeVersion };
    const estimate = measuredSpeed(gpu, model, quant);
    if (estimate) return { source: 'calibrated' as const, low: estimate.low, high: estimate.high };
  }
  const bound = rigSpeedCeiling(gpu, cards, extra, model, quant, verdictOn(totalGB, gpu, cards, extra));
  if (bound) return { source: 'ceiling' as const, tokS: bound.tokS };
}

/**
 * The share of each card the server claims — the `--gpu-memory-utilization`
 * this site's own generated vLLM commands pass (`lib/utils/cli.ts`), so the
 * count matches the command a reader copies.
 */
export const VLLM_MEMORY_UTILIZATION = 0.85;

export interface ServingRow {
  ctx: number;
  /** Sequences of this length whose KV cache fits at once. */
  users: number;
}

/**
 * How many requests of a given length can be in flight at once: what the
 * server claims of the rig, less the weights, divided by one request's cache.
 * The 10% working buffer is applied to both, as everywhere else on the site.
 * A full-length figure is a floor: paged caches (vLLM, llama-server slots)
 * only hold the tokens a request has actually used.
 */
export function servingCapacity(shape: Shape, bpw: number, capacity: number, contexts: number[]): ServingRow[] {
  return contexts.map(ctx => {
    const one = calcVRAM({ ...shape, batchSize: 1, bpw, contextLength: ctx });
    const free = capacity * VLLM_MEMORY_UTILIZATION - (one.modelWeightsGB + (one.extraGB ?? 0)) * 1.1;
    const perUser = one.kvCacheGB * 1.1;
    return { ctx, users: free > 0 && perUser > 0 ? Math.floor(free / perUser) : 0 };
  });
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
  /** Headroom reserved by the estimate, summed across discrete GPUs. */
  reserveGB: number;
  gpuBudgetGB: number;
  /** System RAM the CPU-side layers need (weights + their KV share). */
  ramGB: number;
  /** Approximate token-generation bound with this split, if knowable. */
  tokS?: number;
  /**
   * The expert-only split, for a MoE model whose `arch.moe` is known — only
   * when its speed bound is not below the layer split's.
   */
  moe?: MoeOffload;
  /** `arch.moe` is known but the expert-free part alone overflows the card. */
  moeNoRoom?: boolean;
}

export interface MoeOffload {
  /** N for `--n-cpu-moe N` (a layer index: dense lead layers count). */
  n: number;
  /** Every expert goes to RAM — `--cpu-moe`. */
  all: boolean;
  /** MoE layers whose experts sit in system RAM, of `moeLayers`. */
  cpuMoeLayers: number;
  moeLayers: number;
  ramGB: number;
  /** What stays on the card(s): attention, shared weights, KV cache, buffers. */
  gpuGB: number;
  tokS?: number;
}

/**
 * What happens when it does not fit: llama.cpp/Ollama keep as many whole
 * layers on the card as fit and run the rest from system RAM. Each layer is
 * costed at an even share of the estimate (weights, cache and buffer alike),
 * and the card keeps `--fit`'s 1 GiB free — the same rule `-ngl auto` uses.
 * The speed bound adds the two halves' read times: the GPU's share of the
 * weights and KV cache over its bandwidth, the CPU's over the RAM's — decode
 * reads the whole cache every token, so at long context the cache a layer
 * carries to RAM matters as much as its weights. For MoE only the active
 * share of the weights is read. Undefined when nothing needs offloading, when the
 * card is not discrete, or when the format has no layer offload here (only
 * GGUF runtimes split this way).
 */
export function offloadPlan(
  input: CalcInput,
  result: { totalGB: number; modelWeightsGB: number; kvCacheGB?: number },
  gpu: GPU,
  cards: number,
  ram: RamSetup,
  format: string | undefined,
  model?: QuantModel,
  extra: GPU[] = [],
  level?: string,
): OffloadPlan | undefined {
  if (!hasDedicatedVram(gpu) || format !== 'GGUF') return undefined;
  const layers = input.layers;
  const perLayer = result.totalGB / layers;
  const devices = rigDevices(gpu, cards, extra);
  const reserveGB = devices.length * FIT_MARGIN_GB;
  const budget = devices.reduce((s, g) => s + usableCapacityGB(g), 0) - reserveGB;
  const gpuLayers = Math.max(0, Math.min(layers, Math.floor(budget / perLayer)));
  if (gpuLayers >= layers) return undefined;
  const ramGB = Math.round((layers - gpuLayers) * perLayer * 10) / 10;
  let tokS: number | undefined;
  if (devices.every(g => g.bandwidth)) {
    const activeShare = model && isMoE(model) ? (activeParamsB(model) ?? model.params) / model.params : 1;
    const read = result.modelWeightsGB * activeShare + (result.kvCacheGB ?? 0);
    const gpuPart = read * (gpuLayers / layers);
    const cpuPart = read - gpuPart;
    // The GPU share is itself split by memory across the cards.
    const total = devices.reduce((s, g) => s + usableCapacityGB(g), 0);
    const gpuTime = devices.reduce((s, g) => s + (gpuPart * usableCapacityGB(g)) / total / g.bandwidth!, 0);
    tokS = Math.round(10 / (gpuTime + cpuPart / RAM_SETUPS[ram].gbs)) / 10;
  }
  const moe = model?.arch.moe ? moeOffload(input, result, devices, budget, ram, model, level) : undefined;
  // Interleaved layouts can only move every expert, which on a near-fit costs
  // more than moving two layers; offer the expert split only when it is not slower.
  const keep = moe && !(moe.tokS !== undefined && tokS !== undefined && moe.tokS < tokS);
  return { gpuLayers, layers, reserveGB, gpuBudgetGB: budget, ramGB, tokS, moe: keep ? moe : undefined, moeNoRoom: !!model?.arch.moe && !moe };
}

/**
 * The MoE answer to "does not fit": every layer on the card, and the routed
 * experts of the first N layers in system RAM (`--n-cpu-moe N`, llama.cpp
 * `common/arg.cpp`). That is also what `--fit` does by itself for a MoE model
 * when `-ngl` is left unset (`common/fit.cpp`, "all MoE tensors in system
 * memory"); a set `-ngl` makes `--fit` stand down, so the command must carry
 * the flag. Expert bytes are `expertParams` at the level's rate — MXFP4's 4.25
 * for the native GPT-OSS build, whose other tensors are wider. Undefined when
 * even the expert-free part does not fit the card.
 *
 * The speed bound reads, per token, the non-expert share of the active weights
 * and the whole KV cache from the card plus `perToken / experts` of each layer's experts from
 * wherever they sit — so moving experts costs far less than moving layers.
 */
function moeOffload(
  input: CalcInput,
  result: { totalGB: number; modelWeightsGB: number; kvCacheGB?: number },
  devices: GPU[],
  budget: number,
  ram: RamSetup,
  model: QuantModel,
  level?: string,
): MoeOffload | undefined {
  const e = model.arch.moe!;
  const bpw = level === 'MXFP4' ? 4.25 : input.bpw;
  const expertGB = Math.min(result.modelWeightsGB, (e.expertParams * 1e9 * bpw / 8) / 1024 ** 3);
  if (result.totalGB - expertGB > budget) return undefined;
  const perLayer = expertGB / e.moeLayers;
  const cpuMoeLayers = e.interleaved
    ? e.moeLayers
    : Math.min(e.moeLayers, Math.max(1, Math.ceil((result.totalGB - budget) / perLayer)));
  const all = cpuMoeLayers >= e.moeLayers;
  const n = all ? input.layers : (e.denseLead ?? 0) + cpuMoeLayers;
  const ramGB = Math.round(cpuMoeLayers * perLayer * 10) / 10;
  const gpuGB = Math.round((result.totalGB - cpuMoeLayers * perLayer) * 10) / 10;
  let tokS: number | undefined;
  if (devices.every(g => g.bandwidth)) {
    const routedRead = expertGB * e.perToken / e.experts;
    const activeShare = (activeParamsB(model) ?? model.params) / model.params;
    const sharedRead = Math.max(0, result.modelWeightsGB * activeShare - routedRead);
    const cpuPart = routedRead * cpuMoeLayers / e.moeLayers;
    const gpuPart = sharedRead + routedRead - cpuPart + (result.kvCacheGB ?? 0);
    const total = devices.reduce((s, g) => s + usableCapacityGB(g), 0);
    const gpuTime = devices.reduce((s, g) => s + (gpuPart * usableCapacityGB(g)) / total / g.bandwidth!, 0);
    tokS = Math.round(10 / (gpuTime + cpuPart / RAM_SETUPS[ram].gbs)) / 10;
  }
  return { n, all, cpuMoeLayers, moeLayers: e.moeLayers, ramGB, gpuGB, tokS };
}
