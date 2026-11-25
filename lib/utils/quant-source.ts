import type { QuantModel, QuantSource, QuantVariant } from '@/lib/data/types';
import { calcVRAM, quantBPW, quantWeights } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';

/**
 * Where a quant row's size comes from. `file`: a real file whose bytes were read and recorded
 * (`quant.source`). `published`: the bpw differs from the generic table, often from a
 * published size; this numerical comparison alone cannot establish provenance. `generic`: the calculator's table rate —
 * no exact file bytes are recorded. Derived, so a row cannot claim a file it does not carry.
 */
export type SizingBasis = 'file' | 'published' | 'generic';

export function sizingBasis(quant: QuantVariant): SizingBasis {
  if (quant.source) return 'file';
  const generic = quantBPW[quantLevelKey(quant)];
  return generic !== undefined && Math.abs(generic - quant.bpw) < 0.005 ? 'generic' : 'published';
}

/** Unlike the legacy sizingBasis export, distinguish an attested size from a numerical match. */
export function weightEvidence(quant: QuantVariant) {
  if (quant.source || quant.publishedBytes !== undefined) return 'file';
  if (quant.bpwFromPublishedSize) return 'published';
  return sizingBasis(quant) === 'generic' ? 'generic' : 'model-specific';
}

/** Decimal GB with two places — the unit Hugging Face's file list shows. */
export function fileGB(bytes: number): string {
  return (bytes / 1e9).toFixed(2);
}

/** `1,234,567` grouping, fixed so the build-time HTML and the hydrated bundle agree. */
export function groupedBytes(bytes: number): string {
  return String(bytes).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function repoUrl(source: QuantSource): string {
  return `https://huggingface.co/${source.repo}`;
}

/** The bpw a recorded file implies over the model's `params`. */
export function sourceBpw(model: Pick<QuantModel, 'params'>, source: QuantSource): number {
  return (source.bytes * 8) / (model.params * 1e9);
}

/**
 * The figure every "VRAM" column shows: the calculator's total — weights + KV cache + activation
 * buffer — at 4K context (or the model's own window if shorter). The typed `vramGB` field is not
 * read by any display: it was a mix of file sizes and old totals, and on 182 of 313 rows it
 * disagreed with the footnote beside it (reader report, 2026-10-23).
 */
export function sizeAt4K(model: Pick<QuantModel, 'params' | 'arch' | 'contextLength'>, quant: Pick<QuantVariant, 'bpw' | 'source' | 'publishedBytes'>): number {
  return calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    ...quantWeights(quant),
    contextLength: Math.min(4096, model.contextLength),
    batchSize: 1,
  }).totalGB;
}
