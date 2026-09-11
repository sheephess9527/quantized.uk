export interface GPU {
  id: string;
  name: string;
  vram: number;
  type: 'nvidia-consumer' | 'nvidia-pro' | 'apple' | 'amd' | 'cpu';
  isUnified?: boolean;
  isCPU?: boolean;
  icon: string;
  /**
   * Peak theoretical memory bandwidth in GB/s, from the vendor's own
   * specification. Nothing in the sizing math reads it — capacity decides what
   * fits — but it is the spec that separates two cards with the same VRAM, and
   * without it a 4060 Ti 16G page and a 4080 Super page say the same thing
   * about the same models. Token generation on a local LLM reads the whole
   * weight set once per token, so this is the ceiling on tok/s.
   *
   * Absent on the CPU entries: system bandwidth is a property of the reader's
   * DIMMs and channel count, not of "64 GB of RAM", and a single number there
   * would be a guess dressed as a spec.
   */
  bandwidth?: number;
  /** Memory technology, as the vendor names it. */
  memType?: string;
  /** Set where the headline figure depends on a form factor the name omits. */
  bandwidthNote?: { en: string; zh: string };
}

export const gpuDatabase: GPU[] = [
  /*
   * Capacities verified 2026-09-11 against vendor and press specifications.
   * VRAM is the only field the sizing math reads, and it is the only claim made
   * here — no clock, bandwidth or price, because none of those are checked and
   * none of them change what fits.
   *
   * The Blackwell and RDNA 4 generations and the M4/M5 Macs were absent
   * entirely, which meant the site could not answer "what can an RTX 5090 run"
   * — its single most valuable question type — for anything newer than 2022.
   */
  { id: 'rtx5090',     name: 'RTX 5090',              vram: 32,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 1792, memType: 'GDDR7', },
  { id: 'rtx5080',     name: 'RTX 5080',              vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 960, memType: 'GDDR7', },
  { id: 'rtx5070ti',   name: 'RTX 5070 Ti',           vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 896, memType: 'GDDR7', },
  { id: 'rtx5070',     name: 'RTX 5070',              vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 672, memType: 'GDDR7', },
  { id: 'rtx5060ti16', name: 'RTX 5060 Ti 16G',       vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR7', },
  { id: 'rtx5060ti',   name: 'RTX 5060 Ti 8G',        vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR7', },
  { id: 'rtx5060',     name: 'RTX 5060',              vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR7', },
  { id: 'rtx4090',     name: 'RTX 4090',             vram: 24,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 1008, memType: 'GDDR6X', },
  { id: 'rtx4080s',    name: 'RTX 4080 Super',        vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 736, memType: 'GDDR6X', },
  { id: 'rtx4070tis',  name: 'RTX 4070 Ti Super',     vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 672, memType: 'GDDR6X', },
  { id: 'rtx4070ti',   name: 'RTX 4070 Ti',           vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 504, memType: 'GDDR6X', },
  { id: 'rtx4070s',    name: 'RTX 4070 Super',        vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 504, memType: 'GDDR6X', },
  { id: 'rtx4070',     name: 'RTX 4070',              vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 504, memType: 'GDDR6X', },
  { id: 'rtx4060ti16', name: 'RTX 4060 Ti 16G',       vram: 16,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 288, memType: 'GDDR6', },
  { id: 'rtx4060ti',   name: 'RTX 4060 Ti 8G',        vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 288, memType: 'GDDR6', },
  { id: 'rtx4060',     name: 'RTX 4060',              vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 272, memType: 'GDDR6', },
  { id: 'rtx3090',     name: 'RTX 3090',              vram: 24,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 936, memType: 'GDDR6X', },
  { id: 'rtx3080ti',   name: 'RTX 3080 Ti',           vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 912, memType: 'GDDR6X', },
  { id: 'rtx3080-12',  name: 'RTX 3080 12G',          vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 912, memType: 'GDDR6X', },
  { id: 'rtx3080',     name: 'RTX 3080 10G',          vram: 10,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 760, memType: 'GDDR6X', },
  { id: 'rtx3070ti',   name: 'RTX 3070 Ti',           vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 608, memType: 'GDDR6X', },
  { id: 'rtx3070',     name: 'RTX 3070',              vram: 8,   type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR6', },
  { id: 'a100-80',     name: 'A100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 1935, memType: 'HBM2e', bandwidthNote: { en: 'PCIe figure. The SXM module is 2,039 GB/s.', zh: 'PCIe 版数据。SXM 模组为 2,039 GB/s。' }, },
  { id: 'a100-40',     name: 'A100 40G',              vram: 40,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 1555, memType: 'HBM2', bandwidthNote: { en: 'PCIe figure. The SXM module is 1,555 GB/s as well.', zh: 'PCIe 版数据，SXM 模组同为 1,555 GB/s。' }, },
  { id: 'l40s',        name: 'L40S 48G',              vram: 48,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 864, memType: 'GDDR6', },
  { id: 'a40',         name: 'A40 48G',               vram: 48,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 696, memType: 'GDDR6', },
  { id: 'h100-80',     name: 'H100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 2000, memType: 'HBM2e', bandwidthNote: { en: 'PCIe figure. The SXM5 module carries HBM3 at 3,350 GB/s.', zh: 'PCIe 版数据。SXM5 模组为 HBM3，3,350 GB/s。' }, },
  { id: 'm5-ultra-512', name: 'Mac M5 Ultra 512G',    vram: 512, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 1200, memType: 'Unified LPDDR5X', },
  { id: 'm5-ultra-256', name: 'Mac M5 Ultra 256G',    vram: 256, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 1200, memType: 'Unified LPDDR5X', },
  { id: 'm5-max-128',  name: 'Mac M5 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 614, memType: 'Unified LPDDR5X', },
  { id: 'm5-pro-64',   name: 'Mac M5 Pro 64G',        vram: 64,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 307, memType: 'Unified LPDDR5X', },
  { id: 'm5-32',       name: 'Mac M5 32G',            vram: 32,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 153, memType: 'Unified LPDDR5X', },
  { id: 'm4-max-128',  name: 'Mac M4 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 546, memType: 'Unified LPDDR5X', },
  { id: 'm4-max-36',   name: 'Mac M4 Max 36G',        vram: 36,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 410, memType: 'Unified LPDDR5X', },
  { id: 'm4-pro-48',   name: 'Mac M4 Pro 48G',        vram: 48,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 273, memType: 'Unified LPDDR5X', },
  { id: 'm4-pro-24',   name: 'Mac M4 Pro 24G',        vram: 24,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 273, memType: 'Unified LPDDR5X', },
  { id: 'm3-ultra',    name: 'Mac M3 Ultra 192G',     vram: 192, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 819, memType: 'Unified LPDDR5', },
  { id: 'm3-max-128',  name: 'Mac M3 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 400, memType: 'Unified LPDDR5', },
  { id: 'm3-max-48',   name: 'Mac M3 Max 48G',        vram: 48,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 400, memType: 'Unified LPDDR5', },
  { id: 'm3-pro-36',   name: 'Mac M3 Pro 36G',        vram: 36,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 150, memType: 'Unified LPDDR5', },
  { id: 'm3-pro-18',   name: 'Mac M3 Pro 18G',        vram: 18,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 150, memType: 'Unified LPDDR5', },
  { id: 'm3-16',       name: 'Mac M3 16G',            vram: 16,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 100, memType: 'Unified LPDDR5', },
  { id: 'm3-8',        name: 'Mac M3 8G',             vram: 8,   type: 'apple', isUnified: true, icon: '🍎', bandwidth: 100, memType: 'Unified LPDDR5', },
  { id: 'm2-ultra',    name: 'Mac M2 Ultra 192G',     vram: 192, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 800, memType: 'Unified LPDDR5', },
  { id: 'm2-max-96',   name: 'Mac M2 Max 96G',        vram: 96,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 400, memType: 'Unified LPDDR5', },
  { id: 'rx9070xt',    name: 'Radeon RX 9070 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 640, memType: 'GDDR6', },
  { id: 'rx9070',      name: 'Radeon RX 9070',        vram: 16,  type: 'amd', icon: '🔴', bandwidth: 640, memType: 'GDDR6', },
  { id: 'rx7900xtx',   name: 'Radeon RX 7900 XTX',    vram: 24,  type: 'amd', icon: '🔴', bandwidth: 960, memType: 'GDDR6', },
  { id: 'rx7900xt',    name: 'Radeon RX 7900 XT',     vram: 20,  type: 'amd', icon: '🔴', bandwidth: 800, memType: 'GDDR6', },
  { id: 'rx7900gre',   name: 'Radeon RX 7900 GRE',    vram: 16,  type: 'amd', icon: '🔴', bandwidth: 576, memType: 'GDDR6', },
  { id: 'rx7800xt',    name: 'Radeon RX 7800 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 624, memType: 'GDDR6', },
  { id: 'rx7700xt',    name: 'Radeon RX 7700 XT',     vram: 12,  type: 'amd', icon: '🔴', bandwidth: 432, memType: 'GDDR6', },
  { id: 'rx6900xt',    name: 'Radeon RX 6900 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 512, memType: 'GDDR6', },
  { id: 'rx6800xt',    name: 'Radeon RX 6800 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 512, memType: 'GDDR6', },
  { id: 'rx6700xt',    name: 'Radeon RX 6700 XT',     vram: 12,  type: 'amd', icon: '🔴', bandwidth: 384, memType: 'GDDR6', },
  { id: 'w7900',       name: 'Radeon PRO W7900 48G',  vram: 48,  type: 'amd', icon: '🔴', bandwidth: 864, memType: 'GDDR6 ECC', },
  { id: 'mi100',       name: 'Instinct MI100 32G',    vram: 32,  type: 'amd', icon: '🔴', bandwidth: 1228, memType: 'HBM2', },
  { id: 'cpu-128',     name: '128 GB RAM (CPU)',       vram: 128, type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-64',      name: '64 GB RAM (CPU)',        vram: 64,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-32',      name: '32 GB RAM (CPU)',        vram: 32,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-16',      name: '16 GB RAM (CPU)',        vram: 16,  type: 'cpu', isCPU: true,      icon: '💻' },
];
