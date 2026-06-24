export interface ChangelogEntry {
  date: string;
  en: string;
  zh: string;
}

export const dataLastUpdated = '2026-06-24';

export const dataSources = {
  models: {
    en: 'Hugging Face model cards, community quant releases (bartowski, turboderp, unsloth, city96), WikiText-2 PPL benchmarks',
    zh: 'Hugging Face 模型卡、社区量化发布（bartowski、turboderp、unsloth、city96）、WikiText-2 PPL 基准',
  },
  benchmarks: {
    en: 'Local inference runs on RTX 4090 / 3090 / M3 Max; llama.cpp b4000+, ExLlamaV2 0.2.x, vLLM 0.6.x, Ollama 0.3.x',
    zh: 'RTX 4090 / 3090 / M3 Max 本地实测；llama.cpp b4000+、ExLlamaV2 0.2.x、vLLM 0.6.x、Ollama 0.3.x',
  },
  formatHeat: {
    en: 'Editorial estimate based on Hugging Face GGUF download share and r/LocalLLaMA discussion volume — not a live feed',
    zh: '基于 Hugging Face GGUF 下载占比和 r/LocalLLaMA 讨论量的编辑估算 — 非实时数据',
  },
} as const;

export const benchmarkMethodology = {
  model: 'Meta Llama 3.1 8B Instruct',
  dataset: 'WikiText-2',
  context: 4096,
  batch: 1,
  drivers: 'NVIDIA 550.x / CUDA 12.4',
  frameworks: {
    llamacpp: 'b4217 (CUDA backend)',
    exllama: 'ExLlamaV2 0.2.1',
    vllm: 'v0.6.3',
    ollama: '0.3.14',
  },
  notes: {
    en: 'Speed tests use prompt_len=128, gen_len=128, single sequence. PPL measured on WikiText-2 test split. Your results may vary ±10% depending on driver, batch size, and context length.',
    zh: '速度测试：prompt_len=128，gen_len=128，单序列。PPL 在 WikiText-2 测试集上测量。实际结果因驱动、batch size 和上下文长度可能偏差 ±10%。',
  },
} as const;

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-06-24',
    en: 'Added Terms & Disclaimer page (/legal) with trademark notice and liability disclaimer',
    zh: '新增使用条款与免责声明页面（/legal），含商标声明和责任限制',
  },
  {
    date: '2026-06-24',
    en: 'Phase 3: HF live stats pipeline, model A vs B compare tool, cookbook expanded to 15 guides',
    zh: 'Phase 3：HF 实时数据管道、模型 A vs B 对比工具、Cookbook 扩展至 15 篇',
  },
  {
    date: '2026-06-24',
    en: 'Expanded model index to 30+ entries; added format wizard, hardware profile, ExLlamaV2 CLI, SEO (sitemap/OG), data transparency',
    zh: '模型库扩展至 30+；新增格式向导、硬件档案、ExLlamaV2 CLI、SEO（sitemap/OG）、数据透明度改进',
  },
  {
    date: '2026-06-24',
    en: 'Model detail pages, GPU reverse lookup, shareable VRAM calculator URLs, real homepage stats',
    zh: '模型详情页、GPU 反向查询、可分享显存计算器 URL、真实首页统计',
  },
  {
    date: '2025-06-10',
    en: 'Initial launch: Quant Hub, VRAM calculator, CLI generator, benchmarks, cookbook',
    zh: '首次上线：模型库、显存计算器、CLI 生成器、基准测试、部署指南',
  },
];