export interface ChangelogEntry {
  date: string;
  en: string;
  zh: string;
}

export const dataLastUpdated = '2026-09-01';

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
    en: 'Editorial estimate from HF GGUF share and community discussion volume — not live analytics',
    zh: '基于 HF GGUF 下载占比与社区讨论量的编辑估算 — 非实时统计',
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
    date: '2026-09-01',
    en: 'Homepage paints without waiting for JavaScript: the headline was being shipped as opacity:0 and only became visible after the bundle loaded, which put real-user LCP at P75 3.1s on a prerendered site. Entrance animation is now pure CSS and framer-motion is gone — 33 kB less JavaScript on first load',
    zh: '首页无需等待 JavaScript 即可绘制：此前标题以 opacity:0 发出，要等 bundle 加载后才可见，导致预渲染站点的真实用户 LCP P75 达 3.1 秒。入场动画改为纯 CSS，framer-motion 已移除 —— 首屏 JavaScript 减少 33 kB',
  },
  {
    date: '2026-08-23',
    en: 'Format surfaces now agree with the index: the homepage badges, the "formats tracked" stat and the Hub filters all derive from the formats an indexed model actually ships (4). HQQ stays in the format explainer as reference, but no longer advertises a browse path with no results',
    zh: '格式相关的展示与索引对齐：首页徽章、"格式追踪"统计与 Hub 筛选均改为从实际有模型的格式推导（4 种）。HQQ 仍保留在格式科普中作为参考，但不再引导到没有结果的浏览路径',
  },
  {
    date: '2026-08-23',
    en: 'Format wizard: quant levels are now per-format — choosing "easiest setup" used to print EXL2 · Q4_K_M and AWQ · Q4_K_M, levels that exist in neither format. The runtime column also follows the format, so an AMD reader no longer sees EXL2 recommended with a ROCm runtime next to the reason explaining EXL2 cannot run on ROCm',
    zh: '格式向导：量化档位改为按格式区分 —— 此前选择"最易上手"会给出 EXL2 · Q4_K_M、AWQ · Q4_K_M 这类两种格式里都不存在的档位。框架推荐也改为跟随格式，AMD 读者不会再看到 EXL2 配 ROCm 运行时，却在旁边读到"EXL2 无法在 ROCm 上运行"',
  },
  {
    date: '2026-08-23',
    en: 'Homepage layout: the stats bar had been painted on top of the job-path cards since those were introduced, covering all three descriptions, and the hero was clipped on phones — the VRAM calculator button and format badges were partly unreachable. Navbar no longer overflows at tablet width',
    zh: '首页排版：统计条自 job path 卡片引入后就一直盖在卡片上，遮住全部三行说明；Hero 在手机上被裁切，显存计算器按钮与格式徽章有一部分点不到。导航栏在平板宽度下不再溢出',
  },
  {
    date: '2026-08-20',
    en: 'CLI generator now emits commands that actually run: the real GGUF repo and filename instead of a placeholder, `ollama run hf.co/…` instead of a tag that 404s, and a repo id for vLLM instead of the model\'s display name. llama.cpp build flags updated to the GGML_* names (the old LLAMA_* ones are ignored, giving a silent CPU-only build)',
    zh: 'CLI 生成器现在给出真能跑的命令：用真实 GGUF 仓库与文件名替代占位符，Ollama 改用 `ollama run hf.co/…`（原先生成的 tag 会 404），vLLM 传仓库 id 而非模型展示名。llama.cpp 编译参数改为 GGML_* 新命名（旧的 LLAMA_* 会被忽略，静默编出纯 CPU 版本）',
  },
  {
    date: '2026-08-20',
    en: 'VRAM calculator: forward mode now uses each model\'s own measured bits-per-weight instead of the generic per-level table, matching what reverse mode always did. GPT-OSS 20B at Q8_0 was overstated by 67% (21.1GB → 12.7GB). EXL2 3.5bpw is selectable again',
    zh: '显存计算器：正向模式改用模型自身实测 bpw，而非通用档位表（反向模式一直如此）。GPT-OSS 20B 的 Q8_0 此前被高估 67%（21.1GB → 12.7GB）。EXL2 3.5bpw 档位恢复可选',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition audit: every /zh page now declares zh-Hans in the HTML itself, the 23 guide links on /zh/cookbook stopped bouncing readers to English, and structured data on 102 Chinese pages describes the Chinese page rather than the English one',
    zh: '中文站审计：/zh 页面的 HTML 现在自身声明 zh-Hans；/zh/cookbook 上 23 个指南链接不再把读者弹回英文站；102 个中文页面的结构化数据改为描述中文页本身',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition is now indexable: /zh/** mirrors all 113 pages with hreflang pairing, and the Chinese text is baked into the static HTML rather than swapped in after load',
    zh: '中文站现已可被索引：/zh/** 镜像全部 113 个页面并配对 hreflang，中文文本直接写入静态 HTML，而非加载后再替换',
  },
  {
    date: '2026-08-08',
    en: 'Model index +4 → 79: Qwen3-VL 8B / 30B-A3B, Magistral Small 1.2, Seed-OSS 36B — picked for constrained hardware (multimodal on a 12GB card, small-active MoE for unified memory, 512K context at dual-GPU size). Qwen2-VL 7B marked superseded',
    zh: '模型索引 +4 → 79：Qwen3-VL 8B / 30B-A3B、Magistral Small 1.2、Seed-OSS 36B —— 面向受限硬件挑选（12GB 卡上的多模态、适合统一内存的小激活 MoE、双卡尺寸的 512K 上下文）。Qwen2-VL 7B 标记为过时',
  },
  {
    date: '2026-08-08',
    en: 'New cookbook: running GPT-OSS 20B/120B locally without re-quantizing (23 guides). VRAM calculator now offers MXFP4 — picking Q4_K_M for GPT-OSS overstated weights by ~14%',
    zh: '新增 Cookbook：本地运行 GPT-OSS 20B/120B 且不重新量化（共 23 篇）。显存计算器新增 MXFP4 档 —— 此前给 GPT-OSS 选 Q4_K_M 会把权重高估约 14%',
  },
  {
    date: '2026-08-07',
    en: 'Model index +4 → 75: GPT-OSS 20B/120B (native MXFP4), GLM-4.5-Air 106B-A12B, Devstral Small 1.1 — MoE-heavy batch for 16GB cards and unified-memory Macs',
    zh: '模型索引 +4 → 75：GPT-OSS 20B/120B（原生 MXFP4）、GLM-4.5-Air 106B-A12B、Devstral Small 1.1 —— 面向 16GB 显卡与统一内存 Mac 的 MoE 批次',
  },
  {
    date: '2026-07-22',
    en: 'Polish: re-rendered og.png (71+ models), all 22 cookbook guides have verified stack banners',
    zh: '打磨：重渲 og.png（71+ 模型文案），全部 22 篇 Cookbook 已加验证技术栈条',
  },
  {
    date: '2026-07-22',
    en: 'Cadence pack: +4 models (Gemma 3 27B, R1-Llama-8B, Phi-4, Qwen3 1.7B), superseded tags, measured/estimated labels, Hub “recent”, weekly updates, RSS, cookbook verified stack (71 models)',
    zh: '保鲜组合：+4 模型（Gemma 3 27B、R1-Llama-8B、Phi-4、Qwen3 1.7B）、过时标注、实测/估算、Hub「最近新增」、本周更新、RSS、Cookbook 验证栈（共 71 个）',
  },
  {
    date: '2026-06-26',
    en: 'UX for real traffic: job paths, mobile GPU profile, OG/favicon, honest format heat, feedback email',
    zh: '面向真实访问：任务入口、移动端 GPU 档案、OG/图标、格式热度诚实标注、反馈邮箱',
  },
  {
    date: '2026-06-26',
    en: 'Model index +4: Qwen3 4B, Qwen3-Coder 30B-A3B, Mistral Large 3, GLM-4-9B (67 total)',
    zh: '模型库 +4：Qwen3 4B、Qwen3-Coder 30B-A3B、Mistral Large 3、GLM-4-9B（共 67 个）',
  },
  {
    date: '2026-06-26',
    en: 'QA fixes: HF stats merge on failure, ≤3B filter, CLI/VRAM tool bugs, i18n polish',
    zh: 'QA 修复：HF 统计合并、≤3B 筛选、CLI/VRAM 工具 bug、i18n 优化',
  },
  {
    date: '2026-06-26',
    en: 'Model index +5: Qwen3 32B, 30B-A3B MoE, 235B-A22B, DeepSeek-V3, DeepSeek-R1 (63 total)',
    zh: '模型库 +5：Qwen3 32B、30B-A3B MoE、235B-A22B、DeepSeek-V3、DeepSeek-R1（共 63 个）',
  },
  {
    date: '2026-06-26',
    en: 'Model index +7: Qwen3 8B/14B, Gemma 3 4B/12B, Llama 4 Scout/Maverick, Llama 3.1 405B (58 total)',
    zh: '模型库 +7：Qwen3 8B/14B、Gemma 3 4B/12B、Llama 4 Scout/Maverick、Llama 3.1 405B（共 58 个）',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook TOC scroll highlight, code block copy, Quant Hub Markdown export',
    zh: 'Cookbook 目录滚动高亮、代码块一键复制、Quant Hub Markdown 导出',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook reading progress bar, model HF link copy, Quant Hub shareable filter URLs',
    zh: 'Cookbook 阅读进度条、模型 HF 链接复制、Quant Hub 可分享筛选 URL',
  },
  {
    date: '2026-06-25',
    en: 'Breadcrumb nav + JSON-LD, cookbook article TOC, Quant Hub GPU quick-filter chips',
    zh: '面包屑导航 + JSON-LD、Cookbook 文章目录锚点、Quant Hub GPU 一键筛选芯片',
  },
  {
    date: '2026-06-25',
    en: 'Related cookbook guides, similar-model cards on detail pages, hero latest-update badge',
    zh: 'Cookbook 相关指南推荐、模型详情页相似模型卡片、首页 Hero 最新更新徽章',
  },
  {
    date: '2026-06-25',
    en: 'Homepage explore strip, 404 page, multi-model benchmarks (Qwen 7B/32B, DeepSeek-R1 14B), llms.txt for AI crawlers',
    zh: '首页探索区块、404 页面、多模型基准测试（Qwen 7B/32B、DeepSeek-R1 14B）、AI 爬虫 llms.txt',
  },
  {
    date: '2026-06-24',
    en: 'Added About page (/about) — maintainer story, update cadence, contribution guide',
    zh: '新增关于页面（/about）— 维护者介绍、更新频率、参与贡献方式',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: default to all 51 models visible; scale stats bar; clearer GPU filter UX',
    zh: 'Quant Hub：默认显示全部 51 个模型；规模统计条；GPU 筛选提示更清晰',
  },
  {
    date: '2026-06-24',
    en: 'SEO: canonical URLs, JSON-LD, per-page metadata, Google/Bing verification env vars',
    zh: 'SEO：canonical URL、JSON-LD 结构化数据、页面级 metadata、Google/Bing 验证环境变量',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: show-all toggle when GPU profile active; Cookbook +7 guides (8GB GPU, WSL2, Docker GPU, Nginx, AMD ROCm)',
    zh: 'Quant Hub：GPU 档案筛选时可一键显示全部模型；Cookbook 新增 7 篇（8GB 显卡、WSL2、Docker GPU、Nginx、AMD ROCm）',
  },
  {
    date: '2026-06-24',
    en: 'Privacy Policy + Plausible analytics, cookbook standalone pages (/cookbook/[slug]), model index expanded to 51',
    zh: '隐私政策 + Plausible 分析、Cookbook 独立文章页（/cookbook/[slug]）、模型库扩展至 51 个',
  },
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