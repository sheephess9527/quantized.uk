import { QuantModel } from '@/lib/data/types';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';

export type Winner = 'a' | 'b' | 'tie';

export interface CompareRow {
  key: string;
  labelEn: string;
  labelZh: string;
  valueA: string;
  valueB: string;
  winner?: Winner;
  lowerIsBetter?: boolean;
  higherIsBetter?: boolean;
}

export interface CompareResult {
  modelA: QuantModel;
  modelB: QuantModel;
  rows: CompareRow[];
  overallWinner: Winner;
  scoreA: number;
  scoreB: number;
}

function bestQuant(model: QuantModel) {
  return model.quants.reduce((b, q) => q.pplLossPercent < b.pplLossPercent ? q : b, model.quants[0]);
}

function q4Quant(model: QuantModel) {
  return model.quants.find(q => q.level === 'Q4_K_M') ?? model.quants[0];
}

function row(
  key: string,
  labelEn: string,
  labelZh: string,
  numA: number,
  numB: number,
  fmt: (n: number) => string,
  opts: { lowerIsBetter?: boolean; higherIsBetter?: boolean } = {},
): CompareRow {
  const valueA = fmt(numA);
  const valueB = fmt(numB);
  let winner: Winner = 'tie';
  if (numA !== numB) {
    if (opts.lowerIsBetter) winner = numA < numB ? 'a' : 'b';
    else if (opts.higherIsBetter) winner = numA > numB ? 'a' : 'b';
    else winner = numA < numB ? 'a' : 'b';
  }
  return { key, labelEn, labelZh, valueA, valueB, winner, ...opts };
}

export function compareModels(
  modelA: QuantModel,
  modelB: QuantModel,
  gpuVram?: number,
  contextLen = 4096,
): CompareResult {
  const bestA = bestQuant(modelA);
  const bestB = bestQuant(modelB);
  const q4A = q4Quant(modelA);
  const q4B = q4Quant(modelB);
  const minVramA = Math.min(...modelA.quants.map(q => q.vramGB));
  const minVramB = Math.min(...modelB.quants.map(q => q.vramGB));
  const maxSpeedA = Math.max(...modelA.quants.map(q => q.speedRTX4090 ?? 0));
  const maxSpeedB = Math.max(...modelB.quants.map(q => q.speedRTX4090 ?? 0));
  const formatsA = new Set(modelA.quants.map(q => q.format)).size;
  const formatsB = new Set(modelB.quants.map(q => q.format)).size;

  const rows: CompareRow[] = [
    row('params', 'Parameters', '参数量', modelA.params, modelB.params, n => `${n.toFixed(1)}B`, { lowerIsBetter: true }),
    row('context', 'Max Context', '最大上下文', modelA.contextLength, modelB.contextLength, n => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n), { higherIsBetter: true }),
    row('minVram', 'Min VRAM', '最低显存', minVramA, minVramB, n => `${n.toFixed(1)} GB`, { lowerIsBetter: true }),
    row('q4Vram', 'Q4_K_M VRAM', 'Q4_K_M 显存', q4A.vramGB, q4B.vramGB, n => `${n.toFixed(1)} GB`, { lowerIsBetter: true }),
    row('bestPpl', 'Best PPL Loss', '最佳 PPL 损失', bestA.pplLossPercent, bestB.pplLossPercent, n => `${n.toFixed(1)}%`, { lowerIsBetter: true }),
    row('q4Ppl', 'Q4_K_M PPL Loss', 'Q4_K_M PPL 损失', q4A.pplLossPercent, q4B.pplLossPercent, n => `${n.toFixed(1)}%`, { lowerIsBetter: true }),
    row('speed', 'Peak Speed (4090)', '峰值速度 (4090)', maxSpeedA, maxSpeedB, n => n > 0 ? `${n} tok/s` : '—', { higherIsBetter: true }),
    row('formats', 'Format Count', '格式数量', formatsA, formatsB, n => String(n), { higherIsBetter: true }),
    row('variants', 'Quant Variants', '量化变体数', modelA.quants.length, modelB.quants.length, n => String(n), { higherIsBetter: true }),
  ];

  if (gpuVram) {
    const vramA = calcVRAM({
      paramsB: modelA.params,
      layers: modelA.arch.layers,
      kvHeads: modelA.arch.kvHeads,
      headDim: modelA.arch.headDim,
      bpw: q4A.bpw,
      contextLength: contextLen,
      batchSize: 1,
    }).totalGB;
    const vramB = calcVRAM({
      paramsB: modelB.params,
      layers: modelB.arch.layers,
      kvHeads: modelB.arch.kvHeads,
      headDim: modelB.arch.headDim,
      bpw: q4B.bpw,
      contextLength: contextLen,
      batchSize: 1,
    }).totalGB;
    const verdictA = getVerdict(vramA, gpuVram);
    const verdictB = getVerdict(vramB, gpuVram);
    const scoreMap = { green: 2, yellow: 1, red: 0 };
    rows.push({
      key: 'gpuFit',
      labelEn: `Fits ${gpuVram}GB GPU (Q4, ${contextLen} ctx)`,
      labelZh: `适配 ${gpuVram}GB GPU（Q4，${contextLen} ctx）`,
      valueA: `${vramA.toFixed(1)} GB · ${verdictA}`,
      valueB: `${vramB.toFixed(1)} GB · ${verdictB}`,
      winner: scoreMap[verdictA] > scoreMap[verdictB] ? 'a' : scoreMap[verdictA] < scoreMap[verdictB] ? 'b' : 'tie',
      higherIsBetter: true,
    });
  }

  let scoreA = 0;
  let scoreB = 0;
  for (const r of rows) {
    if (r.winner === 'a') scoreA++;
    if (r.winner === 'b') scoreB++;
  }

  const overallWinner: Winner = scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'tie';

  return { modelA, modelB, rows, overallWinner, scoreA, scoreB };
}