import type { GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { calcVRAM } from '@/lib/utils/vram';
import { isMoE, activeParamsB } from '@/lib/utils/model-meta';

/**
 * Lives apart from `gpu-explainer.ts` so the calculator can quote the same
 * ceiling the GPU pages do without bundling the whole page-prose generator
 * (and every model's fit list) into its client chunk. The context here only
 * feeds `calcVRAM`'s call shape — weights do not depend on it.
 */
export function weightsGB(model: QuantModel, quant: QuantVariant) {
  return calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw: quant.bpw,
    contextLength: 4096,
    batchSize: 1,
  }).modelWeightsGB;
}

/**
 * Memory-bandwidth ceiling on token generation, in tok/s.
 *
 * Dense models only. A mixture-of-experts model reads one router's worth of
 * experts per token, not the whole weight set, so this arithmetic does not
 * describe it — the index's own Qwen3 30B-A3B run measures 95 tok/s on a card
 * whose dense roofline for that file size is 57, which is correct behaviour for
 * an MoE and would look like a broken ceiling if quoted, so this declines;
 * `moeRooflineTokS` below is the active-parameter version the calculator uses.
 */
export function rooflineTokS(gpu: GPU, model: QuantModel, quant: QuantVariant): number | undefined {
  if (!gpu.bandwidth) return undefined;
  if (isMoE(model)) return undefined;
  return Math.round(gpu.bandwidth / weightsGB(model, quant));
}

/**
 * The same ceiling for a mixture-of-experts model, over the weights it reads
 * per token: the file's average bits-per-weight applied to the active share
 * (`activeParamsB / params`). Approximate: the
 * active set mixes always-on attention with routed experts, whose precision
 * can differ from the file's average (GPT-OSS keeps attention wider than its
 * MXFP4 experts) — so it is printed as an approximate bound, never a speed.
 * Kept separate from `rooflineTokS` on purpose: GPU pages quote a dense
 * reference and must not start quoting this.
 */
export function moeRooflineTokS(gpu: GPU, model: QuantModel, quant: QuantVariant): number | undefined {
  if (!gpu.bandwidth || !isMoE(model)) return undefined;
  const active = activeParamsB(model);
  if (active === undefined) return undefined;
  return Math.round(gpu.bandwidth / (weightsGB(model, quant) * (active / model.params)));
}

