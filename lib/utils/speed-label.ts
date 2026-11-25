import type { GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { calcVRAM, quantWeights } from '@/lib/utils/vram';
import { usableCapacityGB } from '@/lib/utils/gpu-page';
import { matchingSpeedRun } from '@/lib/utils/measured-runs';
import { weightsGB, rooflineTokS, moeRooflineTokS } from '@/lib/utils/roofline';
import { measuredSpeed } from '@/lib/utils/measured-speed';
import { prefillSeconds, type PrefillShape } from '@/lib/utils/prefill';
import { activeParamsB, isMoE, isSuperseded } from '@/lib/utils/model-meta';

export { matchingSpeedRun, sameModel, sameQuant } from '@/lib/utils/measured-runs';

/**
 * One speed figure, labelled by where it came from. The GPU pages and the
 * feel-the-speed tool both call this so a 4090 measurement cannot be printed
 * as though it were taken on the card the reader picked.
 *
 * Order is fixed: a row in `matrixData` for this card, else the calibrated
 * `measuredSpeed` range, else the bandwidth ceiling, else the stored RTX 4090
 * figure explicitly marked as another card. MoE models never take the
 * calibrated range — `measuredSpeed` declines them, and the active-parameter
 * ceiling is an upper bound, not a speed to stream.
 */

export type SpeedSource = 'measured' | 'derived' | 'ceiling' | 'other-card';

export const SPEED_CONTEXTS = [128, 4096, 32768] as const;
export type SpeedContext = (typeof SPEED_CONTEXTS)[number];

export interface SpeedQuote {
  source: SpeedSource;
  /** Derived range. Absent for the other sources. */
  low?: number;
  high?: number;
  /** Measured point, ceiling, or the other card's figure. */
  point?: number;
  /** Set when `source` is `other-card`. */
  referenceCard?: string;
  /** GiB read per generated token. MoE uses the active share, not the file. */
  readGB: number;
  /** Whole quantized file, GiB. */
  fileGB: number;
  kvGB: number;
  totalGB: number;
  /** False when the estimate exceeds this machine's usable memory. */
  fits: boolean;
  /** Seconds before the first token. Absent when this card has no prefill row. */
  ttftSeconds?: number;
}


function prefillShape(model: QuantModel): PrefillShape | undefined {
  const active = activeParamsB(model);
  if (active === undefined) return undefined;
  return {
    activeParamsB: active,
    layers: model.arch.layers,
    qDim: model.arch.attHeads * model.arch.headDim,
    attention: model.arch.attention,
  };
}

export function speedQuote(
  gpu: GPU,
  model: QuantModel,
  quant: QuantVariant,
  contextLength: number,
): SpeedQuote {
  const fileGB = weightsGB(model, quant);
  const active = activeParamsB(model);
  const readGB = active === undefined ? 0 : isMoE(model) ? fileGB * (active / model.params) : fileGB;

  const vram = calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    ...quantWeights(quant),
    contextLength,
    batchSize: 1,
  });
  const fits = vram.totalGB <= usableCapacityGB(gpu);
  const shape = prefillShape(model);
  const ttftSeconds = shape ? prefillSeconds(gpu, shape, contextLength) : undefined;

  const base = {
    readGB: Math.round(readGB * 100) / 100,
    fileGB: Math.round(fileGB * 100) / 100,
    kvGB: vram.kvCacheGB,
    totalGB: vram.totalGB,
    fits,
    ttftSeconds,
  };

  const measured = matchingSpeedRun(gpu, model, quant);
  if (measured) {
    return { ...base, source: 'measured', point: measured.speedTokSec };
  }

  const derived = measuredSpeed(gpu, model, quant);
  if (derived) {
    return { ...base, source: 'derived', low: derived.low, high: derived.high };
  }

  const ceiling = isMoE(model) ? moeRooflineTokS(gpu, model, quant) : rooflineTokS(gpu, model, quant);
  if (ceiling !== undefined) {
    return { ...base, source: 'ceiling', point: ceiling };
  }

  if (!gpu.isLaptop && quant.speedRTX4090 != null && gpu.id !== 'rtx4090') {
    return { ...base, source: 'other-card', point: quant.speedRTX4090, referenceCard: 'RTX 4090' };
  }

  return { ...base, source: 'ceiling' };
}

/** Only a measurement or a calibrated range is allowed to move the sample text. */
export function streamTokS(quote: SpeedQuote): number | undefined {
  if (!quote.fits) return undefined;
  if (quote.source === 'measured' && quote.point) return quote.point;
  if (quote.source === 'derived' && quote.low) return quote.low;
  return undefined;
}

export interface FeelPick { model: QuantModel; quant: QuantVariant }

/** Nearest speed-tool context at or below a calculator context (the tool offers three). */
export function feelContext(contextLength: number): SpeedContext {
  let best: SpeedContext = SPEED_CONTEXTS[0];
  for (const c of SPEED_CONTEXTS) if (c <= contextLength) best = c;
  return best;
}

/**
 * The first candidate that actually streams on every card given. A link into the speed tool is
 * only offered when it can play something on both sides; a comparison that would show two
 * bandwidth ceilings has nothing to play and is not linked.
 */
export function playablePick(cards: GPU[], candidates: FeelPick[], contextLength: number): FeelPick | undefined {
  // A superseded model is never the one a page puts forward (the homePicks rule).
  return candidates.find(c => !isSuperseded(c.model) && cards.every(g => streamTokS(speedQuote(g, c.model, c.quant, contextLength)) !== undefined));
}

/** `/tools/feel/` link carrying the cards, model, quant and context — the params SpeedFeel reads. */
export function feelHref(left: GPU | undefined, right: GPU | undefined, pick: FeelPick | undefined, ctx: SpeedContext): string {
  const p = new URLSearchParams();
  if (left) p.set('left', left.id);
  if (right) p.set('right', right.id);
  if (pick) { p.set('model', pick.model.id); p.set('quant', `${pick.quant.format}:${pick.quant.level}`); }
  p.set('ctx', String(ctx));
  return `/tools/feel/?${p.toString()}`;
}
