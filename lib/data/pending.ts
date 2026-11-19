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
    "id": "kormo-web-9b-11b",
    "name": "KORMo Web 9B / 11B",
    "vendor": "KORMo-VL",
    "reason": "not-sized",
    "detail": {
      "en": "Official Apache-2.0 browser-agent weights and configs are readable. The 9B model uses Qwen3.5 vision, while 11B uses a Llava-OneVision wrapper with a custom KORMo text backbone. The current Hub search found no verified GGUF/projector listing for either; their encoders and runtime compatibility must not be inferred from parameter labels.",
      "zh": "可读取官方 Apache-2.0 浏览器智能体权重与配置。9B 使用 Qwen3.5 视觉架构，11B 则为 Llava-OneVision 外层加自定义 KORMo 文本骨干。本次 Hub 搜索未找到两者可核实的 GGUF、投影文件列表；不能从参数标签推断编码器大小和运行时兼容性。"
    },
    "recheck": {
      "en": "When compatible GGUFs/projectors, byte counts and exact backbone runtime support are verified.",
      "zh": "核实兼容 GGUF、投影文件及字节数，并确认具体骨干的运行时支持后。"
    },
    "checkedAt": "2026-11-17"
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
      "en": "Official weights and bartowski GGUFs exist. Its GLM5-next configuration combines linear attention with compressed sparse-attention caches and an indexer, the same unresolved sizing class as GLM-5.3-Flash. The calculator cannot yet express this layout accurately.",
      "zh": "已有官方权重和 bartowski GGUF。其 GLM5-next 配置混合线性注意力、压缩稀疏注意力缓存和索引器，与 GLM-5.3-Flash 属于同一尚未解决的估算类型。计算器目前还不能准确表达这种布局。"
    },
    "recheck": {
      "en": "When compressed-cache/indexer sizing is implemented and verified against actual files and memory observations.",
      "zh": "实现压缩缓存与索引器估算，并对照实际文件和内存记录核实后。"
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
    "reason": "awaiting-data",
    "detail": {
      "en": "Tencent's final Hy4 repository could not be read during this patrol (the official HF API request returned 401). Existing Hy4-preview weights do not establish the final model's files or architecture. This is an access/evidence gap, not proof that final weights do not exist.",
      "zh": "本次无法读取腾讯最终版 Hy4 的官方仓库（HF API 返回 401）。已有 Hy4-preview 权重不能证明最终版的文件或架构。这是访问和证据缺口，不能据此断言最终版权重不存在。"
    },
    "recheck": {
      "en": "When the official final-checkpoint repository, config, licence and quant files can be read.",
      "zh": "能读取官方最终版仓库、配置、许可与量化文件时。"
    },
    "checkedAt": "2026-11-19"
  },
  {
    id: 'kimi-k3-1-pro',
    name: 'Kimi K3.1 Pro',
    vendor: 'Moonshot AI',
    announced: '2026-10-23',
    reason: 'not-sized',
    detail: {
      en: 'The official Hugging Face repository and safetensors listing can now be read. llama.cpp has the kimi-k31 implementation, but this calculator has not audited its mixed KDA and sparse-attention/indexer cache or its packed expert weights. Weight availability is no longer the blocker; sizing remains unverified.',
      zh: '现在已能读取官方 Hugging Face 仓库和 safetensors 列表。llama.cpp 已有 kimi-k31 实现，但本计算器尚未审计它混合 KDA 与稀疏注意力、索引器的缓存以及打包专家权重。权重可访问性已不再是阻碍，显存估算仍未核实。',
    },
    recheck: {
      en: 'After auditing the cache implementation and an actual quantized-file listing, then checking against a published memory measurement.',
      zh: '审计缓存实现和实际量化文件列表，并对照公开内存实测后。',
    },
    checkedAt: '2026-11-17',
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
    checkedAt: '2026-11-17',
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
    checkedAt: '2026-11-17',
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
    checkedAt: '2026-11-17',
  },
  {
    id: 'step-5-preview',
    name: 'Step-5 Preview',
    vendor: 'StepFun',
    announced: '2026-09-20',
    reason: 'not-sized',
    detail: {
      en: 'Official FP8 weights are now available in 28 safetensors files; the original card documents vLLM, SGLang and Transformers serving. Its Step5ForConditionalGeneration config has 92 text layers. This calculator has not audited the Step-5 cache or a compatible quantized-file listing, so it remains unsized rather than borrowing Step 3.5 assumptions. The earlier empty-repository report is obsolete.',
      zh: '官方 FP8 权重现在已发布为 28 个 safetensors 文件，原始模型卡提供 vLLM、SGLang 和 Transformers 部署说明。Step5ForConditionalGeneration 配置有 92 层文本网络。本计算器尚未审计 Step-5 的缓存和兼容量化文件列表，因此仍不提供显存估算，也不借用 Step 3.5 假设。此前仓库为空的记录已经过时。',
    },
    recheck: {
      en: 'When the Step-5 cache and a supported quantized-file listing have been audited and checked against a memory observation.',
      zh: '审计 Step-5 缓存和受支持的量化文件列表，并对照内存记录后。',
    },
    checkedAt: '2026-11-17',
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
    checkedAt: '2026-11-17',
  },
];
