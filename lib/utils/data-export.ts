import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { dataLastUpdated } from '@/lib/data/meta';
import { SITE_URL } from '@/lib/seo';
import { quantConfidence, activeParamsB, isMoE, isSuperseded } from '@/lib/utils/model-meta';
import { referenceQuant } from '@/lib/utils/quality';
import { sizingBasis } from '@/lib/utils/quant-source';
import { quantLevelKey } from '@/lib/utils/recommend';
import { usableCapacityGB, tightCeiling, backendFor, gpuSlug } from '@/lib/utils/gpu-page';

/**
 * The index as public JSON (`/data/v1/models.json`, `/data/v1/gpus.json`).
 *
 * Built from the same arrays the pages render, at build time, like
 * `/llms.txt` — so it cannot drift from the site. What is left out is as
 * deliberate as what is in:
 * - no `speedRTX4090`: 73 of the models' speeds were never run here, and a
 *   bare number in a JSON file loses the "estimated" tag the pages carry;
 * - no `vramGB` as typed: `weightsGB` is recomputed as params × bpw / 8, the
 *   one definition, and runtime memory (KV cache, buffers) is the
 *   calculator's job, linked per model;
 * - a perplexity loss appears only where one was published — never 0 for
 *   "unknown".
 * `v1` is a promise: add fields freely, never rename or repurpose one.
 */

const META = {
  source: SITE_URL,
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  attribution: `quantized.uk (${SITE_URL}/) — link back when you reuse this data`,
  termsUrl: `${SITE_URL}/legal/`,
  scope: "This site's own index and arithmetic. Model weights keep their own licences.",
};

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function modelsExport() {
  return {
    ...META,
    version: 1,
    dataLastUpdated,
    count: models.length,
    notes: {
      weightsGB: 'params × bpw / 8, decimal GB — the weights only. Runtime memory adds KV cache and buffers; use calculatorUrl.',
      confidence: "'measured' = run on this site's hardware; 'estimated' = derived from the architecture or a published file size.",
      pplLossPercent: 'Perplexity increase vs the unquantized weights, where published. Absent means nobody published one.',
      sizingBasis: "'file' = bpw derived from the recorded file in `source` (repo, file, exact bytes summed over parts, separate mmproj bytes, date the listing was read); 'published' = from a published file size that was not recorded; 'generic' = the calculator's table rate for the level.",
      arch: 'Fields the KV-cache arithmetic reads. attention.fullLayers / windowLayers describe hybrid and sliding-window models; windowTokens is what llama.cpp allocates.',
    },
    models: models.map(m => {
      const ref = referenceQuant(m.quants);
      const { note: _note, ...attention } = m.arch.attention ?? {};
      return {
        id: m.id,
        name: m.name,
        family: m.family,
        paramsB: m.params,
        paramLabel: m.paramLabel,
        ...(isMoE(m) ? { activeParamsB: activeParamsB(m) } : {}),
        contextLength: m.contextLength,
        categories: m.categories,
        status: isSuperseded(m) ? 'superseded' : 'active',
        ...(m.supersededBy ? { supersededBy: m.supersededBy } : {}),
        ...(m.addedAt ? { addedToIndex: m.addedAt } : {}),
        arch: {
          layers: m.arch.layers,
          kvHeads: m.arch.kvHeads,
          headDim: m.arch.headDim,
          ...(m.arch.attention ? { attention } : {}),
        },
        referenceLevel: quantLevelKey(ref),
        quants: m.quants.map(q => ({
          format: q.format,
          level: q.level,
          bpw: q.bpw,
          weightsGB: round((m.params * q.bpw) / 8),
          confidence: quantConfidence(m.id, q),
          ...(q.pplLossPercent !== undefined ? { pplLossPercent: q.pplLossPercent } : {}),
          sizingBasis: sizingBasis(q),
          ...(q.source ? { source: q.source } : {}),
        })),
        url: `${SITE_URL}/quant-hub/${m.id}/`,
        calculatorUrl: `${SITE_URL}/tools/vram-calc/?mode=forward&model=${m.id}&quant=${encodeURIComponent(quantLevelKey(ref))}&ctx=4096`,
      };
    }),
  };
}

export function gpusExport() {
  return {
    ...META,
    version: 1,
    dataLastUpdated,
    count: gpuDatabase.length,
    notes: {
      usableGB: "Memory the fit verdicts use: a Mac's GPU gets ~75% of unified memory by default (macOS wired limit); everything else the nameplate.",
      tightCeiling: "Fraction of usableGB up to which a model counts as 'tight' (loads, little headroom). 1.0 where nothing can spill to host RAM.",
      comfortable: "A model is 'comfortable' at ≤ 88% of usableGB.",
      bandwidthGBs: "Vendor peak memory bandwidth. Absent when the vendor does not state it, and on CPU rows (it depends on the reader's DIMMs).",
    },
    gpus: gpuDatabase.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      backend: backendFor(g),
      vramGB: g.vram,
      usableGB: round(usableCapacityGB(g)),
      tightCeiling: tightCeiling(g),
      ...(g.bandwidth !== undefined ? { bandwidthGBs: g.bandwidth } : {}),
      ...(g.memType ? { memType: g.memType } : {}),
      ...(g.isCPU ? { cpuOnly: true } : {}),
      url: `${SITE_URL}/gpu/${gpuSlug(g)}/`,
    })),
  };
}
