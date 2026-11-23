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
    id: 'ccore-web-coder-4b',
    name: 'CCORE Web Coder 4B',
    vendor: 'CCORE',
    reason: 'awaiting-data',
    detail: {
      en: 'The Apache-2.0 Q8_0 GGUF is 4,482,402,816 bytes. The publisher labels it a preview at about 26% of projected training tokens.',
      zh: 'Apache 2.0 Q8_0 GGUF 共 4,482,402,816 字节。发布方注明这是预览权重，约完成预计训练 token 数的 26%。',
    },
    recheck: {
      en: 'Check the published checkpoint and GGUF headers once the completed training release is available.',
      zh: '完整训练版本发布后，核对权重身份及 GGUF 文件头。',
    },
    checkedAt: '2026-11-23',
  },
  {
    id: 'lingsante-3-1',
    name: 'LingSante 3.1 Flash / Air VL',
    vendor: 'inclusionAI',
    reason: 'not-sized',
    detail: {
      en: 'The MIT Flash release uses BailingMoeV3 hybrid attention and ships safetensors. Air VL has community GGUFs and projectors, but the exact sparse cache layout and vision loader still need auditing.',
      zh: 'MIT 许可的 Flash 采用 BailingMoeV3 混合注意力，已发布 safetensors。Air VL 有社区 GGUF 和投影文件，具体稀疏缓存布局和视觉加载仍待审计。',
    },
    recheck: {
      en: 'Verify the exact runtime, quant artifacts and cache layout for each checkpoint.',
      zh: '逐个核实推理版本、量化文件和缓存布局。',
    },
    checkedAt: '2026-11-23',
  },
  {
    id: 'sarvam-105b-1711',
    name: 'Sarvam 105B 1711',
    vendor: 'Sarvam AI',
    reason: 'not-sized',
    detail: {
      en: 'Apache-2.0 weights and a three-part Q8_0 GGUF are public. The quantizer documents build 12636 and an MLA conversion with grouped routing and YaRN. Compatibility with the site Windows pin and cache sizing are unverified.',
      zh: 'Apache 2.0 权重和三分片 Q8_0 GGUF 已公开。量化作者记录了构建 12636，以及带分组路由和 YaRN 的 MLA 转换。本站 Windows 固定版本兼容性与缓存占用仍待核实。',
    },
    recheck: {
      en: 'Verify the launch on a supported build and audit the MLA cache for the converted checkpoint.',
      zh: '在受支持版本上核实启动并审计转换后权重的 MLA 缓存。',
    },
    checkedAt: '2026-11-23',
  },
  {
    id: 'memt-1-0-pro',
    name: 'MemT 1.0 Pro',
    vendor: 'MemTensor',
    reason: 'not-sized',
    detail: {
      en: 'The publisher provides safetensors for its Nemotron-derived checkpoint with dynamic memory state. Compatible quant files and the persistent memory requirements are unverified.',
      zh: '发布方已提供基于 Nemotron、带动态记忆状态的 safetensors 权重。兼容量化文件及持久记忆所需内存仍待核实。',
    },
    recheck: {
      en: 'Verify licensing, a supported quant export and memory-state sizing.',
      zh: '核实许可、受支持的量化文件及记忆状态内存占用。',
    },
    checkedAt: '2026-11-23',
  },
  {
    id: 'clover-2',
    name: 'Clover 2',
    vendor: 'Kitaniai',
    reason: 'not-sized',
    detail: {
      en: 'The publisher describes a Qwen3.8 base with routed LoRA experts. The public search did not identify an exact compatible GGUF for this checkpoint.',
      zh: '发布方说明使用 Qwen3.8 底座及路由 LoRA 专家。公开搜索未找到这版权重对应的兼容 GGUF。',
    },
    recheck: {
      en: 'Verify the licence, exact quant export and residency of the routed adapters.',
      zh: '核实许可、确切量化文件和路由适配器的内存驻留。',
    },
    checkedAt: '2026-11-23',
  },
  {
    "id": "inkling-2-mini",
    "name": "Inkling 2 Mini",
    "vendor": "Thinking Machines",
    "reason": "not-sized",
    "detail": {
      "en": "Apache-2.0 weights and GGUFs are available. Upstream inkling2_loop expands 24 physical layers to 48 execution slots with separate KV and convolution state for loop passes. Ollama 0.40.17 lists Apple Silicon support only.",
      "zh": "Apache 2.0 权重及 GGUF 可获取。上游 inkling2_loop 将 24 个物理层扩为 48 个执行槽，循环各次有独立 KV 和卷积状态。Ollama 0.40.17 仅列 Apple Silicon 支持。"
    },
    "recheck": {
      "en": "Audit the loop cache and projector with an observed memory result before adding a sizing row.",
      "zh": "对照实际内存结果核实循环缓存和投影后再添加估算。"
    },
    "checkedAt": "2026-11-21"
  },
  {
    "id": "olala-mini-7a1b",
    "name": "Olala v1.0 Mini 7A1B",
    "vendor": "OVHaiLLM",
    "reason": "no-runtime",
    "detail": {
      "en": "Apache-2.0 weights and the publisher GGUFs use custom Olala attention; the converter requires its own llama.cpp fork. The config reports zero conventional KV heads so standard sizing cannot be assumed.",
      "zh": "Apache 2.0 原始权重和官方 GGUF 采用自定义 Olala 注意力；发布方要求使用专用 llama.cpp 分支，配置的常规 KV 头数为零，不能套用普通估算。"
    },
    "recheck": {
      "en": "Recheck upstream load support and its actual attention memory.",
      "zh": "复查上游加载支持并核实注意力内存。"
    },
    "checkedAt": "2026-11-21"
  },
  {
    "id": "domyn-edge-sft",
    "name": "Domyn Edge SFT",
    "vendor": "Domyn",
    "reason": "no-runtime",
    "detail": {
      "en": "The original config and community GGUFs are accessible. domyn-edge.cpp is present on the current upstream development line; the pinned Windows build predates that support.",
      "zh": "可读取原始配置与社区 GGUF。当前上游开发版已有 domyn-edge.cpp，本站 Windows 固定版本早于该支持。"
    },
    "recheck": {
      "en": "Confirm a supported runtime and cache sizing before exposing launch commands.",
      "zh": "核实受支持运行时和缓存估算后再提供启动命令。"
    },
    "checkedAt": "2026-11-21"
  },
  {
    "id": "aurora2-400m",
    "name": "Aurora2 400M-A20M",
    "vendor": "AuroraAI Research",
    "reason": "no-runtime",
    "detail": {
      "en": "The public Apache-2.0 checkpoint uses a custom aurora2 architecture. The exact-name Hub search exposed no verifiable GGUF.",
      "zh": "Apache 2.0 公开权重使用自定义 aurora2 架构；按准确名称搜索未找到可核实的 GGUF。"
    },
    "recheck": {
      "en": "Verify runtime support, exact quant files and audited memory inputs.",
      "zh": "核实运行时支持、确切量化文件和内存估算输入。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "supra2-5-pro",
    "name": "Supra 2.5 Pro Instruct",
    "vendor": "SupraLabs",
    "reason": "awaiting-data",
    "detail": {
      "en": "The original Apache-2.0 Qwen3 configuration is readable. The exact-name search did not find a separate quant listing.",
      "zh": "可读取原始 Apache 2.0 Qwen3 配置，准确名称搜索未找到单独的量化文件列表。"
    },
    "recheck": {
      "en": "Verify runtime support, exact quant files and audited memory inputs.",
      "zh": "核实运行时支持、确切量化文件和内存估算输入。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "boris-2",
    "name": "Boris 2",
    "vendor": "OpenCerebral",
    "reason": "not-sized",
    "detail": {
      "en": "The public Apache-2.0 config names a custom boris2 architecture. Results show related checkpoints, but no audited runtime/cache and quant-file basis.",
      "zh": "公开 Apache 2.0 配置声明自定义 boris2 架构。搜索找到同系列权重，尚无经核实的运行时、缓存和量化文件估算依据。"
    },
    "recheck": {
      "en": "Verify runtime support, exact quant files and audited memory inputs.",
      "zh": "核实运行时支持、确切量化文件和内存估算输入。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "embla1",
    "name": "Embla1 4-bit",
    "vendor": "Sevren AI",
    "reason": "not-sized",
    "detail": {
      "en": "The MIT repository contains a custom Embla config, model safetensors and a separate Engram table. The file name alone does not establish compatibility or memory residency.",
      "zh": "MIT 仓库包含自定义 Embla 配置、模型 safetensors 和单独的 Engram 表。仅凭文件名无法确定运行时兼容性或内存驻留。"
    },
    "recheck": {
      "en": "Verify runtime support, exact quant files and audited memory inputs.",
      "zh": "核实运行时支持、确切量化文件和内存估算输入。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "hy4-flash",
    "name": "Hy4 Flash",
    "vendor": "Tencent",
    "reason": "not-sized",
    "detail": {
      "en": "The original weights, Tencent Hy licence and GGUF files are accessible. Its attention mixes sparse indexer caches with sliding windows. Some GGUFs store the separate Engram table on SSD and use a dedicated runtime port. File totals do not describe resident memory.",
      "zh": "原始权重、腾讯 Hy 许可和 GGUF 均可访问。注意力混合稀疏索引缓存与滑窗。部分 GGUF 将独立 Engram 表留在 SSD，并采用专门的运行时移植版，文件总量不能代表常驻内存。"
    },
    "recheck": {
      "en": "Verify upstream support, cache layout, Engram residency and projector memory against a documented run.",
      "zh": "核实上游支持、缓存布局、Engram 驻留及视觉投影内存，并与有记录的运行结果对照。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "aion-1-instruct-2-3b",
    "name": "Aion 1.0 Instruct 2.3B",
    "vendor": "Microsoft",
    "reason": "no-runtime",
    "detail": {
      "en": "The original MIT checkpoint and config are public. AtomicChat ships GGUFs, but documents a patch for its custom Aion architecture. The current upstream b12534 architecture list has no Aion Instruct entry.",
      "zh": "MIT 原始权重和配置已公开。AtomicChat 提供 GGUF，但自定义 Aion 架构需要其补丁。上游 b12534 的架构列表没有 Aion Instruct。"
    },
    "recheck": {
      "en": "Recheck when the runtime ships support and its mixed sliding/full cache can be verified.",
      "zh": "正式运行时支持落地后，核实混合滑窗与全注意力缓存。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "sensenova-loop-9b",
    "name": "SenseNova Loop 9B",
    "vendor": "SenseTime",
    "reason": "not-sized",
    "detail": {
      "en": "The publisher GGUF listing contains Q4_K_M and a projector. Its card describes 32 physical layers, 56 layer executions, hybrid attention and a dedicated llama.cpp fork. The original config returns 401 without access.",
      "zh": "发布方 GGUF 列表有 Q4_K_M 和视觉投影。模型卡显示 32 个物理层、56 次层执行、混合注意力及专用 llama.cpp 分支；原始配置未授权访问时返回 401。"
    },
    "recheck": {
      "en": "Verify the looped cache and runtime support against the final checkpoint and an observed fit.",
      "zh": "基于最终权重核实循环缓存、运行时支持和实际内存结果。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "zaya1-8b",
    "name": "ZAYA1 8B",
    "vendor": "Zyphra",
    "reason": "not-sized",
    "detail": {
      "en": "The public config, a community GGUF listing and new upstream zaya1 code are readable. Its hybrid attention and recurrent state need a verified sizing model, and the pinned Windows build predates that upstream implementation.",
      "zh": "原始配置、社区 GGUF 列表及新的上游 zaya1 实现可读取。混合注意力和循环状态需要核实估算，当前 Windows 固定版本早于该上游实现。"
    },
    "recheck": {
      "en": "Check a supported release and audit the cache against a reproducible memory result.",
      "zh": "核实受支持的发行版，并用可复现实测核对缓存。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "maxwell-v1-flash",
    "name": "Maxwell V1 Flash",
    "vendor": "Maxwell",
    "reason": "no-runtime",
    "detail": {
      "en": "The Apache-2.0 original checkpoint is public. The GGUF publisher documents a required Maxwell port and a learned block-sparse attention layout. The current upstream architecture list has no Maxwell entry.",
      "zh": "Apache 2.0 原始权重可访问。GGUF 发布方说明需要 Maxwell 移植补丁，且模型使用学习型块稀疏注意力；当前上游架构列表无 Maxwell 条目。"
    },
    "recheck": {
      "en": "Recheck stock runtime support and sparse-cache allocation.",
      "zh": "复查上游运行时支持及稀疏缓存分配。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "marin-mochi-535b",
    "name": "Marin Mochi 535B-A23B",
    "vendor": "Open Athena",
    "reason": "awaiting-data",
    "detail": {
      "en": "The OpenMDW 1.1 original checkpoint exposes BF16 tensors and a GrugMoe config. The exact-name search found no verified GGUF file listing.",
      "zh": "原始权重采用 OpenMDW 1.1，提供 BF16 张量和 GrugMoe 配置。按准确名称搜索未找到可核实的 GGUF 文件列表。"
    },
    "recheck": {
      "en": "Verify a supported conversion, complete file byte counts and architecture sizing.",
      "zh": "核实受支持的转换版本、完整文件字节数和架构估算。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "whittle-next-27b",
    "name": "Whittle Next 27B-A3B",
    "vendor": "WhittleOrg",
    "reason": "not-sized",
    "detail": {
      "en": "The original qwen4_exp config and GGUF search results are available. The repository describes an external n-gram memory and multiple residual streams, so the ordinary Qwen MoE sizing does not cover its memory layout.",
      "zh": "可读取原始 qwen4_exp 配置，并找到 GGUF 搜索结果。仓库描述外部 n-gram 内存及多条残差流，现有 Qwen MoE 公式无法覆盖其内存布局。"
    },
    "recheck": {
      "en": "Audit the exact runtime, selected file and n-gram memory residency.",
      "zh": "核实具体运行时、权重文件及 n-gram 内存驻留。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "agnes-2-5-pro-theta",
    "name": "Agnes 2.5 Pro Theta",
    "vendor": "Agnes AI",
    "reason": "not-sized",
    "detail": {
      "en": "The original Apache-2.0 multimodal config defines a custom Agnes architecture. Search results show specialist Basalt packs. Their runtime, cache and vision memory are not yet audited here.",
      "zh": "原始 Apache 2.0 多模态配置采用自定义 Agnes 架构。搜索结果显示专用 Basalt 文件，尚未核实运行时、缓存及视觉内存。"
    },
    "recheck": {
      "en": "Verify runtime support and a complete quant and encoder sizing basis.",
      "zh": "核实运行时，以及完整的量化和编码器估算依据。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    "id": "quark-150m-128k-zero",
    "name": "Quark 150M 128K Zero",
    "vendor": "Empero AI",
    "reason": "no-runtime",
    "detail": {
      "en": "The original Apache-2.0 checkpoint is readable. Its custom QuarkForCausalLM has 12 local hybrid sliding/convolution layers and four global attention layers. Stock llama.cpp has no Quark architecture entry, and the Hub search found no verified GGUF. This is not ordinary Qwen cache sizing.",
      "zh": "可读取原始 Apache-2.0 权重。自定义 QuarkForCausalLM 包含 12 层局部滑窗、卷积混合层与 4 层全局注意力。上游 llama.cpp 没有 Quark 架构条目，Hub 搜索也未找到可核实 GGUF。不套用常规 Qwen 缓存公式。"
    },
    "recheck": {
      "en": "When upstream support, quantized files and audited hybrid state/cache sizing are available.",
      "zh": "上游支持、量化文件与经审计的混合状态、缓存估算可核实时。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "lara-4-mini-base",
    "name": "Lara 4 Mini Base",
    "vendor": "Translated",
    "reason": "awaiting-data",
    "detail": {
      "en": "The original metadata identifies a manually gated translation checkpoint under CC BY-NC-SA 4.0. Config and model card requests return 401 in this patrol, and the search found no GGUF. Metadata alone does not verify its cache or quant sizes; an access failure does not mean weights are absent.",
      "zh": "原始元数据表明这是需人工授权的翻译权重，采用 CC BY-NC-SA 4.0。本次读取配置和模型卡返回 401，搜索未找到 GGUF。仅凭元数据不能核实缓存或量化大小；访问失败不代表权重不存在。"
    },
    "recheck": {
      "en": "When the original config, licence terms and a supported quant-file listing can be read.",
      "zh": "能读取原始配置、许可条款及受支持的量化文件列表时。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    id: 'kormo-web-11b',
    name: 'KORMo Web 11B',
    vendor: 'KORMo-VL',
    reason: 'no-runtime',
    detail: {
      en: 'The original weights are Apache-2.0. Xylolabs publishes GGUFs and projectors and documents stock text inference, but image input needs its Llava-OneVision patch.',
      zh: '官方权重采用 Apache 2.0。Xylolabs 提供 GGUF 和投影文件，并注明上游版本可跑文本，但图像输入需要其 Llava-OneVision 补丁。',
    },
    recheck: {
      en: 'Verify upstream vision loading before listing the screenshot model with a standard launch command.',
      zh: '核实上游可加载视觉投影后，再提供这个截图模型的标准启动命令。',
    },
    checkedAt: '2026-11-23',
  },
  {
    "id": "ernie-5-5-flash-base",
    "name": "ERNIE 5.5 Flash Base",
    "vendor": "Baidu",
    "reason": "not-sized",
    "detail": {
      "en": "Official FP8 weights and config are readable, with a custom ERNIE licence. The 43-layer architecture combines 37 heavily compressed attention layers with six sparse MLA/indexer layers and latent-MoE experts. No verified standard GGUF listing was found, and this calculator cannot express its compressed caches yet.",
      "zh": "可读取官方 FP8 权重和配置，采用自定义 ERNIE 许可。43 层结构中包含 37 层高度压缩注意力、6 层稀疏 MLA 与索引器，以及潜在 MoE 专家。本次未找到可核实的标准 GGUF 文件列表，计算器也还不能表达其压缩缓存。"
    },
    "recheck": {
      "en": "After auditing runtime/cache support and quant-file bytes, then comparing with a published memory observation.",
      "zh": "审计运行时、缓存支持与量化文件字节数，并对照公开内存记录后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "edge0-latent-moe",
    "name": "Edge0 120B / 145B",
    "vendor": "Edge0",
    "reason": "not-sized",
    "detail": {
      "en": "Published packs use custom latent-MoE experts, separate skeleton/PLE files and the Strata-derived Edge0 engine. Their NVFP4 and q3k names do not establish a conventional self-contained GGUF or the resident memory needed by this calculator. The official release uses an Edge0 community licence plus upstream Qwen terms.",
      "zh": "发布包采用自定义潜在 MoE 专家、分离的骨架和逐层嵌入文件，以及基于 Strata 的 Edge0 引擎。NVFP4、q3k 名称不能证明它们是常规单体 GGUF，也不能据此推算本计算器需要的常驻内存。官方发布同时适用 Edge0 社区许可与上游 Qwen 条款。"
    },
    "recheck": {
      "en": "When the custom pack, engine and memory residency can be modelled and checked against a reproducible run.",
      "zh": "能表达这些自定义文件包、引擎与内存驻留规则，并对照可复现运行后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "inkling-2-small",
    "name": "Inkling-2-Small",
    "vendor": "Thinking Machines",
    "reason": "not-sized",
    "detail": {
      "en": "Official weights and unsloth GGUF conversions are available, and llama.cpp has inkling2. The official configuration has 48 layers and 384 routed experts, but its cache and routing/memory layout have not been audited for this calculator. Availability of a conversion is not a verified memory estimate.",
      "zh": "已有官方权重与 unsloth GGUF 转换，llama.cpp 也有 inkling2 实现。官方配置有 48 层和 384 个路由专家，但本计算器尚未审计其缓存与路由、内存布局。有转换文件不等于已有可靠显存估算。"
    },
    "recheck": {
      "en": "After checking inkling2 cache/routing implementation, complete quant file sizes and a published memory measurement.",
      "zh": "核实 inkling2 缓存、路由实现、完整量化文件大小与公开内存实测后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "nex-n2-6",
    "name": "Nex-N2.6",
    "vendor": "Nex-AGI",
    "reason": "not-sized",
    "detail": {
      "en": "Official weights and bartowski GGUFs exist. Its GLM5-next configuration combines linear attention with compressed sparse-attention caches and an indexer, the same layout as GLM-5.3-Flash, which the calculator now sizes. Its own layer counts and GGUF byte counts have not been read yet.",
      "zh": "已有官方权重和 bartowski GGUF。其 GLM5-next 配置混合线性注意力、压缩稀疏注意力缓存和索引器，与 GLM-5.3-Flash 布局相同，计算器现已能估算这类布局，但尚未读取它自己的层数和 GGUF 文件大小。"
    },
    "recheck": {
      "en": "After its config.json and complete GGUF byte counts are read.",
      "zh": "读取其 config.json 与完整 GGUF 文件大小后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "raon-1-nano",
    "name": "Raon-1 nano",
    "vendor": "KRAFTON",
    "reason": "no-runtime",
    "detail": {
      "en": "The publisher provides Apache-2.0 weights and GGUFs, but its own instructions require the raon-1-nano-preview branch of KRAFTON's llama.cpp fork. Stock llama.cpp has no Raon architecture entry. Its mixed RDA/MLA and per-layer embeddings also need audited sizing.",
      "zh": "发布者提供 Apache-2.0 权重和 GGUF，但官方说明要求使用 KRAFTON 的 llama.cpp 分支 raon-1-nano-preview。上游发行版尚无 Raon 架构条目，混合 RDA、MLA 与逐层嵌入的内存估算也仍待审计。"
    },
    "recheck": {
      "en": "When upstream runtime support and audited RDA/MLA sizing are available.",
      "zh": "上游运行时支持落地且 RDA、MLA 估算经审计后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "klm-1-6",
    "name": "KLM-1.6",
    "vendor": "MinimaLabs",
    "reason": "no-runtime",
    "detail": {
      "en": "The original Apache-2.0 repository describes a custom KLMForCausalLM architecture. It is not listed among stock llama.cpp architectures and no verified GGUF source was found in this patrol, so ordinary transformer memory assumptions are not applied.",
      "zh": "原始 Apache-2.0 仓库使用自定义 KLMForCausalLM 架构。上游 llama.cpp 架构列表没有它，本次也未找到可核实 GGUF 来源，因此不套用常规 Transformer 内存公式。"
    },
    "recheck": {
      "en": "When a supported runtime, audited state/cache layout and quantized files can be checked.",
      "zh": "可核实受支持运行时、经审计的状态与缓存布局，以及量化文件后。"
    },
    "checkedAt": "2026-11-17"
  },
  {
    "id": "hy4-final",
    "name": "Hy4 (final release)",
    "vendor": "Tencent",
    "reason": "not-sized",
    "detail": {
      "en": "The official Tencent Hy licence, weights and configuration are now accessible. AngelSlim provides IQ2 and STQ1_0 files plus a separate vision projector. The 78-layer model uses sparse indexer attention and the specialized packings do not have verified resident-memory estimates here.",
      "zh": "腾讯 Hy 许可、正式版权重与配置现已可读。AngelSlim 提供 IQ2、STQ1_0 文件和独立视觉投影。78 层模型采用稀疏索引注意力，专用封装的常驻内存尚未核实。"
    },
    "recheck": {
      "en": "Audit the indexer cache and the runtime memory for an exact quant and projector.",
      "zh": "针对确切量化和投影核实索引缓存及运行内存。"
    },
    "checkedAt": "2026-11-21"
  },
  {
    id: 'step-5-preview',
    name: 'Step-5 Preview',
    vendor: 'StepFun',
    announced: '2026-09-20',
    reason: 'not-sized',
    detail: {
      en: 'Official FP8 weights and deployment instructions are public. The community GGUF reviewed here requires an experimental llama.cpp fork for compressed sparse attention. The 92-layer text cache has not been audited.',
      zh: '官方 FP8 权重和部署说明已公开。本次核查的社区 GGUF 需要实验性 llama.cpp 分支来处理压缩稀疏注意力。92 层文本缓存仍待审计。',
    },
    recheck: {
      en: 'When the Step-5 cache and a supported quantized-file listing have been audited and checked against a memory observation.',
      zh: '审计 Step-5 缓存和受支持的量化文件列表，并对照内存记录后。',
    },
    checkedAt: '2026-11-23',
  },
  {
    id: 'dory-1-0-4b',
    name: 'Nemotron-Labs Dory 1.0 4B',
    vendor: 'NVIDIA',
    announced: '2026-10-16',
    reason: 'no-runtime',
    detail: {
      en: 'A looped (nGPT-style) 4B model. llama.cpp support PR #30306 is open and is no longer a draft, but it has not merged; stock release support is still pending.',
      zh: '循环结构（nGPT 风格）的 4B 模型。llama.cpp 支持 PR #30306 已不再是草稿，但仍未合并，正式发行版支持尚待落实。',
    },
    recheck: { en: 'When that pull request is merged.', zh: '该 PR 合并后。' },
    checkedAt: '2026-11-17',
  },
];
