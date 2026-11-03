/**
 * Models that have been announced or released but are not in the index yet, and why. Every
 * entry comes from a daily patrol or gap-audit note in README §9 — the reason is the one that
 * note records, the re-check condition is what would let the model in, and `checkedAt` is the
 * day that note was written. An entry leaves this list the day its model enters the index;
 * `dataProblems()` fails the build if both exist.
 *
 * This is one page on purpose, not a page per model: a model page with no size is thin content,
 * while a list of "not yet, because" answers the release-day search honestly.
 */
export type PendingReason = 'no-weights' | 'no-runtime' | 'not-sized' | 'awaiting-data' | 'community-only';

export interface PendingModel {
  /** Slug for the anchor; must not be an index model id. */
  id: string;
  name: string;
  vendor: string;
  /** YYYY-MM-DD of the release or announcement, as reported; omitted when no note records it. */
  announced?: string;
  reason: PendingReason;
  detail: { en: string; zh: string };
  recheck: { en: string; zh: string };
  checkedAt: string;
}

export const pendingModels: PendingModel[] = [
  {
    id: 'clover-35b-a3b-preview',
    name: 'Clover-35B-A3B-Preview',
    vendor: 'DiffuSpace',
    reason: 'awaiting-data',
    detail: {
      en: 'A diffusion language model built on Qwen3.6-35B-A3B (35B total, about 3B active per token, Apache 2.0, up to 131,072 tokens), with extra Gated DeltaNet parameters for block diffusion. llama.cpp added it on 2 November, in ordinary left-to-right mode with self-speculative decoding, not block diffusion. Its config and any GGUF file sizes could not be read here, and the extra parameters mean Qwen3.6 35B-A3B\'s sizes cannot simply be reused.',
      zh: '一个基于 Qwen3.6-35B-A3B 的扩散语言模型（总参数 35B，每个 token 约激活 3B，Apache 2.0，最长 131,072 个 token），为块扩散额外加了 Gated DeltaNet 参数。llama.cpp 于 11 月 2 日加入支持，但只按普通的从左到右方式生成（带自推测解码），不是块扩散。这里读不到它的配置和 GGUF 文件大小，而且多出的参数意味着不能直接套用 Qwen3.6 35B-A3B 的体积。',
    },
    recheck: { en: 'When its config.json and a GGUF file listing are available.', zh: '拿到它的 config.json 和 GGUF 文件列表时。' },
    checkedAt: '2026-11-03',
  },
  {
    id: 'minimax-m3-1-flash',
    name: 'MiniMax M3.1 Flash',
    vendor: 'MiniMax',
    announced: '2026-10-23',
    reason: 'not-sized',
    detail: {
      en: 'A 428B mixture-of-experts model with about 23B parameters active per token, released on 23 October under the MiniMax Community License. Its config has now been read: 60 layers (3 dense, 57 with 128 routed experts, 4 per token), 4 KV heads × 128, and experts stored in NVFP4 in the official weights. llama.cpp loads it as `minimax-m3`, with MiniMax Sparse Attention and an indexer — a cache layout this site has not sized before. The only GGUFs are unsloth\'s dynamic UD-* builds (UD-Q4_K_XL is 249 GB), with no standard level, so it is not sized yet. At these sizes only a 512 GB Mac could hold it.',
      zh: '一个 428B 的混合专家模型，每个 token 约激活 23B 参数，10 月 23 日以 MiniMax Community License 发布。它的配置现在已读到：60 层（3 层稠密、57 层各有 128 个路由专家，每个 token 用 4 个），4 个 KV 头 × 128 维，官方权重里的专家以 NVFP4 存储。llama.cpp 以 `minimax-m3` 加载它，使用带索引器的 MiniMax 稀疏注意力——本站还没有计算过这种缓存结构。目前只有 unsloth 的动态 UD-* GGUF（UD-Q4_K_XL 为 249 GB），没有标准档位，所以暂不计算显存。按这个体积，只有 512 GB 的 Mac 能装下。',
    },
    recheck: { en: 'When its cache layout has been read in llama.cpp\'s source and a standard-level GGUF exists.', zh: '在 llama.cpp 源码里核实它的缓存结构、并且有标准档位的 GGUF 时。' },
    checkedAt: '2026-10-29',
  },
  {
    id: 'deepseek-v4-1-flash-1017',
    name: 'DeepSeek-V4.1-Flash-1017',
    vendor: 'DeepSeek',
    announced: '2026-10-17',
    reason: 'not-sized',
    detail: {
      en: 'llama.cpp now lists the architecture (`deepseek41`), and community GGUF conversions are appearing, but no official or widely used GGUF with a file listing has been checked here. Like DeepSeek-V4-Flash, it compresses its cache in ways the calculator cannot express yet, so there is no memory figure rather than a wrong one.',
      zh: 'llama.cpp 现在已列出这个架构（`deepseek41`），社区 GGUF 转换也开始出现，但本站还没核对过官方或常用量化者带文件列表的 GGUF。它和 DeepSeek-V4-Flash 一样会压缩缓存，计算器还表达不了，所以这里宁可不给显存数字，也不给一个错的。',
    },
    recheck: {
      en: 'When the calculator models this cache and a GGUF from a widely used publisher can be read with its byte counts.',
      zh: '计算器能算这种缓存，并且能读到常用量化者 GGUF 的字节数时。',
    },
    checkedAt: '2026-10-26',
  },
  {
    id: 'deepseek-v4-flash-0731',
    name: 'DeepSeek-V4-Flash-0731',
    vendor: 'DeepSeek',
    announced: '2026-07-31',
    reason: 'not-sized',
    detail: {
      en: 'Downloadable today: llama.cpp runs it (`deepseek4`), and ggml-org publishes MXFP4 (155.0 GB in 2 parts) and Q2_K (117.3 GB) GGUFs, with Unsloth UD tiers alongside. What is missing is on this site\'s side: its cache is compressed per layer (4× or 128× plus a 128-token window), which the calculator cannot express yet, so there is no memory figure rather than a wrong one.',
      zh: '现在就能下载：llama.cpp 能运行（`deepseek4`），ggml-org 发布了 MXFP4（155.0 GB，分 2 卷）和 Q2_K（117.3 GB）GGUF，Unsloth 也有 UD 系列。缺的是本站这边：它的缓存按层压缩（4 倍或 128 倍，外加 128 token 窗口），计算器还表达不了，所以这里宁可不给显存数字，也不给一个错的。',
    },
    recheck: {
      en: 'When the calculator models this cache and the result is checked against a published memory measurement.',
      zh: '计算器能算这种缓存，并且结果与一份公开的显存实测对上时。',
    },
    checkedAt: '2026-10-21',
  },
  {
    id: 'step-5-preview',
    name: 'Step-5 Preview',
    vendor: 'StepFun',
    announced: '2026-09-20',
    reason: 'no-weights',
    detail: {
      en: 'Reported as a 600B mixture-of-experts model with about 27B active. The official weight repo was reported empty, and llama.cpp has no architecture for it (its `step35` is Step 3.5).',
      zh: '据报道是 600B 混合专家模型，约激活 27B。官方权重仓库据报道是空的，llama.cpp 也没有对应架构（现有的 `step35` 是 Step 3.5）。',
    },
    recheck: { en: 'When the official repo carries weights and llama.cpp adds the architecture.', zh: '官方仓库放出权重、llama.cpp 加入该架构时。' },
    checkedAt: '2026-10-20',
  },
  {
    id: 'kolibri-1',
    name: 'Kolibri-1',
    vendor: 'Aleph Alpha',
    announced: '2026-10-03',
    reason: 'no-runtime',
    detail: {
      en: 'Reported as a 78B mixture-of-experts model with about 3.5B active. llama.cpp master has no Kolibri architecture; the only GGUF is a community one that needs a patched llama.cpp.',
      zh: '据报道是 78B 混合专家模型，约激活 3.5B。llama.cpp 主线没有 Kolibri 架构；唯一的 GGUF 是社区版，需要打过补丁的 llama.cpp。',
    },
    recheck: { en: 'When upstream llama.cpp supports it.', zh: 'llama.cpp 主线支持它时。' },
    checkedAt: '2026-10-20',
  },
  {
    id: 'dory-1-0-4b',
    name: 'Nemotron-Labs Dory 1.0 4B',
    vendor: 'NVIDIA',
    announced: '2026-10-16',
    reason: 'no-runtime',
    detail: {
      en: 'A looped (nGPT-style) 4B model. llama.cpp support was still an open draft pull request (#30306) when last checked.',
      zh: '循环结构（nGPT 风格）的 4B 模型。上次核对时，llama.cpp 的支持仍是一个未合并的草稿 PR（#30306）。',
    },
    recheck: { en: 'When that pull request is merged.', zh: '该 PR 合并后。' },
    checkedAt: '2026-11-03',
  },
  {
    id: 'glm-5-3-flash',
    name: 'GLM-5.3-Flash',
    vendor: 'Z.ai',
    announced: '2026-08-26',
    reason: 'not-sized',
    detail: {
      en: 'Its config has now been read: about 320B parameters (the BF16 GGUF is 641.6 GB), 45 layers of which 34 are linear attention and 11 are sparse attention with a compressed cache plus an indexer, 288 routed experts with 8 per token. llama.cpp loads it as `glm5-next`. The published GGUFs are unsloth\'s dynamic UD-* builds plus Q8_0 (341 GB) — no standard Q4_K_M — and its cache layout has not been checked against llama.cpp yet, so it is not sized. At these sizes only a 512 GB Mac could hold it.',
      zh: '它的配置现在已读到：约 320B 参数（BF16 GGUF 为 641.6 GB），45 层中 34 层是线性注意力、11 层是带压缩缓存和索引器的稀疏注意力，288 个路由专家、每个 token 用 8 个。llama.cpp 以 `glm5-next` 加载它。已发布的 GGUF 是 unsloth 的动态 UD-* 版本加上 Q8_0（341 GB），没有标准的 Q4_K_M；它的缓存结构也还没对照 llama.cpp 核实，所以暂不计算显存。按这个体积，只有 512 GB 的 Mac 能装下。',
    },
    recheck: { en: 'When its cache layout has been read in llama.cpp\'s source and a standard 4-bit GGUF exists.', zh: '在 llama.cpp 源码里核实它的缓存结构、并且有标准 4-bit GGUF 时。' },
    checkedAt: '2026-10-29',
  },
  {
    id: 'hy-memory-30b-a3b',
    name: 'Hy-Memory-30B-A3B',
    vendor: 'Tencent',
    announced: '2026-10-15',
    reason: 'community-only',
    detail: {
      en: 'A memory-writing model for agents rather than a chat model. Only community GGUFs exist, from uploaders whose files this site has not checked.',
      zh: '给智能体写记忆用的模型，不是对话模型。只有社区上传的 GGUF，本站没有核对过这些文件。',
    },
    recheck: { en: 'When an official or widely used GGUF is published.', zh: '有官方或常用量化者发布的 GGUF 时。' },
    checkedAt: '2026-10-17',
  },
];
