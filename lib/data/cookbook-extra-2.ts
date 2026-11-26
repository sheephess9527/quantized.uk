import type { Article } from './cookbook';
import { LLAMACPP_BUILD } from './runtime-build';

const linuxVulkanSetup = 'sudo apt install build-essential cmake libvulkan-dev glslc spirv-headers vulkan-tools\nvulkaninfo --summary\ncmake -S . -B build-vulkan -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release\ncmake --build build-vulkan --parallel\n./build-vulkan/bin/llama-server --list-devices\n./build-vulkan/bin/llama-server -m /path/to/your-model.gguf -ngl all -c 4096 --host 127.0.0.1 --port 8080';

export const extraArticles2: Article[] = [
  {
    id: '8gb-gpu-starter-guide',
    gpuPreset: { gpuId: 'rtx4060', ctx: 4096 },
    relatedModelIds: ['qwen3-5-9b', 'gemma-4-e4b', 'granite-4.2-8b', 'k2-horizon-7b', 'qwen3-5-4b', 'llama-3.1-8b', 'qwen3-8b', 'qwen3-vl-8b', 'phi-4-mini'],
    title: '8GB GPU Starter Guide: 3060 / 4060 / 3070',
    titleZh: '8GB 显卡入门指南：3060 / 4060 / 3070',
    description: 'The most common local LLM hardware tier — which models, quants, and context lengths actually fit in 8GB VRAM.',
    descriptionZh: '最常见的本地 LLM 硬件档位 — 8GB 显存能跑哪些模型、量化和上下文长度。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['8GB VRAM', 'RTX 3060', 'RTX 4060', 'GGUF', 'Ollama'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on this date; see README §9, 2026-09-08. Model list refreshed 2026-10-21.
    updatedAt: '2026-11-03',
    // No `verifiedAt`: the guide previously carried one while its own VRAM
    // figures were ~2 GB above what this site's calculator returns for the
    // same models. The numbers are corrected and now derive from the index,
    // but nothing here has been re-run on an 8 GB card since, so the date is
    // not ours to claim.
    verifiedStack: {
      en: 'Windows or Linux · NVIDIA 8GB (3060 8G / 3070 / 4060 / 4060 Ti 8G) · Ollama or llama.cpp CUDA · GGUF Q4_K_M · 16GB system RAM',
      zh: 'Windows 或 Linux · NVIDIA 8GB（3060 8G / 3070 / 4060 / 4060 Ti 8G）· Ollama 或 llama.cpp CUDA · GGUF Q4_K_M · 16GB 系统内存',
    },
    content: [
      {
        heading: 'Who this is for',
        headingZh: '适用于谁',
        body: 'An 8GB NVIDIA card (RTX 3060 8G, 3070, 4060, 4060 Ti 8G) on Windows or Linux, with a working driver and roughly 16GB of system RAM. Every figure below is for a single stream — batch 1 — at the context length stated. The commands use Ollama; llama.cpp works the same way and is noted where it differs.',
        bodyZh: '一张 8GB 的 NVIDIA 显卡（RTX 3060 8G、3070、4060、4060 Ti 8G），Windows 或 Linux，驱动正常，系统内存约 16GB。下面所有数字都是单路推理（batch 1）在标注上下文长度下的结果。命令以 Ollama 为例；llama.cpp 用法相同，不同之处会另行说明。',
      },
      {
        heading: 'What fits, and what the numbers mean',
        headingZh: '能装下什么，以及这些数字的含义',
        body: 'These are estimates from this site’s VRAM calculator — model weights at the level’s measured bits-per-weight, plus the KV cache for the stated context, plus a 10% activation buffer. They are not measured file sizes and they exclude whatever your desktop is already using, which on Windows is commonly 0.5–1.5GB. That is why the green band stops at 88% of the card rather than 100%. At 4K context an 8GB card runs 7–8B at Q4_K_M with real room to spare; 14B does not fit at Q4_K_M at any context, because the weights alone are over the card.',
        bodyZh: '以下数字来自本站显存计算器的估算：按该量化档位实测的 bits-per-weight 计算权重，加上对应上下文的 KV 缓存，再加 10% 激活缓冲。它们不是实际文件大小，也不包含桌面本身已占用的显存 —— Windows 上通常是 0.5–1.5GB。这也是绿色区间到 88% 就截止、而不是 100% 的原因。4K 上下文下，8GB 显卡跑 7–8B 的 Q4_K_M 有实打实的余量；14B 在任何上下文下都装不进 Q4_K_M，因为光权重就超过整张卡。',
        code: {
          lang: 'text',
          content: 'Model                       Level    Context   Estimate   On 8GB\n----------------------------------------------------------------------\nPhi-4 Mini 3.8B             Q4_K_M   4K        3.0 GB     fits, large margin\nQwen3.5 4B                  Q4_K_M   4K        3.3 GB     fits, large margin\nQwen3 4B                    Q6_K     4K        4.0 GB     fits\nQwen2.5 7B                  Q4_K_M   4K        5.1 GB     fits\nGemma 4 E4B (image, audio)  Q4_K_M   4K        5.3 GB     fits\nLlama 3.1 8B                Q4_K_M   4K        5.6 GB     fits\nQwen3 8B                    Q4_K_M   4K        5.8 GB     fits\nQwen3-VL 8B (image)         Q4_K_M   4K        6.2 GB     fits\nGranite 4.2 8B              Q4_K_M   4K        6.5 GB     fits\nGemma 4 E4B                 Q4_K_M   64K       6.4 GB     fits\nK2 Horizon 7B               Q4_K_M   4K        6.5 GB     fits\nQwen3.5 9B                  Q4_K_M   4K        6.6 GB     fits\nNemotron Bolt E4B (image)   Q4_K_M   4K        6.6 GB     fits\nQwen3.5 9B                  Q4_K_M   16K       7.0 GB     fits\nLlama 3.1 8B                Q4_K_M   16K       7.3 GB     tight — 91% of the card\nGemma 4 E4B                 Q4_K_M   128K      7.5 GB     tight — 93% of the card\nQwen3 14B                   Q4_K_M   2K        9.7 GB     over the card — see below\nQwen2.5 32B                 any      4K        21.7 GB    not on 8GB',
        },
      },
      {
        heading: 'Newer models that hold a long context on 8GB',
        headingZh: '能在 8GB 上撑起长上下文的新模型',
        body: 'On most models only the KV cache grows with context, and on an 8GB card that is what runs out first. Two newer models keep a growing cache on only some of their layers, so they hold far more context in the same space. Qwen3.5 9B at Q4_K_M with a 16K context is about 7.0 GB, still comfortable, because only 8 of its 32 layers keep a growing cache; at 32K it is tight. Gemma 4 E4B at Q4_K_M with a 64K context is about 6.4 GB, comfortable. At its full 128K window it is about 7.5 GB, tight. For comparison, Llama 3.1 8B at Q4_K_M with a 16K context is about 7.3 GB, already tight. If your work is long documents or long chats rather than short questions, start with one of these two.',
        bodyZh: '大多数模型里，随上下文增长的只有 KV 缓存，而在 8GB 显卡上最先用完的正是它。有两个较新的模型只在部分层保留增长的缓存，所以同样的空间能放下多得多的上下文。Qwen3.5 9B 在 Q4_K_M、16K 上下文下约 7.0 GB，仍然宽裕，因为它 32 层中只有 8 层保留增长缓存；到 32K 就偏紧了。Gemma 4 E4B 在 Q4_K_M、64K 上下文下约 6.4 GB，宽裕。用满 128K 窗口约 7.5 GB，偏紧。作为对比，Llama 3.1 8B 在 Q4_K_M、16K 上下文下约 7.3 GB，已经偏紧。如果你主要处理长文档或长对话，而不是简短提问，就从这两个开始。',
      },
      {
        heading: 'What "over the card" actually means',
        headingZh: '“超出显卡容量”到底意味着什么',
        body: 'A 14B at Q4_K_M needs about 9.7GB against 8GB of VRAM. That is not "tight" — it will not load fully on the GPU. Two real options: use the AWQ/GPTQ INT4 build of the same model, which the index puts at about 8.1GB and which is still above the comfortable band, — and note vLLM, which serves those, runs on Linux only (its docs say it does not support Windows natively), so on Windows that route goes through WSL2 — or keep GGUF and offload part of the model to system RAM. Partial offload works and is what Ollama does by default when a model does not fit, but the layers left on the CPU are read over PCIe every token, so throughput falls sharply — how far depends on your PCIe link and RAM speed, and this guide has not measured it on your hardware. Budget for the offloaded weights in system RAM on top of what the OS needs: roughly 2GB for the 14B case above, and keep 16GB total system RAM as the floor.',
        bodyZh: '14B 的 Q4_K_M 约需 9.7GB，而显卡只有 8GB。这不是“勉强”，而是根本无法完整装入 GPU。两条现实路径：改用同一模型的 AWQ/GPTQ INT4 版本（索引给出约 8.1GB，仍高于宽裕区间）—— 注意提供这类服务的 vLLM 只支持 Linux（官方文档写明不原生支持 Windows），所以在 Windows 上要走 WSL2 —— 或者继续用 GGUF 并把一部分模型卸载到系统内存。部分卸载确实可行，Ollama 在装不下时默认就这么做，但留在 CPU 上的层每生成一个 token 都要经 PCIe 读取，吞吐会大幅下降 —— 具体降多少取决于你的 PCIe 带宽和内存速度，本指南没有在你的硬件上实测过。请为卸载出去的权重额外预留系统内存：上面这个 14B 的例子约 2GB，系统内存建议不低于 16GB。',
        code: {
          lang: 'bash',
          content: '# llama.cpp now picks the split itself by default: with -ngl left unset it\n# fits as many layers as it can while keeping 1 GiB of the card free\nllama-server -m qwen3-14b-Q4_K_M.gguf -c 2048 --host 127.0.0.1\n\n# Either way, the log line says what actually landed on the card:\n#   load_tensors: offloaded N/M layers to GPU\n# To choose yourself, pass -ngl (e.g. -ngl 28): fewer layers = less VRAM,\n# slower generation.',
        },
      },
      {
        heading: 'Quick start with Ollama',
        headingZh: 'Ollama 快速上手',
        body: 'Ollama does not pick a quantization to match your VRAM. Pulling a bare tag gives you that tag\'s default build — Q4_K_M for most models — on a 24GB card and an 8GB one alike; ask for a different level by tagging it explicitly. What Ollama does decide automatically is how many layers to put on the GPU, and it will silently fall back to partial CPU offload rather than refuse to load.',
        bodyZh: 'Ollama 并不会根据你的显存自动挑选量化档位。直接 pull 一个裸标签，拿到的是该标签的默认构建 —— 大多数模型是 Q4_K_M —— 24GB 卡和 8GB 卡拿到的是同一个；想要别的档位必须在标签里写明。Ollama 真正会自动决定的是把多少层放到 GPU 上，而且当装不下时，它会静默退回到部分 CPU 卸载，而不是拒绝加载。',
        code: {
          lang: 'bash',
          content: '# Default tag — Q4_K_M, regardless of your card\nollama pull qwen2.5:7b\n\n# Ask for a level explicitly\nollama pull qwen2.5:7b-instruct-q5_K_M\n\nollama run qwen2.5:7b',
        },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'A model that quietly fell back to CPU offload still answers — it is just slow, and that is the single most common "why is local inference so bad" report. Two checks: `ollama ps` prints a PROCESSOR column that reads 100% GPU when the whole model is on the card, or splits (for example 70%/30% CPU/GPU) when it is not; and `nvidia-smi` should show a process holding roughly the estimate above. If PROCESSOR shows any CPU share, drop to a smaller model or a lower level rather than living with it.',
        bodyZh: '静默退回 CPU 卸载的模型照样能回答，只是很慢 —— 这正是“本地推理怎么这么卡”最常见的原因。两个检查点：`ollama ps` 会打印 PROCESSOR 一列，整模型都在显卡上时显示 100% GPU，否则会显示拆分比例（例如 70%/30% CPU/GPU）；`nvidia-smi` 中应能看到一个占用量接近上面估算值的进程。只要 PROCESSOR 里出现 CPU 占比，就换更小的模型或更低的量化档位，不要将就。',
        code: {
          lang: 'bash',
          content: 'ollama ps\n# NAME          ID     SIZE    PROCESSOR   UNTIL\n# qwen2.5:7b    <id>   ...     100% GPU    4 minutes from now\n\nnvidia-smi --query-compute-apps=pid,used_memory --format=csv',
        },
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'Out of memory on load: the context is usually the cause, not the weights — the KV cache grows linearly with it, so 16K costs an 8B model about 1.7GB over its 4K figure, and puts it at 91% of an 8GB card. Lower the context first. Slow generation with a model that should fit: check `ollama ps` as above; something else on the card (a browser, a game, a second model still resident) is the usual culprit, and `ollama stop <model>` frees the previous one. Windows specifically: the desktop compositor holds VRAM that never appears in your model\'s own accounting, so treat the 88% band as the real ceiling.',
        bodyZh: '加载时显存不足：多数情况是上下文而不是权重造成的 —— KV 缓存随上下文线性增长，8B 模型从 4K 提到 16K 大约要多占 1.7GB，占到 8GB 显卡的 91%。先降上下文。本该装得下却很慢：按上面的方法看 `ollama ps`；通常是显卡上还有别的东西（浏览器、游戏、上一个还驻留的模型），`ollama stop <模型>` 可以释放前一个。Windows 特别注意：桌面合成器占用的显存不会出现在模型自己的统计里，所以请把 88% 这条线当作真正的上限。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'Put your own card into the VRAM calculator to see the full list of what fits at the context you actually use — the numbers above are one row of that table. If you are on Windows, the WSL2 + Ollama GPU guide covers driver passthrough, which is where most 8GB setups actually get stuck.',
        bodyZh: '把你自己的显卡填进显存计算器，就能看到在你实际使用的上下文下完整的可运行列表 —— 上面的表格只是其中几行。如果你用 Windows，WSL2 + Ollama GPU 指南讲的是驱动直通，这才是多数 8GB 配置真正卡住的地方。',
      },
    ],
    faqs: [
      {
        q: 'Can an 8GB GPU run a 14B model?',
        qZh: '8GB 显卡能跑 14B 模型吗？',
        a: 'Not entirely on the card. Qwen3 14B at Q4_K_M is about 9.7GB even at 2K context, so the weights alone are over 8GB. It still runs with part of the model offloaded to system RAM — Ollama and llama.cpp both do this by default — but the layers on the CPU slow every token down. The AWQ INT4 build is about 8.1GB, which still leaves no room for the desktop. For a model that sits fully on the card, stay at 7–8B.',
        aZh: '没法完整放在显卡上。Qwen3 14B 的 Q4_K_M 即使在 2K 上下文下也要约 9.7GB，光权重就超过 8GB。把一部分模型卸载到系统内存还是能跑的 —— Ollama 和 llama.cpp 默认都会这么做 —— 但留在 CPU 上的层会拖慢每一个 token。AWQ INT4 版本约 8.1GB，仍然没给桌面留出余地。想让模型完整待在显卡上，就选 7–8B。',
      },
      {
        q: 'Which models run on an 8GB card with image input?',
        qZh: '8GB 显卡上有哪些能看图的模型？',
        a: 'Ten current models in this index take image input and fit an 8GB card comfortably at 4K context. The largest are Nemotron 3.5 Bolt E4B and Qwen3.5 9B at about 6.6GB each and MiMo-V2.6-Distill-Qwen-9B at about 6.3GB; the smallest, LFM3-VL 2B, is about 1.2GB; Gemma 4 E4B, at about 5.3GB, also takes audio. All are Q4_K_M estimates from this site\'s calculator. Image input adds a vision encoder, which llama.cpp loads from a separate file and which these figures do not include, so leave some margin.',
        aZh: '本索引里有 10 个当前模型支持图像输入，并能在 4K 上下文下从容装进 8GB 显卡。最大的是 Nemotron 3.5 Bolt E4B 和 Qwen3.5 9B，各约 6.6GB，以及 MiMo-V2.6-Distill-Qwen-9B，约 6.3GB；最小的 LFM3-VL 2B 约 1.2GB；Gemma 4 E4B 约 5.3GB，还支持音频输入。以上都是本站计算器给出的 Q4_K_M 估算。图像输入需要额外的视觉编码器，llama.cpp 会从单独的文件加载它，上面的数字不包含这部分，所以要留出一些余量。',
      },
      {
        q: 'How much context can an 8GB card handle?',
        qZh: '8GB 显卡能撑多长的上下文？',
        a: 'For an 8B model at Q4_K_M, about 16K before it leaves the comfortable band: Llama 3.1 8B is 5.6GB at 4K and 7.3GB at 16K, which is 91% of the card — tight, with nothing left for the desktop. The KV cache is the only part that grows with context. A lower quant frees room for it by shrinking the weights; a smaller model does that and also has a smaller cache per token, so it buys more window for the same memory. A model that keeps a growing cache on only some layers buys the most: Qwen3.5 9B at Q4_K_M with a 16K context is about 7.0 GB, still comfortable. Gemma 4 E4B holds a 64K window in less.',
        aZh: '对 Q4_K_M 的 8B 模型来说，大约到 16K 就会离开宽裕区间：Llama 3.1 8B 在 4K 时 5.6GB，16K 时 7.3GB，占显卡的 91% —— 偏紧，已经没有余量留给桌面。随上下文增长的只有 KV 缓存。降低量化档位能通过缩小权重给它腾出空间；换更小的模型不但同样缩小权重，每个 token 的缓存也更小，所以同样的显存能换来更长的窗口。只在部分层保留增长缓存的模型收益最大：Qwen3.5 9B 在 Q4_K_M、16K 上下文下约 7.0 GB，仍然宽裕；Gemma 4 E4B 用更少的空间就能撑起 64K 窗口。',
      },
    ],
  },
  {
    id: 'm1-8gb-ollama-limits',
    gpuPreset: { gpuId: 'm1-8', ctx: 4096 },
    relatedModelIds: ['llama-3.2-3b', 'qwen2.5-3b', 'phi-3.5-mini', 'qwen3-5-4b', 'qwen3-5-2b'],
    title: 'M1 / M2 Mac 8GB: Realistic Ollama Limits',
    titleZh: 'M1 / M2 Mac 8GB：Ollama 真实能力边界',
    description: 'Unified memory is shared with macOS — here is what actually works on base MacBooks without swapping.',
    descriptionZh: '统一内存与 macOS 共享 — 入门 MacBook 不触发 swap 的情况下能跑什么。',
    category: 'mac',
    difficulty: 'beginner',
    tags: ['M1', 'M2', '8GB RAM', 'Ollama', 'Metal'],
    publishedAt: '2026-06-24',
    verifiedAt: '2026-07-22',
    verifiedStack: {
      en: 'M1/M2 8GB · Ollama Metal · 3B Q4 or 7B Q2/Q3 · ctx ≤2K · close browsers',
      zh: 'M1/M2 8GB · Ollama Metal · 3B Q4 或 7B Q2/Q3 · 上下文 ≤2K · 先关浏览器',
    },
    content: [
      {
        heading: 'Memory budget',
        headingZh: '内存预算',
        body: 'macOS + apps use 3–4GB. That leaves ~4GB for the model on an 8GB Mac. Stick to 3B Q4 or 7B Q2/Q3 with short context. Close browsers before loading 7B.',
        bodyZh: 'macOS 和常用应用占 3–4GB，8GB Mac 仅剩约 4GB 给模型。建议 3B Q4 或 7B Q2/Q3 + 短上下文，加载 7B 前关闭浏览器。',
        code: {
          lang: 'text',
          content: 'M1 8GB safe picks:\n  llama3.2:3b       → smooth chat\n  qwen2.5:3b        → good Chinese\n  phi3.5:mini       → fast responses\n\nAvoid on 8GB:\n  llama3.1:8b @ Q4  → swap thrashing\n  any 14B+ model',
        },
      },
      {
        heading: 'Ollama settings',
        headingZh: 'Ollama 设置',
        body: 'Set OLLAMA_NUM_PARALLEL=1 and keep context at 2048 for 8GB machines. Monitor Memory Pressure in Activity Monitor.',
        bodyZh: '设置 OLLAMA_NUM_PARALLEL=1，8GB 机器上下文保持 2048。在活动监视器观察内存压力。',
        code: {
          lang: 'bash',
          content: 'export OLLAMA_NUM_PARALLEL=1\nexport OLLAMA_MAX_LOADED_MODELS=1\nollama pull llama3.2:3b\nollama run llama3.2:3b',
        },
      },
    ],
  },
  {
    id: 'wsl2-ollama-gpu',
    gpuPreset: { gpuId: 'rtx4060ti16', ctx: 4096 },
    relatedModelIds: ['qwen3-8b', 'llama-3.1-8b', 'gpt-oss-20b'],
    title: 'Set Up Ollama on an NVIDIA GPU in Windows WSL2',
    seoTitle: 'Ollama NVIDIA GPU Setup in Windows WSL2',
    titleZh: 'Windows WSL2 + Ollama GPU 透传',
    description: 'On Windows with an NVIDIA GPU, run nvidia-smi in WSL2 to check passthrough. Install Ollama in Ubuntu, start the server, then check GPU use with ollama ps.',
    descriptionZh: '在 WSL2 中用 NVIDIA 显卡运行 Ollama：用 nvidia-smi 检查 GPU 透传，运行 ollama serve 启动服务，再用 ollama ps 排查 CPU 回退。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['WSL2', 'Windows', 'Ollama', 'NVIDIA', 'CUDA'],
    publishedAt: '2026-06-24',
    // Re-checked 2026-10-02 against Microsoft's WSL docs (wsl-config.md,
    // networking.md), NVIDIA's CUDA on WSL user guide, Ollama's docs (faq.mdx,
    // linux.mdx) and scripts/install.sh. A documentation check, not a run on a
    // Windows box — so a target stack, no verified date. See README §9.
    updatedAt: '2026-11-26',
    verifiedStack: {
      en: 'Windows 11 (or Win10 21H2+) · WSL2 Ubuntu 22.04/24.04 · recent NVIDIA Windows driver · Ollama Linux install · GGUF Q4_K_M',
      zh: 'Windows 11（或 Win10 21H2+）· WSL2 Ubuntu 22.04/24.04 · 较新的 NVIDIA Windows 驱动 · Ollama Linux 版 · GGUF Q4_K_M',
    },
    content: [
      {
        heading: 'Three commands to check NVIDIA GPU use',
        headingZh: '用三条命令检查 NVIDIA GPU 是否在用',
        body: 'Choose native Windows Ollama if you just want to run models on Windows. Choose WSL2 if your tools or scripts need Linux. For NVIDIA passthrough, install the driver on Windows, not inside WSL. Use wsl -l -v to find the exact name of the WSL2 distro where Ollama runs, and set $Distro to that name below. Check that Windows sees the GPU, then that the selected distro sees it, then that its Ollama server uses it. If ollama ps is empty, no model is loaded: run a prompt with ollama run qwen3:8b, then check again. 100% GPU means full offload, CPU/GPU means partial offload, and 100% CPU means no GPU offload.',
        bodyZh: '只想在 Windows 上跑模型，就选原生 Ollama；工具或脚本依赖 Linux 时，再选 WSL2。要用 NVIDIA GPU 透传，请在 Windows 安装驱动，不要在 WSL 里装。用 wsl -l -v 找到运行 Ollama 的 WSL2 发行版的准确名称，将下方的 $Distro 改为该名称。先确认 Windows 看得到显卡，再检查选中的发行版能否看到，最后确认其中的 Ollama 服务是否在用它。如果 ollama ps 没有条目，说明当前没有模型加载：先用 ollama run qwen3:8b 发一条提示词，再检查。100% GPU 表示全部卸载到显卡，CPU/GPU 表示部分卸载，100% CPU 表示没有使用显卡。',
        code: { lang: 'powershell', content: '# Windows PowerShell\nwsl.exe -l -v\n$Distro = "Ubuntu" # Use the exact name from the list above.\nnvidia-smi\nwsl.exe -d $Distro --exec /usr/lib/wsl/lib/nvidia-smi\n\n# Run a prompt with Ollama in that distro before checking model offload.\nwsl.exe -d $Distro --exec ollama ps' },
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Windows 11 (or Windows 10 21H2+), an NVIDIA GPU, and a current NVIDIA driver installed on Windows. The one rule that matters: install no NVIDIA driver inside WSL. NVIDIA\'s CUDA on WSL guide is explicit — the Windows driver is stubbed into WSL as libcuda.so under /usr/lib/wsl/lib, and a Linux driver installed on top overwrites it. The easy way to do that by accident is apt install cuda (or cuda-drivers): those meta-packages pull in the Linux driver. If you need the CUDA toolkit inside WSL for building things, NVIDIA says to install the cuda-toolkit-12-x package only.',
        bodyZh: 'Windows 11（或 Windows 10 21H2+）、一张 NVIDIA 显卡，以及 Windows 侧装好的较新 NVIDIA 驱动。唯一要紧的规则：不要在 WSL 里装任何 NVIDIA 驱动。NVIDIA 的 CUDA on WSL 指南写得很明确 —— Windows 驱动会以 libcuda.so 的形式映射进 WSL（/usr/lib/wsl/lib），在它上面再装 Linux 驱动就会把它覆盖掉。最容易误踩的是 apt install cuda（或 cuda-drivers）：这两个元包会顺带装上 Linux 驱动。如果你确实需要在 WSL 里编译东西用的 CUDA 工具包，NVIDIA 的说法是只装 cuda-toolkit-12-x 这个包。',
        code: {
          lang: 'powershell',
          content: '# PowerShell (Administrator)\nwsl --install\nwsl --update\nwsl --status          # want: default version 2\n\n# Run the distro-specific GPU check above.',
        },
      },
      {
        heading: 'Give the WSL VM enough RAM',
        headingZh: '给 WSL 虚拟机足够内存',
        body: 'WSL2 runs in a lightweight VM whose memory limit defaults to 50% of the host\'s RAM (Microsoft\'s documented default for the memory setting). That ceiling is invisible until a model needs CPU offload and the VM runs out well before Windows does. Set it explicitly in %UserProfile%\\.wslconfig, then wsl --shutdown to apply. Leave several GB for Windows itself.',
        bodyZh: 'WSL2 跑在一个轻量虚拟机里，内存上限默认是主机内存的 50%（微软文档里 memory 设置的默认值）。这个上限平时看不见，直到模型需要 CPU 卸载时，虚拟机会比 Windows 先耗尽内存。在 %UserProfile%\\.wslconfig 里显式设置，然后 wsl --shutdown 让它生效。给 Windows 自己留几 GB。',
        code: {
          lang: 'text',
          content: '# %UserProfile%\\.wslconfig   (example for a 32GB machine)\n[wsl2]\nmemory=20GB\nswap=8GB\n\n# then, in PowerShell:\n# wsl --shutdown',
        },
      },
      {
        heading: 'Install Ollama inside WSL',
        headingZh: '在 WSL 中安装 Ollama',
        body: 'Install the Linux build inside Ubuntu. Quit the native Windows Ollama app while testing to avoid talking to the wrong server on port 11434. The WSL installer does not install an NVIDIA driver. It starts a service if systemd is running; if it warns "systemd is not running", either use ollama serve in a second WSL terminal or enable systemd under [boot] in /etc/wsl.conf and restart WSL. Keep models on the WSL filesystem: loading from /mnt/c crosses into the Windows filesystem and can be much slower.',
        bodyZh: '在 Ubuntu 里装 Linux 版。测试时退出 Windows 原生 Ollama，避免在 11434 端口连错服务。WSL 安装脚本不会安装 NVIDIA 驱动。如果 systemd 正在运行，脚本会启动服务；如果提示 "systemd is not running"，就在另一个 WSL 终端运行 ollama serve，或在 /etc/wsl.conf 的 [boot] 节中启用 systemd 并重启 WSL。模型放在 WSL 文件系统里：从 /mnt/c 加载要跨到 Windows 文件系统，可能慢很多。',
        code: {
          lang: 'bash',
          content: 'curl -fsSL https://ollama.com/install.sh | sh\n\n# Only if there is no running Ollama service, run in a separate WSL terminal:\n# ollama serve\n\n# Back in the first terminal, with the service running:\nollama run qwen3:8b',
        },
      },
      {
        heading: 'Verify it is actually on the GPU',
        headingZh: '确认真的用上了 GPU',
        body: 'Use the PROCESSOR column in ollama ps as the main check. WSL’s nvidia-smi has fewer features than the native tool; a missing process row alone does not prove CPU fallback. Qwen3 8B at Q4_K_M with a 4,096-token context needs about 5.8 GB by this site’s calculator. If a small model still runs on CPU, confirm you are talking to the Linux Ollama server, then check its logs for GPU discovery errors.',
        bodyZh: '以 ollama ps 的 PROCESSOR 列为主要依据。WSL 中的 nvidia-smi 功能比原生工具少；进程列表没显示，并不代表一定退回了 CPU。按本站计算器估算，Qwen3 8B 的 Q4_K_M 在 4096 token 上下文下约需 5.8 GB。如果连小模型也走 CPU，先确认连接的是 Linux 版 Ollama 服务，再看日志中有没有显卡探测报错。',
        code: {
          lang: 'bash',
          content: 'ollama ps\n# NAME        ID     SIZE    PROCESSOR   UNTIL\n# qwen3:8b    <id>   ...     100% GPU    4 minutes from now',
        },
      },
      {
        heading: 'Reaching the API from Windows',
        headingZh: '从 Windows 访问 API',
        body: 'WSL2 forwards localhost by default, so http://localhost:11434 from a Windows browser or PowerShell reaches the server inside WSL with no extra configuration. In WSL\'s default NAT networking, nothing on your LAN can reach that server — Microsoft\'s docs say LAN access needs a netsh portproxy rule. That changes in mirrored networking mode (networkingMode=mirrored, Windows 11 22H2+), which connects WSL directly to the LAN: there, an Ollama bound to 0.0.0.0 is reachable by every machine on the network, with no authentication in front of it. Leave OLLAMA_HOST at its default unless you mean that.',
        bodyZh: 'WSL2 默认会转发 localhost，所以在 Windows 浏览器或 PowerShell 里访问 http://localhost:11434 就能连到 WSL 内的服务，不需要额外配置。在 WSL 默认的 NAT 网络模式下，局域网里的其他机器访问不到这个服务 —— 微软文档写明局域网访问需要配一条 netsh portproxy 规则。换成镜像网络模式（networkingMode=mirrored，Windows 11 22H2+）就不一样了：WSL 直接接入局域网，绑定在 0.0.0.0 上的 Ollama 对网络里每台机器都可见，而且前面没有任何鉴权。除非你确实想这样，否则 OLLAMA_HOST 保持默认。',
        code: {
          lang: 'powershell',
          content: '# From Windows PowerShell (curl.exe — plain curl is an alias there)\ncurl.exe http://localhost:11434/api/tags',
        },
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'nvidia-smi fails in the selected WSL2 distro: update the Windows driver, then wsl --update and wsl --shutdown; do not install a driver inside WSL. It worked and then stopped after an apt upgrade: check whether a cuda or cuda-drivers package got installed — that is the Linux driver overwriting the stub. "could not connect to ollama app": the server is not running, almost always because systemd is off (see the install step). nvidia-smi works but Ollama uses CPU: usually a second Ollama (the Windows app) already holding the port, or a model too large for the card — check ollama ps. Disk fills up: the WSL virtual disk grows to hold pulled models and does not shrink by itself; ollama rm removes a model, and getting the space back needs the vhdx compacted (sparseVhd=true in .wslconfig only applies to newly created disks). First load painfully slow: the model is probably under /mnt/c.',
        bodyZh: '在选中的 WSL2 发行版里运行 nvidia-smi 失败：更新 Windows 驱动，然后 wsl --update 与 wsl --shutdown；不要在 WSL 里装驱动。原本好好的，一次 apt upgrade 之后不行了：检查是不是装进了 cuda 或 cuda-drivers 包 —— 那是 Linux 驱动把映射进来的驱动覆盖了。"could not connect to ollama app"：服务没在运行，几乎都是因为 systemd 没开（见安装一节）。nvidia-smi 正常但 Ollama 走 CPU：通常是另一份 Ollama（Windows 应用）占着端口，或者模型对这张卡太大 —— 用 ollama ps 看。磁盘被占满：WSL 虚拟磁盘会为拉取的模型扩容，但不会自己缩回去；ollama rm 能删模型，要真正回收空间得压缩 vhdx（.wslconfig 里的 sparseVhd=true 只对新建的磁盘生效）。首次加载极慢：模型多半放在 /mnt/c 下。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'Put your card into the VRAM calculator to see what else fits at the context you actually use before pulling a larger model — on Windows, subtract the 0.5–1.5GB the desktop already holds.',
        bodyZh: '拉取更大的模型之前，先把你的显卡放进显存计算器，看看在你实际使用的上下文长度下还能装下什么 —— 在 Windows 上，记得减去桌面已经占用的 0.5–1.5GB。',
      },
    ],
    faqs: [
      {
        q: 'Why is Ollama not using my NVIDIA GPU in WSL2?',
        qZh: '为什么 WSL2 里的 Ollama 没有使用 NVIDIA GPU？',
        a: 'Check wsl -l -v in Windows PowerShell: the Ubuntu distro must be version 2. If /usr/lib/wsl/lib/nvidia-smi fails inside WSL, update the Windows NVIDIA driver, run wsl --update and wsl --shutdown, then reopen Ubuntu. Do not install a Linux NVIDIA driver. If nvidia-smi works but ollama ps shows CPU, stop any duplicate Windows Ollama, reduce the model size or context, and read journalctl -u ollama (systemd) or the ollama serve terminal for GPU errors.',
        aZh: '先在 Windows PowerShell 运行 wsl -l -v：Ubuntu 发行版必须是版本 2。如果 WSL 里的 /usr/lib/wsl/lib/nvidia-smi 不能运行，请更新 Windows 的 NVIDIA 驱动，执行 wsl --update 和 wsl --shutdown，再打开 Ubuntu。不要安装 Linux NVIDIA 驱动。如果 nvidia-smi 正常，但 ollama ps 显示 CPU，退出可能同时运行的 Windows 版 Ollama，换更小的模型或减小上下文，并用 journalctl -u ollama（systemd）或查看 ollama serve 终端中的 GPU 报错。',
      },
      {
        q: 'Do I need to install the CUDA toolkit inside WSL to run Ollama?',
        qZh: '在 WSL 里跑 Ollama 需要装 CUDA 工具包吗？',
        a: 'No. Ollama ships its own CUDA libraries and uses the driver that Windows projects into WSL. The toolkit is only for compiling CUDA code yourself — and if you do install it, install cuda-toolkit-12-x alone, never the cuda or cuda-drivers meta-packages, which bring a Linux driver that breaks passthrough.',
        aZh: '不需要。Ollama 自带 CUDA 运行库，用的是 Windows 映射进 WSL 的驱动。工具包只在你要自己编译 CUDA 代码时才需要 —— 真要装的话只装 cuda-toolkit-12-x，千万别装 cuda 或 cuda-drivers 元包，它们会带上 Linux 驱动，把透传弄坏。',
      },
      {
        q: 'Is WSL2 slower than running Ollama natively on Windows?',
        qZh: 'WSL2 会比在 Windows 上原生跑 Ollama 慢吗？',
        a: 'This site has not measured the difference, so it will not quote a number. What it can say: once the model is on the GPU, generation runs on the same card through the same driver either way. The real WSL2 costs come from the edges — a 50% RAM ceiling that bites when a model spills to the CPU, and slow loads when models live under /mnt/c — both covered above.',
        aZh: '本站没有实测过两者的差距，所以不给数字。能说的是：模型进了 GPU 之后，两种方式都是同一张卡、同一个驱动在生成。WSL2 真正的代价在边缘 —— 模型溢出到 CPU 时才会碰到的 50% 内存上限，以及模型放在 /mnt/c 下时的慢加载，上文都讲了。',
      },
      {
        q: 'Can other machines on my network use this Ollama server?',
        qZh: '局域网里的其他机器能用这个 Ollama 服务吗？',
        a: 'Not in WSL\'s default NAT mode — that needs a netsh portproxy rule on Windows. In mirrored networking mode they can, as soon as Ollama listens on 0.0.0.0, and the API has no authentication. If you want LAN access, put an authenticating proxy in front of it rather than exposing port 11434 directly.',
        aZh: '在 WSL 默认的 NAT 模式下不能 —— 需要在 Windows 上配 netsh portproxy 规则。在镜像网络模式下，只要 Ollama 监听 0.0.0.0 就能访问，而这个 API 没有任何鉴权。如果需要局域网访问，在前面加一层带鉴权的反向代理，不要直接暴露 11434 端口。',
      },
      {
        q: 'Can Ollama in Docker use an NVIDIA GPU in WSL2?',
        qZh: 'WSL2 中的 Docker 版 Ollama 能用 NVIDIA GPU 吗？',
        a: 'Yes. First verify nvidia-smi inside WSL2. For Docker Engine installed in the distro, install and configure NVIDIA Container Toolkit there; for Docker Desktop on Windows, use its WSL 2 backend. Use --gpus all with docker run, then send a prompt and check docker exec ollama ollama ps (assuming the container is named ollama).',
        aZh: '可以。先确认 WSL2 里的 nvidia-smi 能运行。如果 Docker Engine 安装在发行版内，就在里面安装并配置 NVIDIA Container Toolkit；如果用的是 Windows 上的 Docker Desktop，就启用它的 WSL 2 后端。运行 docker run 时加上 --gpus all，发一条提示词后，再用 docker exec ollama ollama ps 检查（假设容器名为 ollama）。',
      },
    ],
  },
  {
    id: 'docker-ollama-gpu',
    relatedModelIds: ['llama-3.1-8b'],
    title: 'Docker: Ollama with NVIDIA or AMD GPU Passthrough',
    seoTitle: 'Docker Ollama: NVIDIA or AMD GPU Passthrough',
    titleZh: 'Docker：Ollama 的 NVIDIA / AMD GPU 透传',
    description: 'Containerised Ollama with GPU access — isolate models, pin versions, and run alongside other services.',
    descriptionZh: '容器化 Ollama 并启用 GPU — 隔离模型、固定版本、与其他服务共存。',
    category: 'docker',
    difficulty: 'intermediate',
    tags: ['Docker', 'Ollama', 'NVIDIA', 'GPU', 'Compose'],
    publishedAt: '2026-06-24',
    verifiedAt: '2026-07-22',
    verifiedStack: {
      en: 'Docker 27+ · nvidia-container-toolkit · ollama/ollama image',
      zh: 'Docker 27+ · nvidia-container-toolkit · ollama/ollama 镜像',
    },
    content: [
      {
        heading: 'docker-compose.yml',
        headingZh: 'docker-compose.yml',
        body: 'Requires NVIDIA Container Toolkit on the host. The deploy.resources block requests one GPU. Persist models in a named volume.',
        bodyZh: '宿主机需安装 NVIDIA Container Toolkit。deploy.resources 申请 1 块 GPU。模型存入 named volume 持久化。',
        code: {
          lang: 'yaml',
          content: 'services:\n  ollama:\n    image: ollama/ollama:latest\n    container_name: ollama\n    ports:\n      - "11434:11434"\n    volumes:\n      - ollama_data:/root/.ollama\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: 1\n              capabilities: [gpu]\n    restart: unless-stopped\n\nvolumes:\n  ollama_data:',
        },
      },
      {
        heading: 'Run and pull models',
        headingZh: '启动并拉取模型',
        body: 'Use docker compose (v2) on Linux. On Windows Docker Desktop, enable WSL2 backend and GPU support in settings first.',
        bodyZh: 'Linux 上用 docker compose v2。Windows Docker Desktop 需先启用 WSL2 后端和 GPU 支持。',
        code: {
          lang: 'bash',
          content: 'docker compose up -d\ndocker exec -it ollama ollama pull llama3.1:8b\ndocker exec -it ollama ollama run llama3.1:8b\n\n# API test\ncurl http://localhost:11434/api/generate -d \'{"model":"llama3.1:8b","prompt":"Hello","stream":false}\'',
        },
      },
    ],
  },
  {
    id: 'nginx-llm-api-proxy',
    title: 'Nginx Reverse Proxy for Local LLM APIs',
    titleZh: 'Nginx 反向代理本地 LLM API',
    description: 'Put Ollama or llama.cpp behind Nginx with TLS, rate limiting, and a stable /v1 endpoint for your apps.',
    descriptionZh: '用 Nginx 为 Ollama 或 llama.cpp 提供 TLS、限流和稳定的 /v1 端点。',
    category: 'server',
    difficulty: 'intermediate',
    tags: ['Nginx', 'API', 'TLS', 'Ollama', 'llama.cpp'],
    publishedAt: '2026-06-24',
    verifiedAt: '2026-07-22',
    verifiedStack: {
      en: 'Nginx · TLS · proxy_read_timeout 300s · Ollama/llama.cpp /v1 · rate limit',
      zh: 'Nginx · TLS · proxy_read_timeout 300s · Ollama/llama.cpp /v1 · 限流',
    },
    content: [
      {
        heading: 'Basic proxy to Ollama',
        headingZh: 'Ollama 基础反代',
        body: 'Ollama exposes an OpenAI-compatible /v1/chat/completions endpoint. Proxy it with long timeouts — LLM responses are slow.',
        bodyZh: 'Ollama 提供 OpenAI 兼容的 /v1/chat/completions。反代时需设长超时 — LLM 响应较慢。',
        code: {
          lang: 'nginx',
          content: 'server {\n    listen 443 ssl;\n    server_name llm.example.com;\n\n    ssl_certificate     /etc/letsencrypt/live/llm.example.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/llm.example.com/privkey.pem;\n\n    location /v1/ {\n        proxy_pass http://127.0.0.1:11434/v1/;\n        proxy_read_timeout 300s;\n        proxy_send_timeout 300s;\n        client_max_body_size 10m;\n    }\n}',
        },
      },
      {
        heading: 'Rate limiting',
        headingZh: '限流',
        body: 'Add a limit_req zone to prevent abuse on a public-facing VPS. Adjust rate for your expected users.',
        bodyZh: '对公网 VPS 加 limit_req 防滥用，按预期用户数调整速率。',
        code: {
          lang: 'nginx',
          content: 'limit_req_zone $binary_remote_addr zone=llm:10m rate=10r/m;\n\nlocation /v1/ {\n    limit_req zone=llm burst=5 nodelay;\n    proxy_pass http://127.0.0.1:11434/v1/;\n    proxy_read_timeout 300s;\n}',
        },
      },
    ],
  },
  {
    id: 'amd-rocm-llamacpp',
    gpuPreset: { gpuId: 'rx7900xtx', ctx: 8192 },
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b', 'gpt-oss-20b', 'qwen3-30b-a3b'],
    title: 'Set Up llama.cpp on AMD Radeon with ROCm or Vulkan',
    seoTitle: 'llama.cpp ROCm Setup for AMD Radeon GPUs',
    titleZh: 'AMD 显卡 + llama.cpp ROCm 快速入门',
    description: 'Check your Radeon GPU and ROCm support first. Build llama.cpp with HIP on Linux, pick a Windows ROCm ZIP, or use Vulkan to run a GGUF model.',
    descriptionZh: '在 Radeon RX 9070、7900 或 6800 上安装 llama.cpp：Linux ROCm/HIP 编译与 GPU 架构目标、Windows ROCm ZIP，以及无需 ROCm 的 Vulkan 方案。',
    category: 'edge',
    difficulty: 'advanced',
    tags: ['AMD', 'ROCm', 'llama.cpp', 'HIP', 'Linux'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on 2026-09-08; FAQs + LLAMA_HIPBLAS wording 2026-10-03; RDNA 4 + iGPU
    // re-check 2026-10-20 (llama.cpp docs/build.md + ggml-hip/CMakeLists.txt on master, AMD's ROCm
    // Linux system requirements, Ollama docs/gpu.mdx, LLVM AMDGPUUsage processor table).
    updatedAt: '2026-11-26',
    // Expanded 2026-09-08; commands re-checked against llama.cpp docs/build.md
    // and ggml-hip/CMakeLists.txt on 2026-10-02. No `verifiedAt`: this environment has no Radeon
    // card, so the added build flags and checks are written from the
    // documented interfaces, not from a run. Saying otherwise would make the
    // badge meaningless on the other guides too.
    verifiedStack: {
      en: 'Linux: ROCm 6.1+ (card-dependent) · Windows x64: ROCm 10.0 ZIP or Vulkan · GGUF',
      zh: 'Linux：ROCm 6.1+（视显卡而定）· Windows x64：ROCm 10.0 ZIP 或 Vulkan · GGUF',
    },
    content: [
      {
        heading: 'Choose a path for your Radeon and OS',
        headingZh: '按 Radeon 型号和系统选方案',
        body: 'On Linux, use the ROCm/HIP build if AMD supports your exact card, distribution and ROCm version. On Windows 11 x64, use the official ROCm ZIP if the matching ROCm runtime supports your card. Otherwise start with Vulkan: it works on either OS with a Vulkan-capable driver and does not require ROCm. Use the real gfx target for a supported card. The optional overrides below are Linux-only workarounds, not a compatibility list; if you use one, build for the target you are impersonating and verify the output.',
        bodyZh: '在 Linux 上，如果 AMD 的兼容表支持你的具体显卡、发行版和 ROCm 版本，就选 ROCm/HIP 编译方案。在 Windows 11 x64 上，如果对应的 ROCm 运行环境支持你的显卡，就选官方 ROCm ZIP。否则先试 Vulkan：两个系统都可用，只需要支持 Vulkan 的驱动，不用装 ROCm。受支持的显卡请使用实际的 gfx 架构目标。下表的覆盖值只是 Linux 上可选的变通办法，并非兼容名单；如果使用覆盖，请按模拟的架构编译，并核对输出。',
        code: {
          lang: 'text',
          content: 'Radeon family                       GPU_TARGETS   HSA_OVERRIDE_GFX_VERSION\nRX 6800 / 6800 XT / 6900 XT (RDNA 2) gfx1030       —\nRX 6700 XT (RDNA 2)                  gfx1031       10.3.0 → gfx1030\nRX 6600 XT (RDNA 2)                  gfx1032       10.3.0 → gfx1030\nRX 7900 XTX / XT / GRE (RDNA 3)      gfx1100       —\nRX 7800 XT / 7700 XT (RDNA 3)        gfx1101       11.0.0 → gfx1100\nRX 7600 (RDNA 3)                     gfx1102       11.0.0 → gfx1100\nRadeon 780M iGPU (RDNA 3)            gfx1103       —\nRX 9070 XT / 9070 (RDNA 4)           gfx1201       —\nRX 9060 XT / 9060 (RDNA 4)           gfx1200       —\nRadeon 8060S (Ryzen AI Max)          gfx1151       —',
        },
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Install ROCm 6.1 or newer from AMD’s repository for your distribution — llama.cpp’s HIP build refuses anything older; an RX 9000 card needs a current ROCm 7.x release, which is also what Ollama now requires — then add your user to the render and video groups and log out and back in. Missing group membership is the classic first failure: rocminfo reports no agents, and every later step looks like a build problem when it is a permissions problem. Find your card’s gfx target now — you need it for the build.',
        bodyZh: '按你的发行版从 AMD 仓库安装 ROCm 6.1 或更新版本（llama.cpp 的 HIP 构建会拒绝更旧的版本；RX 9000 显卡需要较新的 ROCm 7.x，Ollama 现在也要求 7.x），然后把用户加入 render 和 video 组，并重新登录。忘记加组是最典型的第一个坑：rocminfo 报告找不到设备，而后面每一步看起来都像编译问题，其实是权限问题。现在先确认显卡的 gfx 目标，编译时要用。',
        code: {
          lang: 'bash',
          content: 'sudo usermod -aG render,video $USER   # then log out and back in\n\nrocminfo | grep -i gfx      # e.g. gfx1100 RX 7900 XTX, gfx1201 RX 9070 XT, gfx1200 RX 9060 XT\nrocm-smi                    # card, VRAM, temperature',
        },
      },
      {
        heading: 'Build llama.cpp with the HIP backend',
        headingZh: '用 HIP 后端编译 llama.cpp',
        body: 'The flag is GGML_HIP=ON. The older LLAMA_HIPBLAS name is gone and, unlike LLAMA_CUDA, is not forwarded to the new one — pass it and you get a build that compiles cleanly, runs, and is CPU-only. CMake’s only complaint is a line near the end of configure listing it under “Manually-specified variables were not used by the project”, which is easy to scroll past. Set GPU_TARGETS to your gfx target so the kernels are compiled for your card (the older AMDGPU_TARGETS name is still forwarded; leaving both out builds for every GPU in the machine). Point HIPCXX at ROCm’s own clang, as llama.cpp’s build docs do — passing hipcc as the compiler still works, but CMake now warns that it is legacy.',
        bodyZh: '编译开关是 GGML_HIP=ON。旧的 LLAMA_HIPBLAS 名称已被移除，而且不像 LLAMA_CUDA 那样会被转发到新名字 —— 用旧名字会得到一个编译顺利、能运行、但纯 CPU 的构建。CMake 唯一的提示是配置末尾的一行，把它列在 “Manually-specified variables were not used by the project” 之下，很容易一滚而过。同时把 GPU_TARGETS 设为你的 gfx 目标，确保内核为你的卡编译（旧名 AMDGPU_TARGETS 仍会被转发；两个都不设则为机器里所有 GPU 编译）。按 llama.cpp 构建文档的做法，用 HIPCXX 指向 ROCm 自带的 clang —— 把 hipcc 当编译器仍然可用，但 CMake 现在会警告这是旧做法。',
        code: {
          lang: 'bash',
          content: 'git clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\n\nHIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" \\\n  cmake -S . -B build \\\n  -DGGML_HIP=ON \\\n  -DGPU_TARGETS=gfx1100 \\\n  -DCMAKE_BUILD_TYPE=Release\ncmake --build build --config Release -j$(nproc)',
        },
      },
      {
        heading: 'If your card is not on the official list',
        headingZh: '如果你的卡不在官方支持列表里',
        body: 'ROCm refuses to initialise on gfx targets it does not officially support, even when the card is architecturally close to one that is. HSA_OVERRIDE_GFX_VERSION tells the runtime to treat it as the nearest supported target: 11.0.0 for RDNA3, 10.3.0 for RDNA2. This is a workaround, not a supported configuration — it is widely used and it can also produce wrong results or hangs on some kernels, so validate output before trusting it. An integrated Radeon outside AMD’s list (a gfx1035 laptop chip, say) can take the same override — llama.cpp’s build docs map gfx1035 to 10.3.0 — and also needs GGML_CUDA_ENABLE_UNIFIED_MEMORY=1 so the model can live in system RAM; the docs warn that this setting slows a discrete card, so set it only for the iGPU.',
        bodyZh: 'ROCm 对于官方未支持的 gfx 目标会直接拒绝初始化，哪怕架构上和某个受支持型号很接近。HSA_OVERRIDE_GFX_VERSION 让运行时把它当作最接近的受支持目标：RDNA3 用 11.0.0，RDNA2 用 10.3.0。这是绕过手段而非受支持配置 —— 用的人很多，但在部分内核上也可能出现结果错误或卡死，采信前请先验证输出。 不在 AMD 列表里的核显（比如笔记本上的 gfx1035）也可以用同样的覆盖 —— llama.cpp 的构建文档把 gfx1035 归到 10.3.0 —— 另外还需要设置 GGML_CUDA_ENABLE_UNIFIED_MEMORY=1，让模型可以放在系统内存里；文档提醒这个设置会拖慢独立显卡，所以只在核显上开。',
        code: {
          lang: 'bash',
          content: '# RDNA2 card reporting gfx1031, treated as gfx1030\nexport HSA_OVERRIDE_GFX_VERSION=10.3.0\n\n# RDNA3\n# export HSA_OVERRIDE_GFX_VERSION=11.0.0\n\n# Integrated Radeon (e.g. gfx1035) only:\n# export HSA_OVERRIDE_GFX_VERSION=10.3.0 GGML_CUDA_ENABLE_UNIFIED_MEMORY=1',
        },
      },
      {
        heading: 'Start the server and confirm the GPU is used',
        headingZh: '启动服务并确认 GPU 已被使用',
        body: 'Bind to 127.0.0.1 unless you deliberately want the server on your network — llama-server has no authentication of its own. On startup the log names the backend and the number of layers offloaded; that line, not the fact that it answers, is the confirmation. A HIP build that fell back to CPU still serves tokens, slowly. rocm-smi should show VRAM held while the model is loaded.',
        bodyZh: '除非你确实想把服务开放到局域网，否则绑定 127.0.0.1 —— llama-server 自身没有任何鉴权。启动时日志会打印使用的后端和卸载到 GPU 的层数；确认的依据是这一行，而不是“它能回答”。退回 CPU 的 HIP 构建照样能出 token，只是很慢。模型加载期间 rocm-smi 应能看到显存被占用。',
        code: {
          lang: 'bash',
          content: './build/bin/llama-server \\\n  -m ./models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\\n  -ngl 99 -c 8192 --host 127.0.0.1 --port 8080\n\n# In the startup log, look for the ROCm device line and:\n#   load_tensors: offloaded 33/33 layers to GPU\n\nrocm-smi --showmemuse',
        },
      },
      {
        heading: 'Sizing a model for your card',
        headingZh: '为你的显卡挑模型',
        body: 'A 24GB RX 7900 XTX sits in the same band as an RTX 3090 or 4090 for what fits: memory arithmetic does not care which vendor made the card, only how much VRAM it has and how large the KV cache is. Use the VRAM calculator with your Radeon selected — it is in the GPU list — rather than reading NVIDIA guidance and hoping it transfers. What does not transfer is throughput: tok/s figures on this site are measured on NVIDIA hardware and are not a prediction for ROCm.',
        bodyZh: '24GB 的 RX 7900 XTX 在“能装下什么”这件事上与 RTX 3090／4090 属于同一档：显存算术不关心是哪家的卡，只关心显存多大、KV 缓存多大。直接在显存计算器里选你的 Radeon（列表里有）来算，而不是照搬 NVIDIA 的建议。不能照搬的是吞吐：本站的 tok/s 数据在 NVIDIA 硬件上实测，不能用来预测 ROCm 上的表现。',
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'rocminfo finds no agents: group membership, or the kernel module did not load — check dmesg for amdgpu. hipErrorNoBinaryForGpu at load: the build did not include your gfx target; rebuild with the right GPU_TARGETS, or set HSA_OVERRIDE_GFX_VERSION. Builds fine but runs on CPU: almost always the old LLAMA_HIPBLAS flag, which CMake lists as unused and otherwise ignores — check the startup log for the backend line. Hangs or garbage output after an override: the override is not a supported path; drop back to a lower context or a different quant before assuming the model is at fault.',
        bodyZh: 'rocminfo 找不到设备：要么是用户组没加，要么是内核模块没加载 —— 用 dmesg 查 amdgpu。加载时报 hipErrorNoBinaryForGpu：编译时没有包含你的 gfx 目标；用正确的 GPU_TARGETS 重新编译，或设置 HSA_OVERRIDE_GFX_VERSION。能编译但跑在 CPU 上：几乎都是用了旧的 LLAMA_HIPBLAS 开关，CMake 只把它列为未使用变量、其余一概忽略 —— 看启动日志里的后端那一行。设置 override 后卡死或输出乱码：override 本就不是受支持路径；先降低上下文或换一个量化档位，再去怀疑模型本身。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'The models linked below are the ones this guide is written around. Open any of them with your Radeon selected in the calculator to see the context length it can actually hold.',
        bodyZh: '下方链接的模型就是本指南所围绕的那几个。在计算器里选好你的 Radeon 再打开其中任意一个，就能看到它实际能撑住多长的上下文。',
      },
      {
        heading: 'Windows: install the official ROCm ZIP',
        headingZh: 'Windows：安装官方 ROCm ZIP',
        body: 'Update the AMD graphics driver, install the latest Microsoft Visual C++ Redistributable (x64) from aka.ms/vc14/vc_redist.x64.exe, and check AMD’s Windows support matrix for your exact card. The pinned ROCm 10.0 x64 ZIP includes llama-server.exe and some HIP DLLs, but not all of the ROCm math libraries. Use x64 Python on PATH to install the matching AMD SDK wheels, then add their bin directory to PATH in the same PowerShell session. The steps use the matching 10.0.0 SDK from llama.cpp’s release workflow. Replace the model path with your own GGUF. If HIP cannot see your Radeon, use the Vulkan path below; HSA_OVERRIDE_GFX_VERSION does not work on Windows.',
        bodyZh: '更新 AMD 显卡驱动，从 aka.ms/vc14/vc_redist.x64.exe 安装最新版 Microsoft Visual C++ 可再发行组件（x64），并在 AMD 的 Windows 兼容表中确认具体型号。这里固定使用的 ROCm 10.0 x64 ZIP 含有 llama-server.exe 和部分 HIP DLL，但并未包含全部 ROCm 数学库。用 PATH 中的 x64 Python 安装配套 AMD SDK 软件包，再在同一个 PowerShell 会话中把 SDK 的 bin 目录加入 PATH。以下命令使用 llama.cpp 发布工作流对应的 10.0.0 SDK；请把路径换成自己的 GGUF 文件。如果 HIP 找不到你的 Radeon，请改用下面的 Vulkan 方案；HSA_OVERRIDE_GFX_VERSION 在 Windows 上不起作用。',
        code: {
          lang: 'powershell',
          content: `$Build = '${LLAMACPP_BUILD}'\n$Zip = "llama-$Build-bin-win-rocm-10.0-x64.zip"\nInvoke-WebRequest "https://github.com/ggml-org/llama.cpp/releases/download/$Build/$Zip" -OutFile $Zip\nExpand-Archive $Zip -DestinationPath .\\llama-rocm\npython -m venv .\\rocm-env\n.\\rocm-env\\Scripts\\python.exe -m pip install --index-url https://stable.repo.amd.com/rocm/whl-next/ "rocm[libraries,devel]==10.0.0"\n.\\rocm-env\\Scripts\\rocm-sdk.exe init\n$RocmBin = (.\\rocm-env\\Scripts\\rocm-sdk.exe path --bin).Trim()\n$env:Path = "$RocmBin;$env:Path"\n.\\llama-rocm\\llama-server.exe --list-devices\n.\\llama-rocm\\llama-server.exe -m "C:\\models\\your-model.gguf" -ngl all -c 4096 --host 127.0.0.1 --port 8080`,
        },
      },
      {
        heading: 'Vulkan fallback on Windows or Linux',
        headingZh: 'Windows 或 Linux 上的 Vulkan 备用方案',
        body: 'Vulkan uses the GPU driver rather than ROCm. On Windows x64, install the Microsoft Visual C++ Redistributable (x64) as above, then extract the official Vulkan ZIP to a separate folder and check that --list-devices names your Radeon. On Debian or Ubuntu, install the Vulkan tools and build dependencies plus your distribution’s Vulkan driver, then run the Bash block from your llama.cpp checkout. In either case, if the list also shows integrated graphics, pass --device with the exact Radeon device name, and look for layer offload in the server log.',
        bodyZh: 'Vulkan 使用显卡驱动，不依赖 ROCm。Windows x64 上，先按上文安装 Microsoft Visual C++ 可再发行组件（x64），再把官方 Vulkan ZIP 解压到单独的目录，确认 --list-devices 列出了 Radeon。在 Debian 或 Ubuntu 上，安装 Vulkan 工具、编译依赖和发行版的 Vulkan 驱动，再从 llama.cpp 源码目录运行 Bash 命令。如果列表还显示集成显卡，可用 --device 指定所列的 Radeon 设备名，并在服务日志里确认模型层已卸载到显卡。',
        code: [
          {
            lang: 'powershell',
            content: `# Windows PowerShell\n$Build = '${LLAMACPP_BUILD}'\n$Zip = "llama-$Build-bin-win-vulkan-x64.zip"\nInvoke-WebRequest "https://github.com/ggml-org/llama.cpp/releases/download/$Build/$Zip" -OutFile $Zip\nExpand-Archive $Zip -DestinationPath .\\llama-vulkan\n.\\llama-vulkan\\llama-server.exe --list-devices\n.\\llama-vulkan\\llama-server.exe -m "C:\\models\\your-model.gguf" -ngl all -c 4096 --host 127.0.0.1 --port 8080`,
          },
          { lang: 'bash', content: linuxVulkanSetup },
        ],
      },
    ],
    faqs: [
      {
        q: 'Should I use ROCm or Vulkan for llama.cpp on a Radeon?',
        qZh: 'Radeon 上跑 llama.cpp，该用 ROCm 还是 Vulkan？',
        a: 'On Linux with a card AMD officially supports, ROCm (the HIP build in this guide) is the documented path. Vulkan is the fallback that needs no ROCm install at all: build with -DGGML_VULKAN=ON instead of GGML_HIP. It is the better choice on Windows for a card outside AMD’s list, because HSA_OVERRIDE_GFX_VERSION is not supported on Windows. Prefer Ollama? It supports ROCm on listed Radeon GPUs with the matching driver stack and Vulkan as an alternative; check Ollama’s GPU support docs for your card and OS. This site has not measured either llama.cpp backend on Radeon; compare with the same model and context.',
        aZh: '在 Linux 上、且显卡在 AMD 官方支持列表里时，ROCm（也就是本指南的 HIP 构建）是文档给出的路径。Vulkan 是完全不需要安装 ROCm 的后备方案：编译时用 -DGGML_VULKAN=ON 代替 GGML_HIP。如果显卡不在 AMD 的 Windows 列表里，优先用 Vulkan，因为 Windows 不支持 HSA_OVERRIDE_GFX_VERSION。想用 Ollama？它可在名单中的 Radeon 显卡上配合相应驱动使用 ROCm，也可以选 Vulkan；请查 Ollama 的 GPU 支持文档确认型号和系统。本站没有在 Radeon 上实测这两种 llama.cpp 后端，请用同一个模型和上下文比较。',
      },
      {
        q: 'Can I run llama.cpp with ROCm on Windows without compiling?',
        qZh: 'Windows 上不编译也能用 ROCm 跑 llama.cpp 吗？',
        a: 'Yes, if your GPU supports the matching ROCm runtime. Use the official Windows x64 ROCm ZIP, install its matching AMD ROCm SDK libraries, and check llama-server.exe --list-devices. If rocBLAS cannot read TensileLibrary.dat for gfx1103 (such as a Radeon 780M iGPU), check that the SDK libraries match the ZIP and that the runtime supports your exact GPU. If its math libraries lack your target, use the Windows Vulkan ZIP; HSA_OVERRIDE_GFX_VERSION does not work on Windows.',
        aZh: '可以，前提是你的显卡受配套的 ROCm 运行环境支持。下载官方 Windows x64 ROCm ZIP、安装匹配的 AMD ROCm SDK 库，再用 llama-server.exe --list-devices 检查。如果 rocBLAS 无法为 gfx1103（例如 Radeon 780M 核显）读取 TensileLibrary.dat，请确认 SDK 库与 ZIP 的版本匹配，而且运行环境支持你的具体显卡。如果数学库缺少该架构，改用 Windows Vulkan ZIP；HSA_OVERRIDE_GFX_VERSION 在 Windows 上不起作用。',
      },
      {
        q: 'How do I split a llama.cpp model across two Radeon GPUs?',
        qZh: '怎样把 llama.cpp 模型分到两张 Radeon 显卡上？',
        a: 'For two supported cards, such as two RX 6800s or two RX 7900 XTXs, run --list-devices and pass both device names in order to --device, separated by a comma. Start with --split-mode layer; it splits layers across the cards. Add --tensor-split 1,1 for equal proportions or adjust the ratio in device order. Set HIP_VISIBLE_DEVICES before launching if you need to restrict which GPUs the HIP runtime can see.',
        aZh: '使用两张受支持的显卡（如两张 RX 6800 或两张 RX 7900 XTX）时，先运行 --list-devices，再把两个设备名按顺序用逗号分隔传给 --device。先用 --split-mode layer，把模型层分到两张卡上。加 --tensor-split 1,1 可按相同比例分配，或按设备顺序调整比例。如果想限制 HIP 运行时能看到哪些 GPU，请在启动前设置 HIP_VISIBLE_DEVICES。',
      },
      {
        q: 'Can a Radeon run AWQ, GPTQ or EXL2 models?',
        qZh: 'Radeon 能跑 AWQ、GPTQ 或 EXL2 模型吗？',
        a: 'AWQ and GPTQ, yes, but only through vLLM’s ROCm builds, and only on cards vLLM lists: the RX 7700 XT, 7800 XT and 7900 series, and the RX 9000 series. The RX 6000 series and the RX 7600 XT are not on that list, so on those cards GGUF through llama.cpp is the route. EXL2 needs CUDA and does not run on any Radeon, and its runtime, ExLlamaV2, is now archived anyway. The GPU pages and the VRAM calculator apply the same rule, so they only recommend formats your card can load.',
        aZh: 'AWQ 和 GPTQ 可以，但只能通过 vLLM 的 ROCm 构建，而且只限 vLLM 列出的显卡：RX 7700 XT、7800 XT、7900 系列，以及 RX 9000 系列。RX 6000 系列和 RX 7600 XT 不在列表里，这些卡请走 llama.cpp + GGUF。EXL2 需要 CUDA，任何 Radeon 都跑不了，况且它的运行时 ExLlamaV2 已经归档。本站的显卡页面和显存计算器用的是同一条规则，只会推荐你的卡能加载的格式。',
      },
      {
        q: 'What fits on a 24GB RX 7900 XTX compared with a 16GB Radeon?',
        qZh: '24GB 的 RX 7900 XTX 和 16GB 的 Radeon 能装下的模型差多少？',
        a: 'At 4K context, {{fit:rx7900xtx}} of the {{models}} models in this index fit the RX 7900 XTX comfortably, against {{fit:rx7800xt}} on a 16GB RX 7800 XT or RX 9070 XT. The difference is the 30B class. Qwen3 30B-A3B at Q4_K_M is about 20.2 GB at 8K context — 84% of a 7900 XTX, comfortable — and does not fit a 16GB card. GPT-OSS 20B at MXFP4 is about 12.9 GB at 8K context, so it runs on either. These are memory figures only; this site has no Radeon speed measurements.',
        aZh: '在 4K 上下文下，本索引 {{models}} 个模型中有 {{fit:rx7900xtx}} 个能宽裕地放进 RX 7900 XTX，而 16GB 的 RX 7800 XT 或 RX 9070 XT 是 {{fit:rx7800xt}} 个。差距在 30B 这一档。Qwen3 30B-A3B 的 Q4_K_M 在 8K 上下文下约 20.2 GB —— 占 7900 XTX 的 84%，属于宽裕 —— 而 16GB 卡放不下。GPT-OSS 20B 的 MXFP4 在 8K 上下文下约 12.9 GB，两种卡都能跑。以上只是显存数字；本站没有 Radeon 上的速度实测。',
      },
    ],
  },
  {
    id: 'windows-ollama-native',
    title: 'Ollama on Windows (Native, No WSL)',
    titleZh: 'Windows 原生 Ollama（不用 WSL）',
    description: 'Install the Windows Ollama app for the simplest path — NVIDIA and AMD Radeon GPUs both work, with no WSL and no toolkit to install.',
    descriptionZh: '安装 Windows 版 Ollama 最简单 —— NVIDIA 和 AMD Radeon 显卡都能用 GPU，不用 WSL，也不用装工具包。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['Windows', 'Ollama', 'NVIDIA', 'Desktop'],
    publishedAt: '2026-06-24',
    verifiedAt: '2026-07-22',
    verifiedStack: {
      en: 'Windows 11 · Ollama native installer · NVIDIA GPU auto · API :11434',
      zh: 'Windows 11 · Ollama 原生安装包 · NVIDIA 自动 GPU · API :11434',
    },
    content: [
      {
        heading: 'Install',
        headingZh: '安装',
        body: 'Download the installer from ollama.com. It runs as a background service and auto-detects NVIDIA GPUs. No CUDA toolkit install needed.',
        bodyZh: '从 ollama.com 下载安装包。以后台服务运行，自动检测 NVIDIA 显卡，无需单独装 CUDA toolkit。',
        code: {
          lang: 'powershell',
          content: '# Download from https://ollama.com/download/windows\n# Or winget:\nwinget install Ollama.Ollama\n\n# Verify service\nollama --version\nollama list',
        },
      },
      {
        heading: 'When to use WSL instead',
        headingZh: '何时改用 WSL',
        body: 'Stick with native Ollama for quick chat and Open WebUI. Switch to WSL2 if you need llama.cpp custom builds, ExLlamaV2, or fine-grained CUDA control.',
        bodyZh: '快速对话和 Open WebUI 用原生版即可。需要 llama.cpp 自定义编译、ExLlamaV2 或精细 CUDA 控制时改用 WSL2。',
        code: {
          lang: 'text',
          content: 'Native Windows Ollama:\n  ✓ One-click install\n  ✓ NVIDIA GPU acceleration\n  ✓ OpenAI-compatible API at :11434\n\nUse WSL2 instead for:\n  → ExLlamaV2 / EXL2 quants\n  → Custom llama.cpp flags\n  → vLLM / TabbyAPI',
        },
      },
    ],
  },
  {
    id: 'gpt-oss-mxfp4-local',
    gpuPreset: { gpuId: 'rtx4090', ctx: 32768 },
    relatedModelIds: ['gpt-oss-20b', 'gpt-oss-120b'],
    title: 'Run GPT-OSS 20B (and 120B) locally without re-quantizing',
    seoTitle: 'Run GPT-OSS 20B/120B without re-quantizing',
    titleZh: '本地运行 GPT-OSS 20B（及 120B）——不要重新量化',
    description: 'GPT-OSS ships natively in MXFP4, so the usual "download the Q4_K_M" habit makes it bigger and worse. Sizing, the right flags, and how MoE expert-offload puts the 120B on a 24GB card.',
    descriptionZh: 'GPT-OSS 原生就是 MXFP4，习惯性去下 Q4_K_M 反而更大更差。本文讲清显存怎么算、该用哪些参数，以及如何用 MoE 专家卸载在 24GB 卡上跑 120B。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['GPT-OSS', 'MXFP4', 'MoE', 'llama.cpp', 'Ollama', 'GGUF'],
    publishedAt: '2026-08-08',
    updatedAt: '2026-10-03',
    content: [
      {
        heading: 'The one thing to get right: MXFP4 is the original',
        headingZh: '最关键的一点：MXFP4 就是原版',
        body: 'Almost every other model on this site is published in BF16 and quantized by the community afterwards, so "find the Q4_K_M" is the right reflex. GPT-OSS breaks that reflex. OpenAI post-trained it with the MoE weights already in MXFP4 (~4.25 bits), and those MoE weights are over 90% of the parameters. The MXFP4 checkpoint is not a lossy copy of something better — it is the model. Converting it up to Q8_0, or sideways to Q4_K_M, gives you a file that is larger and no more accurate, because the precision it is padding back was never there.',
        bodyZh: '本站几乎所有其他模型都是 BF16 发布、社区事后量化，所以"找 Q4_K_M"是对的直觉。GPT-OSS 打破了这个直觉：OpenAI 在后训练阶段就把 MoE 权重做成了 MXFP4（约 4.25 bit），而 MoE 权重占参数量 90% 以上。这份 MXFP4 权重不是某个更好版本的有损副本——它本身就是模型。把它转成 Q8_0 或平移到 Q4_K_M，只会得到一个更大但并不更准的文件，因为你补回去的精度从来就不存在。',
        code: {
          lang: 'text',
          content: 'gpt-oss-20b   MXFP4 (native)  11.3 GiB file   ← use this\ngpt-oss-120b  MXFP4 (native)  59.0 GiB file   ← use this\n\n(file sizes from llama.cpp\'s own gpt-oss guide)\n\nRule: for GPT-OSS, "bigger quant" buys you nothing.\nSpend the VRAM on context length instead.',
        },
      },
      {
        heading: 'Sizing it for your card',
        headingZh: '按你的显卡估算',
        body: 'The 20B fits a 16GB card with room for a useful context window. Note that GPT-OSS uses a head dimension of 64 rather than the usual 128, which halves its KV cache compared to a same-layer-count model — and half its layers use a 128-token sliding window, so only the other half grow a cache with context. Long context is unusually cheap here. Use the VRAM calculator with the MXFP4 level selected. MXFP4 is about 4.25 bits on the expert weights only — attention and embeddings are stored wider — so the whole 20B file works out to about 4.6 bits per weight, which is the rate the calculator uses for it. llama.cpp\'s own gpt-oss guide lists a higher total than this calculator does (14.9 GB at 8K context for the 20B, against about 12.9 here), because its figure includes the runtime\'s compute buffers in full; treat the calculator as the lower bound and leave room.',
        bodyZh: '20B 在 16GB 卡上可跑，且还剩下够用的上下文空间。注意 GPT-OSS 的 head dim 是 64 而非常见的 128，同层数下 KV cache 直接减半——而且一半的层使用 128 token 的滑动窗口，只有另一半会随上下文增长缓存。长上下文在这个模型上便宜得反常。用显存计算器时记得选 MXFP4 档。MXFP4 约 4.25 bit 只针对专家权重 —— 注意力和嵌入层存得更宽 —— 所以 20B 整个文件折合约每权重 4.6 bit，计算器用的就是这个比率。llama.cpp 自己的 gpt-oss 指南给出的总量比本计算器高（20B 在 8K 上下文下是 14.9 GB，这里约 12.9 GB），因为它把运行时的计算缓冲区完整算了进去；请把计算器的数字当作下限，留出余量。',
        code: {
          lang: 'text',
          content: 'gpt-oss-20b @ MXFP4, batch=1 (this site\'s calculator)\n  weights                    ~11.5 GB\n  KV cache @  8K ctx          ~0.2 GB\n  KV cache @ 32K ctx          ~0.8 GB\n  KV cache @ 131K ctx         ~3.0 GB\n  total @ 8K / 32K / 131K     12.9 / 13.5 / 16.0 GB\n\nllama.cpp\'s own guide, same model: 14.9 / 15.5 / 17.9 GB\n\n16GB card  → comfortable to ~32K ctx; the full 131K window does not fit\n24GB card  → full 131K ctx with headroom',
        },
      },
      {
        heading: 'Fastest path: Ollama',
        headingZh: '最省事：Ollama',
        body: 'Ollama pulls the MXFP4 build by default, so there is no quant tag to choose and no way to accidentally get a re-quantized one. This is the right starting point unless you need custom flags.',
        bodyZh: 'Ollama 默认拉取的就是 MXFP4 构建，没有量化档位可选，也就不会误拿到重新量化的版本。除非你需要自定义参数，否则从这里开始最合适。',
        code: {
          lang: 'bash',
          content: 'ollama pull gpt-oss:20b\nollama run gpt-oss:20b\n\n# 120B — needs ~61GB of combined VRAM+RAM\nollama pull gpt-oss:120b\n\n# OpenAI-compatible endpoint stays on :11434\ncurl http://localhost:11434/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model":"gpt-oss:20b","messages":[{"role":"user","content":"hi"}]}\'',
        },
      },
      {
        heading: 'llama.cpp: pass --jinja or the output gets strange',
        headingZh: 'llama.cpp：必须加 --jinja，否则输出会很怪',
        body: 'GPT-OSS was trained on OpenAI\'s "harmony" response format, which separates the reasoning channel from the final answer. That structure lives in the model\'s chat template, so llama.cpp needs --jinja to apply it. Skip the flag and you get raw channel markers bleeding into replies, or a model that never stops talking — a failure that reads like a broken quant but is purely a template problem.',
        bodyZh: 'GPT-OSS 使用 OpenAI 的 "harmony" 响应格式训练，该格式把推理通道与最终回答分开。这个结构写在模型的 chat template 里，所以 llama.cpp 需要 --jinja 才会套用。不加这个参数，你会看到通道标记直接漏进回复里，或者模型停不下来——这个现象很像量化坏了，其实纯粹是模板问题。',
        code: {
          lang: 'bash',
          content: '# 20B, all layers on a 16GB+ GPU\nllama-server \\\n  -hf ggml-org/gpt-oss-20b-GGUF \\\n  --jinja \\\n  -ngl 99 \\\n  --ctx-size 32768 \\\n  --host 127.0.0.1 --port 8080\n\n# --jinja       applies the harmony chat template  (do not omit)\n# -ngl 99       offload every layer to the GPU\n# --ctx-size    32K is ~13.5 GB by this site\'s estimate, 15.5 GB by\n#               llama.cpp\'s own table — fine on 16GB with nothing else\n#               on the card. llama.cpp\'s guide uses --ctx-size 0 (the\n#               full 131K) and -ub 2048 -b 2048, which needs ~18 GB.',
        },
      },
      {
        heading: 'Running the 120B on a 24GB consumer card',
        headingZh: '在 24GB 消费级显卡上跑 120B',
        body: 'This is where the MoE architecture pays off. Only 5.1B parameters are active per token, so the expert weights are read sparsely — which makes them the ideal thing to leave in system RAM. llama.cpp\'s own guidance is to offload the whole model and use --n-cpu-moe to keep as many layers\' experts on the CPU as necessary; whatever stays on the CPU lives in system RAM, so budget most of the 59 GiB file there. The same flag brings the 20B to smaller cards: llama.cpp\'s guide runs it on an 8GB RTX 2060 with --n-cpu-moe 16. This site has not measured either setup, so it gives no speed for them.',
        bodyZh: '这正是 MoE 架构的价值所在。每个 token 只激活 5.1B 参数，专家权重是稀疏读取的——因此它们最适合留在系统内存里。llama.cpp 官方的做法是把整个模型都放到 GPU 上，再用 --n-cpu-moe 把需要的若干层专家留在 CPU；留在 CPU 上的部分占用的是系统内存，所以要为这 59 GiB 的文件留出大部分内存。同一个参数也能让 20B 跑在更小的卡上：llama.cpp 的指南就用 --n-cpu-moe 16 在 8GB 的 RTX 2060 上运行它。这两种配置本站都没有实测，所以不给速度数字。',
        code: {
          lang: 'bash',
          content: '# 120B on 24GB: keep the experts of N layers on the CPU\nllama-server \\\n  -hf ggml-org/gpt-oss-120b-GGUF \\\n  --jinja \\\n  -ngl 99 \\\n  --n-cpu-moe 28 \\\n  --ctx-size 16384 \\\n  --host 127.0.0.1 --port 8080\n\n# 20B on an 8GB card (llama.cpp\'s own RTX 2060 example)\nllama-server -hf ggml-org/gpt-oss-20b-GGUF --jinja \\\n  --ctx-size 32768 --n-cpu-moe 16 --host 127.0.0.1\n\n# Lower N = more experts on the GPU = faster. Lower it until\n# loading fails for lack of VRAM, then step back up.',
        },
      },
      {
        heading: 'Reasoning effort is a dial, not a fixed cost',
        headingZh: '推理强度是可调的，不是固定开销',
        body: 'GPT-OSS exposes low / medium / high reasoning effort. High spends far more tokens thinking before answering, which on local hardware is the difference between a snappy assistant and one that pauses for a minute. Set it low for chat and autocomplete, high only for problems that actually need the chain of thought.',
        bodyZh: 'GPT-OSS 支持 low / medium / high 三档推理强度。high 会在回答前消耗多得多的 token 思考，在本地硬件上这就是"响应利落的助手"和"卡一分钟"的区别。日常对话和补全用 low，只在真正需要思维链的问题上开 high。',
        code: {
          lang: 'text',
          content: 'llama.cpp (from its gpt-oss guide):\n\n  llama-server ... --chat-template-kwargs \'{"reasoning_effort": "low"}\'\n\nAny client that can only set the system message:\n\n  System: Reasoning: low\n\nRough local cost on a 16GB card (20B):\n  low     fast, chat-grade latency\n  medium  noticeably more thinking tokens\n  high    can multiply time-to-first-answer several times over\n\nStart at low. Raise it per-task, not globally.',
        },
      },
      {
        heading: 'Common failure modes',
        headingZh: '常见故障对照',
        body: 'Most GPT-OSS problems reported locally are one of five things, and none of them are the quantization. Check these before hunting for a different build.',
        bodyZh: '本地跑 GPT-OSS 报的问题绝大多数是以下五种之一，且没有一种是量化的锅。换构建之前先对照检查。',
        code: {
          lang: 'text',
          content: 'Channel markers in the output, or it never stops\n  → missing --jinja (harmony template not applied)\n\n"unknown model architecture" on load\n  → llama.cpp / Ollama predates gpt-oss support; update\n\nSlower than expected on the 120B\n  → --n-cpu-moe too high; lower it until GPU VRAM is nearly full\n\nRepetitive or oddly degraded answers\n  → check sampling: OpenAI recommends temperature 1.0 and\n    top_p 1.0, and llama.cpp\'s guide says not to use a\n    repetition penalty\n\nFile much bigger than ~11.3 GiB (20B)\n  → you downloaded an upcast build; get the MXFP4 one',
        },
      },
    ],
    faqs: [
      {
        q: 'Can GPT-OSS 20B run on an 8GB or 12GB GPU?',
        qZh: 'GPT-OSS 20B 能在 8GB 或 12GB 显卡上跑吗？',
        a: 'Not entirely on the card — this site sizes it at about 12.8GB at 4K context, and llama.cpp\'s own table is higher. It runs with some of its experts kept in system RAM: llama.cpp\'s gpt-oss guide shows it on an 8GB RTX 2060 with --n-cpu-moe 16, and reports about 67 tokens per second at the start of generation on a 12GB RTX 3060 with offloading. Because only about 3.6B parameters are active per token, it slows down far less from offloading than a dense 20B would.',
        aZh: '没法完整放在显卡上 —— 本站按 4K 上下文估算约 12.8GB，llama.cpp 自己的表格还更高。把一部分专家留在系统内存就能跑：llama.cpp 的 gpt-oss 指南用 --n-cpu-moe 16 在 8GB 的 RTX 2060 上运行它，并报告 12GB 的 RTX 3060 在卸载状态下生成初期约每秒 67 个 token。由于每个 token 只激活约 3.6B 参数，卸载带来的减速远小于同体量的稠密模型。',
      },
      {
        q: 'How fast is GPT-OSS 20B on an RTX 4090?',
        qZh: 'GPT-OSS 20B 在 RTX 4090 上有多快？',
        a: 'llama.cpp\'s own benchmark in its gpt-oss guide reports about 222 tokens per second of generation and about 8,000 tokens per second of prompt processing on an RTX 4090. Those are the llama.cpp developers\' measurements, not this site\'s; this site\'s own figure for the same card is listed on the model page with its source marked.',
        aZh: 'llama.cpp 在其 gpt-oss 指南里给出的基准测试：RTX 4090 上生成约每秒 222 个 token，提示词处理约每秒 8,000 个 token。这是 llama.cpp 开发者测的，不是本站测的；本站对同一张卡的数字列在模型页上，并标明了来源。',
      },
      {
        q: 'What sampling settings should I use for GPT-OSS?',
        qZh: 'GPT-OSS 应该用什么采样参数？',
        a: 'OpenAI recommends temperature 1.0 and top_p 1.0, and llama.cpp\'s gpt-oss guide adds: do not use a repetition penalty. Many front-ends apply their own defaults, often a lower temperature and a repetition penalty, so set these explicitly if answers come out repetitive or strangely clipped.',
        aZh: 'OpenAI 推荐 temperature 1.0、top_p 1.0，llama.cpp 的 gpt-oss 指南还补充了一条：不要用重复惩罚。很多前端会套用自己的默认值，通常是更低的 temperature 加上重复惩罚，所以如果回答重复或者莫名被截断，请显式设置这几个参数。',
      },
    ],
  },

  {
    id: 'intel-arc-llamacpp',
    gpuPreset: { gpuId: 'arc-b580', ctx: 8192 },
    relatedModelIds: ['qwen3-8b', 'gemma-3-12b-it', 'qwen3-14b', 'gemma-4-e4b'],
    title: 'Set Up llama.cpp on Intel Arc with SYCL or Vulkan',
    seoTitle: 'llama.cpp Setup on Intel Arc: SYCL or Vulkan',
    titleZh: 'Intel Arc 显卡：llama.cpp（SYCL）或 Ollama（Vulkan）',
    description: 'Check your Intel Arc GPU and driver, then choose SYCL or Vulkan for llama.cpp. Use a prebuilt ZIP on Windows or build on Linux and list devices.',
    descriptionZh: '在 Intel Arc B580、B570、A770 或 A750 上运行 llama.cpp：选择 Windows SYCL 或 Vulkan ZIP、在 Linux 上编译，或使用 Ollama Vulkan。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['Intel Arc', 'SYCL', 'llama.cpp', 'Ollama', 'Vulkan', 'GGUF'],
    publishedAt: '2026-10-04',
    updatedAt: '2026-11-26',
    // Written 2026-10-04 from llama.cpp docs/backend/SYCL.md, docs/build.md and
    // docs/docker.md, and Ollama docs/gpu.mdx + docs/docker.mdx. No `verifiedAt`:
    // there is no Arc card in this environment, so nothing here was run.
    verifiedStack: {
      en: 'Intel GPU driver · Windows 11: SYCL or Vulkan ZIP · Linux: SYCL or Vulkan build · Ollama Vulkan · GGUF',
      zh: '英特尔 GPU 驱动 · Windows 11：SYCL 或 Vulkan ZIP · Linux：编译 SYCL 或 Vulkan 版 · Ollama Vulkan · GGUF',
    },
    content: [
      {
        heading: 'Choose SYCL or Vulkan for Intel Arc',
        headingZh: 'Intel Arc 选 SYCL 还是 Vulkan',
        body: 'Start with Vulkan for a Windows install or Linux build without oneAPI. Choose llama.cpp SYCL for Intel’s oneAPI backend. Upstream lists the Arc A770, A750 and B580, and Lunar Lake integrated Arc graphics, which include the Arc 140V. The B570 and Arc Pro B70 are not named in the pinned SYCL support table; use --list-devices to check your installation rather than assuming compatibility. Ollama uses Vulkan, not SYCL. This guide uses GGUF: ExLlamaV2 requires CUDA, and this site has not confirmed which quantized formats vLLM’s Intel backend serves on consumer Arc.',
        bodyZh: '想在 Windows 上不装 oneAPI 就能运行，或在 Linux 上不装 oneAPI 就能编译，先选 Vulkan。想用英特尔的 oneAPI 后端则选 llama.cpp SYCL。上游列出了 Arc A770、A750、B580 和 Lunar Lake 的 Arc 核显（包括 Arc 140V）。固定版本的 SYCL 支持表没有列出 B570 和 Arc Pro B70；请用 --list-devices 检查本机，不要直接假定兼容。Ollama 用的是 Vulkan，不是 SYCL。本指南用 GGUF：ExLlamaV2 需要 CUDA，而本站尚未确认 vLLM 英特尔后端在消费级 Arc 上支持哪些量化格式。',
        code: {
          lang: 'text',
          content: 'llama.cpp SYCL:    Intel-specific path; upstream lists Arc A770, A750, B580\n                   Arc B570 is the same generation as B580 but not on that list\nllama.cpp Vulkan:  Windows ZIP or Linux build without oneAPI\nOllama:            Vulkan, not SYCL; enabled by default when supported\nModel format:      GGUF',
        },
      },
      {
        heading: 'Prerequisites on Linux',
        headingZh: 'Linux 上的前置条件',
        body: 'Install Intel’s GPU driver by following dgpu-docs.intel.com for your distribution, then add your user to the render and video groups and log out and back in. Then install the oneAPI Base Toolkit, keeping the default path /opt/intel/oneapi. Check the card is visible before building anything: sycl-ls should list a level_zero GPU entry. If it does not, the SYCL docs’ own advice is to run sudo sycl-ls and check the group membership — a missing group is the usual cause, not the build.',
        bodyZh: '按 dgpu-docs.intel.com 上对应发行版的说明安装英特尔 GPU 驱动，然后把用户加入 render 和 video 组并重新登录。接着安装 oneAPI Base Toolkit，保留默认路径 /opt/intel/oneapi。编译之前先确认能看到显卡：sycl-ls 应列出一个 level_zero 的 GPU 条目。如果没有，SYCL 文档自己的建议是运行 sudo sycl-ls 并检查用户组 —— 通常是没加组，而不是编译的问题。',
        code: {
          lang: 'bash',
          content: 'sudo usermod -aG render $USER\nsudo usermod -aG video $USER   # then log out and back in\n\nsource /opt/intel/oneapi/setvars.sh\nsycl-ls                        # expect a [level_zero:gpu] line for the Arc card',
        },
      },
      {
        heading: 'Build llama.cpp with SYCL',
        headingZh: '用 SYCL 编译 llama.cpp',
        body: 'The switch is GGML_SYCL=ON, compiled with Intel’s icx/icpx from the oneAPI environment you just sourced; GGML_SYCL_F16=ON is what the docs recommend for speed. Every new shell needs setvars.sh sourced again before you build or run. The first run is slower than later ones: the build has no ahead-of-time kernels, so they are compiled on first use.',
        bodyZh: '开关是 GGML_SYCL=ON，用刚才加载的 oneAPI 环境里的英特尔 icx/icpx 编译；文档建议加上 GGML_SYCL_F16=ON 以获得更好的速度。每开一个新 shell，编译或运行前都要重新 source setvars.sh。第一次运行比之后慢：这个构建没有预编译内核，内核在首次使用时才编译。',
        code: {
          lang: 'bash',
          content: 'git clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\nsource /opt/intel/oneapi/setvars.sh\ncmake -B build -DGGML_SYCL=ON -DCMAKE_C_COMPILER=icx -DCMAKE_CXX_COMPILER=icpx -DGGML_SYCL_F16=ON\ncmake --build build --config Release -j\n\n./build/bin/llama-ls-sycl-device   # lists the SYCL devices the build can see',
        },
      },
      {
        heading: 'Start the server and check it is on the GPU',
        headingZh: '启动服务并确认在用 GPU',
        body: 'Bind to 127.0.0.1 — llama-server has no authentication unless you pass --api-key. The confirmation is in the startup log, not in the fact that it answers: look for the SYCL device detection line and load_tensors reporting every layer offloaded. A build that fell back to the CPU still answers, slowly. On a machine with Intel integrated graphics as well, pin the discrete card with ONEAPI_DEVICE_SELECTOR, or list devices with --list-devices and choose one with --device.',
        bodyZh: '绑定 127.0.0.1 —— 除非传 --api-key，llama-server 没有任何鉴权。确认的依据在启动日志里，而不是“它能回答”：找 SYCL 设备检测那一行，以及 load_tensors 报告所有层都已卸载。退回 CPU 的构建照样能回答，只是很慢。如果机器上同时有英特尔核显，用 ONEAPI_DEVICE_SELECTOR 固定独显，或者用 --list-devices 列出设备、再用 --device 指定。',
        code: {
          lang: 'bash',
          content: 'ONEAPI_DEVICE_SELECTOR="level_zero:0" ./build/bin/llama-server \\\n  -m ./models/Qwen3-8B-Q4_K_M.gguf \\\n  -ngl 99 -c 8192 --host 127.0.0.1 --port 8080\n\n# In the startup log:\n#   detect 1 SYCL GPUs: [0] with top Max compute units:...\n#   load_tensors: offloaded 37/37 layers to GPU',
        },
      },
      {
        heading: 'The Ollama route',
        headingZh: 'Ollama 路线',
        body: 'Ollama uses Vulkan for Arc without a build step or oneAPI. Vulkan is on by default when the backend is installed. On Windows, update the Intel graphics driver; on Linux, install the Vulkan driver and userspace packages for your distribution. If you previously set OLLAMA_VULKAN=0 on the server, remove it and restart Ollama. On Linux, without root or cap_perfmon Ollama estimates free VRAM instead of reading it from Vulkan. After running a prompt, check the PROCESSOR column in ollama ps: 100% GPU means full offload. In a container, pass /dev/dri only — /dev/kfd is AMD’s device, and Docker will not start a container whose device does not exist.',
        bodyZh: 'Ollama 在 Arc 上使用 Vulkan，不用编译，也不用装 oneAPI。安装了 Vulkan 后端就会默认启用。Windows 上更新英特尔显卡驱动；Linux 上安装发行版对应的 Vulkan 驱动和用户态组件。如果先前在服务端设过 OLLAMA_VULKAN=0，去掉它并重启 Ollama。在 Linux 上，没有 root 权限或 cap_perfmon 能力时，Ollama 会估算可用显存，而不是从 Vulkan 读取。发一条提示词后检查 ollama ps 的 PROCESSOR 列：100% GPU 表示全部卸载到显卡。在容器里只透传 /dev/dri —— /dev/kfd 是 AMD 的设备，宿主机上没有时 Docker 会拒绝启动容器。',
        code: {
          lang: 'bash',
          content: 'curl -fsSL https://ollama.com/install.sh | sh\nsudo setcap cap_perfmon+ep /usr/local/bin/ollama\n\nollama run hf.co/Qwen/Qwen3-8B-GGUF:Q4_K_M\nollama ps                          # PROCESSOR should read 100% GPU\n\n# With an Intel iGPU too, pick the discrete card by its Vulkan index:\n#   GGML_VK_VISIBLE_DEVICES=1 ollama serve',
        },
      },
      {
        heading: 'What fits, and the speed ceiling',
        headingZh: '能装下什么，以及速度上限',
        body: 'Memory arithmetic does not care which vendor made the card. The figures below come from this site’s calculator at Q4_K_M, which every one of these models ships. Qwen3 8B at Q4_K_M with an 8K context is about 6.4 GB. Gemma 3 12B at Q4_K_M with an 8K context is about 8.8 GB. Qwen3 14B at Q4_K_M with an 8K context is about 10.7 GB, which is 89% of a B580 — past this site’s comfortable line, so keep the context short or move to the 16 GB A770. The speed column is a ceiling, not a measurement: generation reads the whole weight file once per token, so bandwidth divided by file size bounds tok/s. Nobody here has run these on Arc; real throughput will be lower.',
        bodyZh: '显存算术不关心是哪家的卡。下表来自本站计算器，均为 Q4_K_M（这几个模型都提供该档位）。Qwen3 8B 在 Q4_K_M、8K 上下文下约 6.4 GB。Gemma 3 12B 在 Q4_K_M、8K 上下文下约 8.8 GB。Qwen3 14B 在 Q4_K_M、8K 上下文下约 10.7 GB，占 B580 的 89% —— 超过了本站的“宽裕”线，所以要么缩短上下文，要么换 16 GB 的 A770。速度一栏是上限，不是实测：生成每个 token 都要把整个权重文件读一遍，所以带宽除以文件大小就是 tok/s 的上限。本站没有人在 Arc 上实际跑过，真实吞吐会更低。',
        code: {
          lang: 'text',
          content: 'Model, Q4_K_M, 8K context     size     B580 12G   A770 16G   ceiling B580 / A770\nQwen3 8B                       6.4 GB   54%        40%        97 / 119 tok/s\nGemma 3 12B                    8.8 GB   73%        55%        65 / 80 tok/s\nQwen3 14B                      10.7 GB  89%        67%        54 / 66 tok/s\n\nMeasure your own: ./build/bin/llama-bench -m <model.gguf> -ngl 99   (pp512 / tg128)',
        },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Most first-day failures on Arc are one of a few things, and only the last is the model.',
        bodyZh: 'Arc 上第一天遇到的问题大多是下面几种之一，只有最后一种和模型有关。',
        code: {
          lang: 'text',
          content: 'sycl-ls shows no level_zero GPU\n  → driver not installed, or user not in render/video (log out and back in)\n\n"setvars.sh" forgotten → icx not found at build, or SYCL libraries missing at run\n\nFirst run very slow, later runs normal\n  → kernels compiled on first use (no ahead-of-time build) — expected\n\nRuns, but on the integrated GPU\n  → ONEAPI_DEVICE_SELECTOR="level_zero:0" (llama.cpp) / GGML_VK_VISIBLE_DEVICES (Ollama)\n\nOut of device memory\n  → shorten -c, or pick a smaller quant (the SYCL docs\' own advice)',
        },
      },
      {
        heading: 'Windows 11: install a SYCL or Vulkan ZIP',
        headingZh: 'Windows 11：安装 SYCL 或 Vulkan ZIP',
        body: 'Update the Intel Arc driver and install the latest Microsoft Visual C++ Redistributable (x64) from aka.ms/vc14/vc_redist.x64.exe. Then choose the official x64 SYCL or Vulkan ZIP. The SYCL ZIP bundles the oneAPI runtime; the Vulkan ZIP needs neither oneAPI nor the Vulkan SDK. Use a separate folder for each backend. Check that --list-devices shows the Arc card before loading a GGUF model, and use --device with the listed name if the integrated GPU also appears.',
        bodyZh: '更新 Intel Arc 驱动，从 aka.ms/vc14/vc_redist.x64.exe 安装最新版 Microsoft Visual C++ 可再发行组件（x64），再选择官方 x64 SYCL 或 Vulkan ZIP。SYCL ZIP 已带 oneAPI 运行库；Vulkan ZIP 不需要 oneAPI，也不需要 Vulkan SDK。两种后端请解压到不同目录。加载 GGUF 之前，先用 --list-devices 确认 Arc 出现在设备列表中；如果还列出了集成显卡，可用 --device 指定 Arc 的设备名。',
        code: {
          lang: 'powershell',
          content: `$Build = '${LLAMACPP_BUILD}'\n$Backend = 'sycl' # or 'vulkan'\n$Zip = "llama-$Build-bin-win-$Backend-x64.zip"\n$Folder = ".\\llama-$Backend"\nInvoke-WebRequest "https://github.com/ggml-org/llama.cpp/releases/download/$Build/$Zip" -OutFile $Zip\nExpand-Archive $Zip -DestinationPath $Folder\n& "$Folder\\llama-server.exe" --list-devices\n& "$Folder\\llama-server.exe" -m "C:\\models\\your-model.gguf" -ngl all -c 4096 --host 127.0.0.1 --port 8080`,
        },
      },
      {
        heading: 'Linux: build llama.cpp with Vulkan instead of SYCL',
        headingZh: 'Linux：为 llama.cpp 编译 Vulkan 版而非 SYCL 版',
        body: 'Install a Vulkan-capable Intel driver for your distribution and check that vulkaninfo --summary lists the Arc card. The build below uses Debian or Ubuntu packages plus the llama.cpp source checkout. It needs no oneAPI. Run --list-devices and check the server log for Vulkan and the number of layers offloaded. Use --device with the Arc device name if necessary.',
        bodyZh: '为你的发行版安装支持 Vulkan 的英特尔驱动，用 vulkaninfo --summary 确认列出了 Arc 显卡。下面从 llama.cpp 源码目录开始，用的是 Debian 或 Ubuntu 软件包，无需 oneAPI。运行 --list-devices，再查看服务日志中的 Vulkan 后端和卸载到显卡的模型层数；如果需要，可用 --device 指定 Arc 的设备名。',
        code: {
          lang: 'bash',
          content: linuxVulkanSetup,
        },
      },
    ],
    faqs: [
      {
        q: 'Should I use llama.cpp SYCL or Vulkan on Intel Arc?',
        qZh: 'Intel Arc 上跑 llama.cpp，应该用 SYCL 还是 Vulkan？',
        a: 'Use Vulkan if you want a Windows install or Linux build without oneAPI. Use SYCL for llama.cpp’s Intel-specific backend; upstream lists the A770, A750 and B580, and the Windows SYCL ZIP bundles its runtime. Ollama uses Vulkan for Arc, not SYCL. This site has not measured which backend is faster on Arc.',
        aZh: '如果想在 Windows 或 Linux 上免装 oneAPI，选 Vulkan。想用 llama.cpp 的英特尔专用后端就选 SYCL；上游列出了 A770、A750 和 B580，Windows SYCL ZIP 也已带运行库。Ollama 在 Arc 上用的是 Vulkan，不是 SYCL。本站没有实测哪种后端在 Arc 上更快。',
      },
      {
        q: 'Can I use llama.cpp SYCL on Windows without installing oneAPI?',
        qZh: '在 Windows 上不装 oneAPI 能用 llama.cpp SYCL 吗？',
        a: 'Yes. On Windows 11, install the Intel graphics driver and Microsoft Visual C++ Redistributable (x64), then extract the official bin-win-sycl-x64 ZIP. It includes the SYCL runtime and dependent DLLs; no separate oneAPI Toolkit install is needed. Windows source builds still require Visual Studio and the oneAPI Base Toolkit, and the Linux SYCL package requires matching oneAPI packages.',
        aZh: '可以。在 Windows 11 上安装英特尔显卡驱动和 Microsoft Visual C++ 可再发行组件（x64），再解压官方 bin-win-sycl-x64 ZIP。包里已带 SYCL 运行时和依赖的 DLL，不用另装 oneAPI Toolkit。在 Windows 上从源码编译仍需要 Visual Studio 和 oneAPI Base Toolkit；Linux 的 SYCL 软件包则需要匹配的 oneAPI 软件包。',
      },
      {
        q: 'How many models fit on an Arc B580?',
        qZh: 'Arc B580 能装下多少个模型？',
        a: '{{fit:arc-b580}} of the {{models}} models in this index fit the B580 comfortably at 4K context, all as GGUF — the same count as any other 12 GB card, because only capacity decides what fits. The A770 16G fits {{fit:arc-a770-16}}, the B570 10G {{fit:arc-b570}}, and the A750 8G {{fit:arc-a750}}. Speed is a different question: the B580 has 456 GB/s of memory bandwidth, which sets the ceiling on tokens per second once a model fits.',
        aZh: '本索引 {{models}} 个模型中，有 {{fit:arc-b580}} 个能以 GGUF 在 4K 上下文下宽裕地装进 B580 —— 与其他 12 GB 显卡相同，因为决定能否装下的只有容量。A770 16G 可装 {{fit:arc-a770-16}} 个，B570 10G {{fit:arc-b570}} 个，A750 8G {{fit:arc-a750}} 个。速度是另一个问题：B580 的显存带宽为 456 GB/s，模型装下之后，它决定了每秒 token 数的上限。',
      },
    ],
  },

  {
    id: '12gb-gpu-what-to-run',
    gpuPreset: { gpuId: 'rtx3060', ctx: 8192 },
    relatedModelIds: ['qwen3-8b', 'gemma-3-12b-it', 'qwen3-14b', 'deepseek-v2-lite', 'qwen3-5-9b', 'mellum2-1-12b-a2-5b'],
    title: 'What to Run on a 12GB GPU (RTX 3060 12G, 4070, 5070)',
    titleZh: '12GB 显卡能跑什么（RTX 3060 12G、4070、5070）',
    seoTitle: '12GB GPU: What to Run (RTX 3060, 4070, 5070)',
    description: 'Which models fit a 12GB NVIDIA card at 8K–32K context, where 14B stops fitting, how to run them with Ollama or llama.cpp, and how to prove they are on the GPU.',
    descriptionZh: '12GB NVIDIA 显卡在 8K–32K 上下文下能装下哪些模型、14B 从哪里开始装不下、如何用 Ollama 或 llama.cpp 运行，以及如何确认确实跑在 GPU 上。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['12GB', 'RTX 3060', 'RTX 4070', 'RTX 5070', 'Ollama', 'llama.cpp', 'GGUF'],
    publishedAt: '2026-10-04',
    updatedAt: '2026-11-12',
    // Written 2026-10-04. Every size is calcVRAM on the model's own row; speeds are
    // roofline ceilings from vendor bandwidth. No `verifiedAt` — no GPU here.
    verifiedStack: {
      en: 'Windows or Linux · NVIDIA driver with CUDA · Ollama, or llama.cpp built with GGML_CUDA=ON · GGUF Q4_K_M',
      zh: 'Windows 或 Linux · 带 CUDA 的 NVIDIA 驱动 · Ollama，或以 GGML_CUDA=ON 编译的 llama.cpp · GGUF Q4_K_M',
    },
    content: [
      {
        heading: 'Which cards this covers',
        headingZh: '适用于哪些显卡',
        body: 'Seven NVIDIA cards in this index have 12GB: the RTX 3060 12G, RTX 4070, 4070 Super and 4070 Ti, RTX 5070, and RTX 3080 12G and 3080 Ti. They fit exactly the same models — only capacity decides what fits — but they do not run them at the same speed, because token generation is limited by memory bandwidth, and that ranges from 360 GB/s on the 3060 to 912 GB/s on the 3080s. A 12GB Radeon or an Arc B580 fits the same list too; the AMD and Intel Arc guides cover their runtimes.',
        bodyZh: '本索引里有七张 12GB 的 NVIDIA 卡：RTX 3060 12G、RTX 4070、4070 Super、4070 Ti、RTX 5070，以及 RTX 3080 12G 和 3080 Ti。它们能装下的模型完全一样 —— 决定能否装下的只有容量 —— 但跑起来速度不同，因为生成 token 的速度受显存带宽限制，而带宽从 3060 的 360 GB/s 到 3080 的 912 GB/s 不等。12GB 的 Radeon 或 Arc B580 能装下的模型清单也相同，它们的运行时请看 AMD 和 Intel Arc 指南。',
        code: {
          lang: 'text',
          content: 'Card            Bandwidth   ceiling for Qwen3 8B Q4_K_M\nRTX 3060 12G    360 GB/s    76 tok/s\nRTX 4070 / Super / Ti   504 GB/s    107 tok/s\nRTX 5070        672 GB/s    142 tok/s\nRTX 3080 12G / Ti       912 GB/s    193 tok/s\n\nCeilings = bandwidth ÷ weight file size. Not measured here; real speed is lower.',
        },
      },
      {
        heading: 'What fits, and where 14B stops fitting',
        headingZh: '能装下什么，以及 14B 从哪里开始装不下',
        body: '{{fit:rtx3060}} of the {{models}} models in this index fit a 12GB card comfortably at 4K context, and {{load:rtx3060}} load at all. 7B–12B models are the comfortable zone, and the context length is what decides the rest. Gemma 3 12B at Q4_K_M with a 32K context is about 10.4 GB, still comfortable, because most of its layers use a short sliding window. Mistral Nemo 12B at Q4_K_M with a 32K context is about 13.2 GB, which does not fit. 14B is the edge: Qwen3 14B at Q4_K_M with a 4K context is about 10.0 GB, comfortable, but Qwen3 14B at Q4_K_M with an 8K context is about 10.7 GB — 89% of the card, past this site’s comfortable line — and with 16K it no longer fits.',
        bodyZh: '本索引 {{models}} 个模型中，有 {{fit:rtx3060}} 个能在 4K 上下文下宽裕地装进 12GB 显卡，能加载的共 {{load:rtx3060}} 个。7B–12B 是宽裕区间，其余取决于上下文长度。Gemma 3 12B 在 Q4_K_M、32K 上下文下约 10.4 GB，仍然宽裕，因为它大部分层只用很短的滑动窗口。Mistral Nemo 12B 在 Q4_K_M、32K 上下文下约 13.2 GB，装不下。14B 是边界：Qwen3 14B 在 Q4_K_M、4K 上下文下约 10.0 GB，宽裕；但在 8K 上下文下约 10.7 GB —— 占显卡 89%，超过了本站的宽裕线 —— 到 16K 就装不下了。',
        code: {
          lang: 'text',
          content: 'GGUF Q4_K_M            8K        16K       32K\nLlama 3.1 8B           6.2 GB    7.3 GB    9.5 GB\nQwen3 8B               6.4 GB    7.7 GB    10.1 GB\nGemma 3 12B            8.8 GB    9.3 GB    10.4 GB\nMistral Nemo 12B       9.1 GB    10.5 GB   13.2 GB  ✗\nQwen3 14B              10.7 GB ~ 12.1 GB ✗ 14.9 GB ✗\nPhi-4 14B              11.0 GB ~ 12.8 GB ✗ (16K max)\n\n~ = tight (88–105% of the card)   ✗ = does not fit',
        },
      },
      {
        heading: 'Run it with Ollama',
        headingZh: '用 Ollama 运行',
        body: 'Ollama is the shortest path on Windows or Linux. Pulling straight from a Hugging Face GGUF repo pins the exact quant, which matters here: the difference between Q4_K_M and Q8_0 on a 12B model is the difference between fitting and not. Ollama sets its own context length; raise it inside the session when you need more, and check the table above before you do.',
        bodyZh: 'Windows 或 Linux 上最短的路是 Ollama。直接从 Hugging Face 的 GGUF 仓库拉取可以固定具体的量化档位，这一点在这里很关键：12B 模型用 Q4_K_M 还是 Q8_0，就是装得下和装不下的区别。Ollama 有自己的默认上下文长度；需要更长时在会话里调大，调之前先对照上面的表。',
        code: {
          lang: 'bash',
          content: 'ollama run hf.co/Qwen/Qwen3-8B-GGUF:Q4_K_M\n\n# inside the session, for a longer context:\n/set parameter num_ctx 16384\n\nollama ps          # PROCESSOR should read 100% GPU',
        },
      },
      {
        heading: 'Or run it with llama.cpp',
        headingZh: '或者用 llama.cpp 运行',
        body: 'With llama.cpp, pass -ngl all and an explicit -c. Recent builds fit the model to the card automatically and keep about 1 GiB free, so a model near the limit silently loses layers to the CPU; asking for every layer makes a model that does not fit fail loudly instead of running slowly. Bind to 127.0.0.1 unless you mean to serve your network.',
        bodyZh: '用 llama.cpp 时，传 -ngl all 和明确的 -c。新版本会自动按显卡容量调整，并保留约 1 GiB 空闲，所以接近上限的模型会悄悄把部分层留在 CPU 上；明确要求全部层上 GPU，能让装不下的模型直接报错，而不是慢吞吞地跑。除非你确实要对局域网提供服务，否则绑定 127.0.0.1。',
        code: {
          lang: 'bash',
          content: 'pip install -U huggingface_hub\nhf download Qwen/Qwen3-8B-GGUF --include "Qwen3-8B-Q4_K_M.gguf" --local-dir ./models\n\n./build/bin/llama-server -m ./models/Qwen3-8B-Q4_K_M.gguf \\\n  -ngl all -c 16384 --host 127.0.0.1 --port 8080\n\n# startup log:  load_tensors: offloaded 37/37 layers to GPU',
        },
      },
      {
        heading: 'Check it is really on the GPU',
        headingZh: '确认真的在 GPU 上',
        body: 'Three checks, any one of which is enough: ollama ps shows 100% GPU; llama.cpp’s startup log reports every layer offloaded; nvidia-smi shows the memory held while the model is loaded. On Windows, watch for the slow-but-working case: the NVIDIA control panel’s System Memory Fallback is on by default and spills VRAM into system RAM instead of failing, so a model that does not fit turns into a model that crawls. Set CUDA Sysmem Fallback Policy to prefer no fallback while you are sizing things.',
        bodyZh: '三项检查，任何一项都够：ollama ps 显示 100% GPU；llama.cpp 的启动日志显示所有层都已卸载；模型加载期间 nvidia-smi 显示显存被占用。在 Windows 上要留意“能跑但很慢”的情况：NVIDIA 控制面板的系统内存回退默认开启，显存不够时会溢出到系统内存而不是报错，于是装不下的模型变成了慢得出奇的模型。调试显存占用时，把 CUDA 系统内存回退策略设为不回退。',
        code: {
          lang: 'bash',
          content: 'nvidia-smi --query-gpu=name,memory.used,memory.total --format=csv\n\n# measure speed on your own card:\n./build/bin/llama-bench -m ./models/Qwen3-8B-Q4_K_M.gguf -ngl 99   # pp512 / tg128',
        },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Most problems on a 12GB card are the context, not the model.',
        bodyZh: '12GB 显卡上的大多数问题出在上下文，而不是模型。',
        code: {
          lang: 'text',
          content: 'Out of memory after a while, not at load\n  → the KV cache grows with the conversation; lower -c / num_ctx\n\nLoads, but generates at a few tok/s\n  → layers on the CPU: check ollama ps / the load_tensors line\n  → Windows: System Memory Fallback is hiding an out-of-memory\n\n14B fits at 4K, fails at 16K\n  → expected (see the table); drop to 8K, or use a 12B model\n\nA 20B MoE model "almost" fits\n  → keep some experts on the CPU (--n-cpu-moe), see the GPT-OSS guide',
        },
      },
    ],
    faqs: [
      {
        q: 'Can a 12GB GPU run a 14B model?',
        qZh: '12GB 显卡能跑 14B 模型吗？',
        a: 'Yes, at Q4_K_M with a short context. This site sizes Qwen3 14B at Q4_K_M at about 10.0 GB at 4K context, which is comfortable, and about 10.7 GB at 8K, which is tight. At 16K it no longer fits. If you need a long context on a 12GB card, Gemma 3 12B is the larger model that stays comfortable at 32K, because most of its layers use a sliding window.',
        aZh: '可以，用 Q4_K_M 并保持较短的上下文。本站估算 Qwen3 14B 在 Q4_K_M、4K 上下文下约 10.0 GB，宽裕；8K 下约 10.7 GB，偏紧；16K 就装不下了。如果在 12GB 显卡上需要长上下文，Gemma 3 12B 是在 32K 下仍然宽裕的较大模型，因为它大部分层使用滑动窗口。',
      },
      {
        q: 'RTX 3060 12G or RTX 4060 Ti 16G for local LLMs?',
        qZh: '跑本地大模型，RTX 3060 12G 还是 RTX 4060 Ti 16G？',
        a: 'The 16GB card fits more: {{fit:rtx4060ti16}} of the {{models}} models in this index comfortably at 4K, against {{fit:rtx3060}} for any 12GB card, and it holds 14B models at long contexts that a 12GB card cannot. On speed the 3060 is not behind — its 360 GB/s of memory bandwidth is higher than the 4060 Ti\'s 288 GB/s, and bandwidth is what limits generation once a model fits. If the models you want already fit in 12GB, the extra 4GB buys nothing.',
        aZh: '16GB 的卡能装下更多：本索引 {{models}} 个模型中，它能在 4K 下宽裕装下 {{fit:rtx4060ti16}} 个，任何 12GB 卡是 {{fit:rtx3060}} 个；它还能在长上下文下装下 12GB 卡装不下的 14B 模型。速度上 3060 并不落后 —— 它 360 GB/s 的显存带宽高于 4060 Ti 的 288 GB/s，而模型装下之后，限制生成速度的正是带宽。如果你想跑的模型 12GB 已经装得下，多出的 4GB 并不带来什么。',
      },
      {
        q: 'Can I run GPT-OSS 20B on a 12GB card?',
        qZh: '12GB 显卡能跑 GPT-OSS 20B 吗？',
        a: 'Not entirely on the card: this site sizes GPT-OSS 20B at its native MXFP4 at about 12.8 GB at 4K context, just over the limit. Because it is a mixture-of-experts model, it runs well with some experts kept in system RAM using llama.cpp\'s --n-cpu-moe option — the GPT-OSS guide covers the settings.',
        aZh: '无法完整放在显卡上：本站估算 GPT-OSS 20B 在原生 MXFP4 下、4K 上下文约 12.8 GB，略超上限。由于它是混合专家模型，用 llama.cpp 的 --n-cpu-moe 选项把部分专家留在系统内存里也能跑得不错 —— 具体设置见 GPT-OSS 指南。',
      },
    ],
  },

  {
    id: 'rtx5090-32gb-what-to-run',
    gpuPreset: { gpuId: 'rtx5090', ctx: 32768 },
    relatedModelIds: ['qwen3-32b', 'gemma-4-31b', 'qwen3-8-27b', 'qwen3-coder-30b-a3b', 'muse-glimmer-30b', 'qwen3-6-27b', 'qwen3-6-35b-a3b'],
    title: 'RTX 5090: What 32GB Actually Buys for Local LLMs',
    seoTitle: 'RTX 5090 32GB: What It Buys for Local LLMs',
    titleZh: 'RTX 5090：32GB 显存在本地大模型上到底多出什么',
    description: 'What fits on an RTX 5090 that does not fit on a 24GB card: not many more models, but much longer context and higher speed ceilings. Sizes from the calculator, setup for Blackwell.',
    descriptionZh: 'RTX 5090 能装下而 24GB 卡装不下的是什么：模型数量没多几个，但上下文长得多、速度上限更高。数字来自计算器，附 Blackwell 的配置要点。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['RTX 5090', '32GB', 'Blackwell', 'llama.cpp', 'Ollama', 'GGUF', 'long context'],
    publishedAt: '2026-10-04',
    updatedAt: '2026-11-12',
    // Written 2026-10-04. Sizes are calcVRAM on each model's own row; speeds are
    // roofline ceilings from NVIDIA's 1,792 GB/s figure. CUDA 12.8 as the first
    // toolkit with RTX 50 (sm_120) support is from NVIDIA's 12.8 release notes.
    // No `verifiedAt` — there is no GPU here.
    verifiedStack: {
      en: 'Windows or Linux · NVIDIA driver with CUDA 12.8+ · current Ollama, or llama.cpp built with GGML_CUDA=ON against CUDA 12.8+ · GGUF',
      zh: 'Windows 或 Linux · 支持 CUDA 12.8+ 的 NVIDIA 驱动 · 新版 Ollama，或基于 CUDA 12.8+、以 GGML_CUDA=ON 编译的 llama.cpp · GGUF',
    },
    content: [
      {
        heading: 'The honest answer: not many more models',
        headingZh: '老实说：能多装的模型并不多',
        body: 'At 4K context, {{fit:rtx5090}} of the {{models}} models in this index fit an RTX 5090 comfortably, against {{fit:rtx4090}} for a 24GB RTX 4090. The models that fit on neither are the 70B-and-up class: Llama 3.3 70B at Q4_K_M with an 8K context is about 47.5 GB, so a single 5090 does not change that — it takes two cards, or offloading layers to system RAM. What the extra 8GB does buy is room for context on the 27B–36B models that a 24GB card can only run with a short one, and the bandwidth — 1,792 GB/s against 1,008 — raises the speed ceiling on everything by about 1.8×.',
        bodyZh: '在 4K 上下文下，本索引 {{models}} 个模型中有 {{fit:rtx5090}} 个能宽裕地装进 RTX 5090，24GB 的 RTX 4090 是 {{fit:rtx4090}} 个。两张卡都装不下的是 70B 及以上：Llama 3.3 70B 在 Q4_K_M、8K 上下文下约 47.5 GB，单张 5090 改变不了这一点 —— 需要两张卡，或者把部分层卸载到系统内存。多出来的 8GB 真正换来的，是 27B–36B 模型的上下文空间（24GB 卡上只能用短上下文跑这些模型）；而 1,792 GB/s 对 1,008 GB/s 的带宽，让所有模型的速度上限提高约 1.8 倍。',
      },
      {
        heading: 'Where the extra 8GB goes: context',
        headingZh: '多出的 8GB 用在哪：上下文',
        body: 'The table below is where 24GB and 32GB actually differ. Qwen3 32B at Q4_K_M with an 8K context is about 22.9 GB, which is comfortable here and tight on a 24GB card. Gemma 4 31B at Q4_K_M with a 32K context is about 24.5 GB: comfortable on the 5090, 102% of a 4090 and tight there. Qwen3.8 27B at Q4_K_M with a 128K context is about 27.0 GB, which a 24GB card cannot hold at all — it stays this small because only a quarter of its layers keep a growing cache. Dense 32B models still run out at long context: Qwen3 32B at Q4_K_M with a 32K context is about 29.6 GB, tight even here.',
        bodyZh: '下表就是 24GB 和 32GB 真正拉开差距的地方。Qwen3 32B 在 Q4_K_M、8K 上下文下约 22.9 GB，在这里宽裕，在 24GB 卡上偏紧。Gemma 4 31B 在 Q4_K_M、32K 上下文下约 24.5 GB：在 5090 上宽裕，在 4090 上占 102%，偏紧。Qwen3.8 27B 在 Q4_K_M、128K 上下文下约 27.0 GB，24GB 卡完全装不下 —— 它能这么小，是因为只有四分之一的层保留随上下文增长的缓存。稠密 32B 模型在长上下文下仍会吃紧：Qwen3 32B 在 Q4_K_M、32K 上下文下约 29.6 GB，即使在这里也偏紧。',
        code: {
          lang: 'text',
          content: 'GGUF Q4_K_M               8K        32K       64K       128K\nQwen3.8 27B (hybrid)      18.8 GB   20.4 GB   22.6 GB   27.0 GB\nGemma 3 27B               18.6 GB   20.7 GB   23.5 GB   29.0 GB ~\nGemma 4 31B               22.5 GB   24.5 GB   27.3 GB   32.8 GB ~\nQwen3-Coder 30B-A3B       20.2 GB   22.7 GB   26.0 GB   32.6 GB ~\nQwen3 32B (40K max)       22.9 GB   29.6 GB ~\nSeed-OSS 36B              25.0 GB   31.6 GB ~ 40.4 GB ✗\n\n~ = tight (88–105% of 32 GB)   ✗ = does not fit',
        },
      },
      {
        heading: 'Blackwell needs a current stack',
        headingZh: 'Blackwell 需要较新的软件栈',
        body: 'The RTX 50 series is a new architecture (compute capability 12.0), and NVIDIA’s CUDA 12.8 is the first toolkit that supports it. In practice that means: a current driver, a current Ollama, and if you build llama.cpp yourself, a CUDA 12.8 or newer toolkit. An older build either fails to load the CUDA backend or falls back to the CPU — which is why the GPU check below matters more on a brand-new card than on an old one.',
        bodyZh: 'RTX 50 系列是新架构（计算能力 12.0），NVIDIA 的 CUDA 12.8 是第一个支持它的工具包。实际意味着：要用新驱动、新版 Ollama；如果自己编译 llama.cpp，要用 CUDA 12.8 或更新的工具包。旧版本要么加载不了 CUDA 后端，要么退回 CPU —— 所以在新卡上，下面的 GPU 检查比在老卡上更重要。',
        code: {
          lang: 'bash',
          content: 'nvidia-smi                 # driver version, and the CUDA version it supports\nnvcc --version             # if building llama.cpp: needs 12.8 or newer\n\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_CUDA=ON\ncmake --build build --config Release -j',
        },
      },
      {
        heading: 'Run a 32B model with a real context',
        headingZh: '用真正够用的上下文跑 32B 模型',
        body: 'Pass -ngl all and an explicit -c to llama.cpp. Recent builds fit the model to the card automatically and keep about 1 GiB free, which on a model near the limit quietly moves layers to the CPU; asking for every layer makes an oversized setting fail at load instead. Bind to 127.0.0.1 unless you intend to serve your network. With Ollama, pull the exact quant from the GGUF repo and raise num_ctx inside the session.',
        bodyZh: '给 llama.cpp 传 -ngl all 和明确的 -c。新版本会自动按显卡容量调整并保留约 1 GiB 空闲，模型接近上限时会悄悄把部分层挪到 CPU；明确要求全部层上 GPU，设置过大时就会在加载阶段直接报错。除非你确实要对局域网提供服务，否则绑定 127.0.0.1。用 Ollama 时，从 GGUF 仓库拉取指定量化档位，并在会话里调大 num_ctx。',
        code: {
          lang: 'bash',
          content: 'hf download Qwen/Qwen3-32B-GGUF --include "Qwen3-32B-Q4_K_M.gguf" --local-dir ./models\n\n./build/bin/llama-server -m ./models/Qwen3-32B-Q4_K_M.gguf \\\n  -ngl all -c 16384 --host 127.0.0.1 --port 8080\n#   load_tensors: offloaded 65/65 layers to GPU\n\n# or with Ollama:\nollama run hf.co/Qwen/Qwen3-32B-GGUF:Q4_K_M\n/set parameter num_ctx 16384',
        },
      },
      {
        heading: 'What the speed should look like',
        headingZh: '速度大概是什么样',
        body: 'Generation reads the whole weight file once per token, so bandwidth divided by file size is a hard ceiling. At 1,792 GB/s that puts Qwen3 32B at Q4_K_M under about 95 tok/s and Gemma 3 27B under about 114. These are ceilings, not measurements — this site has no runs on a 5090, and real throughput lands below them. Mixture-of-experts models such as Qwen3-Coder 30B-A3B read only their active experts per token, so they run well above what their total size suggests. Measure your own with llama-bench.',
        bodyZh: '生成每个 token 都要把整个权重文件读一遍，所以带宽除以文件大小就是硬上限。按 1,792 GB/s 算，Qwen3 32B（Q4_K_M）上限约 95 tok/s，Gemma 3 27B 上限约 114 tok/s。这些是上限，不是实测 —— 本站没有 5090 的实测记录，真实吞吐会低于它。Qwen3-Coder 30B-A3B 这类混合专家模型每个 token 只读取激活的专家，所以跑得比总参数量看上去快得多。用 llama-bench 测你自己的卡。',
        code: {
          lang: 'bash',
          content: './build/bin/llama-bench -m ./models/Qwen3-32B-Q4_K_M.gguf -ngl 99   # pp512 / tg128',
        },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'On a new card most failures are the software stack, not the model.',
        bodyZh: '在新卡上，大多数问题出在软件栈，而不是模型。',
        code: {
          lang: 'text',
          content: 'CUDA backend fails to load, or "no kernel image is available"\n  → toolkit / build older than CUDA 12.8; rebuild, or update Ollama\n\nRuns, but at CPU speed\n  → check ollama ps (100% GPU) or the load_tensors line\n  → Windows: System Memory Fallback is hiding an out-of-memory\n\n32B fine at 8K, fails at 32K\n  → expected for dense 32B (29.6 GB); use 16K, or a hybrid model like Qwen3.8 27B\n\nWant 70B\n  → does not fit one 32 GB card at Q4_K_M; see the dual-GPU guide',
        },
      },
    ],
    faqs: [
      {
        q: 'Is the RTX 5090 worth it over the RTX 4090 for local LLMs?',
        qZh: '跑本地大模型，RTX 5090 比 RTX 4090 值吗？',
        a: 'Only if you need the context or the speed. At 4K context the 5090 fits {{fit:rtx5090}} of the {{models}} models in this index comfortably and the 4090 fits {{fit:rtx4090}}, so the list of models barely changes. What changes is long context on 27B–32B models — Gemma 4 31B at Q4_K_M and 32K is comfortable on the 5090 and 102% of a 4090, tight — and the speed ceiling, which rises with bandwidth from 1,008 to 1,792 GB/s.',
        aZh: '只有你需要更长的上下文或更快的速度时才值。在 4K 上下文下，5090 能宽裕装下本索引 {{models}} 个模型中的 {{fit:rtx5090}} 个，4090 是 {{fit:rtx4090}} 个，模型清单几乎没变。变化在于 27B–32B 模型的长上下文 —— Gemma 4 31B 的 Q4_K_M 在 32K 下在 5090 上宽裕，在 4090 上占 102%，偏紧 —— 以及速度上限，它随带宽从 1,008 GB/s 提高到 1,792 GB/s。',
      },
      {
        q: 'Can an RTX 5090 run a 70B model?',
        qZh: 'RTX 5090 能跑 70B 模型吗？',
        a: 'Not on the card alone at a usable quality. This site sizes Llama 3.3 70B at Q4_K_M at about 47.5 GB with an 8K context, half again more than the card holds. Two cards, or offloading part of the model to system RAM at a large speed cost, are the realistic routes — the dual-GPU guide covers the first.',
        aZh: '单靠这张卡、以可用的质量跑不了。本站估算 Llama 3.3 70B 在 Q4_K_M、8K 上下文下约 47.5 GB，比显卡容量还多出一半。现实的路线是两张卡，或者把部分模型卸载到系统内存（速度损失很大）—— 前者见双卡指南。',
      },
      {
        q: 'What do I need to run llama.cpp on an RTX 5090?',
        qZh: '在 RTX 5090 上跑 llama.cpp 需要什么？',
        a: 'A driver and toolkit that know Blackwell: NVIDIA\'s CUDA 12.8 is the first toolkit to support the RTX 50 series, so build llama.cpp with GGML_CUDA=ON against 12.8 or newer, or use a current Ollama release. Then confirm the startup log reports every layer offloaded to the GPU — on a new card, a stack that is too old can fall back to the CPU without an obvious error.',
        aZh: '需要认识 Blackwell 的驱动和工具包：NVIDIA 的 CUDA 12.8 是第一个支持 RTX 50 系列的工具包，所以要基于 12.8 或更新版本以 GGML_CUDA=ON 编译 llama.cpp，或使用新版 Ollama。然后确认启动日志显示所有层都已卸载到 GPU —— 在新卡上，过旧的软件栈可能在没有明显报错的情况下退回 CPU。',
      },
    ],
  },
  {
    id: 'dgx-spark-64gb-vs-128gb',
    gpuPreset: { gpuId: 'dgx-spark-64', ctx: 8192 },
    relatedModelIds: ['gpt-oss-120b', 'gpt-oss-20b', 'llama-3.3-70b', 'glm-4.5-air', 'qwen3-8-flash-next'],
    title: 'DGX Spark 64GB vs 128GB: What Each One Runs',
    titleZh: 'DGX Spark 64GB 与 128GB：各自能跑什么',
    description: 'Which models fit the 64GB and 128GB DGX Spark, from the calculator: GPT-OSS 120B needs the 128GB model, 70B dense fits both, and 273 GB/s sets the speed. Setup for Ollama and llama.cpp.',
    descriptionZh: '64GB 和 128GB 两款 DGX Spark 各能装下哪些模型（数字来自计算器）：GPT-OSS 120B 需要 128GB 版，70B 稠密模型两款都能装，速度由 273 GB/s 决定。附 Ollama 与 llama.cpp 配置。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['DGX Spark', 'GB10', 'unified memory', '64GB', '128GB', 'GPT-OSS', 'Ollama', 'llama.cpp'],
    publishedAt: '2026-10-05',
    updatedAt: '2026-11-12',
    // Written 2026-10-05, ahead of the 64GB model's 23 October sale date. Specs
    // from nvidia.com (128GB LPDDR5X, 273 GB/s, 256-bit; 64GB at $4,999 from six
    // OEMs); the 64GB model's identical bandwidth from press coverage. Sizes are
    // calcVRAM on each model's own row. GB10 = compute capability 12.1 is from
    // Ollama's docs/gpu.mdx; 121a-real needing CUDA 12.9+ is from llama.cpp's
    // ggml-cuda CMakeLists; :server-cuda13 being an arm64 image from
    // docs/docker.md. No `verifiedAt` — there is no Spark here.
    verifiedStack: {
      en: 'DGX OS (Ubuntu-based, arm64) · current Ollama, or llama.cpp built with GGML_CUDA=ON against CUDA 12.9+ · GGUF',
      zh: 'DGX OS（基于 Ubuntu，arm64）· 新版 Ollama，或基于 CUDA 12.9+、以 GGML_CUDA=ON 编译的 llama.cpp · GGUF',
    },
    content: [
      {
        heading: 'The short answer',
        headingZh: '简短的回答',
        body: 'Both DGX Spark models use the same GB10 chip and the same 273 GB/s memory; the only difference that matters for local models is capacity. NVIDIA announced the 64GB model at $4,999, on sale from 23 October 2026 through Acer, ASUS, Dell, GIGABYTE, HP and MSI. At 4K context, {{fit:dgx-spark-64}} of the {{models}} models in this index fit the 64GB Spark comfortably and {{fit:dgx-spark-128}} fit the 128GB one — against {{fit:rtx5090}} for a 32GB RTX 5090. The gap between the two Sparks is narrow but it sits exactly on the models people buy a Spark for: the 100B-class mixture-of-experts releases.',
        bodyZh: '两款 DGX Spark 用的是同一颗 GB10 芯片、同样 273 GB/s 的内存；对本地模型而言，唯一要紧的差别是容量。NVIDIA 公布 64GB 版售价 4,999 美元，2026 年 10 月 23 日起通过宏碁、华硕、戴尔、技嘉、惠普和微星发售。在 4K 上下文下，本索引 {{models}} 个模型中有 {{fit:dgx-spark-64}} 个能宽裕装进 64GB 版，128GB 版是 {{fit:dgx-spark-128}} 个——32GB 的 RTX 5090 是 {{fit:rtx5090}} 个。两款 Spark 的差距不大，但恰好落在人们买 Spark 的理由上：100B 级的混合专家（MoE）模型。',
      },
      {
        heading: 'GPT-OSS 120B does not fit the 64GB model',
        headingZh: '64GB 版装不下 GPT-OSS 120B',
        body: 'GPT-OSS 120B at MXFP4 with an 8K context is about 66.5 GB — more than the whole machine has, and the CPU and DGX OS live in that same pool. The Q4_K_M conversions do not rescue it: GPT-OSS 120B at Q4_K_M with an 8K context is about 62.9 GB, 98% of the pool, which leaves the operating system nothing. On the 128GB model the native build is about half the memory. GLM-4.5-Air and Llama 4 Scout follow the same pattern at Q4_K_M; on 64GB they need their Q3_K_M builds. Note that this site treats anything over the pool as not loading at all: on a discrete card a small overrun can spill into system RAM, but a Spark has no system RAM besides this.',
        bodyZh: 'GPT-OSS 120B 在 MXFP4、8K 上下文下约 66.5 GB——比整台机器的内存还多，而 CPU 和 DGX OS 也住在同一块内存里。换 Q4_K_M 转换版也救不回来：GPT-OSS 120B 在 Q4_K_M、8K 上下文下约 62.9 GB，占这块内存的 98%，操作系统就没有空间了。在 128GB 版上，原生版本只占约一半内存。GLM-4.5-Air 和 Llama 4 Scout 在 Q4_K_M 下也是同样的情况；在 64GB 上它们需要用 Q3_K_M。注意本站把超出这块内存的模型一律判为装不下：独立显卡的小幅超出可以溢出到系统内存，但 Spark 除了这块内存之外没有别的系统内存。',
        code: {
          lang: 'text',
          content: 'GGUF                         8K        32K       128K     64GB   128GB\nGPT-OSS 20B      MXFP4      12.9 GB   13.5 GB   16.0 GB   ok     ok\nLlama 3.3 70B    Q4_K_M     47.5 GB   55.7 GB   88.7 GB   ok*    ok\nGLM-4.5-Air      Q3_K_M     55.2 GB   59.9 GB   78.9 GB   ok†    ok\nGLM-4.5-Air      Q4_K_M     68.7 GB   73.5 GB   92.5 GB   ✗      ok\nLlama 4 Scout    Q4_K_M     70.7 GB   72.0 GB   77.0 GB   ✗      ok\nGPT-OSS 120B     Q4_K_M     62.9 GB   63.8 GB   67.5 GB   ✗      ok\nGPT-OSS 120B     MXFP4      66.5 GB   67.5 GB   71.2 GB   ✗      ok\nQwen3.8-Flash-Next Q4_K_M  79.4 GB   80.2 GB   83.3 GB   ✗      ok\nQwen3 235B-A22B  Q3_K_M    120.4 GB  125.3 GB     —       ✗      ✗\n\nok = within 88% of the pool   * up to the 32K column   † 8K column only\n✗ = over 88%; past 100% it cannot load at all',
        },
      },
      {
        heading: 'What 64GB is good for',
        headingZh: '64GB 适合跑什么',
        body: 'The 64GB model is the dense-70B machine. Llama 3.3 70B at Q4_K_M with a 32K context is about 55.7 GB, inside the comfortable line, and no single consumer card holds it at all. GPT-OSS 20B at MXFP4 with a 128K context is about 16.0 GB, so it runs its full window with most of the pool to spare. GLM-4.5-Air at Q3_K_M with an 8K context is about 55.2 GB, which is the largest mixture-of-experts option, at a lower quant than you would choose with room to spare. If the plan is GPT-OSS 120B, GLM-4.5-Air at Q4_K_M or long context on 70B, buy the 128GB model.',
        bodyZh: '64GB 版是跑 70B 稠密模型的机器。Llama 3.3 70B 在 Q4_K_M、32K 上下文下约 55.7 GB，在宽裕线以内，而任何单张消费级显卡都装不下它。GPT-OSS 20B 在 MXFP4、128K 上下文下约 16.0 GB，能跑满整个上下文窗口，大部分内存还空着。GLM-4.5-Air 在 Q3_K_M、8K 上下文下约 55.2 GB，是这里最大的 MoE 选项，只是量化档位比内存充裕时会选的低。如果打算跑 GPT-OSS 120B、Q4_K_M 的 GLM-4.5-Air，或者 70B 的长上下文，就买 128GB 版。',
      },
      {
        heading: 'Speed: 273 GB/s is the ceiling for both',
        headingZh: '速度：两款的上限都是 273 GB/s',
        body: 'Generation reads the active weights once per token, so bandwidth divided by the bytes read is a hard ceiling. For a dense model that is the whole file: Llama 3.3 70B at Q4_K_M tops out around 7 tok/s on either Spark (weights only; with a 4K KV cache read too it is about 6.5). That is the trade the machine makes — an RTX 5090 moves 1,792 GB/s, about 6.6× more, on anything it can hold. Mixture-of-experts models read only their active experts, which is why GPT-OSS and GLM-4.5-Air are the natural fit here. This site has no measured run on a Spark and publishes no tok/s figure for one; measure your own with llama-bench.',
        bodyZh: '生成每个 token 都要把激活的权重读一遍，所以带宽除以读取的字节数就是硬上限。稠密模型要读整个文件：Llama 3.3 70B（Q4_K_M）在任一款 Spark 上的上限约 7 tok/s（只算权重；4K 时把 KV 缓存也算上约 6.5）。这正是这台机器的取舍——对于它能装下的模型，RTX 5090 的 1,792 GB/s 约快 6.6 倍。混合专家模型只读取激活的专家，所以 GPT-OSS 和 GLM-4.5-Air 才是这台机器的天然搭档。本站没有 Spark 的实测记录，不公布它的 tok/s 数字；请用 llama-bench 自己测。',
      },
      {
        heading: 'Setup: Ollama or llama.cpp',
        headingZh: '配置：Ollama 或 llama.cpp',
        body: 'The Spark is an Arm machine (arm64), so anything you install must have an arm64 build. Ollama\'s GPU documentation lists the GB10 (DGX Spark) as compute capability 12.1, and its standard Linux installer handles arm64. For llama.cpp, build with GGML_CUDA=ON: its CMake adds the GB10\'s native architecture only when the CUDA toolkit is 12.9 or newer. The prebuilt :server-cuda13 container image is published for arm64; the older :server-cuda image is built against CUDA 12.8 and lacks GB10 native kernels. Bind servers to 127.0.0.1 unless you mean to serve your network.',
        bodyZh: 'Spark 是 Arm 架构（arm64）机器，装的任何软件都必须有 arm64 版本。Ollama 的 GPU 文档把 GB10（DGX Spark）列为计算能力 12.1，标准的 Linux 安装脚本支持 arm64。llama.cpp 要以 GGML_CUDA=ON 编译：它的 CMake 只有在 CUDA 工具包为 12.9 或更新时才加入 GB10 的原生架构。预编译的 :server-cuda13 容器镜像提供 arm64 版本；较旧的 :server-cuda 镜像基于 CUDA 12.8，不含 GB10 的原生内核。除非确实要对局域网提供服务，否则把服务绑定到 127.0.0.1。',
        code: {
          lang: 'bash',
          content: '# Ollama\ncurl -fsSL https://ollama.com/install.sh | sh\nollama run gpt-oss:20b          # 64GB and 128GB\nollama run gpt-oss:120b         # 128GB only\n\n# llama.cpp, built on the Spark itself\nnvcc --version                  # 12.9 or newer for GB10 native kernels\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_CUDA=ON\ncmake --build build --config Release -j\n\n./build/bin/llama-server -hf ggml-org/gpt-oss-120b-GGUF --jinja \\\n  -ngl all -c 16384 --host 127.0.0.1 --port 8080   # 128GB model',
        },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'Unified memory changes the usual checks. nvidia-smi lists processes but reports no memory-usage figure on this integrated GPU, so it cannot tell you whether a model fits. With Ollama, ollama ps shows the split in its PROCESSOR column — 100% GPU is what you want. With llama.cpp, the startup log should report every layer offloaded. One habit from discrete cards does not carry over: --n-cpu-moe keeps experts in system RAM to save VRAM, but on a Spark that is the same memory, so it saves nothing and only slows generation.',
        bodyZh: '统一内存让常用的检查方法变了样。nvidia-smi 会列出进程，但在这颗集成 GPU 上不报告显存占用数字，所以它没法告诉你模型装不装得下。用 Ollama 时，ollama ps 的 PROCESSOR 列会显示分配情况——要看到 100% GPU。用 llama.cpp 时，启动日志应显示所有层都已卸载。独立显卡上的一个习惯在这里不适用：--n-cpu-moe 把专家留在系统内存里以节省显存，但在 Spark 上那是同一块内存，什么也省不下，只会拖慢生成。',
        code: {
          lang: 'text',
          content: 'ollama ps\n  NAME            SIZE     PROCESSOR    CONTEXT\n  gpt-oss:20b     ...      100% GPU     ...\n\nllama.cpp log:\n  load_tensors: offloaded 37/37 layers to GPU\n\nFails to load on 64GB with a 100B-class model\n  → expected; see the table above (use Q3_K_M, or the 128GB model)\n\n"no kernel image is available"\n  → llama.cpp built against CUDA older than 12.9; rebuild, or use :server-cuda13',
        },
      },
    ],
    faqs: [
      {
        q: 'Can the 64GB DGX Spark run GPT-OSS 120B?',
        qZh: '64GB 版 DGX Spark 能跑 GPT-OSS 120B 吗？',
        a: 'No. This site sizes GPT-OSS 120B at MXFP4 with an 8K context at about 66.5 GB, more than the machine\'s 64 GB in total, and the Q4_K_M conversion at about 62.9 GB still leaves DGX OS — which shares the same memory — nothing to run in. GPT-OSS 20B fits easily, and the 128GB model runs the 120B with about half its memory to spare.',
        aZh: '不能。本站估算 GPT-OSS 120B 在 MXFP4、8K 上下文下约 66.5 GB，比整台机器的 64 GB 还多；Q4_K_M 转换版约 62.9 GB，仍然没给共用同一块内存的 DGX OS 留下运行空间。GPT-OSS 20B 可以轻松装下，128GB 版跑 120B 也还剩约一半内存。',
      },
      {
        q: 'Should I buy the 64GB or the 128GB DGX Spark?',
        qZh: 'DGX Spark 买 64GB 还是 128GB？',
        a: 'Decide by the largest model you want. At 4K context the 64GB model fits {{fit:dgx-spark-64}} of the {{models}} models in this index comfortably and the 128GB fits {{fit:dgx-spark-128}}, with the same chip and the same 273 GB/s, so neither is faster. The ones only the 128GB holds are the 100B-class mixture-of-experts models at 4-bit — GPT-OSS 120B, GLM-4.5-Air, Llama 4 Scout and Qwen3.8-Flash-Next at Q4_K_M — plus long context on 70B.',
        aZh: '按你想跑的最大模型来决定。在 4K 上下文下，64GB 版能宽裕装下本索引 {{models}} 个模型中的 {{fit:dgx-spark-64}} 个，128GB 版是 {{fit:dgx-spark-128}} 个；两者芯片相同、带宽同为 273 GB/s，所以谁也不比谁快。只有 128GB 版装得下的，是 4-bit 的 100B 级混合专家模型——GPT-OSS 120B，以及 Q4_K_M 的 GLM-4.5-Air、Llama 4 Scout 和 Qwen3.8-Flash-Next——再加上 70B 的长上下文。',
      },
      {
        q: 'Is a DGX Spark faster than an RTX 5090 for local LLMs?',
        qZh: '跑本地大模型，DGX Spark 比 RTX 5090 快吗？',
        a: 'Not on any model both can hold. Token generation is bound by memory bandwidth, and the 5090 moves 1,792 GB/s against the Spark\'s 273, about 6.6× more. The Spark\'s advantage is capacity: 70B dense models and 100B-class mixture-of-experts models that no 32GB card holds at all.',
        aZh: '在两者都装得下的模型上不快。token 生成受内存带宽限制，5090 是 1,792 GB/s，Spark 是 273 GB/s，相差约 6.6 倍。Spark 的优势在容量：70B 稠密模型和 100B 级混合专家模型，任何 32GB 显卡都完全装不下。',
      },
    ],
  },
  {
    id: '24gb-gpu-what-to-run',
    gpuPreset: { gpuId: 'rtx4090', ctx: 32768 },
    relatedModelIds: ['qwen3-6-27b', 'gemma-4-26b-a4b', 'qwen3-coder-30b-a3b', 'north-mini-code-1.0', 'flint-40b-a2-5b', 'nemotron-3.5-lightning-30b-a3b', 'qwen3-6-35b-a3b', 'gemma-4-31b', 'qwen3-32b'],
    title: 'What to Run on a 24GB GPU (RTX 4090, 3090, RX 7900 XTX)',
    titleZh: '24GB 显卡能跑什么（RTX 4090、3090、RX 7900 XTX）',
    seoTitle: '24GB GPU: What to Run (4090, 3090, 7900 XTX)',
    description: 'Which models fit a 24GB card at 8K–128K context, which 30B-class models are only tight, and which hold a long window cheaply. Sizes from the calculator.',
    descriptionZh: '24GB 显卡在 8K–128K 上下文下能装下哪些模型、哪些 30B 级模型只是偏紧、哪些能便宜地撑起长窗口，以及如何确认确实跑在 GPU 上。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['24GB', 'RTX 4090', 'RTX 3090', 'RX 7900 XTX', 'Ollama', 'llama.cpp', 'GGUF', 'long context'],
    publishedAt: '2026-10-21',
    updatedAt: '2026-11-12',
    // Written 2026-10-21. Every size is calcVRAM on the model's own row (most of the 27B–36B
    // rows are sized from real GGUF byte counts); speeds are roofline ceilings from vendor
    // bandwidth. No `verifiedAt` — there is no GPU here.
    verifiedStack: {
      en: 'Windows or Linux · NVIDIA driver with CUDA (or ROCm for the RX 7900 XTX) · Ollama, or llama.cpp built with GGML_CUDA=ON · GGUF',
      zh: 'Windows 或 Linux · 带 CUDA 的 NVIDIA 驱动（RX 7900 XTX 用 ROCm）· Ollama，或以 GGML_CUDA=ON 编译的 llama.cpp · GGUF',
    },
    content: [
      {
        heading: 'Which cards this covers',
        headingZh: '适用于哪些显卡',
        body: 'Four cards in this index have 24GB: the RTX 4090, the RTX 3090, the Radeon RX 7900 XTX and the older Tesla P40. They fit exactly the same models, because only capacity decides what fits, but they do not run them at the same speed: generation is limited by memory bandwidth, which ranges from 346 GB/s on the P40 to 1,008 GB/s on the 4090. The RX 7900 XTX runs GGUF through ROCm or Vulkan; the AMD guide covers that setup. A 24GB Mac is a different case: macOS lets the GPU use about three quarters of it, so it fits fewer models than these cards.',
        bodyZh: '本索引里有四张 24GB 的卡：RTX 4090、RTX 3090、Radeon RX 7900 XTX，以及较老的 Tesla P40。它们能装下的模型完全一样，因为决定能否装下的只有容量；但跑起来速度不同：生成速度受显存带宽限制，从 P40 的 346 GB/s 到 4090 的 1,008 GB/s 不等。RX 7900 XTX 通过 ROCm 或 Vulkan 跑 GGUF，具体配置见 AMD 指南。24GB 的 Mac 是另一回事：macOS 只让 GPU 使用大约四分之三的内存，所以能装下的模型比这几张卡少。',
        code: {
          lang: 'text',
          content: 'Card              Bandwidth    ceiling for Qwen3.6 27B Q4_K_M\nRTX 4090          1,008 GB/s   59 tok/s\nRX 7900 XTX         960 GB/s   56 tok/s\nRTX 3090            936 GB/s   55 tok/s\nTesla P40           346 GB/s   20 tok/s\n\nCeilings = bandwidth ÷ weight file size. Not measured here; real speed is lower.',
        },
      },
      {
        heading: 'What fits, and where the 30B class gets tight',
        headingZh: '能装下什么，以及 30B 级从哪里开始偏紧',
        body: '{{fit:rtx4090}} of the {{models}} models in this index fit a 24GB card comfortably at 4K context, and {{load:rtx4090}} load at all. Up to about 27B the question is only how long a context you want. Above that, many of the newest models land just over this site’s comfortable line, which leaves room for the model but not for your desktop. Qwen3.6 27B at Q4_K_M with a 32K context is about 21.0 GB, still comfortable. Qwen3.6 35B-A3B at Q4_K_M with a 4K context is about 23.4 GB, which is tight. K2 Horizon 32B at Q4_K_M with a 4K context is about 23.1 GB, also tight. Qwen3 32B at Q4_K_M with an 8K context is about 22.9 GB, tight, and at 32K it no longer fits.',
        bodyZh: '本索引 {{models}} 个模型中，有 {{fit:rtx4090}} 个能在 4K 上下文下宽裕地装进 24GB 显卡，能加载的共 {{load:rtx4090}} 个。27B 左右及以下，只看你想要多长的上下文。再往上，很多最新的模型刚好越过本站的宽裕线：模型本身放得下，但没给桌面留余地。Qwen3.6 27B 在 Q4_K_M、32K 上下文下约 21.0 GB，仍然宽裕。Qwen3.6 35B-A3B 在 Q4_K_M、4K 上下文下约 23.4 GB，偏紧。K2 Horizon 32B 在 Q4_K_M、4K 上下文下约 23.1 GB，同样偏紧。Qwen3 32B 在 Q4_K_M、8K 上下文下约 22.9 GB，偏紧，到 32K 就装不下了。',
        code: {
          lang: 'text',
          content: 'GGUF (level)                         8K        32K       64K       128K\nGemma 4 26B-A4B (Q4_K_M)             18.3 GB   18.8 GB   19.5 GB   20.9 GB\nMuse Glimmer 30B (Q4_K_M)            17.7 GB   18.1 GB   18.5 GB   19.4 GB\nNemotron 3.5 Lightning (Q4_0)        19.8 GB   20.0 GB   20.2 GB   20.6 GB\nQwen3.6 27B (Q4_K_M)                 19.3 GB   21.0 GB   23.2 GB ~ 27.6 GB ✗\nQwen3.8 27B (Q4_K_M)                 18.8 GB   20.4 GB   22.6 GB ~ 27.0 GB ✗\nNorth Mini Code 30B-A3B (Q4_K_M)     20.2 GB   20.8 GB   21.7 GB ~ 23.5 GB ~\nQwen3-Coder 30B-A3B (Q4_K_M)         20.2 GB   22.7 GB ~ 26.0 GB ✗\nGemma 4 31B (Q4_0, Google QAT)       20.4 GB   22.5 GB ~ 25.2 GB ✗\nQwen3.6 35B-A3B (Q4_K_M)             23.5 GB ~ 24.0 GB ~ 24.7 GB ~ 26.1 GB ✗\nQwen3 32B (Q4_K_M)*                  22.9 GB ~ 29.6 GB ✗\nK2 Horizon 32B (Q4_K_M)              24.2 GB ~ 30.8 GB ✗\n\n~ = tight (88–105% of 24 GB)   ✗ = does not fit   * window ends at 40,960 tokens',
        },
      },
      {
        heading: 'Long context: pick the architecture, not the parameter count',
        headingZh: '长上下文：看架构，而不是看参数量',
        body: 'The table above splits into two groups. Models whose every layer keeps a growing cache, such as Qwen3 32B and K2 Horizon 32B, add several GB for every extra 32K of context. Models that keep a growing cache on only some layers barely move: the rest use a short sliding window or a fixed-size state. Gemma 4 26B-A4B at Q4_K_M with a 128K context is about 20.9 GB, comfortable. Nemotron 3.5 Lightning 30B-A3B at Q4_0 with a 128K context is about 20.6 GB. Muse Glimmer 30B at Q4_K_M with a 128K context is about 19.4 GB. If you want a whole repository or a long document in the window on one 24GB card, start with these rather than the dense 32B models.',
        bodyZh: '上表可以分成两组。每一层都保留随上下文增长的缓存的模型，比如 Qwen3 32B 和 K2 Horizon 32B，上下文每多 32K 就要多出好几 GB。只有部分层保留增长缓存的模型几乎不涨：其余层只用很短的滑动窗口或固定大小的状态。Gemma 4 26B-A4B 在 Q4_K_M、128K 上下文下约 20.9 GB，宽裕。Nemotron 3.5 Lightning 30B-A3B 在 Q4_0、128K 上下文下约 20.6 GB。Muse Glimmer 30B 在 Q4_K_M、128K 上下文下约 19.4 GB。如果想在一张 24GB 显卡上把整个代码仓库或一篇长文档放进窗口，先从这几个开始，而不是稠密的 32B 模型。',
      },
      {
        heading: 'For code',
        headingZh: '写代码用',
        body: 'Three coding models in this index are built for this card size. North Mini Code 1.0 30B-A3B at Q4_K_M with a 32K context is about 20.8 GB, comfortable, and stays only tight up to 128K, because 13 of its 49 layers keep a growing cache. Qwen3-Coder 30B-A3B at Q4_K_M with an 8K context is about 20.2 GB, comfortable; with a 32K context it is about 22.7 GB, tight. Recursive Flint 40B-A2.5B at Q3_K_M with a 4K context is about 20.6 GB, comfortable, and only 14 of its 49 layers keep a growing cache, so it stays only tight up to 128K; its Q4_K_M needs a 32 GB card. All three are mixture-of-experts models with 2.5–3B parameters active per token, so they generate much faster than a dense 30B. This site runs no coding benchmarks, so it does not say which writes better code.',
        bodyZh: '本索引里有三个编程模型正好面向这个显存档位。North Mini Code 1.0 30B-A3B 在 Q4_K_M、32K 上下文下约 20.8 GB，宽裕；一直到 128K 也只是偏紧，因为它 49 层中只有 13 层保留增长缓存。Qwen3-Coder 30B-A3B 在 Q4_K_M、8K 上下文下约 20.2 GB，宽裕；32K 下约 22.7 GB，偏紧。Recursive Flint 40B-A2.5B 在 Q3_K_M、4K 上下文下约 20.6 GB，宽裕；它 49 层中只有 14 层保留增长缓存，所以一直到 128K 也只是偏紧；它的 Q4_K_M 需要 32 GB 显卡。三者都是混合专家模型，每个 token 激活 2.5B–3B 参数，所以生成速度比稠密 30B 快得多。本站没有跑编程评测，所以不评判哪个代码写得更好。',
      },
      {
        heading: 'Run it',
        headingZh: '运行',
        body: 'With Ollama, pull the exact quant straight from a GGUF repo; at this size the difference between Q4_K_M and Q5_K_M is often the difference between comfortable and tight. With llama.cpp, pass -ngl all and an explicit -c. Recent builds fit the model to the card automatically and keep about 1 GiB free, so a model near the limit silently loses layers to the CPU; asking for every layer makes a setting that does not fit fail at load instead. Bind to 127.0.0.1 unless you mean to serve your network.',
        bodyZh: '用 Ollama 时，直接从 GGUF 仓库拉取指定的量化档位；在这个体量上，Q4_K_M 和 Q5_K_M 往往就是宽裕和偏紧的区别。用 llama.cpp 时，传 -ngl all 和明确的 -c。新版本会自动按显卡容量调整，并保留约 1 GiB 空闲，所以接近上限的模型会悄悄把部分层留在 CPU 上；明确要求全部层上 GPU，设置装不下时就会在加载阶段直接报错。除非你确实要对局域网提供服务，否则绑定 127.0.0.1。',
        code: {
          lang: 'bash',
          content: 'ollama run hf.co/bartowski/Qwen_Qwen3.6-27B-GGUF:Q4_K_M\n/set parameter num_ctx 32768\nollama ps          # PROCESSOR should read 100% GPU\n\n# or llama.cpp:\nhf download bartowski/Qwen_Qwen3.6-27B-GGUF --include "Qwen_Qwen3.6-27B-Q4_K_M.gguf" --local-dir ./models\n./build/bin/llama-server -m ./models/Qwen_Qwen3.6-27B-Q4_K_M.gguf \\\n  -ngl all -c 32768 --host 127.0.0.1 --port 8080\n#   load_tensors: offloaded 65/65 layers to GPU',
        },
      },
      {
        heading: 'Check it is really on the GPU',
        headingZh: '确认真的在 GPU 上',
        body: 'Any one of these is enough: ollama ps shows 100% GPU; llama.cpp’s startup log reports every layer offloaded; nvidia-smi shows the memory held while the model is loaded. A tight model is where the slow-but-working case shows up most: on Windows, the NVIDIA control panel’s System Memory Fallback is on by default and spills VRAM into system RAM instead of failing, so a model that is a few hundred MB over turns into a model that crawls. Set CUDA Sysmem Fallback Policy to prefer no fallback while you are sizing things.',
        bodyZh: '以下任何一项都够：ollama ps 显示 100% GPU；llama.cpp 的启动日志显示所有层都已卸载；模型加载期间 nvidia-smi 显示显存被占用。“能跑但很慢”最常出现在偏紧的模型上：Windows 上 NVIDIA 控制面板的系统内存回退默认开启，显存不够时会溢出到系统内存而不是报错，于是只超出几百 MB 的模型会变得慢得出奇。调试显存占用时，把 CUDA 系统内存回退策略设为不回退。',
        code: {
          lang: 'bash',
          content: 'nvidia-smi --query-gpu=name,memory.used,memory.total --format=csv\n\n# measure speed on your own card:\n./build/bin/llama-bench -m ./models/Qwen_Qwen3.6-27B-Q4_K_M.gguf -ngl 99   # pp512 / tg128',
        },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'On a 24GB card most problems come from a model that was only ever tight.',
        bodyZh: '在 24GB 显卡上，大多数问题来自一个本来就只是“偏紧”的模型。',
        code: {
          lang: 'text',
          content: 'Loads, then runs out of memory partway through a long answer\n  → the KV cache grows with the conversation; lower -c / num_ctx\n\nLoads, but generates at a few tok/s\n  → layers on the CPU: check ollama ps / the load_tensors line\n  → Windows: System Memory Fallback is hiding an out-of-memory\n\nA 35B model "fits" in the calculator but not in practice\n  → it is tight: close the browser / other GPU apps, or drop one quant level\n\nWant 70B\n  → does not fit one 24 GB card at Q4_K_M; see the dual-GPU guide',
        },
      },
    ],
    faqs: [
      {
        q: 'Can a 24GB GPU run a 32B model?',
        qZh: '24GB 显卡能跑 32B 模型吗？',
        a: 'At Q4_K_M only with a short context, and only tight. This site sizes Qwen3 32B at Q4_K_M at about 22.9 GB with an 8K context, past its comfortable line, and with a 32K context it no longer fits. Q3_K_M brings it to about 17.7 GB at 4K. If you want a dense model of about that size with a real context, Qwen3.6 27B at Q4_K_M with a 32K context is about 21.0 GB and stays comfortable.',
        aZh: '用 Q4_K_M 只能配短上下文，而且只是偏紧。本站估算 Qwen3 32B 在 Q4_K_M、8K 上下文下约 22.9 GB，已经越过宽裕线；32K 上下文就装不下了。用 Q3_K_M 时 4K 下约 17.7 GB。如果想要差不多体量、又有像样上下文的稠密模型，Qwen3.6 27B 在 Q4_K_M、32K 上下文下约 21.0 GB，仍然宽裕。',
      },
      {
        q: 'RTX 3090 or RTX 4090 for local LLMs?',
        qZh: '跑本地大模型，RTX 3090 还是 RTX 4090？',
        a: 'They fit the same models: {{fit:rtx4090}} of the {{models}} models in this index comfortably at 4K context on either card. The difference is bandwidth, 936 against 1,008 GB/s, which puts the generation ceiling for Qwen3.6 27B at Q4_K_M at about 55 tok/s on the 3090 and 59 on the 4090. For running models, as opposed to training them, a used 3090 gives up very little.',
        aZh: '能装下的模型一样：两张卡都能在 4K 上下文下宽裕装下本索引 {{models}} 个模型中的 {{fit:rtx4090}} 个。区别在带宽，936 对 1,008 GB/s，Qwen3.6 27B（Q4_K_M）的生成速度上限在 3090 上约 55 tok/s，在 4090 上约 59 tok/s。如果只是跑模型而不是训练，二手 3090 损失很小。',
      },
      {
        q: 'Can a 24GB GPU run a 70B model?',
        qZh: '24GB 显卡能跑 70B 模型吗？',
        a: 'Not on the card. This site sizes Llama 3.3 70B at Q4_K_M at about 46.1 GB with a 4K context, nearly twice what the card holds. Two 24GB cards, or offloading most of the model to system RAM at a large speed cost, are the realistic routes; the dual-GPU guide covers the first.',
        aZh: '单卡跑不了。本站估算 Llama 3.3 70B 在 Q4_K_M、4K 上下文下约 46.1 GB，接近这张卡容量的两倍。现实的路线是两张 24GB 显卡，或者把大部分模型卸载到系统内存（速度损失很大）；前者见双卡指南。',
      },
    ],
  },
];
