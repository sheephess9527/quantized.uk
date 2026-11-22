import { matrixData, type MatrixRow } from '@/lib/data/benchmarks';
import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { benchmarkMethodology } from '@/lib/data/meta';
import { measuredRowsFor } from '@/lib/utils/measured-runs';
import { sameModel, sameQuant } from '@/lib/utils/speed-label';
import { calcVRAM, KV_CACHE_TYPES } from '@/lib/utils/vram';
import { rooflineTokS } from '@/lib/utils/roofline';
import { isMoE } from '@/lib/utils/model-meta';

/**
 * How far over the card's bandwidth ceiling a dense run may sit before it is
 * treated as impossible. The ceiling is `rooflineTokS` — the figure the GPU
 * pages quote — and the 15% covers `params × bpw` versus the real file. This
 * is the number /benchmarks/ publishes as its rule and the build enforces on
 * every matrix row (`benchRowProblems` in validate.ts): one constant, so the
 * page cannot promise a check the build does not make.
 */
export const CEILING_TOLERANCE = 1.15;

export interface CalibrationRow {
  row: MatrixRow;
  model?: QuantModel;
  quant?: QuantVariant;
  gpu?: GPU;
  /** The calculator's total at the context the runs used. Absent when the row's model or level is not in the index. */
  estimateGB?: number;
  /** Bandwidth ceiling for a dense model; absent for MoE (reads only active experts) and unknown bandwidth. */
  ceiling?: number;
  moe: boolean;
}

/**
 * Each benchmark row joined to the index: which model and level it is, which
 * card, what the calculator would have said, and the ceiling it is checked
 * against. The joins are the same exact-name matchers the speed quotes use —
 * a row whose name the index does not carry stays unmatched rather than being
 * attributed to a lookalike.
 */
export function calibrationRows(): CalibrationRow[] {
  return matrixData.map(row => {
    const gpu = gpuDatabase.find(g => measuredRowsFor(g).includes(row));
    let model: QuantModel | undefined;
    let quant: QuantVariant | undefined;
    for (const m of models) {
      if (!sameModel(m.name, row.model)) continue;
      const q = m.quants.find(q => sameQuant(row.quant, q));
      if (q) { model = m; quant = q; break; }
    }
    if (!model || !quant) return { row, gpu, moe: false };
    const estimateGB = calcVRAM({
      paramsB: model.params,
      layers: model.arch.layers,
      kvHeads: model.arch.kvHeads,
      headDim: model.arch.headDim,
      attention: model.arch.attention,
      bpw: quant.bpw,
      contextLength: benchmarkMethodology.context,
      batchSize: benchmarkMethodology.batch,
      kvBytesPerValue: KV_CACHE_TYPES.f16,
    }).totalGB;
    const moe = isMoE(model);
    const ceiling = gpu && !moe ? rooflineTokS(gpu, model, quant) : undefined;
    return { row, model, quant, gpu, estimateGB, ceiling, moe };
  });
}

export function memoryAccuracy(rows: readonly CalibrationRow[] = calibrationRows()) {
  const gaps = rows.flatMap(({ row, estimateGB }) =>
    estimateGB === undefined ? [] : [Math.abs(estimateGB - row.vramUsedGB)],
  );
  return {
    total: rows.length,
    compared: gaps.length,
    hardware: new Set(rows.map(({ row }) => row.hardware)).size,
    meanAbsoluteError: gaps.length ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : null,
    maxAbsoluteError: gaps.length ? Math.max(...gaps) : null,
  };
}
