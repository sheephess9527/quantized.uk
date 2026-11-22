export interface GPU {
  id: string;
  name: string;
  vram: number;
  type: 'nvidia-consumer' | 'nvidia-pro' | 'nvidia-unified' | 'apple' | 'amd' | 'intel' | 'cpu';
  isUnified?: boolean;
  isCPU?: boolean;
  isLaptop?: boolean;
  isIntegrated?: boolean;
  /** Source for the published hardware specifications, when recorded. */
  specUrl?: string;
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
  /**
   * `YYYY-MM-DD` this index picked the row up — from `git log`, never typed
   * from memory. Feeds the homepage "Latest additions" beside new models.
   * Rows older than the field (2026-10-02) simply omit it.
   */
  addedAt?: string;
}

function geforceLaptops(series: 30 | 40 | 50, memType: string, models: [string, number, boolean?][]): GPU[] {
  const specUrl = `https://www.nvidia.com/en-us/geforce/laptops/${series}-series/`;
  return models.map(([model, vram, hasVariants]) => ({
    id: `rtx${model.toLowerCase().replace(/ /g, '')}-laptop${hasVariants ? `-${vram}gb` : ''}`,
    name: `RTX ${model} Laptop GPU${hasVariants ? ` ${vram}G` : ''}`,
    vram, memType, specUrl, isLaptop: true, type: 'nvidia-consumer', icon: '🟢', addedAt: '2026-11-22',
  }));
}

const radeonLaptopLaunch = 'https://web.archive.org/web/20230516185750/https://www.amd.com/en/graphics/amd-radeon-rx-laptops';
const radeonLaptopDefaults = { type: 'amd', icon: '🔴', memType: 'GDDR6', isLaptop: true, addedAt: '2026-11-22' } as const;

