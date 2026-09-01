/**
 * Explanatory copy for the four tool pages.
 *
 * These pages used to carry a single `h1` and nothing else: a bare interactive
 * widget, which search engines have little to rank and a first-time reader has
 * nothing to calibrate against. Everything here is written from the code that
 * actually runs — `lib/utils/vram.ts`, `lib/utils/cli.ts`,
 * `lib/utils/format-wizard.ts` — so the page cannot drift from the tool.
 *
 * Bilingual like every other reader-facing field in `lib/data`.
 */

export interface ToolSection {
  heading: { en: string; zh: string };
  body: { en: string; zh: string };
}

export interface ToolFaq {
  q: { en: string; zh: string };
  a: { en: string; zh: string };
}

export interface ToolContent {
  /** Short description used for the SoftwareApplication schema. */
  summary: { en: string; zh: string };
  sections: ToolSection[];
  faqs: ToolFaq[];
}

export const vramCalcContent: ToolContent = {
  summary: {
    en: 'Estimate VRAM for any quantized LLM: model weights, KV cache and activation buffer, with a per-GPU verdict across 43 cards.',
    zh: '估算任意量化 LLM 的显存占用：模型权重、KV 缓存与激活缓冲，并对 43 张显卡逐一给出裁决。',
  },
  sections: [
    {
      heading: { en: 'How the estimate is calculated', zh: '这个估算是怎么算出来的' },
      body: {
        en: 'Three terms are added. **Model weights** are `params × bpw ÷ 8`, converted to GiB, plus 2% for embedding and norm tensors that most quantizers keep at higher precision. **KV cache** is `2 (K and V) × layers × kv_heads × head_dim × context × batch × 2 bytes`, the last factor being fp16 cache. **Activation buffer** is a flat 10% of the first two, covering the transient tensors an inference runtime allocates per forward pass. When you pick an indexed model the calculator uses that model\'s own measured bits-per-weight rather than the generic per-level table, because the two can differ sharply — GPT-OSS ships mostly-MXFP4 weights, so its Q8_0 is 5.10 bpw, not 8.5.',
        zh: '三项相加。**模型权重** = `参数量 × bpw ÷ 8`，换算为 GiB，再加 2%，用于覆盖多数量化器保持较高精度的 embedding 与 norm 张量。**KV 缓存** = `2（K 和 V）× 层数 × kv_heads × head_dim × 上下文 × batch × 2 字节`，最后一项是 fp16 缓存。**激活缓冲**取前两项之和的 10%，对应推理运行时每次前向分配的临时张量。选中索引内的模型时，计算器使用该模型自身实测的 bpw，而不是通用档位表 —— 两者可能相差很大：GPT-OSS 权重多为原生 MXFP4，其 Q8_0 实际是 5.10 bpw 而非 8.5。',
      },
    },
    {
      heading: { en: 'Why context length matters more than you expect', zh: '为什么上下文长度比你以为的更关键' },
      body: {
        en: 'Weights are fixed once you pick a quant level; the KV cache is not. It grows linearly with context and with batch size, and on long-context models it can overtake the weights entirely. The lever that decides how steep that growth is is **grouped-query attention**: `kv_heads` is often far smaller than the number of attention heads. Llama 3.1 8B has 32 attention heads but only 8 KV heads, so its cache is a quarter of what multi-head attention would cost. Two models of identical size can therefore have very different memory curves, which is why this calculator reads `layers`, `kvHeads` and `headDim` from each model\'s real config rather than assuming a shape.',
        zh: '选定量化档位后权重就固定了，KV 缓存不会。它随上下文长度和 batch 线性增长，在长上下文模型上甚至会超过权重本身。决定这条曲线陡峭程度的是**分组查询注意力（GQA）**：`kv_heads` 往往远小于注意力头数。Llama 3.1 8B 有 32 个注意力头，但只有 8 个 KV 头，因此缓存只有多头注意力的四分之一。两个体量相同的模型可能有完全不同的显存曲线 —— 所以本计算器从每个模型真实的 config 读取 `layers`、`kvHeads`、`headDim`，而不是假定一个通用形状。',
      },
    },
    {
      heading: { en: 'How close is it to reality', zh: '与实测差多少' },
      body: {
        en: 'For Llama 3.1 8B at Q4_K_M the estimate is 4.62 GB against a 4.58 GiB file from bartowski — close enough to plan a card purchase around. Treat it as an estimate all the same. Runtimes differ in how much they reserve: llama.cpp\'s compute buffer scales with batch and context, vLLM pre-allocates a fixed fraction of the card (`--gpu-memory-utilization`, 0.85 by default in our generated commands), and CUDA itself takes a few hundred MB of context before any weights load. The verdict colours build that in — green means the estimate uses at most 88% of the card, amber up to 105%, so a green result already has headroom.',
        zh: 'Llama 3.1 8B 在 Q4_K_M 下估算为 4.62 GB，而 bartowski 的实际文件为 4.58 GiB —— 足以据此决定买哪张卡。但它仍然是估算。不同运行时的预留差异很大：llama.cpp 的计算缓冲随 batch 与上下文增长，vLLM 会按固定比例预占显存（`--gpu-memory-utilization`，本站生成的命令默认 0.85），而 CUDA 本身在任何权重加载前就要占掉几百 MB 上下文。裁决颜色已经把这些考虑进去 —— 绿色表示估算占用不超过显存的 88%，琥珀色到 105%，因此绿色结果本身就留有余量。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Does this include the operating system and display overhead?', zh: '这个数字包含系统和显示占用吗？' },
      a: {
        en: 'No. It estimates what the model needs. On a card that is also driving a desktop, subtract roughly 0.5–1.5 GB before comparing — which is part of why the green threshold stops at 88% rather than 100%.',
        zh: '不包含。它估算的是模型自身的需求。如果这张卡同时在驱动显示器，比较前请先扣掉约 0.5–1.5 GB —— 这也是绿色阈值定在 88% 而非 100% 的原因之一。',
      },
    },
    {
      q: { en: 'Why does the same quant level give different sizes for different models?', zh: '为什么同一个量化档位在不同模型上体积不同？' },
      a: {
        en: 'Because bits-per-weight is an average over a mixed scheme. `Q4_K_M` keeps some tensors at higher precision, and how many depends on the architecture — an MoE model with most of its parameters in experts quantizes differently from a dense one. Where a model in the index ships that level, the calculator uses its measured figure instead of the generic one.',
        zh: '因为 bpw 是一套混合方案的平均值。`Q4_K_M` 会把部分张量保持在更高精度，具体比例取决于架构 —— 大部分参数位于专家层的 MoE 模型，量化结果与稠密模型不同。如果索引里的模型实际提供了该档位，计算器会用它的实测值而非通用值。',
      },
    },
    {
      q: { en: 'Can I run a model that shows amber?', zh: '显示琥珀色的模型能跑吗？' },
      a: {
        en: 'Often yes, with less context or a smaller batch — both shrink the KV cache directly. Lower the context slider and watch the total fall. If it is still amber at short context, the weights alone are the problem and you need a smaller quant level.',
        zh: '通常可以，但要降低上下文或减小 batch —— 两者都直接压缩 KV 缓存。拉低上下文滑块，观察总量下降。如果短上下文下仍是琥珀色，那说明问题出在权重本身，需要换更低的量化档位。',
      },
    },
    {
      q: { en: 'What does reverse mode do differently?', zh: '反向模式有什么不同？' },
      a: {
        en: 'Forward mode answers "will this model fit on my card". Reverse mode starts from the card and lists every model × quant pair in the index that fits, sorted by quality, speed or footprint. Both size from the same per-model figures, so the two views agree.',
        zh: '正向模式回答「这个模型能装进我的卡吗」。反向模式从显卡出发，列出索引中所有能装下的「模型 × 量化档位」组合，可按质量、速度或占用排序。两者使用同一套按模型的实测数据，因此结论一致。',
      },
    },
    {
      q: { en: 'Are these numbers measured or estimated?', zh: '这些数字是实测还是估算？' },
      a: {
        en: 'The VRAM figure is computed, not measured. The per-quant `vramGB` and speed values in the model index carry a confidence marker — measured, estimated or community — and the benchmarks page documents the hardware and framework versions behind the measured ones.',
        zh: '显存数字是计算得出，不是实测。模型索引中每个量化档位的 `vramGB` 与速度值都带有可信度标记 —— 实测、估算或社区数据；基准页面记录了实测数据背后的硬件与框架版本。',
      },
    },
  ],
};

