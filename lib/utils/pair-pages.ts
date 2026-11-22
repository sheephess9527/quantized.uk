import { models } from '@/lib/data/models';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { calcVRAM, getVerdict } from '@/lib/utils/vram';
import {
  formatAllowed,
  gpuSlug,
  tightCeiling,
  usableCapacityGB,
} from '@/lib/utils/gpu-page';
import { measuredRowsFor } from '@/lib/utils/measured-runs';
import { sameModel } from '@/lib/utils/speed-label';
import { isSuperseded } from '@/lib/utils/model-meta';
import { qualityRank } from '@/lib/utils/quality';

export function pairSize(
  model: QuantModel,
  gpu: GPU,
  quant: QuantVariant,
  contextLength = 4096
) {
  const memory = calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw: quant.bpw,
    contextLength,
    batchSize: 1,
  });
  const { totalGB } = memory;
  return {
    ...memory,
    quant,
    totalGB,
    verdict: getVerdict(totalGB, usableCapacityGB(gpu), tightCeiling(gpu)),
    headroomGB: usableCapacityGB(gpu) - totalGB,
  };
}

export function pairAnswer(model: QuantModel, gpu: GPU) {
  const { recommended, rows } = pairData(model, gpu);
  const capacityGB = usableCapacityGB(gpu);
  if (!recommended) return undefined;
  const size = (ctx: number) => pairSize(model, gpu, recommended.quant, ctx);
  let low = 0;
  let high = model.contextLength;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (size(mid).totalGB <= capacityGB) low = mid;
    else high = mid - 1;
  }
  const a = model.arch;
  const full = a.attention?.fullLayers ?? a.layers;
  const window = a.attention?.windowLayers ?? 0;
  const contextLength = low;
  const workedContext = low || 1;
  const fullTerm = `2 × ${full} × ${a.attention?.fullKvHeads ?? a.kvHeads} × ${a.attention?.fullHeadDim ?? a.headDim} × ${workedContext} × 2`;
  const windowTerm = `2 × ${window} × ${a.kvHeads} × ${a.headDim} × ${Math.min(workedContext, a.attention?.windowTokens ?? workedContext)} × 2`;
  return {
    quant: recommended.quant,
    capacityGB,
    contextLength,
    workedContext,
    memory: size(workedContext),
    kvFormula: window ? `(${fullTerm} + ${windowTerm})` : `(${fullTerm})`,
    anyQuantFits: rows.some(r => pairSize(model, gpu, r.quant, 1).totalGB <= capacityGB),
  };
}

export function pairData(model: QuantModel, gpu: GPU) {
  const measured = measuredRowsFor(gpu).filter(row =>
    sameModel(model.name, row.model)
  );
  const rows = model.quants
    .filter(q => formatAllowed(gpu, q.format))
    .map(q => pairSize(model, gpu, q));
  const ranked = [...rows].sort(
    (a, b) => qualityRank(a.quant) - qualityRank(b.quant)
  );
  const verified = ranked.filter(r => r.quant.source);
  const best =
    verified.find(r => r.verdict === 'green') ??
    verified.find(r => r.verdict === 'yellow');
  const complete =
    !isSuperseded(model) &&
    gpu.type !== 'cpu' &&
    !!gpu.bandwidth &&
    !!best &&
    best.totalGB >= usableCapacityGB(gpu) * 0.25;
  const recommended =
    best ??
    ranked.find(r => r.verdict === 'green') ??
    ranked.find(r => r.verdict === 'yellow') ??
    ranked[0];
  return {
    model,
    gpu,
    measured,
    rows,
    recommended,
    eligible: measured.length > 0 || complete,
  };
}

export const pairHref = (model: QuantModel, gpu: GPU) =>
  `/quant-hub/${model.id}/${gpuSlug(gpu)}/`;
let cached: { model: QuantModel; gpu: GPU }[] | undefined;
export function pairPages() {
  return (cached ??= models.flatMap(model =>
    gpuDatabase.flatMap(gpu =>
      pairData(model, gpu).eligible ? [{ model, gpu }] : []
    )
  ));
}
