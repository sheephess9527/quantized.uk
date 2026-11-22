import { LLAMACPP_BUILD } from '@/lib/data/runtime-build';

export const dataLastUpdated = '2026-11-22'; // Latest release: filter-aware reverse share previews.

/**
 * Last day the *sizing* behind derived pages changed without a model or GPU
 * being added — an arch-field fix, a new fit rule, a change to the page-prose
 * generators. Together with every `addedAt` it dates the GPU, `/best/`,
 * format and tool pages in the sitemap (`app/sitemap.ts`). Before this they
 * carried `dataLastUpdated`, so a daily patrol that only bumped a runtime
 * version told IndexNow 354 of 460 URLs had changed. Bump it only when such a
 * change ships; `dataProblems()` rejects a date later than `dataLastUpdated`.
 */
export const sizingChangedAt = '2026-11-22';

export const dataSources = {
  models: {
    en: 'Hugging Face model cards and community quant releases (bartowski, turboderp, unsloth, city96); perplexity figures as those sources publish them',
    zh: 'Hugging Face 模型卡和社区量化发布（bartowski、turboderp、unsloth、city96）；困惑度数字取自这些来源公布的数据',
  },
  benchmarks: {
    en: 'Local inference runs on RTX 4090 / 3090 / M3 Max / M2 Ultra; llama.cpp b4217, ExLlamaV2 0.2.1, vLLM v0.6.3, Ollama 0.3.14',
    zh: 'RTX 4090 / 3090 / M3 Max / M2 Ultra 本地实测；llama.cpp b4217、ExLlamaV2 0.2.1、vLLM v0.6.3、Ollama 0.3.14',
  },
  formatHeat: {
    en: 'Editorial judgement from which formats Hugging Face uploads and community threads favour. It is not measured, so it is shown as an order, not a percentage — the per-format model counts above are the measured part.',
    zh: '依据 Hugging Face 上传与社区讨论更偏向哪种格式做出的编辑判断。它不是测量值，因此只给出排序、不给百分比 —— 上面每种格式的模型数才是实测的部分。',
  },
} as const;

export const benchmarkMethodology = {
  model: 'Meta Llama 3.1 8B Instruct',
  dataset: 'WikiText-2',
  context: 4096,
  batch: 1,
  /** Structured out of the free-text `notes` below rather than duplicated by hand. */
  promptLen: 128,
  genLen: 128,
  /** WikiText-2 PPL on the reference model's FP16 weights — the number `pplSubtitle` already cites. */
  baselinePpl: 6.14,
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

/**
 * What the runtimes are at today, separate from what the benchmarks were run on.
 *
 * The methodology block above records the versions those figures were actually
 * measured with — that is a fact about the measurement and must not be edited
 * to look current. But leaving only that on the page made the site look
 * abandoned to exactly the reader it is written for: `llama.cpp b4000+,
 * vLLM 0.6.x, Ollama 0.3.x` is two major generations behind, and a geek
 * checking whether a reference site is still alive checks precisely this.
 *
 * So both are shown, and the gap between them is stated rather than hidden.
 * `checkedAt` is when the right-hand column was last verified against the
 * projects' own release pages — update it only when actually re-checked.
 */
export const runtimeVersions = {
  checkedAt: '2026-11-21',
  current: {
    llamacpp: LLAMACPP_BUILD,
    vllm: 'v0.34.0',
    ollama: 'v0.40.17',
    // ExLlamaV2 has stalled at v0.3.2 (2025-07-13) — see the `note` below for
    // where the project's actual activity moved to. Keeping this key as
    // `exllama` (matching `benchmarkMethodology.frameworks.exllama` above) so
    // the two line up when read side by side.
    exllama: 'v0.3.2 (stalled)',
  },
  note: {
    en: 'llama.cpp stable is v1.0.0 (its nightly-tag.txt points to b12359); Windows commands retain the previously verified b12409 pin. Newer b12606 is flagged as a prerelease and is not adopted in this stable-release review. vLLM 0.34 enables extensible KV caching by default and changes block size to 64; this site’s generated commands explicitly set GPU memory utilization to 0.85. The figures on this page were measured on the stack in the left column. Those releases are now well behind current — speed numbers in particular move with the runtime, so treat them as a ranking between formats rather than as what you will see today. One thing this comparison cannot show: ExLlamaV2 has had no release since 2025-07, and the maintainer\'s active project has moved to a separate repository, ExLlamaV3 (v1.6.7 as of the date above, and shipping fast). Its own README describes a genuinely new quantization format, EXL3, not a version bump of EXL2 — this index does not track it yet, since no model here ships it, but a format this site tracks going quiet is itself worth knowing.',
    zh: 'llama.cpp 稳定版为 v1.0.0（nightly-tag.txt 指向 b12359）；Windows 命令保留此前已核实的 b12409。较新的 b12606 标记为预发布，本次稳定版核查不采用。vLLM 0.34 默认启用可扩展 KV 缓存，块大小改为 64；本站生成命令已显式设置显存利用率 0.85。本页的数字是在左列那套软件栈上测得的。这些版本如今已明显落后于当前版本 —— 速度尤其会随运行时变化，因此请把它们当作格式之间的排序参考，而不是你今天会跑出的数值。这个对比说明不了的一件事：ExLlamaV2 自 2025-07 起再没有发布过新版本，维护者的主要精力已经转到另一个仓库 ExLlamaV3（截至上面的日期已到 v1.6.7，更新很勤）。它自己的 README 说得很清楚，这是一个全新的量化格式 EXL3，而不是 EXL2 的版本升级——本索引目前还没有任何模型提供这个格式，所以暂不收录，但本站在跟踪的一个格式陷入停滞，这件事本身值得让读者知道。',
  },
} as const;
