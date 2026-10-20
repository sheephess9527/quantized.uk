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
    id: 'deepseek-v4-1-flash-1017',
    name: 'DeepSeek-V4.1-Flash-1017',
    vendor: 'DeepSeek',
    announced: '2026-10-17',
    reason: 'no-runtime',
    detail: {
      en: 'A new architecture (`deepseek_v41`: new compression ratios, cross-layer KV sharing, lookup tables) that llama.cpp cannot load. Unsloth\'s GGUF repo exists but is empty. DeepSeek\'s own DeepInfer runs it only on NVIDIA SM100 and Huawei Ascend 950 datacentre hardware.',
      zh: '新架构（`deepseek_v41`：新的压缩比、跨层 KV 共享、查找表），llama.cpp 还不能加载。Unsloth 的 GGUF 仓库已建但是空的。DeepSeek 自家的 DeepInfer 只支持 NVIDIA SM100 和华为昇腾 950 这类数据中心硬件。',
    },
    recheck: {
      en: 'When llama.cpp supports `deepseek_v41` and a GGUF with real files is published.',
      zh: 'llama.cpp 支持 `deepseek_v41`，并且有带实际文件的 GGUF 发布时。',
    },
    checkedAt: '2026-10-20',
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
    id: 'mistral-large-4',
    name: 'Mistral Large 4',
    vendor: 'Mistral AI',
    announced: '2026-10-06',
    reason: 'no-weights',
    detail: {
      en: 'Announced at about 1T parameters, API-only so far, with open weights reported as due on 27 October.',
      zh: '公布时约 1T 参数，目前只有 API，据报道开放权重定在 10 月 27 日。',
    },
    recheck: { en: 'When the weights are downloadable and a GGUF exists.', zh: '权重可下载并且有 GGUF 时。' },
    checkedAt: '2026-10-18',
  },
  {
    id: 'nemotron-3-5-bolt-e4b',
    name: 'Nemotron 3.5 Bolt E4B',
    vendor: 'NVIDIA',
    reason: 'no-weights',
    detail: {
      en: 'A smaller sibling of Bolt 74B-A9B (which is in the index), due on 23 October; no weights yet.',
      zh: 'Bolt 74B-A9B（已收录）的小型版本，预定 10 月 23 日发布；权重还没放出。',
    },
    recheck: { en: 'On or after 23 October, when the weights and a GGUF are out.', zh: '10 月 23 日之后，权重和 GGUF 发布时。' },
    checkedAt: '2026-10-18',
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
      en: 'A looped (nGPT-style) 4B model. llama.cpp support was still an open pull request (#30306) when last checked.',
      zh: '循环结构（nGPT 风格）的 4B 模型。上次核对时，llama.cpp 的支持仍是一个未合并的 PR（#30306）。',
    },
    recheck: { en: 'When that pull request is merged.', zh: '该 PR 合并后。' },
    checkedAt: '2026-10-17',
  },
  {
    id: 'glm-5-3-flash',
    name: 'GLM-5.3-Flash',
    vendor: 'Z.ai',
    announced: '2026-08-26',
    reason: 'awaiting-data',
    detail: {
      en: 'llama.cpp has the architecture (`glm-dsa`). Not sized yet because its config and GGUF file sizes have not been read; this site does not size a model from a parameter count alone.',
      zh: 'llama.cpp 已有对应架构（`glm-dsa`）。还没算显存，是因为它的配置和 GGUF 文件大小还没核对过；本站不只凭参数量估算一个模型。',
    },
    recheck: { en: 'When its config.json and a GGUF file listing are in hand.', zh: '拿到它的 config.json 和 GGUF 文件列表时。' },
    checkedAt: '2026-10-20',
  },
  {
    id: 'mimo-v2-6-distill-qwen-9b',
    name: 'MiMo-V2.6-Distill-Qwen-9B',
    vendor: 'Xiaomi',
    announced: '2026-09-21',
    reason: 'awaiting-data',
    detail: {
      en: 'A 9B distill on a Qwen backbone; GGUFs exist (bartowski, ggml-org), and the two publishers\' Q8_0 files differ in size. Not added until its config is read, so the cache is sized from the real layer layout.',
      zh: '基于 Qwen 骨干的 9B 蒸馏模型；已有 GGUF（bartowski、ggml-org），两家的 Q8_0 文件大小不同。读到它的配置之前不收录，这样缓存才能按真实的层结构计算。',
    },
    recheck: { en: 'When its config.json and both file listings are in hand.', zh: '拿到它的 config.json 和两家的文件列表时。' },
    checkedAt: '2026-10-21',
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
