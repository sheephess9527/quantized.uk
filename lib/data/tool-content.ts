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
    en: 'Estimate VRAM for any quantized LLM — or any model on Hugging Face — with a verdict for your card or mixed cards, the speed ceiling, the wait before the first token, how many people it can serve, and the memory to fine-tune it.',
    zh: '估算任意量化大模型（或 Hugging Face 上任意模型）的显存占用，并给出你的显卡或混搭多卡能否装下、速度上限、首字等待时间、能同时服务几个人，以及微调所需显存。',
  },
  sections: [
    {
      heading: { en: 'How the estimate is calculated', zh: '这个估算是怎么算出来的' },
      body: {
        en: 'Three terms are added. **Model weights** use recorded file bytes when available. Otherwise use `params × bpw ÷ 8`. Add a separate 2% planning allowance to either weight basis. **KV cache** is `2 (K and V) × layers × kv_heads × head_dim × context × batch × bytes per value`: 2 for the default fp16 cache, and ggml\'s block sizes when you pick a quantized one — q8_0 stores 32 values in 34 bytes, q4_0 in 18. **Activation buffer** is a flat 10% of the weights and cache (and a vision encoder, when you add one), covering the transient tensors an inference runtime allocates per forward pass. **Units:** memory estimates use GiB (1024³ bytes). When you pick an indexed model the calculator uses that model\'s own measured bits-per-weight rather than the generic per-level table, because the two can differ sharply — GPT-OSS ships mostly-MXFP4 weights, so its Q8_0 is 5.10 bpw, not 8.5.',
        zh: '三项相加。**模型权重** 优先采用已记录的文件字节数，缺少字节数时按 `参数量 × bpw ÷ 8` 估算，两种方式均另留 2% 规划余量。**KV 缓存** = `2（K 和 V）× 层数 × kv_heads × head_dim × 上下文 × batch × 每个值的字节数`：默认 fp16 缓存为 2 字节；选择量化缓存时按 ggml 的块大小计算 —— q8_0 每 32 个值占 34 字节，q4_0 占 18 字节。**激活缓冲**取权重与缓存之和（加入视觉编码器时也计入）的 10%，对应推理运行时每次前向分配的临时张量。**单位：**显存估算使用 GiB（1024³ 字节）。选中索引内的模型时，计算器使用该模型自身实测的 bpw，而不是通用档位表 —— 两者可能相差很大：GPT-OSS 权重多为原生 MXFP4，其 Q8_0 实际是 5.10 bpw 而非 8.5。',
      },
    },
    {
      heading: { en: 'What else it answers once you pick a card', zh: '选好显卡后它还能回答什么' },
      body: {
        en: '**Mixed cards**: add a second, different card on the same backend and capacity adds the way llama.cpp and Ollama split layers, in proportion to each card\'s memory; the speed ceiling follows the cards in turn, so a slower card pulls it down. **Speed**: token generation is bounded by memory bandwidth over the bytes read per token. **Time to first token**: each card\'s measured Llama 2 7B prompt speed from llama.cpp\'s community scoreboards, scaled by the chosen model\'s compute per token — cards with no published run get no figure. **Serving**: how many full-length requests fit at once at 4K, 8K and 32K, with the 85% memory share this site\'s vLLM commands use; paged caches fit more short chats than that. **Fine-tuning**: QLoRA, LoRA or a full fine-tune, from the byte counts in the transformers documentation, the QLoRA paper and the transformers loss code. **Any Hugging Face model**: paste a repo and the calculator reads its own config.json in your browser.',
        zh: '**混搭显卡**：再加一张同一类的不同型号显卡，显存按 llama.cpp 和 Ollama 的拆分方式相加（按每张卡的显存比例分层）；速度上限按各卡轮流计算，较慢的卡会拉低整体。**速度**：生成速度的上限是显存带宽除以每个 token 要读取的字节数。**首字等待**：以 llama.cpp 社区跑分里每张卡实测的 Llama 2 7B 提示词速度为起点，按所选模型每个 token 的计算量换算；没有公开跑分的卡不给数字。**多人使用**：按本站 vLLM 命令使用的 85% 显存占比，算出 4K、8K、32K 下能同时容纳几个满长度请求；短对话实际能容纳更多。**微调**：QLoRA、LoRA 或全参数微调，字节数取自 transformers 文档、QLoRA 论文和 transformers 损失函数代码。**任意 Hugging Face 模型**：粘贴仓库名，计算器会在你的浏览器里读取它自己的 config.json。',
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
        en: 'For Llama 3.1 8B Q4_K_M, the weight estimate is 4.62 GiB and the bartowski GGUF file is 4.58 GiB. This checks weight sizing only. Peak VRAM also depends on the context, batch and runtime. Runtimes differ in how much they reserve: llama.cpp\'s compute buffer scales with batch and context, vLLM pre-allocates a fixed fraction of the card (`--gpu-memory-utilization`, 0.85 by default in our generated commands), and CUDA itself takes a few hundred MB of context before any weights load. The verdict colours build that in — green means the estimate uses at most 88% of the card, amber up to 105%, so a green result already has headroom.',
        zh: 'Llama 3.1 8B 的 Q4_K_M 权重估算为 4.62 GiB，bartowski 的 GGUF 文件为 4.58 GiB。这组数字仅用于核对权重体积。运行时的峰值显存还取决于上下文、批大小和推理框架。不同运行时的预留差异很大：llama.cpp 的计算缓冲随 batch 与上下文增长，vLLM 会按固定比例预占显存（`--gpu-memory-utilization`，本站生成的命令默认 0.85），而 CUDA 本身在任何权重加载前就要占掉几百 MB 上下文。裁决颜色已经把这些考虑进去 —— 绿色表示估算占用不超过显存的 88%，琥珀色到 105%，因此绿色结果本身就留有余量。',
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
        en: 'Often yes, with less context, a smaller batch or a quantized KV cache — all three shrink the cache directly. With your card chosen, the calculator prints the longest context that stays green and the longest that stays amber. If it is still amber at short context, the weights alone are the problem and you need a smaller quant level; the table of every level the model ships shows which one fits.',
        zh: '通常可以，办法是降低上下文、减小 batch，或量化 KV 缓存 —— 三者都直接压缩缓存。选好你的显卡后，计算器会直接给出保持绿色的最长上下文和保持琥珀色的最长上下文。如果短上下文下仍是琥珀色，那说明问题出在权重本身，需要换更低的量化档位；「全部量化档位」表会告诉你哪一档装得下。',
      },
    },
    {
      q: { en: 'What if the model is bigger than my card?', zh: '模型比我的显卡还大怎么办？' },
      a: {
        en: 'Two ways, and the calculator sizes both. **Add a card:** llama.cpp\'s default split gives each card a slice of layers and that slice\'s KV cache, so memory adds up — Llama 3.3 70B at Q4_K_M and 8K context is 47.5 GB, out of reach for one RTX 3090 and a tight fit on two. The cards take turns on every token, so a second card buys room, not speed. **Spill to system RAM:** llama.cpp and Ollama keep as many whole layers on the GPU as fit and run the rest on the CPU. On one RTX 3090 that is about 38 of the 80 layers, with about 25 GB in system RAM, and the RAM half sets the pace — the bound is roughly 4 tok/s with dual-channel DDR5-5600. For a mixture-of-experts model, `--n-cpu-moe` moves only the expert weights, which usually costs far less speed.',
        zh: '有两种办法，计算器两种都会算。**加一张卡：**llama.cpp 默认按层拆分，每张卡放一段层及其 KV 缓存，所以显存可以相加——Llama 3.3 70B 在 Q4_K_M、8K 上下文时为 47.5 GB，一张 RTX 3090 装不下，两张勉强装下。各卡轮流处理每个 token，所以第二张卡换来的是空间，不是速度。**溢出到系统内存：**llama.cpp 和 Ollama 会把放得下的整层留在 GPU 上，其余交给 CPU。单张 RTX 3090 大约能放下 80 层中的 38 层，约 25 GB 放在系统内存，而内存那一半决定速度——双通道 DDR5-5600 下上限约 4 tok/s。混合专家模型可以用 `--n-cpu-moe` 只搬走专家权重，速度损失通常小得多。',
      },
    },
    {
      q: { en: 'Should I quantize the KV cache?', zh: '要不要量化 KV 缓存？' },
      a: {
        en: 'At long context it is the cheapest memory you can win back. Llama 3.1 8B at Q4_K_M and 32K context is 9.49 GB with the default fp16 cache, 7.42 GB with q8_0 and 6.32 GB with q4_0 — the weights do not change, only the cache does. In llama.cpp pass `-ctk q8_0 -ctv q8_0`; a quantized V cache needs Flash Attention, which `-fa auto` turns on and which fails if forced off. In Ollama set `OLLAMA_KV_CACHE_TYPE=q8_0` with Flash Attention enabled. Ollama\'s own documentation describes q8_0 as usually unnoticeable and q4_0 as a small-to-medium precision loss that shows more at long context; this site has not measured either.',
        zh: '长上下文下，这是最便宜的省显存手段。Llama 3.1 8B 在 Q4_K_M、32K 上下文时，默认 fp16 缓存为 9.49 GB，q8_0 为 7.42 GB，q4_0 为 6.32 GB —— 权重不变，变的只是缓存。llama.cpp 用 `-ctk q8_0 -ctv q8_0`；量化 V 缓存需要 Flash Attention，`-fa auto` 会自动开启，强制关闭则会报错。Ollama 在开启 Flash Attention 后设置 `OLLAMA_KV_CACHE_TYPE=q8_0`。按 Ollama 官方文档的说法，q8_0 通常察觉不到差别，q4_0 有小到中等的精度损失、长上下文时更明显；本站没有实测过两者。',
      },
    },
    {
      q: { en: 'Which LLMs can I run on my GPU?', zh: '我的显卡能跑哪些大模型？' },
      a: {
        en: 'Choose your GPU in reverse mode to see which indexed models and quantization levels fit, sorted by quality, speed or memory use. If you already have a model in mind, use forward mode to estimate its memory use. Both modes use the same sizing rules.',
        zh: '在反向模式选择显卡，就能查看索引中能装下的模型和量化档位，可按质量、速度或内存占用排序。已有目标模型时，用正向模式估算它的内存需求。两种模式使用同一套估算规则。',
      },
    },
    {
      q: { en: 'Are these numbers measured or estimated?', zh: '这些数字是实测还是估算？' },
      a: {
        en: 'The VRAM figure is computed, not measured. Every size on this site comes from the same arithmetic as this calculator; what carries a confidence marker — measured, estimated or community — is each quant row\'s speed, and the benchmarks page documents the hardware and framework versions behind the measured ones.',
        zh: '显存数字是计算得出，不是实测。本站所有体积数字都和这个计算器用同一套算法；带可信度标记（实测、估算或社区数据）的是每个量化档位的速度，基准页面记录了实测数据背后的硬件与框架版本。',
      },
    },
    {
      q: { en: 'How much memory does LoRA or QLoRA fine-tuning need?', zh: 'LoRA 或 QLoRA 微调需要多少显存？' },
      a: {
        en: 'Fine-tune mode adds five parts. The base weights: 16-bit for LoRA, 4-bit NF4 for QLoRA (about 4.1 bits per weight with double quantization), with the embeddings and output head kept 16-bit. The adapters, trained in fp32 with their gradients and AdamW state, at 16 bytes per adapter parameter. Activations, which grow with sequence length and batch; gradient checkpointing keeps only each layer\'s input. The output logits, held in fp32 for the loss, which grow with the vocabulary. And a 10% working buffer. A full fine-tune instead keeps 18 bytes for every parameter of the model. The estimate describes a standard transformers + PEFT run; Unsloth and similar trainers offload and chunk parts of this and publish lower minimums.',
        zh: '微调模式把五部分加起来。基座权重：LoRA 是 16 位，QLoRA 是 4 位 NF4（双重量化后约每参数 4.1 位），词嵌入和输出层保持 16 位。适配器：以 fp32 训练，连同梯度和 AdamW 状态每个适配器参数 16 字节。激活值：随序列长度和批大小增长，开启梯度检查点后只保留每层的输入。输出层 logits：为计算损失以 fp32 保存，随词表大小增长。最后是 10% 的运行缓冲。全参数微调则是模型每个参数 18 字节。这个估算对应标准的 transformers + PEFT 训练；Unsloth 等工具会把其中一部分转存或分块计算，公布的最低显存更低。',
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
        en: 'llama.cpp renamed its CMake options from `LLAMA_*` to `GGML_*`, and the commands here use the current names. The old ones are handled, not ignored: `LLAMA_CUDA` still turns CUDA on with a deprecation warning, and `LLAMA_CUBLAS` stops the configure step with an error. What does give you a build that compiles, runs and is CPU-only is no GPU flag at all, or a misspelt one — CMake only mentions it in a "Manually-specified variables were not used" warning at the end of configure. If a build of yours is inexplicably slow, read that warning before anything else.',
        zh: 'llama.cpp 把 CMake 选项从 `LLAMA_*` 改名为 `GGML_*`，本页生成的命令使用的是当前名称。旧名字是被处理的，并没有被忽略：`LLAMA_CUDA` 仍会打开 CUDA，只是附带一条弃用警告；`LLAMA_CUBLAS` 会直接让配置步骤报错停止。真正会编出「能编译、能运行、却是纯 CPU」版本的，是根本没加 GPU 开关，或者开关名拼错了 —— CMake 只会在配置结束时用一条 "Manually-specified variables were not used" 警告提一句。如果你的构建莫名很慢，先去看这条警告。',
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
        en: '`hf download --include` (the command was `huggingface-cli` before huggingface_hub renamed it) exits 0 when its pattern matches no file, so a wrong filename looks like a successful download of nothing. Check that the repo actually publishes that quant level — smaller models often skip Q8_0, and very large ones ship sharded files whose names carry an `-00001-of-0000N` suffix.',
        zh: '`hf download --include`（huggingface_hub 改名之前这个命令叫 `huggingface-cli`）在模式匹配不到任何文件时退出码仍是 0，所以文件名写错看起来就像"成功下载了零个文件"。请确认该仓库确实发布了这个量化档位 —— 小模型常常没有 Q8_0，而超大模型的文件是分片的，名字带 `-00001-of-0000N` 后缀。',
      },
    },
    {
      q: { en: 'Can I run these commands on AMD, Intel Arc or Apple silicon?', zh: '这些命令能在 AMD、Intel Arc 或苹果芯片上跑吗？' },
      a: {
        en: 'The llama.cpp and Ollama paths, yes — the build and the container follow the card in your hardware profile: Metal on a Mac, ROCm/HIP on Radeon, SYCL on Intel Arc (Ollama reaches Arc through Vulkan), or a plain CPU build. **ExLlamaV2 is CUDA-only.** vLLM is not: it ships official ROCm builds, so it runs on supported Radeon and Instinct cards, though kernel coverage for AWQ and GPTQ there is narrower than on CUDA and moves between releases — check the vLLM installation docs for your card before committing to it. Neither runs on Apple silicon, and this site does not generate vLLM commands for Intel Arc.',
        zh: 'llama.cpp 和 Ollama 可以 —— 编译方式和容器会跟随你硬件配置里的显卡：Mac 用 Metal，Radeon 用 ROCm/HIP，Intel Arc 用 SYCL（Ollama 通过 Vulkan 支持 Arc），否则是纯 CPU 构建。**ExLlamaV2 仅支持 CUDA。** vLLM 并非如此：它提供官方 ROCm 构建，可在受支持的 Radeon 与 Instinct 卡上运行，只是 AWQ/GPTQ 算子在该平台的覆盖比 CUDA 窄且随版本变动 —— 选定前请查阅 vLLM 安装文档确认你的卡。两者都不支持苹果芯片；本站也不为 Intel Arc 生成 vLLM 命令。',
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
        en: '**GGUF** runs everywhere — CPU, NVIDIA, AMD, Intel Arc, Apple — and is the only format that splits a model across VRAM and system RAM. **EXL2** is the fastest on consumer NVIDIA cards and lets you pick a fractional bits-per-weight, but it is CUDA-only and its runtime, ExLlamaV2, is now archived with no maintained API server. **AWQ** is built for batched serving through vLLM. **GPTQ** predates AWQ and covers a similar niche with wider legacy tooling. The wizard only recommends formats an indexed model actually ships.',
        zh: '**GGUF** 到处都能跑 —— CPU、NVIDIA、AMD、Intel Arc、苹果芯片 —— 也是唯一支持把模型拆分在显存与内存之间的格式。**EXL2** 在消费级 NVIDIA 卡上最快，且可以选择小数位的 bpw，但仅支持 CUDA，而且它的运行时 ExLlamaV2 已经归档，没有仍在维护的 API 服务端。**AWQ** 面向通过 vLLM 的批量服务场景。**GPTQ** 早于 AWQ，覆盖类似场景，遗留工具链更广。向导只会推荐索引内确实有模型提供的格式。',
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
        en: 'Only if speed is the priority, you are chatting locally, and you accept an archived runtime: ExLlamaV2 still runs EXL2, but development moved to ExLlamaV3 and no maintained server loads EXL2 any more, so it cannot back an API. GGUF has far wider tooling and is the only option if the model does not fully fit in VRAM; AWQ through vLLM wins on batched throughput. The wizard weights these by the priority you pick.',
        zh: '只有在速度优先、只在本机对话、并且能接受一个已归档的运行时的情况下才是：ExLlamaV2 仍能跑 EXL2，但开发已转到 ExLlamaV3，也已经没有仍在维护的服务端加载 EXL2，所以它无法用来提供 API。GGUF 的工具链广得多，而且在模型无法完全装进显存时是唯一选择；批量吞吐场景下 AWQ + vLLM 更强。向导会按你选择的优先级加权。',
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
        en: 'Every row is labelled with how its number was arrived at. **Estimated** rows are recomputed by the same function the calculator uses, at the context length you set — two models can swap places as context grows if their KV cache shapes differ. **Published** rows are fixed figures from the release and do not move with the controls. **Spec** rows are properties of the model. Speed is tokens per second on an RTX 4090 at batch 1. Quality loss is perplexity increase against the unquantized weights, so lower is better, and the absolute value is only comparable within one model.',
        zh: '每一行都标注了数字的来源。**预估**行由计算器所用的同一个函数、按你设定的上下文重新计算 —— 如果两个模型的 KV 缓存形状不同，随着上下文增长它们的排序可能对调。**已发布**行是发布方给出的固定数字，不随控件变化。**规格**行是模型自身属性。速度是 RTX 4090、batch=1 下的每秒 token 数。质量损失是相对未量化权重的困惑度上升，越低越好，且绝对值只在同一模型内部可比。',
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

export const feelContent: ToolContent = {
  summary: {
    en: 'Stream one sentence at a card\'s measured or scaled token rate, side by side with another card. Bandwidth ceilings are labelled and are not played back as a speed.',
    zh: '按一张卡的实测或缩放后的 token 速度把一句话流出来，并和另一张卡并排。带宽天花板只标注，不拿来当速度播放。',
  },
  sections: [
    {
      heading: { en: 'What is allowed to move the text', zh: '什么情况下才会播字' },
      body: {
        en: 'Three labels, and only the first two stream. **Measured** is a row in this site\'s benchmark matrix for that exact card, model and quant (prompt 128, generation 128, one sequence). **Derived** is a range: the card\'s own Llama 2 7B Q4_0 generation speed, scaled by how many bytes this quant reads per token, with the checked error 0.99–1.31. Text streams at the low end of that range. **Ceiling** is memory bandwidth divided by the bytes read per token — for a mixture-of-experts model, only the active parameters, not the whole file. It is an upper bound. Similar MoE models measured on an RTX 4090 landed near a quarter of that bound, so a ceiling never streams.',
        zh: '三种标签，只有前两种会播字。**实测**是本站基准表里同一张卡、同一个模型、同一档量化的一行（提示 128，生成 128，单条）。**推算**是一个范围：用这张卡自己的 Llama 2 7B Q4_0 生成速度，按这一档每个 token 要读的字节数缩放，误差范围是已核对的 0.99–1.31。字按范围的低端流出。**天花板**是显存带宽除以每个 token 读取的字节数——混合专家模型只算激活参数，不算整个文件。它是上界。同类模型在 RTX 4090 上的实测大约只有这个上界的四分之一，所以天花板从不播字。',
      },
    },
    {
      heading: { en: 'Context changes the wait, not the range', zh: '上下文改变的是等待，不是那个范围' },
      body: {
        en: 'Generation rate stays put when you change context, because decode is bound by reading the weights. What changes is the KV cache and the time to first token, which is this card\'s measured Llama 2 7B prompt speed scaled by the model\'s compute. A card with no published prefill row shows no wait. If the estimate exceeds the memory this machine can use — about 75% of unified memory on a Mac, the whole pool on a discrete card — streaming stops. Partial offload to system RAM is not modelled here.',
        zh: '改上下文时，生成速度的范围不变，因为解码的瓶颈是把权重读一遍。变的是 KV 缓存和首 token 时间：用这张卡实测的 Llama 2 7B 提示词速度，按该模型的计算量缩放。没有公开预填充跑分的卡不显示等待。如果估算超过这台机器能用的内存——Mac 统一内存大约 75%，独显则是整块显存——就停止播字。这一版不模拟溢出到系统内存之后的速度。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Why does a 30B mixture-of-experts model not play on a 24 GB card?', zh: '为什么 30B 的混合专家模型在 24 GB 卡上不播字？' },
      a: {
        en: 'Unless that exact card has a measured row, the only number we will stand behind is the bandwidth ceiling on the active parameters. Playing that number would look several times too fast. The RTX 4090 row for Qwen3 30B-A3B Q4_K_M is a real measurement, so that one card does stream.',
        zh: '除非这张卡自己有一行实测，否则我们只给出按激活参数算出的带宽天花板。拿那个数字去播，会比真实速度快好几倍。RTX 4090 上 Qwen3 30B-A3B Q4_K_M 有实测，所以那一张卡会播。',
      },
    },
    {
      q: { en: 'Can I share what I am looking at?', zh: '可以分享当前看到的组合吗？' },
      a: {
        en: 'Yes. Both cards, the model, the quant and the context length are in the URL.',
        zh: '可以。两张卡、模型、量化档位和上下文长度都在 URL 里。',
      },
    },
  ],
};

/*
 * The three question pages (`/tools/speed/`, `/tools/which-quant/`,
 * `/tools/context-length/`). Their tables are computed by
 * `lib/utils/question-pages.ts` from the calculator's own functions; this copy
 * explains the method and carries no figure that could drift from the data
 * (formula constants and documented runtime defaults only).
 */
export const speedQContent: ToolContent = {
  summary: {
    en: 'Tokens per second for the models that fit the most common cards: a calibrated estimate from each card\'s own measured run, and the upper bound its memory bandwidth sets.',
    zh: '最常见几张卡上、能装下的模型每秒能生成多少 token：按每张卡自己的实测跑分校准的估计值，以及显存带宽决定的上限。',
  },
  sections: [
    {
      heading: { en: 'Why memory bandwidth sets the limit', zh: '为什么显存带宽决定上限' },
      body: {
        en: 'To generate one token, a dense model reads every one of its weights from memory once. So **tokens per second can never exceed `bandwidth ÷ weight bytes`**: an RTX 4090 moves about 1 TB/s, and a model whose weights take 10 GB cannot pass about 100 tokens per second on it, however fast the compute is. That is why a smaller quant level is faster as well as smaller, and why a card with more bandwidth but the same memory runs the same model faster. A mixture-of-experts model reads only the experts each token is routed to, so its bound is computed over the active parameters and is much higher.',
        zh: '稠密模型每生成一个 token，都要把全部权重从显存里读一遍。所以**每秒 token 数永远不可能超过 `带宽 ÷ 权重字节数`**：RTX 4090 每秒约能搬运 1 TB，一个权重占 10 GB 的模型在它上面最多约每秒 100 个 token，算力再强也一样。这也是为什么更小的量化档位不仅更省显存、也更快；以及为什么显存一样但带宽更高的卡，跑同一个模型会更快。MoE（混合专家）模型每个 token 只读取被路由到的专家，所以它的上限按激活参数计算，会高得多。',
      },
    },
    {
      heading: { en: 'Why the estimate sits below the bound', zh: '为什么估计值低于上限' },
      body: {
        en: 'No runtime reaches its card\'s peak bandwidth: kernels, drivers and per-token overhead all cost something, and how much differs by card. So the estimate starts from what this card actually did — its `tg128` result for Llama 2 7B Q4_0 on llama.cpp\'s community scoreboards — and scales it by how many more or fewer bytes the chosen model reads per token. Checked against the dense GGUF runs in this site\'s benchmark table, real speeds landed between 0.99× and 1.31× of the estimate, which is the range printed beside it. Outside dense 7–33B GGUF models that check does not apply, so those rows show the bound alone.',
        zh: '没有哪个运行时能跑满显卡的峰值带宽：计算内核、驱动和每个 token 的固定开销都要占时间，而且每张卡损耗不同。所以估计值从这张卡自己的实测出发 —— 它在 llama.cpp 社区跑分里 Llama 2 7B Q4_0 的 `tg128` 结果 —— 再按所选模型每个 token 要多读或少读多少字节来缩放。用本站基准表里的稠密 GGUF 实测数据核对，真实速度落在估计值的 0.99 到 1.31 倍之间，这就是估计值旁边印的范围。超出 7–33B 稠密 GGUF 模型的范围，这个核对就不适用，那些行只给上限。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Why do some rows show only an upper bound?', zh: '为什么有些行只有上限，没有估计值？' },
      a: {
        en: 'The estimate is calibrated on llama.cpp runs of GGUF files from dense 7–33B models. A row whose recommended level is AWQ or GPTQ (run by vLLM), a mixture-of-experts model, or a model outside that size range has not been checked against a real run, so it gets the bandwidth bound only — a printed guess would look as reliable as the checked figures and would not be.',
        zh: '估计值是用 7–33B 稠密模型的 GGUF 文件在 llama.cpp 上的实测校准的。推荐档位是 AWQ 或 GPTQ（由 vLLM 运行）的行、MoE 模型，以及超出这个体量范围的模型，都没有和真实跑分核对过，所以只给带宽上限 —— 硬印一个猜测值，看起来会和核对过的数字一样可靠，但它并不是。',
      },
    },
    {
      q: { en: 'Does a long prompt or a long conversation slow it down?', zh: '提示词或对话很长时会变慢吗？' },
      a: {
        en: 'Yes. These figures are for generating with a nearly empty context, which is what `tg128` measures. As the context grows each token also reads more of the KV cache, so generation slows, and a long prompt adds a wait before the first token appears. The VRAM calculator shows that wait separately, from each card\'s measured prompt-processing speed.',
        zh: '会。这里的数字对应上下文几乎为空时的生成速度，也就是 `tg128` 测的情况。上下文变长后，每个 token 还要多读 KV 缓存，生成会变慢；很长的提示词还会让第一个字出现之前多等一段时间。显存计算器会根据每张卡实测的提示词处理速度，单独给出这个等待时间。',
      },
    },
    {
      q: { en: 'Do two cards make it twice as fast?', zh: '插两张卡会快一倍吗？' },
      a: {
        en: 'Not with the default setup. llama.cpp and Ollama split a model across cards by layers, and the cards take turns on every token, so the speed bound stays that of one card; a second card buys capacity — a bigger model or a longer context — not speed. Tensor-parallel serving in vLLM can scale speed, at the cost of a fast link between the cards.',
        zh: '默认设置下不会。llama.cpp 和 Ollama 按层把模型拆到几张卡上，每个 token 都要几张卡轮流算一遍，所以速度上限仍是一张卡的水平；第二张卡换来的是容量 —— 能放更大的模型或更长的上下文 —— 而不是速度。vLLM 的张量并行可以提升速度，但需要卡与卡之间有高速互联。',
      },
    },
  ],
};

export const quantQContent: ToolContent = {
  summary: {
    en: 'Which quant level to download for each recommended model on the most common cards: every level sized at 4K context, and the highest-quality one that fits comfortably.',
    zh: '最常见几张卡上，每个推荐模型该下载哪个量化档位：所有档位在 4K 上下文下的显存，以及能从容装下的最高质量那一档。',
  },
  sections: [
    {
      heading: { en: 'How the pick is made', zh: '推荐档位是怎么选出来的' },
      body: {
        en: 'Every level the model is published at is sized with the VRAM calculator at 4K context, then judged against the card: green is at most 88% of it, amber up to 105%, and a format the card\'s runtime cannot read is out at any size. Of the green levels, the pick is the most faithful one: the lowest published perplexity rise when the level has one, otherwise the most bits per weight — within one model more bits is closer to the original, which is the only ordering the data supports when no perplexity was published. It is the same rule the calculator\'s "Best fit" uses, so the two always agree.',
        zh: '模型发布的每个量化档位，都用显存计算器按 4K 上下文算出显存，再和显卡比较：不超过显存 88% 为绿色，最多到 105% 为黄色；这张卡的运行时读不了的格式，无论多大都排除。在绿色档位里，选最接近原模型的那一档：有公开困惑度增幅的，取增幅最小的；没有的，取每权重比特数最高的 —— 同一个模型，比特数越高越接近原版，这是在没有困惑度数据时数据唯一能支持的排序。这与计算器的"最佳选择"用的是同一条规则，所以两边永远一致。',
      },
    },
    {
      heading: { en: 'What the level names mean', zh: '这些档位名称是什么意思' },
      body: {
        en: 'The number is roughly the bits stored per weight. GGUF `Q8_0` keeps about 8.5 bits, `Q6_K` about 6.6, `Q5_K_M` about 5.7, `Q4_K_M` about 4.9 and `Q3_K_M` about 3.9; the file shrinks in step, and the perplexity rise grows as the bits fall. `AWQ INT4` and `GPTQ INT4` are 4-bit formats that vLLM runs, usually a little smaller than `Q4_K_M`. A model released in a native low-bit format, such as GPT-OSS in `MXFP4`, has no full-precision original to lose against, so that level is the reference.',
        zh: '数字大致是每个权重存储的比特数。GGUF 的 `Q8_0` 约 8.5 比特，`Q6_K` 约 6.6，`Q5_K_M` 约 5.7，`Q4_K_M` 约 4.9，`Q3_K_M` 约 3.9；文件大小随之等比缩小，比特数越低，困惑度增幅越大。`AWQ INT4` 和 `GPTQ INT4` 是由 vLLM 运行的 4 比特格式，通常比 `Q4_K_M` 略小。以原生低比特格式发布的模型（比如以 `MXFP4` 发布的 GPT-OSS）没有可供对比的全精度原版，所以发布的那一档本身就是基准。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Q4 or Q5 — which should I pick?', zh: 'Q4 和 Q5 该选哪个？' },
      a: {
        en: 'If both are green on your card at the context you need, take the higher one: it is closer to the original model and costs only memory you have spare. If only Q4 is green, take Q4 rather than a tight Q5 — a level that barely loads leaves no room for context, and the runtime may push layers to system memory, which is far slower. Where a model\'s perplexity is published for both levels, its own page shows the difference.',
        zh: '如果在你需要的上下文长度下两档都是绿色，就选高的那档：它更接近原模型，多占的只是你本来就空着的显存。如果只有 Q4 是绿色，就选 Q4，而不要选偏紧的 Q5 —— 勉强能加载的档位没有上下文余量，运行时还可能把部分层挪到内存里，速度会慢得多。模型对两档都公布了困惑度的，它自己的页面上能看到差别。',
      },
    },
    {
      q: { en: 'Why does the pick change when I raise the context?', zh: '为什么上下文开大后推荐档位会变？' },
      a: {
        en: 'The weights stay the same size at any context, but the KV cache grows with every token of context, and it shares the card with them. A level that is green at 4K can turn amber at 32K, and the pick moves down a level to make room. The context-length page shows how far each pick stretches; the calculator recomputes the pick at whatever context you set.',
        zh: '权重大小不随上下文变化，但 KV 缓存会随上下文每多一个 token 而增长，并且和权重共用显存。4K 时是绿色的档位，到 32K 可能就变黄，推荐档位就会降一档来腾出空间。上下文长度页面列出了每个推荐档位能开到多长；计算器会按你设置的上下文重新选档。',
      },
    },
    {
      q: { en: 'Why is the pick AWQ on some cards, and can I use it on Windows?', zh: '为什么有些卡推荐的是 AWQ？Windows 上能用吗？' },
      a: {
        en: 'AWQ INT4 stores every layer at 4 bits, so it is smaller than GGUF `Q4_K_M` and can be the only level that fits a card comfortably. It runs in vLLM, which needs Linux or WSL2 — Ollama and LM Studio on native Windows load GGUF only. If that is your setup, take the best GGUF row in the table instead, even if it is amber, and keep the context short.',
        zh: 'AWQ INT4 每一层都存成 4 比特，所以比 GGUF 的 `Q4_K_M` 更小，有时是唯一能从容装进这张卡的档位。它要用 vLLM 运行，需要 Linux 或 WSL2 —— Windows 原生的 Ollama 和 LM Studio 只能加载 GGUF。如果你是这种环境，就选表里最好的 GGUF 档位，即使它是黄色，也把上下文开短一些。',
      },
    },
  ],
};

export const contextQContent: ToolContent = {
  summary: {
    en: 'The longest context each recommended model keeps comfortably on the most common cards, with the default fp16 KV cache and with the cache quantized to q8_0 or q4_0.',
    zh: '最常见几张卡上，每个推荐模型能从容开到的最长上下文 —— 分别列出默认 fp16 KV 缓存，以及缓存量化为 q8_0、q4_0 后的结果。',
  },
  sections: [
    {
      heading: { en: 'Why context costs memory', zh: '为什么上下文会占显存' },
      body: {
        en: 'Every token of context leaves a key and a value vector in every layer that keeps a cache: `2 × layers × kv_heads × head_dim × bytes` per token. Two models of the same size can differ several-fold here. Grouped-query attention shares one KV head between several attention heads; sliding-window layers keep only a fixed window; hybrid models such as Qwen3.5/3.6 keep a growing cache in a quarter of their layers. That is why some models reach their full window on a card where a same-size model stops at a few thousand tokens. Each figure here is found by running the calculator itself at every step, not by inverting the formula.',
        zh: '上下文里的每个 token，都会在每个保留缓存的层里留下一组 K 和 V 向量：每个 token 占 `2 × 层数 × kv_heads × head_dim × 字节数`。同样大小的两个模型，这里可以相差好几倍。分组查询注意力让多个注意力头共用一个 KV 头；滑动窗口层只保留固定长度的窗口；Qwen3.5/3.6 这样的混合架构只在四分之一的层里保留随上下文增长的缓存。所以同一张卡上，有的模型能开满整个窗口，同样大小的另一个模型却只能开几千 token。这里每个数字都是让计算器本身逐档计算得出的，而不是把公式倒推出来。',
      },
    },
    {
      heading: { en: 'Quantizing the KV cache', zh: '把 KV 缓存量化' },
      body: {
        en: 'The cache does not have to be fp16. ggml\'s `q8_0` stores 32 values in 34 bytes, about 53% of fp16, and `q4_0` stores them in 18, about 28%. Ollama\'s documentation describes `q8_0` as a very small loss in precision that usually has no noticeable impact, and `q4_0` as a small-to-medium loss that may be more noticeable at long contexts, varying by model. Both runtimes need Flash Attention for it. In llama.cpp pass `-ctk q8_0 -ctv q8_0` (the default `-fa auto` turns Flash Attention on); in Ollama set `OLLAMA_KV_CACHE_TYPE=q8_0` on the server, which applies to every model it loads.',
        zh: 'KV 缓存不一定要用 fp16。ggml 的 `q8_0` 用 34 字节存 32 个值，约为 fp16 的 53%；`q4_0` 用 18 字节，约 28%。Ollama 的文档说，`q8_0` 精度损失很小，通常对模型质量没有明显影响；`q4_0` 有小到中等的损失，上下文越长可能越明显，具体因模型而异。两个运行时都需要开启 Flash Attention。llama.cpp 里加 `-ctk q8_0 -ctv q8_0`（默认的 `-fa auto` 会自动开启 Flash Attention）；Ollama 在服务端设置 `OLLAMA_KV_CACHE_TYPE=q8_0`，它会作用于加载的所有模型。',
      },
    },
  ],
  faqs: [
    {
      q: { en: 'Is a q8_0 cache worth it?', zh: 'q8_0 缓存值得开吗？' },
      a: {
        en: 'For long documents and code, usually yes: it roughly doubles the context that fits for the cache\'s share of memory, and Ollama\'s own documentation calls the precision loss very small. `q4_0` stretches further but its loss is larger and more visible at long contexts, so try it on your own task before relying on it.',
        zh: '处理长文档和代码时，通常值得：缓存所占的那部分显存能多装大约一倍的上下文，而且 Ollama 自己的文档说它的精度损失很小。`q4_0` 能开得更长，但损失更大，上下文越长越明显，所以要先在你自己的任务上试过再依赖它。',
      },
    },
    {
      q: { en: 'Why does a model stop at "full window" even with memory to spare?', zh: '为什么显存还有剩余，模型却停在"满窗口"？' },
      a: {
        en: 'Because that is the longest context the model was trained or configured for; this page never sizes a model past its own window. Runtimes may let you set a longer context, but the model was not built to use it, and answers past the window degrade.',
        zh: '因为那是模型训练或配置支持的最长上下文；本页从不按超过模型自身窗口的长度来计算。运行时也许允许你设得更长，但模型并不是为此设计的，超出窗口后回答质量会下降。',
      },
    },
    {
      q: { en: 'Does llama.cpp use this much context by default?', zh: 'llama.cpp 默认会开这么长的上下文吗？' },
      a: {
        en: 'Recent llama.cpp starts from the model\'s trained context when you omit `-c`, then trims it to fit the card, and Ollama picks its own default. Set the context yourself (`-c 32768` in llama.cpp, `num_ctx` in Ollama) so you get the length you planned for rather than whatever the runtime settled on.',
        zh: '新版 llama.cpp 在不加 `-c` 时会从模型训练时的上下文长度开始，再裁剪到显卡装得下；Ollama 有它自己的默认值。最好自己设定上下文（llama.cpp 用 `-c 32768`，Ollama 用 `num_ctx`），这样得到的是你计划的长度，而不是运行时自己定下的值。',
      },
    },
  ],
};
