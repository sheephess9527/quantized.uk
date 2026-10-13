import type { GPU } from '@/lib/data/gpus';
import type { ModelArch } from '@/lib/data/types';
import { prefillData, PREFILL_REFERENCE } from '@/lib/data/prefill';
import { usableCapacityGB } from '@/lib/utils/gpu-page';

/**
 * How long a prompt takes to read before the first token appears.
 *
 * Prompt processing is compute-bound: about 2 FLOPs per active weight per
 * token, plus attention, which for a prompt of N tokens averages N/2 earlier
 * positions × 4 FLOPs × query width per full-attention layer (window layers
 * stop at their window; linear layers are not counted). The rate for a model
 * is the card's measured Llama 2 7B pp512 scaled by the ratio of those FLOPs —
 * a scaling from one measurement, not a measurement of this model.
 */

export interface PrefillShape {
  activeParamsB: number;
  layers: number;
  qDim: number;
  attention?: ModelArch['attention'];
}

function flopsPerToken(s: PrefillShape, promptLen: number): number {
  const full = s.attention?.fullLayers ?? s.layers;
  const windowLayers = s.attention?.windowLayers ?? 0;
  const window = s.attention?.windowTokens ?? 0;
  const avgPos = promptLen / 2;
  const attn = 4 * s.qDim * (full * avgPos + windowLayers * Math.min(avgPos, window));
  return 2 * s.activeParamsB * 1e9 + attn;
}

const REF_FLOPS = flopsPerToken(
  { activeParamsB: PREFILL_REFERENCE.paramsB, layers: PREFILL_REFERENCE.layers, qDim: PREFILL_REFERENCE.qDim },
  PREFILL_REFERENCE.promptLen,
);

/** Seconds to read `promptLen` tokens on one card, or undefined without a scoreboard row. */
export function prefillSeconds(gpu: GPU, shape: PrefillShape, promptLen: number): number | undefined {
  const row = prefillData[gpu.id];
  if (!row) return undefined;
  const rate = row.pp512 * (REF_FLOPS / flopsPerToken(shape, promptLen));
  return promptLen / rate;
}

/**
 * A rig on the layer split reads the prompt one card after another, each its
 * share of the layers (proportional to memory): the times add by share.
 */
export function rigPrefillSeconds(devices: GPU[], shape: PrefillShape, promptLen: number): number | undefined {
  const total = devices.reduce((s, g) => s + usableCapacityGB(g), 0);
  let seconds = 0;
  for (const g of devices) {
    const t = prefillSeconds(g, shape, promptLen);
    if (t === undefined) return undefined;
    seconds += (usableCapacityGB(g) / total) * t;
  }
  return seconds;
}
