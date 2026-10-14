/**
 * Measured prompt-processing speed (llama-bench `pp512`, tokens/s) for Llama 2 7B
 * Q4_0 with every layer on the device and flash attention off — the one
 * benchmark llama.cpp's own community scoreboards share across backends.
 *
 * Sources (read 2026-10-13; values copied with their scoreboard row, two reads
 * each agreeing to the ± figure):
 * - CUDA: github.com/ggml-org/llama.cpp/discussions/15013
 * - ROCm (HIP): …/discussions/15021
 * - Vulkan (Intel Arc rows only): …/discussions/10879
 * - Apple Metal: …/discussions/4167 — run on build 8e672ef (Nov 2023), older
 *   than the others; Q4_0 column. Our Mac rows do not name a GPU core count,
 *   so each takes the lower-core variant of the chip at that bandwidth.
 *
 * These are single community submissions on varying drivers and builds, not
 * this site's runs: some orderings look odd (the RX 7900 GRE below the
 * RX 7800 XT; the Arc B580 below the B570) and are kept as reported rather
 * than "corrected". A card without a scoreboard row has no entry — no figure
 * is borrowed from a sibling card unless the scoreboard row names the chip
 * without its memory size (same silicon, noted per row).
 */

export type PrefillSource = 15013 | 15021 | 10879 | 4167;

export interface PrefillRow {
  pp512: number;
  /**
   * Token generation (`tg128`, tokens/s) from the same scoreboard row as
   * `pp512` — matched by that row's pp512 figure, so both numbers are one
   * submission's run. Added 2026-10-14 (Grok Bot); Apple rows: Q4_0 TG column.
   */
  tg128: number;
  backend: 'CUDA' | 'ROCm' | 'Vulkan' | 'Metal';
  source: PrefillSource;
}

/** The scoreboards' model: Llama 2 7B (32 layers, 32 × 128 attention width). */
export const PREFILL_REFERENCE = { paramsB: 6.74, layers: 32, qDim: 4096, promptLen: 512 } as const;

const cuda = (pp512: number, tg128: number): PrefillRow => ({ pp512, tg128, backend: 'CUDA', source: 15013 });
const rocm = (pp512: number, tg128: number): PrefillRow => ({ pp512, tg128, backend: 'ROCm', source: 15021 });
const vulkan = (pp512: number, tg128: number): PrefillRow => ({ pp512, tg128, backend: 'Vulkan', source: 10879 });
const metal = (pp512: number, tg128: number): PrefillRow => ({ pp512, tg128, backend: 'Metal', source: 4167 });

export const prefillData: Record<string, PrefillRow> = {
  // CUDA scoreboard (#15013)
  rtx5090: cuda(14073.41, 290.02),
  rtx5080: cuda(8297.36, 181.99),
  rtx5070ti: cuda(6952.38, 176.85),
  rtx5070: cuda(5184.75, 127.54),
  rtx5060ti16: cuda(3737.25, 90.94), // row "RTX 5060 Ti", memory size not stated — same GPU in both
  rtx5060ti: cuda(3737.25, 90.94),
  rtx4090: cuda(11992.70, 186.21),
  rtx4080s: cuda(8125.15, 148.33),
  rtx4070tis: cuda(6924.53, 132.26),
  rtx4060ti16: cuda(3394.63, 63.86), // row "RTX 4060 Ti", memory size not stated
  rtx4060ti: cuda(3394.63, 63.86),
  rtx3090: cuda(5174.69, 158.16),
  rtx3080: cuda(5013.86, 139.65), // row "RTX 3080"
  rtx3060: cuda(2137.50, 75.57), // row "RTX 3060"
  'a100-80': cuda(4849.53, 190.88),
  a40: cuda(4609.01, 124.11),
  'h100-80': cuda(9918.34, 267.81), // row "H100 80 GB", form factor not stated
  'dgx-spark-128': cuda(3062.31, 57.21), // row "DGX Spark" — one GB10 chip in both sizes
  'dgx-spark-64': cuda(3062.31, 57.21),
  'p100-16': cuda(760.80, 58.35),
  'p40-24': cuda(1007.42, 54.74),
  // ROCm scoreboard (#15021)
  rx7900xtx: rocm(3552.27, 167.11),
  rx7900xt: rocm(3098.38, 116.15),
  rx7900gre: rocm(1456.98, 96.07),
  rx7800xt: rocm(2151.81, 100.94),
  rx7600xt: rocm(1099.64, 48.58),
  rx9070xt: rocm(5055.19, 101.27),
  rx9070: rocm(2381.77, 114.48),
  rx9060xt16: rocm(1419.67, 67.58), // row "RX 9060 XT", memory size not stated
  rx9060xt8: rocm(1419.67, 67.58),
  rx6900xt: rocm(1889.84, 88.49),
  rx6800xt: rocm(1447.07, 83.92),
  w7900: rocm(3213.17, 121.18),
  r9700: rocm(4443.54, 93.84),
  mi100: rocm(2732.83, 110.48),
  // Vulkan scoreboard (#10879) — Intel Arc has no SYCL scoreboard
  'arc-b580': vulkan(620.94, 70.14),
  'arc-b570': vulkan(913.95, 49.64),
  'arc-a770-16': vulkan(1073.85, 52.56),
  'arc-a750': vulkan(1075.94, 42.66),
  'arc-pro-b70': vulkan(3379.00, 112.02),
  // Apple scoreboard (#4167), Q4_0 PP, lower-core variant at that bandwidth
  'm1-8': metal(107.81, 14.19), // M1 7-core
  'm1-16': metal(107.81, 14.19),
  'm2-16': metal(145.91, 21.7), // M2 8-core
  'm3-8': metal(186.75, 21.34), // M3 10-core (only M3 row)
  'm3-16': metal(186.75, 21.34),
  'm4-16': metal(221.29, 24.11), // M4 10-core
  'm4-24': metal(221.29, 24.11),
  'm3-pro-18': metal(269.49, 30.65), // M3 Pro 14-core
  'm3-pro-36': metal(269.49, 30.65),
  'm4-pro-24': metal(364.06, 49.64), // M4 Pro 16-core
  'm4-pro-48': metal(364.06, 49.64),
  'm1-max-64': metal(400.26, 54.61), // M1 Max 24-core
  'm2-max-96': metal(537.60, 60.99), // M2 Max 30-core
  'm3-max-48': metal(759.70, 66.31), // M3 Max 40-core (400 GB/s)
  'm3-max-128': metal(759.70, 66.31),
  'm4-max-36': metal(713.93, 69.95), // M4 Max 32-core (410 GB/s)
  'm4-max-128': metal(885.68, 83.06), // M4 Max 40-core (546 GB/s)
  'm2-ultra': metal(1013.81, 88.64), // M2 Ultra 60-core
  'm3-ultra': metal(1073.09, 88.40), // M3 Ultra 60-core
};
