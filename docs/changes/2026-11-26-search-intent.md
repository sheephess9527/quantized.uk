# 2026-11-26 搜索入口文案与自检

依据站主提供的 2026-08-22 至 2026-11-21 Search Console 和必应数据，按 P0、P1、P2 更新。本记录从本地生产构建提取实际的 title、description、H1 和首段。所有目标 URL 均存在。P1 范围为五篇英文教程。显存组覆盖计算器、5 个独立显存档位及 3 个显存选型页。

## 英文 · P0

### URL → `/benchmarks/`

**title** → Local LLM Quantization Benchmarks | quantized.uk

**description** → Compare measured speed and VRAM for local LLM quants on RTX 4090, RTX 3090 and Apple silicon. Filter by hardware, model, runtime or quantization.

**H1** → Local LLM Quantization Benchmarks

**首屏改写要点**

- Compare measured tokens per second and VRAM across tested models, quantization levels, hardware and runtimes. Filter the table for setups close to yours, then check the recorded runtime version before applying a result.

### URL → `/tools/vram-calc/`

**title** → LLM VRAM Calculator: What Fits Your GPU? | quantized.uk

**description** → Pick a GPU to find local LLMs that fit, or estimate VRAM and RAM for a model at a chosen quant and context. Paste a GGUF link to use its exact size.

**H1** → LLM VRAM Calculator

**首屏改写要点**

- Pick your GPU to see which local LLMs and quants fit. If you already know the model, choose its quantization and context length to estimate VRAM or RAM, or paste a GGUF file link to use its exact size.
- 手机端短文案：Pick a GPU to see what fits, or choose a model and quant to estimate memory.

### URL → `/best/8gb-vram/`

**title** → Local LLMs for 8GB VRAM | quantized.uk

**description** → Compare local LLM sizes and quantization levels for 8GB VRAM at 4K context. See estimated headroom and picks for chat, coding and images.

**H1** → Local LLMs for 8GB VRAM

**首屏改写要点**

- At 4K context, the largest catalog model estimated to fit with headroom at Q4_K_M is Qwen3.5 9B (9B). Compare the recommended quants and the headroom they leave below.

### URL → `/best/12gb-vram/`

**title** → Local LLMs for 12GB VRAM | quantized.uk

**description** → Compare local LLM sizes and quantization levels for 12GB VRAM at 4K context. See estimated headroom and picks for chat, coding and images.

**H1** → Local LLMs for 12GB VRAM

**首屏改写要点**

- At 4K context, the largest catalog model estimated to fit with headroom at Q4_K_M is DeepSeek-Coder-V2-Lite Instruct (16B-A2.4B). Compare the recommended quants and the headroom they leave below.

### URL → `/best/16gb-vram/`

**title** → Local LLMs for 16GB VRAM | quantized.uk

**description** → Compare local LLM sizes and quantization levels for 16GB VRAM at 4K context. See estimated headroom and picks for chat, coding and images.

**H1** → Local LLMs for 16GB VRAM

**首屏改写要点**

- At 4K context, the largest catalog model estimated to fit with headroom at Q4_K_M is GPT-OSS 20B (21B MoE). Compare the recommended quants and the headroom they leave below.

### URL → `/best/24gb-vram/`

**title** → Local LLMs for 24GB VRAM | quantized.uk

**description** → Compare local LLM sizes and quantization levels for 24GB VRAM at 4K context. See estimated headroom and picks for chat, coding and images.

**H1** → Local LLMs for 24GB VRAM

**首屏改写要点**

- At 4K context, the largest catalog model estimated to fit with headroom at Q4_K_M is Qwen3-Coder 30B-A3B Instruct (30B-A3B). Compare the recommended quants and the headroom they leave below.

### URL → `/best/32gb-vram/`

**title** → Local LLMs for 32GB VRAM | quantized.uk

**description** → Compare local LLM sizes and quantization levels for 32GB VRAM at 4K context. See estimated headroom and picks for chat, coding and images.

**H1** → Local LLMs for 32GB VRAM

**首屏改写要点**

