import { QuantModel } from '@/lib/data/types';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import { contextLabel } from '@/lib/utils/context-label';
import { bestQuant as pickBestQuant } from '@/lib/utils/quality';

export type Winner = 'a' | 'b' | 'tie';

/**
 * How a row's number was arrived at. The distinction is the point of this
 * module: a fixed published figure and a value recomputed from the reader's
 * current settings must never share a row, or changing the context length
 * appears to do nothing.
 */
export type RowBasis =
  /** Published per-variant figure. Fixed; carries its own measurement conditions. */
  | 'fixed'
  /** Recomputed from the selected context/batch by `calcVRAM`. Moves with the controls. */
  | 'estimated'
  /** A property of the model itself (parameters, context window). */
  | 'spec';

export interface CompareRow {
  key: string;
  labelEn: string;
  labelZh: string;
  valueA: string;
  valueB: string;
  basis: RowBasis;
  /**
   * Only set where one side being lower/higher is a real advantage *on that
   * axis*. Rows like parameter count or how many quant variants this site has
   * indexed have no better side and carry no winner.
   */
  winner?: Winner;
  lowerIsBetter?: boolean;
  higherIsBetter?: boolean;
}

export interface CompareResult {
  modelA: QuantModel;
  modelB: QuantModel;
  rows: CompareRow[];
}

function bestQuant(model: QuantModel) {
  return pickBestQuant(model.quants);
}

function q4Quant(model: QuantModel) {
  return model.quants.find(q => q.level === 'Q4_K_M') ?? model.quants[0];
}

function row(
  key: string,
  labelEn: string,
  labelZh: string,
  numA: number | undefined,
  numB: number | undefined,
  fmt: (n: number) => string,
  basis: RowBasis,
  opts: { lowerIsBetter?: boolean; higherIsBetter?: boolean } = {},
): CompareRow {
  // An axis nobody published for one of the two models is not a zero — it is
  // unknown, and declaring a winner against it would award the win to whichever
  // model happens to be better documented.
  const valueA = numA === undefined ? '—' : fmt(numA);
  const valueB = numB === undefined ? '—' : fmt(numB);
  // No direction declared means the axis has no better side — no winner is
  // assigned, and nothing downstream can add it up into a verdict.
  const directed = opts.lowerIsBetter || opts.higherIsBetter;
  let winner: Winner | undefined;
  if (directed && numA !== undefined && numB !== undefined) {
    if (numA === numB) winner = 'tie';
    else if (opts.lowerIsBetter) winner = numA < numB ? 'a' : 'b';
    else winner = numA > numB ? 'a' : 'b';
  }
  return { key, labelEn, labelZh, valueA, valueB, basis, winner, ...opts };
}

export function compareModels(
  modelA: QuantModel,
  modelB: QuantModel,
  gpuVram?: number,
  contextLen = 4096,
): CompareResult {
  const q4A = q4Quant(modelA);
  const q4B = q4Quant(modelB);
  const bestA = bestQuant(modelA);
  const bestB = bestQuant(modelB);

  /** Estimated total at the reader's current context — the row that must move. */
  const estimate = (m: QuantModel, q: { bpw: number }) =>
    calcVRAM({
      paramsB: m.params,
      layers: m.arch.layers,
      kvHeads: m.arch.kvHeads,
      headDim: m.arch.headDim,
      attention: m.arch.attention,
      bpw: q.bpw,
      contextLength: contextLen,
      batchSize: 1,
    }).totalGB;

  const estA = estimate(modelA, q4A);
  const estB = estimate(modelB, q4B);

  const rows: CompareRow[] = [
    // Spec rows: facts about the model, with no better side. A 70B is not
    // "losing" for having more parameters.
    row('params', 'Parameters', '参数量', modelA.params, modelB.params, n => `${n.toFixed(1)}B`, 'spec'),
    row('context', 'Max Context', '最大上下文', modelA.contextLength, modelB.contextLength,
      n => contextLabel(n), 'spec'),

    // The row the context control actually drives.
    row('estVram', `Estimated VRAM @ ${contextLabel(contextLen)} ctx (Q4_K_M, batch 1)`,
      `当前上下文下的预估显存 @ ${contextLabel(contextLen)}（Q4_K_M，batch 1）`,
      estA, estB, n => `${n.toFixed(2)} GB`, 'estimated', { lowerIsBetter: true }),

    // Published figures. Fixed by definition — they do not move with context.
    row('q4Vram', 'Published Q4_K_M size', '已发布的 Q4_K_M 体积', q4A.vramGB, q4B.vramGB,
      n => `${n.toFixed(1)} GB`, 'fixed', { lowerIsBetter: true }),
    // A row is only comparable when both sides published a figure. When either
    // side has none, `row` is handed undefined and prints "—" without declaring
    // a winner — comparing a published loss against a missing one would hand the
    // win to whichever model happened to be documented.
    row('q4Ppl', 'Q4_K_M PPL loss', 'Q4_K_M 困惑度损失', q4A.pplLossPercent, q4B.pplLossPercent,
      n => `${n.toFixed(1)}%`, 'fixed', { lowerIsBetter: true }),
    row('bestPpl', 'Lowest PPL loss (any level)', '最低困惑度损失（任意档位）', bestA.pplLossPercent, bestB.pplLossPercent,
      n => `${n.toFixed(1)}%`, 'fixed', { lowerIsBetter: true }),
    row('speed', 'Peak speed on RTX 4090 (batch 1)', 'RTX 4090 峰值速度（batch 1）',
      Math.max(...modelA.quants.map(q => q.speedRTX4090 ?? 0)),
      Math.max(...modelB.quants.map(q => q.speedRTX4090 ?? 0)),
      n => (n > 0 ? `${n} tok/s` : '—'), 'fixed', { higherIsBetter: true }),

    // Inventory of this site, not a property of the model — no winner.
    row('variants', 'Quant variants indexed here', '本站收录的量化变体数',
      modelA.quants.length, modelB.quants.length, n => String(n), 'spec'),
  ];

  if (gpuVram) {
    const verdictA = getVerdict(estA, gpuVram);
    const verdictB = getVerdict(estB, gpuVram);
    const scoreMap = { green: 2, yellow: 1, red: 0 };
    rows.push({
      key: 'gpuFit',
      labelEn: `Fits ${gpuVram}GB card at this context`,
      labelZh: `在当前上下文下能否装进 ${gpuVram}GB 显卡`,
      valueA: `${estA.toFixed(1)} GB · ${verdictA}`,
      valueB: `${estB.toFixed(1)} GB · ${verdictB}`,
      basis: 'estimated',
      winner: scoreMap[verdictA] > scoreMap[verdictB] ? 'a' : scoreMap[verdictA] < scoreMap[verdictB] ? 'b' : 'tie',
      higherIsBetter: true,
    });
  }

  // No overall winner. Counting row wins made a smaller model "beat" a larger
  // one 6:1 by double-counting memory, double-counting how much of each model
  // this site happens to index, and treating fewer parameters as an advantage.
  // Choosing between two models needs task benchmarks this site does not have.
  return { modelA, modelB, rows };
}
