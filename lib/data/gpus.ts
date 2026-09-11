export interface GPU {
  id: string;
  name: string;
  vram: number;
  type: 'nvidia-consumer' | 'nvidia-pro' | 'apple' | 'amd' | 'cpu';
  isUnified?: boolean;
  isCPU?: boolean;
  icon: string;
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
  { id: 'rtx5090',     name: 'RTX 5090',              vram: 32,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5080',     name: 'RTX 5080',              vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5070ti',   name: 'RTX 5070 Ti',           vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5070',     name: 'RTX 5070',              vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5060ti16', name: 'RTX 5060 Ti 16G',       vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5060ti',   name: 'RTX 5060 Ti 8G',        vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx5060',     name: 'RTX 5060',              vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4090',     name: 'RTX 4090',             vram: 24,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4080s',    name: 'RTX 4080 Super',        vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4070tis',  name: 'RTX 4070 Ti Super',     vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4070ti',   name: 'RTX 4070 Ti',           vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4070s',    name: 'RTX 4070 Super',        vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4070',     name: 'RTX 4070',              vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4060ti16', name: 'RTX 4060 Ti 16G',       vram: 16,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4060ti',   name: 'RTX 4060 Ti 8G',        vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx4060',     name: 'RTX 4060',              vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3090',     name: 'RTX 3090',              vram: 24,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3080ti',   name: 'RTX 3080 Ti',           vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3080-12',  name: 'RTX 3080 12G',          vram: 12,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3080',     name: 'RTX 3080 10G',          vram: 10,  type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3070ti',   name: 'RTX 3070 Ti',           vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'rtx3070',     name: 'RTX 3070',              vram: 8,   type: 'nvidia-consumer', icon: '🟢' },
  { id: 'a100-80',     name: 'A100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵' },
  { id: 'a100-40',     name: 'A100 40G',              vram: 40,  type: 'nvidia-pro',      icon: '🔵' },
  { id: 'l40s',        name: 'L40S 48G',              vram: 48,  type: 'nvidia-pro',      icon: '🔵' },
  { id: 'a40',         name: 'A40 48G',               vram: 48,  type: 'nvidia-pro',      icon: '🔵' },
  { id: 'h100-80',     name: 'H100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵' },
  { id: 'm5-ultra-512', name: 'Mac M5 Ultra 512G',    vram: 512, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm5-ultra-256', name: 'Mac M5 Ultra 256G',    vram: 256, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm5-max-128',  name: 'Mac M5 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm5-pro-64',   name: 'Mac M5 Pro 64G',        vram: 64,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm5-32',       name: 'Mac M5 32G',            vram: 32,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm4-max-128',  name: 'Mac M4 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm4-max-36',   name: 'Mac M4 Max 36G',        vram: 36,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm4-pro-48',   name: 'Mac M4 Pro 48G',        vram: 48,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm4-pro-24',   name: 'Mac M4 Pro 24G',        vram: 24,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-ultra',    name: 'Mac M3 Ultra 192G',     vram: 192, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-max-128',  name: 'Mac M3 Max 128G',       vram: 128, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-max-48',   name: 'Mac M3 Max 48G',        vram: 48,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-pro-36',   name: 'Mac M3 Pro 36G',        vram: 36,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-pro-18',   name: 'Mac M3 Pro 18G',        vram: 18,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-16',       name: 'Mac M3 16G',            vram: 16,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm3-8',        name: 'Mac M3 8G',             vram: 8,   type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm2-ultra',    name: 'Mac M2 Ultra 192G',     vram: 192, type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'm2-max-96',   name: 'Mac M2 Max 96G',        vram: 96,  type: 'apple', isUnified: true, icon: '🍎' },
  { id: 'rx9070xt',    name: 'Radeon RX 9070 XT',     vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx9070',      name: 'Radeon RX 9070',        vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx7900xtx',   name: 'Radeon RX 7900 XTX',    vram: 24,  type: 'amd', icon: '🔴' },
  { id: 'rx7900xt',    name: 'Radeon RX 7900 XT',     vram: 20,  type: 'amd', icon: '🔴' },
  { id: 'rx7900gre',   name: 'Radeon RX 7900 GRE',    vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx7800xt',    name: 'Radeon RX 7800 XT',     vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx7700xt',    name: 'Radeon RX 7700 XT',     vram: 12,  type: 'amd', icon: '🔴' },
  { id: 'rx6900xt',    name: 'Radeon RX 6900 XT',     vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx6800xt',    name: 'Radeon RX 6800 XT',     vram: 16,  type: 'amd', icon: '🔴' },
  { id: 'rx6700xt',    name: 'Radeon RX 6700 XT',     vram: 12,  type: 'amd', icon: '🔴' },
  { id: 'w7900',       name: 'Radeon PRO W7900 48G',  vram: 48,  type: 'amd', icon: '🔴' },
  { id: 'mi100',       name: 'Instinct MI100 32G',    vram: 32,  type: 'amd', icon: '🔴' },
  { id: 'cpu-128',     name: '128 GB RAM (CPU)',       vram: 128, type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-64',      name: '64 GB RAM (CPU)',        vram: 64,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-32',      name: '32 GB RAM (CPU)',        vram: 32,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-16',      name: '16 GB RAM (CPU)',        vram: 16,  type: 'cpu', isCPU: true,      icon: '💻' },
];