- At 4K context, the largest catalog model estimated to fit with headroom at Q4_K_M is Recursive Flint 40B-A2.5B (40B-A2.5B). Compare the recommended quants and the headroom they leave below.

### URL → `/what-llm-can-i-run-locally/`

**title** → Which Local LLM Fits My GPU? | quantized.uk

**description** → Select your exact GPU and context length to find local LLM sizes and quantization levels within its memory budget. Compare options before downloading.

**H1** → Which Local LLM Fits My GPU?

**首屏改写要点**

- Select your exact GPU and context length to find local LLM sizes and quantization levels within its memory budget. Compare options before downloading.

### URL → `/best-llm-to-run-locally/`

**title** → Local LLM Picks for 8–32GB VRAM | quantized.uk

**description** → Start with your GPU memory tier, then compare local LLM picks for chat, coding and images. See quantization levels and estimated memory at 4K.

**H1** → Local LLM Picks for 8–32GB VRAM

**首屏改写要点**

- Start with your GPU memory tier, then compare local LLM picks for chat, coding and images. See quantization levels and estimated memory at 4K.

### URL → `/local-llm-gpu-requirements/`

**title** → Local LLM VRAM Requirements by Model Size | quantized.uk

**description** → Compare five GPUs with different local LLM sizes at 4K context. Each example names a model and quantization that fits with estimated memory headroom.

**H1** → Local LLM VRAM Requirements by Model Size

**首屏改写要点**

- Compare five GPUs with different local LLM sizes at 4K context. Each example names a model and quantization that fits with estimated memory headroom.

## 英文 · P1

### URL → `/cookbook/amd-rocm-llamacpp/`

**title** → llama.cpp ROCm Setup for AMD Radeon GPUs | quantized.uk

**description** → Check your Radeon GPU and ROCm support first. Build llama.cpp with HIP on Linux, pick a Windows ROCm ZIP, or use Vulkan to run a GGUF model.

**H1** → Set Up llama.cpp on AMD Radeon with ROCm or Vulkan

**首屏改写要点**

- Check your Radeon GPU and ROCm support first. Build llama.cpp with HIP on Linux, pick a Windows ROCm ZIP, or use Vulkan to run a GGUF model.

### URL → `/cookbook/llamacpp-windows-cuda/`

**title** → llama.cpp CUDA Setup on Windows | quantized.uk

**description** → On x64 Windows with an NVIDIA GPU, select the matching llama.cpp CUDA and runtime ZIPs. Check GPU detection, launch a GGUF model, and fix missing DLLs.

**H1** → Install llama.cpp with CUDA on Windows

**首屏改写要点**

- On x64 Windows with an NVIDIA GPU, select the matching llama.cpp CUDA and runtime ZIPs. Check GPU detection, launch a GGUF model, and fix missing DLLs.

### URL → `/cookbook/wsl2-ollama-gpu/`

**title** → Ollama NVIDIA GPU Setup in Windows WSL2 | quantized.uk

**description** → On Windows with an NVIDIA GPU, run nvidia-smi in WSL2 to check passthrough. Install Ollama in Ubuntu, start the server, then check GPU use with ollama ps.

**H1** → Set Up Ollama on an NVIDIA GPU in Windows WSL2

**首屏改写要点**

- On Windows with an NVIDIA GPU, run nvidia-smi in WSL2 to check passthrough. Install Ollama in Ubuntu, start the server, then check GPU use with ollama ps.

### URL → `/cookbook/intel-arc-llamacpp/`

**title** → llama.cpp Setup on Intel Arc: SYCL or Vulkan | quantized.uk

**description** → Check your Intel Arc GPU and driver, then choose SYCL or Vulkan for llama.cpp. Use a prebuilt ZIP on Windows or build on Linux and list devices.

**H1** → Set Up llama.cpp on Intel Arc with SYCL or Vulkan

**首屏改写要点**

- Check your Intel Arc GPU and driver, then choose SYCL or Vulkan for llama.cpp. Use a prebuilt ZIP on Windows or build on Linux and list devices.

### URL → `/cookbook/cpu-inference-optimization/`

**title** → llama.cpp CPU Setup on Linux and VPS | quantized.uk

