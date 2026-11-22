import type { GPU } from '@/lib/data/gpus';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { matrixData, type MatrixRow } from '@/lib/data/benchmarks';

/**
 * The benchmark rows measured on this exact card, if any.
 *
 * Four cards in `matrixData` have real runs behind them; the other 39 have
 * none, and saying so is more useful than letting the estimates read as
 * measurements.
 *
 * Matching is fussy on purpose. The benchmark rows and `gpuDatabase` write the
 * same card differently — `RTX 4090 24G` vs `RTX 4090`, `M3 Max 48G` vs
 * `Mac M3 Max 48G` — so both sides are normalised to a bare model name plus a
 * capacity. A prefix match alone attributed the RTX 4060 Ti 16G's three
 * measured runs to a plain RTX 4060, which is a different card; and dropping
 * capacity entirely would have handed the 16G card's numbers to the 8G one.
 * Both halves have to agree.
 */
const SIZE_SUFFIX = /\s+(\d+)G$/;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Matrix rows name models by a short display name, not an id. A substring test attributed the
 * Llama 3.1 8B runs to "Nous Hermes 3 Llama 3.1 8B" (a different model nobody here measured), so
 * a row now matches only the same name with a trailing "Instruct" dropped, or a listed alias for
 * a row whose name is abbreviated.
 */
const ROW_ALIASES: Record<string, string> = {
  r1distillllama8b: 'deepseekr1distillllama8b',
  deepseekr114b: 'deepseekr1distillqwen14b',
};

export function sameModel(modelName: string, rowModel: string): boolean {
  const b = norm(rowModel);
  if (!b) return false;
  const target = ROW_ALIASES[b] ?? b;
  const a = norm(modelName);
  return a === target || a.replace(/instruct$/, '') === target;
}

export function sameQuant(rowQuant: string, quant: QuantVariant): boolean {
  const rq = rowQuant.toLowerCase();
  const level = quant.level.toLowerCase();
  if (quant.format === 'GGUF') return rq.startsWith('gguf') && rq.endsWith(level);
  if (quant.format === 'EXL2') return rq.includes('exl2') && rq.includes(level);
  if (quant.format === 'AWQ') return rq.includes('awq') && rq.includes(level);
  if (quant.format === 'GPTQ') return rq.includes('gptq') && rq.includes(level);
  return rq.includes(level);
}

function frameworkRank(framework: string): number {
  if (/llama\.cpp/i.test(framework)) return 0;
  if (/ollama/i.test(framework)) return 1;
  return 2;
}

export function matchingSpeedRun(gpu: GPU, model: QuantModel, quant: QuantVariant): MatrixRow | undefined {
  return measuredRowsFor(gpu)
    .filter(row => sameModel(model.name, row.model) && sameQuant(row.quant, quant))
    .sort((a, b) => frameworkRank(a.framework) - frameworkRank(b.framework))[0];
}

function normalizeHardware(name: string): { model: string; vram: number | null } {
  const stripped = name.replace(/^Mac\s+/i, '').trim();
  const m = stripped.match(SIZE_SUFFIX);
  return {
    model: stripped.replace(SIZE_SUFFIX, '').toLowerCase(),
    vram: m ? Number(m[1]) : null,
  };
}

export function measuredRowsFor(gpu: GPU): MatrixRow[] {
  const want = normalizeHardware(gpu.name);
  return matrixData.filter(row => {
    const got = normalizeHardware(row.hardware);
    if (got.model !== want.model) return false;
    // When either side states a capacity, they must agree — an 8G and a 16G
    // card of the same name do not share results.
    if (got.vram !== null && got.vram !== gpu.vram) return false;
    if (want.vram !== null && got.vram !== null && got.vram !== want.vram) return false;
    return true;
  });
}