export const cliGenContent: ToolContent = {
  summary: {
    en: 'Generate runnable llama.cpp, Ollama, vLLM and ExLlamaV2 commands for any indexed model, including Docker and Compose variants.',
    zh: '为索引内任意模型生成可直接运行的 llama.cpp、Ollama、vLLM 与 ExLlamaV2 命令，含 Docker 与 Compose 版本。',
  },
  sections: [
    {
      heading: { en: 'Where the identifiers come from', zh: '命令里的标识符从哪来' },
      body: {
        en: 'A model\'s display name is not an identifier. "Llama 3.1 8B Instruct" is not a Hugging Face repo, not a GGUF filename and not an Ollama tag, and a command built from it fails in a way that looks like it should have worked. The generator takes the real repo from the site\'s repo map and derives the GGUF filename from it, because that is the actual convention: `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` ships `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`.',
        zh: '模型的展示名不是标识符。"Llama 3.1 8B Instruct" 既不是 Hugging Face 仓库名，也不是 GGUF 文件名或 Ollama tag，用它拼出来的命令会以一种"看着本该能跑"的方式失败。生成器从站内的仓库映射取真实仓库，并据此推导 GGUF 文件名 —— 这才是实际的命名约定：`bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` 提供的文件是 `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`。',
      },
    },
    {
      heading: { en: 'Why some commands show a placeholder', zh: '为什么有些命令里是占位符' },
      body: {
        en: 'vLLM serves FP16, AWQ or GPTQ weights — not the GGUF repos this site maps — and EXL2 conversions are published per model by different people. Neither is derivable from what the index knows, so those commands emit a visible `<hf-repo-id>` rather than a plausible guess. An obvious placeholder costs you one lookup; a wrong repo costs you a download and a confusing error.',
        zh: 'vLLM 加载的是 FP16、AWQ 或 GPTQ 权重，而非本站映射的 GGUF 仓库；EXL2 转换则由不同的人按模型分别发布。这两者都无法从索引已知的信息推导出来，所以相应命令给出显式的 `<hf-repo-id>` 占位符，而不是一个貌似合理的猜测。明显的占位符只让你多查一次；错误的仓库名会让你白下一次并撞上一个费解的报错。',
      },
    },
    {
      heading: { en: 'Build flags that silently do nothing', zh: '会静默失效的编译参数' },
      body: {
        en: 'llama.cpp renamed its CMake options from `LLAMA_*` to `GGML_*`. CMake does not error on an unknown option — it defines an unused variable and carries on — so `-DLLAMA_CUDA=ON` produces a build that compiles, runs, and is CPU-only. If a build of yours is inexplicably slow, check the flag names before anything else. The commands here use the current names.',
        zh: 'llama.cpp 把 CMake 选项从 `LLAMA_*` 改名为 `GGML_*`。CMake 遇到未知选项不会报错 —— 它只是定义一个没人用的变量然后继续 —— 所以 `-DLLAMA_CUDA=ON` 会编出一个能编译、能运行、但纯 CPU 的版本。如果你的构建莫名很慢，先检查参数名。本页生成的命令使用的是当前名称。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Why does Ollama use an hf.co/ tag instead of a short one?', zh: '为什么 Ollama 用 hf.co/ 而不是短 tag？' },
      a: {
        en: 'Ollama library tags like `qwen2.5:7b` are curated and cannot be derived from a model name — a guessed one simply 404s. Pulling the GGUF straight from Hugging Face works for every mapped model and pins the exact quant level. If the model has a library tag you prefer, it works too, but it picks the quant for you.',
        zh: 'Ollama 的库 tag（如 `qwen2.5:7b`）是人工策展的，无法从模型名推导 —— 猜出来的 tag 会直接 404。直接从 Hugging Face 拉取 GGUF 对所有已映射模型都有效，并且能精确指定量化档位。如果该模型有你更习惯的库 tag，也可以用，只是量化档位由它替你决定。',
      },
    },
    {
      q: { en: 'What is -ngl and what should I set it to?', zh: '-ngl 是什么，该设多少？' },
      a: {
        en: 'The number of transformer layers offloaded to the GPU. `99` means "all of them", which is what you want whenever the model fits. Lower it to split a model between VRAM and system RAM; throughput drops sharply once any layer lives in RAM, so use the VRAM calculator first to see whether you need to.',
        zh: '卸载到 GPU 的 transformer 层数。`99` 表示"全部"，只要模型装得下就该用这个值。调低它可以把模型拆分在显存和内存之间；但只要有任何一层落在内存里，吞吐就会明显下降 —— 所以先用显存计算器看看是否真有必要。',
      },
    },
    {
      q: { en: 'The download command matched nothing. Why?', zh: '下载命令一个文件都没匹配到，为什么？' },
      a: {
        en: '`huggingface-cli download --include` exits 0 when its pattern matches no file, so a wrong filename looks like a successful download of nothing. Check that the repo actually publishes that quant level — smaller models often skip Q8_0, and very large ones ship sharded files whose names carry an `-00001-of-0000N` suffix.',
        zh: '`huggingface-cli download --include` 在模式匹配不到任何文件时退出码仍是 0，所以文件名写错看起来就像"成功下载了零个文件"。请确认该仓库确实发布了这个量化档位 —— 小模型常常没有 Q8_0，而超大模型的文件是分片的，名字带 `-00001-of-0000N` 后缀。',
      },
    },
    {
      q: { en: 'Can I run these commands on AMD or Apple silicon?', zh: '这些命令能在 AMD 或苹果芯片上跑吗？' },
      a: {
        en: 'The llama.cpp and Ollama paths, yes — pick the matching environment and the build flags change to Metal or ROCm. vLLM and ExLlamaV2 are CUDA-only; the generator labels them as such rather than offering a command that cannot run.',
        zh: 'llama.cpp 和 Ollama 可以 —— 选择对应环境后编译参数会切换为 Metal 或 ROCm。vLLM 与 ExLlamaV2 仅支持 CUDA；生成器会明确标注，而不是给出一条跑不起来的命令。',
      },
    },
  ],
};