**description** → Check physical cores on a Linux PC or CPU-only VPS. Run a GGUF with llama.cpp and use llama-bench to test thread counts and where OpenBLAS helps.

**H1** → Tune llama.cpp on a CPU-Only Linux PC or VPS

**首屏改写要点**

- Check physical cores on a Linux PC or CPU-only VPS. Run a GGUF with llama.cpp and use llama-bench to test thread counts and where OpenBLAS helps.

## 英文 · P2

### URL → `/quant-hub/`

**title** → GGUF Models & VRAM Requirements | quantized.uk

**description** → Find GGUF and other quantized model files, compare estimated VRAM by quant, and filter the catalog by model, format or GPU before downloading.

**H1** → Quantized Models: GGUF and VRAM

**首屏改写要点**

- Look up a model to compare GGUF and other quantized files, find download sources, and check estimated VRAM by quantization.
- 快捷入口：[Qwen3 8B](https://quantized.uk/quant-hub/qwen3-8b/) · [VRAM Calculator](https://quantized.uk/tools/vram-calc/) · [RTX 4090](https://quantized.uk/gpu/rtx-4090/)

## 中文 · P0

### URL → `/zh/benchmarks/`

**title** → 本地大模型量化实测：速度与显存 | quantized.uk

**description** → 比较 RTX 4090、RTX 3090 和 Apple 芯片上的本地大模型实测速度与显存。按硬件、模型、运行时和量化档位筛选。

**H1** → 本地大模型量化实测：速度与显存

**首屏改写要点**

- 按硬件、模型、运行时和量化档位筛选实测，比较生成速度和显存占用。先找接近自己设备的组合，再查看测试所用的运行时版本。

### URL → `/zh/tools/vram-calc/`

**title** → 本地大模型显存计算器：能跑多大？ | quantized.uk

**description** → 按显卡和可用显存估算能跑多大的本地大模型、哪些量化档位能装下。可调整上下文，或粘贴 GGUF 文件链接按实际大小估算。

**H1** → 本地大模型显存计算器：能跑多大？

**首屏改写要点**

- 先选显卡，按显存查能跑多大的本地大模型和可用量化档位。也可以选模型并调整上下文，或粘贴 GGUF 文件链接，估算需要多少显存或内存。
- 手机端短文案：选显卡，看能跑多大的本地大模型；选模型和量化档位，估算显存。

### URL → `/zh/best/8gb-vram/`

**title** → 8GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按 8GB 显存估算 4K 上下文能跑的本地大模型大小、量化档位和显存余量。查看聊天、写代码和看图的配置建议。

**H1** → 8GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按 4K 上下文估算，目录中用 Q4_K_M 且还能留出显存余量的最大模型是 Qwen3.5 9B（9B）。下方可按用途对照量化档位和显存余量。

### URL → `/zh/best/12gb-vram/`

**title** → 12GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按 12GB 显存估算 4K 上下文能跑的本地大模型大小、量化档位和显存余量。查看聊天、写代码和看图的配置建议。

**H1** → 12GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按 4K 上下文估算，目录中用 Q4_K_M 且还能留出显存余量的最大模型是 DeepSeek-Coder-V2-Lite Instruct（16B-A2.4B）。下方可按用途对照量化档位和显存余量。

### URL → `/zh/best/16gb-vram/`

**title** → 16GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按 16GB 显存估算 4K 上下文能跑的本地大模型大小、量化档位和显存余量。查看聊天、写代码和看图的配置建议。

**H1** → 16GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按 4K 上下文估算，目录中用 Q4_K_M 且还能留出显存余量的最大模型是 GPT-OSS 20B（21B MoE）。下方可按用途对照量化档位和显存余量。

### URL → `/zh/best/24gb-vram/`

**title** → 24GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按 24GB 显存估算 4K 上下文能跑的本地大模型大小、量化档位和显存余量。查看聊天、写代码和看图的配置建议。

**H1** → 24GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按 4K 上下文估算，目录中用 Q4_K_M 且还能留出显存余量的最大模型是 Qwen3-Coder 30B-A3B Instruct（30B-A3B）。下方可按用途对照量化档位和显存余量。

### URL → `/zh/best/32gb-vram/`

**title** → 32GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按 32GB 显存估算 4K 上下文能跑的本地大模型大小、量化档位和显存余量。查看聊天、写代码和看图的配置建议。

**H1** → 32GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按 4K 上下文估算，目录中用 Q4_K_M 且还能留出显存余量的最大模型是 Recursive Flint 40B-A2.5B（40B-A2.5B）。下方可按用途对照量化档位和显存余量。

### URL → `/zh/what-llm-can-i-run-locally/`

**title** → 我的显存能跑多大的本地大模型？ | quantized.uk

**description** → 选择显卡，按可用显存和上下文估算本地大模型能跑多大、哪些量化档位有余量。也可切换图像输入后重新估算。

**H1** → 我的显存能跑多大的本地大模型？

**首屏改写要点**

- 选择显卡，按可用显存和上下文估算本地大模型能跑多大、哪些量化档位有余量。也可切换图像输入后重新估算。

### URL → `/zh/best-llm-to-run-locally/`

**title** → 8–32GB 显存能跑多大的本地大模型？ | quantized.uk

**description** → 按显存容量和用途，对照能跑多大的本地大模型、建议量化档位和 4K 上下文显存估算。可进入各档位查看详细推荐。

**H1** → 8–32GB 显存能跑多大的本地大模型？

**首屏改写要点**

- 按显存容量和用途，对照能跑多大的本地大模型、建议量化档位和 4K 上下文显存估算。可进入各档位查看详细推荐。

### URL → `/zh/local-llm-gpu-requirements/`

**title** → 本地大模型显存对照表：能跑多大？ | quantized.uk

**description** → 按显卡和模型参数量对照，估算 4K 上下文能跑多大的本地大模型。每个示例列出量化档位和预计显存，并链接到模型详情。

**H1** → 本地大模型显存对照表：能跑多大？

**首屏改写要点**

- 按显卡和模型参数量对照，估算 4K 上下文能跑多大的本地大模型。每个示例列出量化档位和预计显存，并链接到模型详情。

## 中文 · P2

### URL → `/zh/quant-hub/`

**title** → 量化模型库：查 GGUF 和显存需求 | quantized.uk

**description** → 按模型查找 GGUF 等量化版本、文件来源和预计显存。也可按显卡和量化格式筛选，再查看模型详情与下载入口。

**H1** → 量化模型库：按模型查 GGUF 和显存

**首屏改写要点**

- 查模型的 GGUF 等量化档位、文件来源和显存估算。也可以先选显卡，再筛适合的模型。
- 快捷入口：[Qwen3 8B](https://quantized.uk/zh/quant-hub/qwen3-8b/) · [显存计算器](https://quantized.uk/zh/tools/vram-calc/) · [RTX 4090](https://quantized.uk/zh/gpu/rtx-4090/)

## 自检表

字符数含品牌与标点。显示宽度按仓库规则计算，中日韩字符计两格。标题每页最多 60 个字符与 60 格，摘要最多 155 个字符与 160 格。

| URL | 含核心意图词 | title 字符 / 宽度 | description 字符 / 宽度 | 与真实内容一致 | 有性能夸大 |
| --- | --- | ---: | ---: | --- | --- |
| `/benchmarks/` | 是 | 48 / 48 · 通过 | 145 / 145 · 通过 | 是 | 无 |
| `/tools/vram-calc/` | 是 | 55 / 55 · 通过 | 148 / 148 · 通过 | 是 | 无 |
| `/best/8gb-vram/` | 是 | 38 / 38 · 通过 | 137 / 137 · 通过 | 是 | 无 |
| `/best/12gb-vram/` | 是 | 39 / 39 · 通过 | 138 / 138 · 通过 | 是 | 无 |
| `/best/16gb-vram/` | 是 | 39 / 39 · 通过 | 138 / 138 · 通过 | 是 | 无 |
| `/best/24gb-vram/` | 是 | 39 / 39 · 通过 | 138 / 138 · 通过 | 是 | 无 |
| `/best/32gb-vram/` | 是 | 39 / 39 · 通过 | 138 / 138 · 通过 | 是 | 无 |
| `/what-llm-can-i-run-locally/` | 是 | 43 / 43 · 通过 | 150 / 150 · 通过 | 是 | 无 |
| `/best-llm-to-run-locally/` | 是 | 46 / 46 · 通过 | 142 / 142 · 通过 | 是 | 无 |
| `/local-llm-gpu-requirements/` | 是 | 56 / 56 · 通过 | 149 / 149 · 通过 | 是 | 无 |
| `/cookbook/amd-rocm-llamacpp/` | 是 | 55 / 55 · 通过 | 140 / 140 · 通过 | 是 | 无 |
| `/cookbook/llamacpp-windows-cuda/` | 是 | 46 / 46 · 通过 | 151 / 151 · 通过 | 是 | 无 |
| `/cookbook/wsl2-ollama-gpu/` | 是 | 54 / 54 · 通过 | 154 / 154 · 通过 | 是 | 无 |
| `/cookbook/intel-arc-llamacpp/` | 是 | 59 / 59 · 通过 | 144 / 144 · 通过 | 是 | 无 |
| `/cookbook/cpu-inference-optimization/` | 是 | 51 / 51 · 通过 | 145 / 145 · 通过 | 是 | 无 |
| `/quant-hub/` | 是 | 46 / 46 · 通过 | 142 / 142 · 通过 | 是 | 无 |
| `/zh/benchmarks/` | 是 | 30 / 45 · 通过 | 64 / 103 · 通过 | 是 | 无 |
| `/zh/tools/vram-calc/` | 是 | 31 / 47 · 通过 | 59 / 112 · 通过 | 是 | 无 |
| `/zh/best/8gb-vram/` | 是 | 32 / 45 · 通过 | 55 / 101 · 通过 | 是 | 无 |
| `/zh/best/12gb-vram/` | 是 | 33 / 46 · 通过 | 56 / 102 · 通过 | 是 | 无 |
| `/zh/best/16gb-vram/` | 是 | 33 / 46 · 通过 | 56 / 102 · 通过 | 是 | 无 |
| `/zh/best/24gb-vram/` | 是 | 33 / 46 · 通过 | 56 / 102 · 通过 | 是 | 无 |
| `/zh/best/32gb-vram/` | 是 | 33 / 46 · 通过 | 56 / 102 · 通过 | 是 | 无 |
| `/zh/what-llm-can-i-run-locally/` | 是 | 30 / 45 · 通过 | 50 / 100 · 通过 | 是 | 无 |
| `/zh/best-llm-to-run-locally/` | 是 | 35 / 48 · 通过 | 54 / 104 · 通过 | 是 | 无 |
| `/zh/local-llm-gpu-requirements/` | 是 | 31 / 47 · 通过 | 57 / 110 · 通过 | 是 | 无 |
| `/zh/quant-hub/` | 是 | 33 / 45 · 通过 | 53 / 100 · 通过 | 是 | 无 |

## 验证记录

- 本地 `npm test` 与 `npm run build` 均通过。首次构建的导出脚本仍匹配旧计算器摘要，已同步更新该断言，并完整重跑构建。
- 对照本次查询的生产站点地图和本地导出，两者包含相同的 1,488 个 URL。27 个目标页面均核对了规范链接、标题、摘要、H1 和首段。
- Chromium 390 px 中英文通过基准筛选、三个模型库入口、计算器跳转与反查及 8GB 档位检查。仓库手机端回归同时核对了搜索、筛选和 44 px 操作区。

## Handoff notes

- 文案工作基于主线快照 `d41a135`。沿用原有硬件、量化档位、上下文估算、实测表及部署步骤。新增的三个模型库入口均指向已导出的同语种页面。
- 把受影响页面的 sitemap 日期更新为文案修改日。目录规模、显存计算公式和运行时核查日期沿用原值。自检记录中的数值均来自目录或实测表已有字段。
- 改动放在本地分支 `content/search-intent-2026-11-26`，可审阅构建产物。生产站仍使用原版本。
