import { models } from '@/lib/data/models';
import { gpuDatabase, POPULAR_GPU_IDS, type GPU } from '@/lib/data/gpus';
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

// Every pair page is four exported files (en + zh, each index.html + index.txt),
// so unmeasured pairs are limited to the popular cards to stay well inside
// Cloudflare Pages' 20,000-file limit.
const PAIR_PAGE_GPU_IDS: ReadonlySet<string> = new Set(POPULAR_GPU_IDS);

export function pairSize(
  model: QuantModel,
  gpu: GPU,
  quant: QuantVariant,
  contextLength = 4096
) {
  const { totalGB } = calcVRAM({
    paramsB: model.params,
    layers: model.arch.layers,
    kvHeads: model.arch.kvHeads,
    headDim: model.arch.headDim,
    attention: model.arch.attention,
    bpw: quant.bpw,
    contextLength,
    batchSize: 1,
  });
  return {
    quant,
    totalGB,
    verdict: getVerdict(totalGB, usableCapacityGB(gpu), tightCeiling(gpu)),
    headroomGB: usableCapacityGB(gpu) - totalGB,
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
    PAIR_PAGE_GPU_IDS.has(gpu.id) &&
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