export const formatWizardContent: ToolContent = {
  summary: {
    en: 'Answer three questions about your hardware and priorities to get a quantization format, runtime and quant level that actually run together.',
    zh: '回答三个关于硬件与优先级的问题，得到一组真正能协同工作的量化格式、运行时与量化档位。',
  },
  sections: [
    {
      heading: { en: 'The formats, in one paragraph each', zh: '四种格式，各一段话' },
      body: {
        en: '**GGUF** runs everywhere — CPU, NVIDIA, AMD, Apple — and is the only format that splits a model across VRAM and system RAM. **EXL2** is the fastest on consumer NVIDIA cards and lets you pick a fractional bits-per-weight, but it is CUDA-only. **AWQ** is built for batched serving through vLLM. **GPTQ** predates AWQ and covers a similar niche with wider legacy tooling. The wizard only recommends formats an indexed model actually ships.',
        zh: '**GGUF** 到处都能跑 —— CPU、NVIDIA、AMD、苹果芯片 —— 也是唯一支持把模型拆分在显存与内存之间的格式。**EXL2** 在消费级 NVIDIA 卡上最快，且可以选择小数位的 bpw，但仅支持 CUDA。**AWQ** 面向通过 vLLM 的批量服务场景。**GPTQ** 早于 AWQ，覆盖类似场景，遗留工具链更广。向导只会推荐索引内确实有模型提供的格式。',
      },
    },
    {
      heading: { en: 'Why hardware decides more than preference', zh: '为什么硬件比偏好更有决定权' },
      body: {
        en: 'Most of the scoring is elimination, not taste. ExLlamaV2 is CUDA-only, so EXL2 is not a slow option on a Radeon — it is not an option. AWQ and GPTQ kernels are CUDA-first with partial, version-sensitive ROCm support. On Apple silicon, GGUF through llama.cpp\'s Metal backend is the only path with full support. That is why an AMD or Mac answer converges on GGUF regardless of what you say you care about.',
        zh: '大部分打分是在做排除，不是在谈偏好。ExLlamaV2 仅支持 CUDA，所以在 Radeon 上 EXL2 不是"慢一点的选项"，而是根本不是选项。AWQ 与 GPTQ 的算子以 CUDA 为先，ROCm 支持不完整且对版本敏感。在苹果芯片上，经 llama.cpp Metal 后端的 GGUF 是唯一完整支持的路径。所以只要选了 AMD 或 Mac，无论你说自己更看重什么，结论都会收敛到 GGUF。',
      },
    },
    {
      heading: { en: 'Quant levels belong to one format', zh: '量化档位只属于某一种格式' },
      body: {
        en: '`Q4_K_M` is a GGUF level. `4.65bpw` is an EXL2 level. `INT4` is what AWQ and GPTQ ship. They are not interchangeable names for the same thing, and a recommendation that mixes them — "EXL2 · Q4_K_M" — is telling you to fetch something that does not exist. Each row here names a level that belongs to its own format.',
        zh: '`Q4_K_M` 是 GGUF 的档位，`4.65bpw` 是 EXL2 的档位，`INT4` 是 AWQ 与 GPTQ 提供的。它们不是同一件事的不同叫法，把两者混在一起的推荐 —— 比如 "EXL2 · Q4_K_M" —— 是在让你去下载一个不存在的东西。这里每一行给出的档位都属于它自己的格式。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'I have an NVIDIA card. Should I always use EXL2?', zh: '我有 NVIDIA 卡，是不是该一直用 EXL2？' },
      a: {
        en: 'Only if speed is the priority and you are serving one request at a time. GGUF has far wider tooling and is the only option if the model does not fully fit in VRAM; AWQ through vLLM wins on batched throughput. The wizard weights these by the priority you pick.',
        zh: '只有在速度优先、且一次只处理一个请求时才是。GGUF 的工具链广得多，而且在模型无法完全装进显存时是唯一选择；批量吞吐场景下 AWQ + vLLM 更强。向导会按你选择的优先级加权。',
      },
    },
    {
      q: { en: 'What does bits-per-weight actually control?', zh: 'bpw 究竟决定了什么？' },
      a: {
        en: 'Size and quality, jointly. Fewer bits means a smaller file and more perplexity loss, and the relationship is not linear — the drop from 4-bit to 3-bit costs far more quality than 8-bit to 6-bit. The perplexity chart on the benchmarks page shows where the curve turns.',
        zh: '同时决定体积与质量。位数越少，文件越小、困惑度损失越大，而且关系不是线性的 —— 从 4 bit 降到 3 bit 的质量代价远大于从 8 bit 降到 6 bit。基准页面的困惑度曲线图标出了拐点位置。',
      },
    },
    {
      q: { en: 'Can I convert between formats myself?', zh: '我能自己在格式之间转换吗？' },
      a: {
        en: 'You quantize from the original FP16 weights rather than converting between quantized formats — going from one lossy format to another compounds the loss. The cookbook has a guide for producing your own GGUF.',
        zh: '正确做法是从原始 FP16 权重重新量化，而不是在量化格式之间互转 —— 从一种有损格式转到另一种会叠加损失。Cookbook 里有一篇自行制作 GGUF 的指南。',
      },
    },
    {
      q: { en: 'Why is HQQ not offered?', zh: '为什么没有 HQQ？' },
      a: {
        en: 'The format reference documents it, but no model in this index ships HQQ weights. Recommending a format with nothing behind it would send you to a page with no results.',
        zh: '格式参考里有它的介绍，但本索引中没有任何模型提供 HQQ 权重。推荐一个背后什么都没有的格式，只会把你带到一个没有结果的页面。',
      },
    },
  ],
};

export const compareContent: ToolContent = {
  summary: {
    en: 'Put two quantized models side by side: parameters, context, VRAM at your chosen context length, speed and quality loss.',
    zh: '将两个量化模型并排对比：参数量、上下文、在你选定上下文下的显存、速度与质量损失。',
  },
  sections: [
    {
      heading: { en: 'What the columns mean', zh: '各列的含义' },
      body: {
        en: 'VRAM is computed at the context length you set, not at a fixed default — which matters, because two models can swap places as context grows if their KV cache shapes differ. Speed is tokens per second on an RTX 4090 at batch 1. Quality loss is perplexity increase against the unquantized weights, so lower is better and the absolute value is only comparable within a model family.',
        zh: '显存按你设定的上下文长度计算，而非固定默认值 —— 这一点很重要：如果两个模型的 KV 缓存形状不同，随着上下文增长，它们的排序可能对调。速度是 RTX 4090、batch=1 下的每秒 token 数。质量损失是相对未量化权重的困惑度上升，因此越低越好，且绝对值只在同一模型家族内可比。',
      },
    },
    {
      heading: { en: 'Comparing across families is harder than it looks', zh: '跨家族比较比看上去更难' },
      body: {
        en: 'Perplexity is measured on a fixed corpus, and models trained on different data start from different baselines — a 2% loss on one model and a 2% loss on another do not represent the same amount of degradation. Use the figure to choose a quant level within a model, and use the model index and your own evaluation to choose between models.',
        zh: '困惑度是在固定语料上测的，而在不同数据上训练的模型基线本就不同 —— 一个模型损失 2% 和另一个模型损失 2%，代表的退化程度并不相同。这个数字适合用来在**同一模型内部**挑选量化档位；在模型之间做选择，请结合模型索引和你自己的评测。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Why does the smaller model sometimes need more VRAM?', zh: '为什么有时更小的模型反而更占显存？' },
      a: {
        en: 'Its KV cache. A model with more layers or more KV heads carries a heavier cache per token, and at long context that can outweigh a difference in parameter count. Drop the context slider and watch the ordering change.',
        zh: '是 KV 缓存。层数更多或 KV 头更多的模型，每个 token 的缓存开销更大；在长上下文下这可以盖过参数量的差距。把上下文滑块拉低，你会看到排序发生变化。',
      },
    },
    {
      q: { en: 'Are the speed numbers comparable across frameworks?', zh: '不同框架之间的速度数字可比吗？' },
      a: {
        en: 'Roughly, and only at batch 1. The benchmarks page lists the exact framework versions and test parameters; throughput rankings change substantially once you batch requests, which is where vLLM pulls ahead.',
        zh: '大致可比，且仅限 batch=1。基准页面列出了具体的框架版本与测试参数；一旦开始批量处理请求，吞吐排名会明显变化 —— 那正是 vLLM 拉开差距的场景。',
      },
    },
    {
      q: { en: 'Can I share a comparison?', zh: '可以分享对比结果吗？' },
      a: {
        en: 'Yes — both models and the context length are kept in the URL, so copying the address bar shares exactly what you are looking at, in the language you are reading it in.',
        zh: '可以 —— 两个模型和上下文长度都保存在 URL 里，直接复制地址栏就能分享你当前看到的内容，并保持你所使用的语言。',
      },
    },
  ],
};
