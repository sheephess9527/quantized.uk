import type { GPU } from '@/lib/data/gpus';
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
