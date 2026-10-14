import type { GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { prefillData, type PrefillRow } from '@/lib/data/prefill';
import { weightsGB } from '@/lib/utils/roofline';
import { isMoE } from '@/lib/utils/model-meta';

/**
 * Generation speed calibrated on a real run of THIS card, not on its spec sheet.
 *
 * llama.cpp's community scoreboards (see `prefill.ts`) give each card's measured
 * `tg128` for one model: Llama 2 7B Q4_0, whose file is 3,825,807,040 bytes
 * (huggingface.co/TheBloke/Llama-2-7B-GGUF, `x-linked-size`, read 2026-10-14).
 * Token generation is memory-bound, so the card's measured rate scales with the
 * bytes read per token: tokS ≈ tg128 × refGB / modelGB, with both sides in the
 * unit `weightsGB()` uses (GiB × the same 1.02 overhead). This keeps the card's real efficiency (drivers, kernels,
 * the gap to peak bandwidth) that the pure roofline throws away.
 *
 * Error range: checked against the dense llama.cpp / Ollama GGUF rows in
 * `benchmarks.ts` `matrixData` (`npx tsx scripts/check-measured-speed.ts`,
 * which fails if the constant below drifts from the data). Measured ÷ this
 * figure came out 0.99–1.31 over 9 rows (2026-10-14): within 1% on 8B-class
 * models on the RTX 4090; 10–22% low on 14B–32B (bigger models run closer to
 * peak bandwidth than the 7B reference); ~30% low on the two Macs, whose
 * scoreboard rows are from a Nov 2023 build. So it reads as a floor-ish
 * estimate and the UI prints it with that range, labelled an estimate.
 *
 * MoE models are declined: the two MoE rows (Qwen3 30B-A3B, Qwen3-Coder
 * 30B-A3B, both 4090) measured 0.24× of the active-share scaling, so the
 * calculator keeps its existing approximate MoE bound for them.
 */
export const REF_FILE_BYTES = 3_825_807_040;
export const REF_WEIGHTS_GB = (REF_FILE_BYTES / 1024 ** 3) * 1.02;

/** Measured ÷ predicted, min and max over the dense check set. */
export const CALIBRATION_ERROR = { low: 0.99, high: 1.31, n: 9 };

export interface MeasuredSpeed {
  tokS: number;
  low: number;
  high: number;
  row: PrefillRow;
}

export function measuredSpeed(gpu: GPU, model: QuantModel, quant: QuantVariant): MeasuredSpeed | undefined {
  const row = prefillData[gpu.id];
  if (!row || quant.format !== 'GGUF') return undefined;
  if (isMoE(model)) return undefined;
  const readGB = weightsGB(model, quant);
  if (!(readGB > 0)) return undefined;
  const raw = (row.tg128 * REF_WEIGHTS_GB) / readGB;
  return {
    tokS: Math.round(raw),
    low: Math.round(raw * CALIBRATION_ERROR.low),
    high: Math.round(raw * CALIBRATION_ERROR.high),
    row,
  };
}