export const gpuDatabase: GPU[] = [
  { id: 'ryzen-ai-max-395-64', name: 'Ryzen AI Max+ 395 64G', vram: 48, type: 'amd', isIntegrated: true, icon: '🔴', bandwidth: 256, memType: 'LPDDR5X-8000', addedAt: '2026-11-22', specUrl: 'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html', bandwidthNote: { en: '64 GB unified system memory; this row budgets up to 48 GB GPU allocation on Windows with AMD Variable Graphics Memory (OEM/BIOS dependent). Radeon 8060S shares the 256-bit bus with the CPU. Not 64 GB of dedicated VRAM.', zh: '整机统一内存 64 GB；本行按 Windows 下 AMD Variable Graphics Memory 最多分配 48 GB 给 GPU 估算（取决于厂商与 BIOS）。Radeon 8060S 与 CPU 共享 256 位总线，并非 64 GB 独立显存。' } },
  { id: 'ryzen-ai-max-395-128', name: 'Ryzen AI Max+ 395 128G', vram: 96, type: 'amd', isIntegrated: true, icon: '🔴', bandwidth: 256, memType: 'LPDDR5X-8000', addedAt: '2026-11-22', specUrl: 'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html', bandwidthNote: { en: '128 GB unified system memory; this row uses the Windows AMD Variable Graphics Memory ceiling of 96 GB GPU allocation, not a Linux-tuned budget. Radeon 8060S shares the 256-bit bus with the CPU. Not 128 GB of dedicated VRAM.', zh: '整机统一内存 128 GB；本行采用 Windows 下 AMD Variable Graphics Memory 最多分配 96 GB 给 GPU 的上限，不采用 Linux 调优后的容量。Radeon 8060S 与 CPU 共享 256 位总线，并非 128 GB 独立显存。' } },
  { id: 'gtx1080ti', name: 'GTX 1080 Ti 11G', vram: 11, type: 'nvidia-consumer', icon: '🟢', bandwidth: 484, memType: 'GDDR5X', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-gtx-1080-ti.c2877' },
  { id: 'rtx2060', name: 'RTX 2060 6G', vram: 6, type: 'nvidia-consumer', icon: '🟢', bandwidth: 336, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-2060.c3310' },
  { id: 'rtx2060-12', name: 'RTX 2060 12G', vram: 12, type: 'nvidia-consumer', icon: '🟢', bandwidth: 336, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-2060-12-gb.c3836' },
  { id: 'rtx2070', name: 'RTX 2070 8G', vram: 8, type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-2070.c3252' },
  { id: 'rtx2080', name: 'RTX 2080 8G', vram: 8, type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-2080.c3224' },
  { id: 'rtx2080ti', name: 'RTX 2080 Ti 11G', vram: 11, type: 'nvidia-consumer', icon: '🟢', bandwidth: 616, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf' },
  { id: 'rtx3060ti', name: 'RTX 3060 Ti 8G', vram: 8, type: 'nvidia-consumer', icon: '🟢', bandwidth: 448, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-3060-ti.c3681', bandwidthNote: { en: 'Original GDDR6 version; not the later GDDR6X variant.', zh: '原版 GDDR6 配置，并非后出的 GDDR6X 版本。' } },
  { id: 'rtx3050', name: 'RTX 3050 8G', vram: 8, type: 'nvidia-consumer', icon: '🟢', bandwidth: 224, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.techpowerup.com/gpu-specs/geforce-rtx-3050-8-gb.c3858' },
  { id: 'v100-16', name: 'Tesla V100 PCIe 16G', vram: 16, type: 'nvidia-pro', icon: '🔵', bandwidth: 900, memType: 'HBM2', addedAt: '2026-11-22', specUrl: 'https://images.nvidia.com/content/technologies/volta/pdf/tesla-volta-v100-datasheet.pdf' },
  { id: 'v100-32', name: 'Tesla V100 PCIe 32G', vram: 32, type: 'nvidia-pro', icon: '🔵', bandwidth: 900, memType: 'HBM2', addedAt: '2026-11-22', specUrl: 'https://images.nvidia.com/content/technologies/volta/pdf/tesla-volta-v100-datasheet.pdf' },
  { id: 't4', name: 'Tesla T4 16G', vram: 16, type: 'nvidia-pro', icon: '🔵', bandwidth: 320, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-tensor-core-product-brief.pdf', bandwidthNote: { en: 'Peak bandwidth from the product brief; NVIDIA also lists 300 GB/s in its datasheet.', zh: '采用产品简介中的峰值带宽；NVIDIA 的数据表另列为 300 GB/s。' } },
  { id: 'rtxa6000', name: 'RTX A6000 48G', vram: 48, type: 'nvidia-pro', icon: '🔵', bandwidth: 768, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/nvidia-rtx-a6000-datasheet.pdf' },
  { id: 'rtx6000-ada', name: 'RTX 6000 Ada 48G', vram: 48, type: 'nvidia-pro', icon: '🔵', bandwidth: 960, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.nvidia.com/en-us/products/workstations/rtx-6000/' },
  { id: 'rtx2080ti-22', name: 'RTX 2080 Ti 22G (Mod/改装)', vram: 22, type: 'nvidia-consumer', icon: '🟢', bandwidth: 616, memType: 'GDDR6', addedAt: '2026-11-22', specUrl: 'https://www.tomshardware.com/pc-components/gpus/pre-modded-rtx-2080-ti-cards-with-22gb-of-vram-surface-on-ebay-for-usd500-hong-kong-based-seller-offers-ai-friendly-memory-mod-for-a-reasonable-price', bandwidthNote: { en: 'Unofficial China-market memory modification, not an NVIDIA SKU. 22 GB comes from the mod; bandwidth assumes stock 14 Gbps memory on the unchanged 352-bit bus. Firmware, stability and warranty vary by seller; verify your actual card.', zh: '中国市场非官方扩容改装卡，并非 NVIDIA 官方型号。22 GB 容量来自改装；带宽沿用原卡 14 Gbps 显存及 352 位总线。固件、稳定性和保修取决于卖家，请核实实卡。' } },
  { id: 'rtx4090-48', name: 'RTX 4090 48G (Mod/改装)', vram: 48, type: 'nvidia-consumer', icon: '🟢', bandwidth: 1008, memType: 'GDDR6X', addedAt: '2026-11-22', specUrl: 'https://www.tomshardware.com/pc-components/gpus/blower-style-rtx-4090-48gb-teardown-reveals-dual-sided-memory-configuration-pcb-design-echoes-the-rtx-3090', bandwidthNote: { en: 'Unofficial China-market memory modification, not an NVIDIA SKU. 48 GB comes from a modified board; bandwidth assumes stock 21 Gbps memory on the unchanged 384-bit bus. Firmware, stability and warranty vary by seller; verify your actual card.', zh: '中国市场非官方扩容改装卡，并非 NVIDIA 官方型号。48 GB 容量来自改装电路板；带宽沿用原卡 21 Gbps 显存及 384 位总线。固件、稳定性和保修取决于卖家，请核实实卡。' } },
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
  { id: 'rtx5050',     name: 'RTX 5050',              vram: 8,   type: 'nvidia-consumer', icon: '🟢', memType: 'GDDR6', addedAt: '2026-10-02', },
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
  { id: 'rtx3060',     name: 'RTX 3060 12G',          vram: 12,  type: 'nvidia-consumer', icon: '🟢', bandwidth: 360, memType: 'GDDR6', addedAt: '2026-10-02', },
  { id: 'a100-80',     name: 'A100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 1935, memType: 'HBM2e', bandwidthNote: { en: 'PCIe figure. The SXM module is 2,039 GB/s.', zh: 'PCIe 版数据。SXM 模组为 2,039 GB/s。' }, },
  { id: 'a100-40',     name: 'A100 40G',              vram: 40,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 1555, memType: 'HBM2', bandwidthNote: { en: 'PCIe figure. The SXM module is 1,555 GB/s as well.', zh: 'PCIe 版数据，SXM 模组同为 1,555 GB/s。' }, },
  { id: 'l40s',        name: 'L40S 48G',              vram: 48,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 864, memType: 'GDDR6', },
  { id: 'a40',         name: 'A40 48G',               vram: 48,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 696, memType: 'GDDR6', },
  { id: 'h100-80',     name: 'H100 80G',              vram: 80,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 2000, memType: 'HBM2e', bandwidthNote: { en: 'PCIe figure. The SXM5 module carries HBM3 at 3,350 GB/s.', zh: 'PCIe 版数据。SXM5 模组为 HBM3，3,350 GB/s。' }, },
  /*
   * NVIDIA DGX Spark (GB10 Grace Blackwell), a desktop machine rather than a
   * card: 128 GB of unified LPDDR5X at 273 GB/s on a 256-bit interface
   * (nvidia.com product page). The 64 GB model was announced 2026-10-02 for
   * sale from 2026-10-23 at $4,999 through six OEMs (nvidia.com); press
   * coverage (The Register, HotHardware) reports the same 273 GB/s, the bus
   * fully populated with lower-density packages. Not `isUnified`: that flag
   * carries macOS's ~75% wired-memory cap, which has nothing to do with
   * DGX OS. `tightCeiling()` instead stops the 'tight' band at 100%.
   */
  { id: 'dgx-spark-128', name: 'DGX Spark 128G',      vram: 128, type: 'nvidia-unified', icon: '🟩', bandwidth: 273, memType: 'Unified LPDDR5X', bandwidthNote: { en: 'One pool shared by the GB10\'s CPU and GPU and by DGX OS itself. NVIDIA publishes no fixed GPU share, so fits are judged against the whole pool — and nothing larger than it can load, because there is no separate system RAM to spill into.', zh: 'GB10 的 CPU、GPU 和 DGX OS 本身共用这一块内存。NVIDIA 没有公布 GPU 可用的固定比例，所以本站按整块内存判定能否装下——超出它的模型一律装不下，因为没有另外的系统内存可以溢出。' }, addedAt: '2026-10-05', },
  { id: 'dgx-spark-64', name: 'DGX Spark 64G',        vram: 64,  type: 'nvidia-unified', icon: '🟩', bandwidth: 273, memType: 'Unified LPDDR5X', bandwidthNote: { en: 'Same 273 GB/s as the 128 GB model. One pool shared by the GB10\'s CPU and GPU and by DGX OS itself. NVIDIA publishes no fixed GPU share, so fits are judged against the whole pool — and nothing larger than it can load, because there is no separate system RAM to spill into.', zh: '带宽与 128 GB 版相同，均为 273 GB/s。GB10 的 CPU、GPU 和 DGX OS 本身共用这一块内存。NVIDIA 没有公布 GPU 可用的固定比例，所以本站按整块内存判定能否装下——超出它的模型一律装不下，因为没有另外的系统内存可以溢出。' }, addedAt: '2026-10-05', },
  /*
   * Pascal-generation datacentre cards (2016), still traded second-hand for
   * their VRAM-per-dollar — a common budget home-lab pick, especially in the
   * used-hardware market this site's Chinese readers shop in. Capacities and
   * bandwidths are NVIDIA's own published specs for the cards, unchanged
   * since release; no local benchmark runs recorded on either yet.
   */
  { id: 'p100-16',     name: 'Tesla P100 16G',        vram: 16,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 732, memType: 'HBM2', },
  { id: 'p40-24',      name: 'Tesla P40 24G',         vram: 24,  type: 'nvidia-pro',      icon: '🔵', bandwidth: 346, memType: 'GDDR5', },
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
  // Apple's own spec pages and newsroom (2026-10-02): M4 16/24GB at 120 GB/s, M2 at 100 GB/s,
  // M1 Max up to 64GB at 400 GB/s. memType omitted: the sources read did not state it.
  { id: 'm4-24',       name: 'Mac M4 24G',            vram: 24,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 120, addedAt: '2026-10-02', },
  { id: 'm4-16',       name: 'Mac M4 16G',            vram: 16,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 120, addedAt: '2026-10-02', },
  { id: 'm2-16',       name: 'Mac M2 16G',            vram: 16,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 100, addedAt: '2026-10-02', },
  { id: 'm1-max-64',   name: 'Mac M1 Max 64G',        vram: 64,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 400, addedAt: '2026-10-02', },
  { id: 'm1-16',       name: 'Mac M1 16G',            vram: 16,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 68, bandwidthNote: { en: 'Derived from Apple\'s statements that the M2 (100 GB/s) is 50% faster and the M1 Max (400 GB/s) nearly 6× faster; Apple does not list the M1 figure directly.', zh: '由苹果的两处表述推算：M2（100 GB/s）比它快 50%，M1 Max（400 GB/s）是它的近 6 倍；苹果没有直接列出 M1 的数字。' }, addedAt: '2026-10-02', },
  { id: 'm1-8',        name: 'Mac M1 8G',             vram: 8,   type: 'apple', isUnified: true, icon: '🍎', bandwidth: 68, bandwidthNote: { en: 'Derived from Apple\'s statements that the M2 (100 GB/s) is 50% faster and the M1 Max (400 GB/s) nearly 6× faster; Apple does not list the M1 figure directly.', zh: '由苹果的两处表述推算：M2（100 GB/s）比它快 50%，M1 Max（400 GB/s）是它的近 6 倍；苹果没有直接列出 M1 的数字。' }, addedAt: '2026-10-02', },
  { id: 'm2-ultra',    name: 'Mac M2 Ultra 192G',     vram: 192, type: 'apple', isUnified: true, icon: '🍎', bandwidth: 800, memType: 'Unified LPDDR5', },
  { id: 'm2-max-96',   name: 'Mac M2 Max 96G',        vram: 96,  type: 'apple', isUnified: true, icon: '🍎', bandwidth: 400, memType: 'Unified LPDDR5', },
  { id: 'rx9070xt',    name: 'Radeon RX 9070 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 640, memType: 'GDDR6', },
  { id: 'rx9070',      name: 'Radeon RX 9070',        vram: 16,  type: 'amd', icon: '🔴', bandwidth: 640, memType: 'GDDR6', },
  { id: 'rx9060xt16',  name: 'Radeon RX 9060 XT 16G', vram: 16,  type: 'amd', icon: '🔴', bandwidth: 320, memType: 'GDDR6', addedAt: '2026-10-02', },
  { id: 'rx9060xt8',   name: 'Radeon RX 9060 XT 8G',  vram: 8,   type: 'amd', icon: '🔴', bandwidth: 320, memType: 'GDDR6', addedAt: '2026-10-02', },
  { id: 'rx7900xtx',   name: 'Radeon RX 7900 XTX',    vram: 24,  type: 'amd', icon: '🔴', bandwidth: 960, memType: 'GDDR6', },
  { id: 'rx7900xt',    name: 'Radeon RX 7900 XT',     vram: 20,  type: 'amd', icon: '🔴', bandwidth: 800, memType: 'GDDR6', },
  { id: 'rx7900gre',   name: 'Radeon RX 7900 GRE',    vram: 16,  type: 'amd', icon: '🔴', bandwidth: 576, memType: 'GDDR6', },
  { id: 'rx7800xt',    name: 'Radeon RX 7800 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 624, memType: 'GDDR6', },
  { id: 'rx7700xt',    name: 'Radeon RX 7700 XT',     vram: 12,  type: 'amd', icon: '🔴', bandwidth: 432, memType: 'GDDR6', },
  { id: 'rx7600xt',    name: 'Radeon RX 7600 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 288, memType: 'GDDR6', addedAt: '2026-10-02', },
  { id: 'rx6900xt',    name: 'Radeon RX 6900 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 512, memType: 'GDDR6', },
  { id: 'rx6800xt',    name: 'Radeon RX 6800 XT',     vram: 16,  type: 'amd', icon: '🔴', bandwidth: 512, memType: 'GDDR6', },
  { id: 'rx6700xt',    name: 'Radeon RX 6700 XT',     vram: 12,  type: 'amd', icon: '🔴', bandwidth: 384, memType: 'GDDR6', },
  { id: 'w7900',       name: 'Radeon PRO W7900 48G',  vram: 48,  type: 'amd', icon: '🔴', bandwidth: 864, memType: 'GDDR6 ECC', },
  // amd.com product page (2026-10-08): 32 GB GDDR6, 256-bit, 640 GB/s peak, RDNA 4 (gfx1201 — the
  // RX 9070 XT's chip; vLLM's platforms/rocm.py names it, ROCm's support table lists it).
  { id: 'r9700',       name: 'Radeon AI PRO R9700 32G', vram: 32, type: 'amd', icon: '🔴', bandwidth: 640, memType: 'GDDR6', addedAt: '2026-10-08', },
  { id: 'mi100',       name: 'Instinct MI100 32G',    vram: 32,  type: 'amd', icon: '🔴', bandwidth: 1228, memType: 'HBM2', },
  // Intel Arc — capacity, bandwidth and memory type from intel.com's product
  // specification pages (checked 2026-10-03). The A770 also shipped as an 8 GB
  // card, hence the size in the name.
  { id: 'arc-b580',    name: 'Arc B580 12G',          vram: 12,  type: 'intel', icon: '🔵', bandwidth: 456, memType: 'GDDR6', addedAt: '2026-10-03', },
  { id: 'arc-b570',    name: 'Arc B570 10G',          vram: 10,  type: 'intel', icon: '🔵', bandwidth: 380, memType: 'GDDR6', addedAt: '2026-10-03', },
  { id: 'arc-a770-16', name: 'Arc A770 16G',          vram: 16,  type: 'intel', icon: '🔵', bandwidth: 560, memType: 'GDDR6', addedAt: '2026-10-03', },
  { id: 'arc-a750',    name: 'Arc A750 8G',           vram: 8,   type: 'intel', icon: '🔵', bandwidth: 512, memType: 'GDDR6', addedAt: '2026-10-03', },
  // intel.com spec page + datasheet (2026-10-08): 32 GB GDDR6, 256-bit, 608 GB/s. A workstation card —
  // consumer/retail filters exclude "Arc Pro" by name, as they exclude Radeon PRO.
  { id: 'arc-pro-b70', name: 'Arc Pro B70 32G',       vram: 32,  type: 'intel', icon: '🔵', bandwidth: 608, memType: 'GDDR6', addedAt: '2026-10-08', },
  ...geforceLaptops(50, 'GDDR7', [
    ['5090', 24], ['5080', 16], ['5070 Ti', 12], ['5070', 8, true], ['5070', 12, true], ['5060', 8], ['5050', 8],
  ]),
  ...geforceLaptops(40, 'GDDR6', [
    ['4090', 16], ['4080', 12], ['4070', 8], ['4060', 8], ['4050', 6],
  ]),
  ...geforceLaptops(30, 'GDDR6', [
    ['3080 Ti', 16], ['3080', 8, true], ['3080', 16, true], ['3070 Ti', 8], ['3070', 8], ['3060', 6],
    ['3050 Ti', 4], ['3050', 4, true], ['3050', 6, true],
  ]),
  { ...radeonLaptopDefaults, id: 'rx7900m', name: 'Radeon RX 7900M', vram: 16, specUrl: 'https://www.amd.com/en/newsroom/press-releases/2023-10-19-amd-introduces-fastest-amd-radeon-laptop-graphics-.html' },
  { ...radeonLaptopDefaults, id: 'rx7800m', name: 'Radeon RX 7800M', vram: 12, bandwidth: 432, specUrl: 'https://www.amd.com/en/products/graphics/laptops/radeon/7000-series/amd-radeon-rx-7800m.html' },
  { ...radeonLaptopDefaults, id: 'rx7600mxt', name: 'Radeon RX 7600M XT', vram: 8, specUrl: radeonLaptopLaunch },
  { ...radeonLaptopDefaults, id: 'rx7600m', name: 'Radeon RX 7600M', vram: 8, specUrl: radeonLaptopLaunch },
  { ...radeonLaptopDefaults, id: 'rx7700s', name: 'Radeon RX 7700S', vram: 8, specUrl: radeonLaptopLaunch },
  { ...radeonLaptopDefaults, id: 'rx7600s', name: 'Radeon RX 7600S', vram: 8, specUrl: radeonLaptopLaunch },
  { id: 'cpu-128',     name: '128 GB RAM (CPU)',       vram: 128, type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-64',      name: '64 GB RAM (CPU)',        vram: 64,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-32',      name: '32 GB RAM (CPU)',        vram: 32,  type: 'cpu', isCPU: true,      icon: '💻' },
  { id: 'cpu-16',      name: '16 GB RAM (CPU)',        vram: 16,  type: 'cpu', isCPU: true,      icon: '💻' },
];

/**
 * The cards offered as one-tap starts on the homepage and in the calculator —
 * mixed generations, weighted towards constrained and non-NVIDIA setups (see
 * `PopularStarts`). One list so the two surfaces cannot drift apart.
 */
export const POPULAR_GPU_IDS = [
  'rtx5060ti16', 'rtx4060ti', 'rtx4060ti16', 'rtx5070',
  'rtx3090', 'rtx4090', 'rtx5090', 'rx9070xt', 'm4-pro-24', 'cpu-32',
];
