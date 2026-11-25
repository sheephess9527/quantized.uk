import { QuantModel } from '@/lib/data/types';
import { calcVRAM, getVerdict, quantWeights } from '@/lib/utils/vram';
import { contextLabel } from '@/lib/utils/context-label';
import { bestQuant as pickBestQuant, referenceQuant } from '@/lib/utils/quality';
import type { GPU } from '@/lib/data/gpus';
import { usableCapacityGB, tightCeiling, formatAllowed } from '@/lib/utils/gpu-page';
import { quantConfidence } from '@/lib/utils/model-meta';

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
  | 'spec'
  /** Run on this site's own hardware (`quantConfidence` = measured). */
  | 'measured'
  /** A figure in the index that this site has not run or sourced. */
  | 'unverified';

export interface CompareRow {
  key: string;
  labelEn: string;
  labelZh: string;
  valueA: string;
  valueB: string;
  /** Set when a value is words rather than a number (e.g. "beyond its window"). */
  valueAZh?: string;
  valueBZh?: string;
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
  gpu?: GPU,
  contextLen = 4096,
): CompareResult {
  // `referenceQuant`, the level each model page is sized at — not "Q4_K_M or
  // whatever comes first", which labelled a Q2_K or Q4_0 size as Q4_K_M for the
  // models that ship no Q4_K_M.
  const q4A = referenceQuant(modelA.quants);
  const q4B = referenceQuant(modelB.quants);
  const bestA = bestQuant(modelA);
  const bestB = bestQuant(modelB);
  const fastest = (m: QuantModel) => m.quants
    .filter(q => q.speedRTX4090 != null)
    .sort((a, b) => (b.speedRTX4090 ?? 0) - (a.speedRTX4090 ?? 0))[0];
  const fastA = fastest(modelA);
  const fastB = fastest(modelB);
  const speedMeasured = !!fastA && !!fastB
    && quantConfidence(modelA.id, fastA) === 'measured'
    && quantConfidence(modelB.id, fastB) === 'measured';

  /**
   * Estimated total at the reader's current context — the row that must move.
   * Undefined past the model's own window: a size at a context the model cannot
   * take is not an answer (same rule as the calculator's static tables).
   */
  const estimate = (m: QuantModel, q: Pick<QuantModel['quants'][number], 'bpw' | 'source'>) =>
    contextLen > m.contextLength ? undefined : calcVRAM({
      paramsB: m.params,
      layers: m.arch.layers,
      kvHeads: m.arch.kvHeads,
      headDim: m.arch.headDim,
      attention: m.arch.attention,
      ...quantWeights(q),
      contextLength: contextLen,
      batchSize: 1,
    }).totalGB;

  const estA = estimate(modelA, q4A);
  const estB = estimate(modelB, q4B);
  const levelName = (q: { format: string; level: string }) => (q.format === 'GGUF' ? q.level : `${q.format} ${q.level}`);
  const overEn = (m: QuantModel) => `beyond its ${contextLabel(m.contextLength)} window`;
  const overZh = (m: QuantModel) => `超出它的 ${contextLabel(m.contextLength)} 窗口`;
  const estRow: CompareRow = {
    key: 'estVram',
    labelEn: `Estimated VRAM @ ${contextLabel(contextLen)} ctx (reference build, batch 1)`,
    labelZh: `当前上下文下的预估显存 @ ${contextLabel(contextLen)}（参考档位，batch 1）`,
    valueA: estA === undefined ? overEn(modelA) : `${estA.toFixed(2)} GB · ${levelName(q4A)}`,
    valueB: estB === undefined ? overEn(modelB) : `${estB.toFixed(2)} GB · ${levelName(q4B)}`,
    valueAZh: estA === undefined ? overZh(modelA) : undefined,
    valueBZh: estB === undefined ? overZh(modelB) : undefined,
    basis: 'estimated',
    lowerIsBetter: true,
    winner: estA === undefined || estB === undefined ? undefined : estA === estB ? 'tie' : estA < estB ? 'a' : 'b',
  };

  const rows: CompareRow[] = [
    // Spec rows: facts about the model, with no better side. A 70B is not
    // "losing" for having more parameters.
    row('params', 'Parameters', '参数量', modelA.params, modelB.params, n => `${n.toFixed(1)}B`, 'spec'),
    row('context', 'Max Context', '最大上下文', modelA.contextLength, modelB.contextLength,
      n => contextLabel(n), 'spec'),

    // The row the context control actually drives.
    estRow,

    // Published figures. Fixed by definition — they do not move with context.
    // The file as recorded from a real listing (decimal GB, as Hugging Face shows it) — not the
    // typed `vramGB`, which mixed file sizes with old 4K totals. No recorded file → "—".
    row('q4Vram', 'File size of that build (recorded)', '该档位的文件大小（已核对）',
      q4A.source ? q4A.source.bytes / 1e9 : undefined, q4B.source ? q4B.source.bytes / 1e9 : undefined,
      n => `${n.toFixed(2)} GB`, 'fixed', { lowerIsBetter: true }),
    // A row is only comparable when both sides published a figure. When either
    // side has none, `row` is handed undefined and prints "—" without declaring
    // a winner — comparing a published loss against a missing one would hand the
    // win to whichever model happened to be documented.
    row('q4Ppl', 'PPL loss of that build', '该档位的困惑度损失', q4A.pplLossPercent, q4B.pplLossPercent,
      n => `${n.toFixed(1)}%`, 'fixed', { lowerIsBetter: true }),
    row('bestPpl', 'Lowest PPL loss (any level)', '最低困惑度损失（任意档位）', bestA.pplLossPercent, bestB.pplLossPercent,
      n => `${n.toFixed(1)}%`, 'fixed', { lowerIsBetter: true }),
    // A model with no speed used to enter as 0, handing the win to the other
    // side; and 73 models' speeds were labelled "published" though nothing here
    // ran them. Missing stays missing, and a winner needs two measured figures.
    row('speed', 'Peak speed on RTX 4090 (batch 1)', 'RTX 4090 峰值速度（batch 1）',
      fastA?.speedRTX4090, fastB?.speedRTX4090,
      n => `${n} tok/s`, speedMeasured ? 'measured' : 'unverified',
      speedMeasured ? { higherIsBetter: true } : {}),

    // Inventory of this site, not a property of the model — no winner.
    row('variants', 'Quant variants indexed here', '本站收录的量化变体数',
      modelA.quants.length, modelB.quants.length, n => String(n), 'spec'),
  ];

  if (gpu) {
    // The same capacity and tight ceiling every other verdict on the site uses:
    // a Mac's usable share, DGX Spark's hard 100%, and the format check — the
    // raw nameplate figure judged a 16 GB Mac against 16 GB.
    const cap = usableCapacityGB(gpu);
    const scoreMap = { green: 2, yellow: 1, red: 0 } as const;
    const fit = (m: QuantModel, q: { format: string }, est: number | undefined) => {
      if (est === undefined) return { en: overEn(m), zh: overZh(m), score: -1 };
      if (!formatAllowed(gpu, q.format as never)) return { en: `${q.format} does not run on this card`, zh: `这张卡跑不了 ${q.format}`, score: 0 };
      const v = getVerdict(est, cap, tightCeiling(gpu));
      return { en: `${est.toFixed(1)} GB · ${v}`, zh: `${est.toFixed(1)} GB · ${v === 'green' ? '从容' : v === 'yellow' ? '偏紧' : '装不下'}`, score: scoreMap[v] };
    };
    const fa = fit(modelA, q4A, estA);
    const fb = fit(modelB, q4B, estB);
    const capLabel = cap === gpu.vram ? `${gpu.vram}GB` : `${gpu.vram}GB (${cap.toFixed(0)} GB usable)`;
    const capLabelZh = cap === gpu.vram ? `${gpu.vram}GB` : `${gpu.vram}GB（可用 ${cap.toFixed(0)} GB）`;
    rows.push({
      key: 'gpuFit',
      labelEn: `Fits ${gpu.name} ${capLabel} at this context`,
      labelZh: `在当前上下文下能否装进 ${gpu.name} ${capLabelZh}`,
      valueA: fa.en,
      valueB: fb.en,
      valueAZh: fa.zh,
      valueBZh: fb.zh,
      basis: 'estimated',
      winner: fa.score < 0 || fb.score < 0 ? undefined : fa.score > fb.score ? 'a' : fa.score < fb.score ? 'b' : 'tie',
      higherIsBetter: true,
    });
  }

  // No overall winner. Counting row wins made a smaller model "beat" a larger
  // one 6:1 by double-counting memory, double-counting how much of each model
  // this site happens to index, and treating fewer parameters as an advantage.
  // Choosing between two models needs task benchmarks this site does not have.
  return { modelA, modelB, rows };
}
