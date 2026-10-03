import type { Article } from './cookbook';

export const extraArticles2: Article[] = [
  {
    id: '8gb-gpu-starter-guide',
    gpuPreset: { gpuId: 'rtx4060', ctx: 4096 },
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b', 'qwen3-4b', 'phi-4-mini', 'qwen3-vl-8b', 'gemma-4-e4b'],
    title: '8GB GPU Starter Guide: 3060 / 4060 / 3070',
    titleZh: '8GB 显卡入门指南：3060 / 4060 / 3070',
    description: 'The most common local LLM hardware tier — which models, quants, and context lengths actually fit in 8GB VRAM.',
    descriptionZh: '最常见的本地 LLM 硬件档位 — 8GB 显存能跑哪些模型、量化和上下文长度。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['8GB VRAM', 'RTX 3060', 'RTX 4060', 'GGUF', 'Ollama'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on this date; see README §9, 2026-09-08.
    updatedAt: '2026-10-03',
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
          content: 'Model                       Level    Context   Estimate   On 8GB\n----------------------------------------------------------------------\nPhi-4 Mini 3.8B             Q4_K_M   4K        3.0 GB     fits, large margin\nQwen3 4B                    Q6_K     4K        4.0 GB     fits\nGemma 4 E4B (image, audio)  Q4_K_M   4K        4.9 GB     fits\nQwen2.5 7B                  Q4_K_M   4K        5.1 GB     fits\nLlama 3.1 8B                Q4_K_M   4K        5.6 GB     fits\nQwen3 8B                    Q4_K_M   4K        5.8 GB     fits\nQwen3-VL 8B (image)         Q4_K_M   4K        6.2 GB     fits\nLlama 3.1 8B                Q4_K_M   16K       7.3 GB     tight — 91% of the card\nQwen3 14B                   Q4_K_M   2K        9.7 GB     over the card — see below\nQwen2.5 32B                 any      4K        21.7 GB    not on 8GB',
        },
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
        a: 'Two in this index fit comfortably at 4K context: Gemma 4 E4B at about 4.9GB, which also takes audio, and Qwen3-VL 8B at about 6.2GB. Both are Q4_K_M estimates from this site\'s calculator. Image input adds a vision encoder, which llama.cpp loads from a separate file and which these figures do not include, so leave some margin.',
        aZh: '本索引里有两个在 4K 上下文下可以从容运行：Gemma 4 E4B 约 4.9GB，还支持音频输入；Qwen3-VL 8B 约 6.2GB。两者都是本站计算器给出的 Q4_K_M 估算。图像输入需要额外的视觉编码器，llama.cpp 会从单独的文件加载它，上面的数字不包含这部分，所以要留出一些余量。',
      },
      {
        q: 'How much context can an 8GB card handle?',
        qZh: '8GB 显卡能撑多长的上下文？',
        a: 'For an 8B model at Q4_K_M, about 16K before it leaves the comfortable band: Llama 3.1 8B is 5.6GB at 4K and 7.3GB at 16K, which is 91% of the card — tight, with nothing left for the desktop. The KV cache is the only part that grows with context. A lower quant frees room for it by shrinking the weights; a smaller model does that and also has a smaller cache per token, so it buys more window for the same memory.',
        aZh: '对 Q4_K_M 的 8B 模型来说，大约到 16K 就会离开宽裕区间：Llama 3.1 8B 在 4K 时 5.6GB，16K 时 7.3GB，占显卡的 91% —— 偏紧，已经没有余量留给桌面。随上下文增长的只有 KV 缓存。降低量化档位能通过缩小权重给它腾出空间；换更小的模型不但同样缩小权重，每个 token 的缓存也更小，所以同样的显存能换来更长的窗口。',
      },
    ],
  },
  {
    id: 'm1-8gb-ollama-limits',
    gpuPreset: { gpuId: 'm1-8', ctx: 4096 },
    relatedModelIds: ['llama-3.2-3b', 'qwen2.5-3b', 'phi-3.5-mini'],
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
    title: 'WSL2 + Ollama GPU Passthrough on Windows',
    titleZh: 'Windows WSL2 + Ollama GPU 透传',
    description: 'Run Ollama with NVIDIA GPU acceleration inside WSL2 — the most reliable Windows path for local LLMs.',
    descriptionZh: '在 WSL2 内用 NVIDIA GPU 加速运行 Ollama — Windows 本地 LLM 最稳妥的路线。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['WSL2', 'Windows', 'Ollama', 'NVIDIA', 'CUDA'],
    publishedAt: '2026-06-24',
    // Re-checked 2026-10-02 against Microsoft's WSL docs (wsl-config.md,
    // networking.md), NVIDIA's CUDA on WSL user guide, Ollama's docs (faq.mdx,
    // linux.mdx) and scripts/install.sh. A documentation check, not a run on a
    // Windows box — so a target stack, no verified date. See README §9.
    updatedAt: '2026-10-02',
    verifiedStack: {
      en: 'Windows 11 (or Win10 21H2+) · WSL2 Ubuntu 22.04/24.04 · recent NVIDIA Windows driver · Ollama Linux install · GGUF Q4_K_M',
      zh: 'Windows 11（或 Win10 21H2+）· WSL2 Ubuntu 22.04/24.04 · 较新的 NVIDIA Windows 驱动 · Ollama Linux 版 · GGUF Q4_K_M',
    },
    content: [
      {
        heading: 'Who this is for',
        headingZh: '适用于谁',
        body: 'A Windows machine with an NVIDIA GPU, where you want the Linux tooling (Ollama, llama.cpp, Python) without dual-booting. If you only want to chat with a model and never touch a terminal, the native Windows Ollama app is simpler — this guide is for the case where you also want the Linux side.',
        bodyZh: '一台带 NVIDIA 显卡的 Windows 机器，你想用 Linux 那套工具（Ollama、llama.cpp、Python）又不想装双系统。如果你只是想聊天、完全不碰终端，Windows 原生的 Ollama 应用更简单 —— 这篇是写给同时还想要 Linux 环境的情况。',
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Windows 11 (or Windows 10 21H2+), an NVIDIA GPU, and a current NVIDIA driver installed on Windows. The one rule that matters: install no NVIDIA driver inside WSL. NVIDIA\'s CUDA on WSL guide is explicit — the Windows driver is stubbed into WSL as libcuda.so under /usr/lib/wsl/lib, and a Linux driver installed on top overwrites it. The easy way to do that by accident is apt install cuda (or cuda-drivers): those meta-packages pull in the Linux driver. If you need the CUDA toolkit inside WSL for building things, NVIDIA says to install the cuda-toolkit-12-x package only.',
        bodyZh: 'Windows 11（或 Windows 10 21H2+）、一张 NVIDIA 显卡，以及 Windows 侧装好的较新 NVIDIA 驱动。唯一要紧的规则：不要在 WSL 里装任何 NVIDIA 驱动。NVIDIA 的 CUDA on WSL 指南写得很明确 —— Windows 驱动会以 libcuda.so 的形式映射进 WSL（/usr/lib/wsl/lib），在它上面再装 Linux 驱动就会把它覆盖掉。最容易误踩的是 apt install cuda（或 cuda-drivers）：这两个元包会顺带装上 Linux 驱动。如果你确实需要在 WSL 里编译东西用的 CUDA 工具包，NVIDIA 的说法是只装 cuda-toolkit-12-x 这个包。',
        code: {
          lang: 'powershell',
          content: '# PowerShell (Administrator)\nwsl --install\nwsl --update\nwsl --status          # want: default version 2\n\n# The check that matters — GPU visible from inside the WSL VM\nwsl nvidia-smi',
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
        body: 'Install the Linux build inside Ubuntu, not the Windows app — running both leaves two servers competing for port 11434 and for the GPU. On WSL2 the install script installs no GPU driver at all; it only checks for the passthrough and prints "Nvidia GPU detected." when nvidia-smi works, so if that line is missing, fix the passthrough before going further. The script also starts Ollama as a systemd service. WSL\'s documented default is systemd off, and without it the script warns "systemd is not running" and nothing is serving — enable it in /etc/wsl.conf, or run ollama serve in a second terminal. Keep models on the WSL filesystem (~/.ollama); under /mnt/c every read crosses into the Windows filesystem and loads are dramatically slower.',
        bodyZh: '在 Ubuntu 里装 Linux 版，而不是 Windows 应用 —— 两个都装会有两个服务同时抢 11434 端口和 GPU。在 WSL2 上安装脚本完全不装 GPU 驱动，只检查透传是否可用，nvidia-smi 正常时会打印 "Nvidia GPU detected."；如果没看到这一行，先修好透传再往下走。脚本还会把 Ollama 注册成 systemd 服务。WSL 文档里 systemd 默认是关闭的，没开的话脚本会警告 "systemd is not running"，此时没有任何服务在运行 —— 在 /etc/wsl.conf 里开启它，或者在另一个终端里运行 ollama serve。模型放在 WSL 文件系统里（~/.ollama）；放在 /mnt/c 下，每次读取都要跨到 Windows 文件系统，加载会慢得多。',
        code: {
          lang: 'bash',
          content: 'curl -fsSL https://ollama.com/install.sh | sh\n# look for: "Nvidia GPU detected."\n\n# If it warned "systemd is not running":\n#   printf \'[boot]\\nsystemd=true\\n\' | sudo tee -a /etc/wsl.conf\n#   then in PowerShell: wsl --shutdown\n\n# Most library tags default to Q4_K_M\nollama pull qwen3:8b\nollama run qwen3:8b',
        },
      },
      {
        heading: 'Verify it is actually on the GPU',
        headingZh: '确认真的用上了 GPU',
        body: 'Ollama falls back to CPU rather than failing, so a model that answers slowly is the symptom of a broken passthrough, not of a slow card. Two checks: ollama ps shows a PROCESSOR column that reads 100% GPU when the whole model is on the card, and nvidia-smi inside WSL shows the ollama process holding roughly the model\'s size. For Qwen3 8B at Q4_K_M and Ollama\'s default 4,096-token context, this site\'s calculator puts that at about 5.8 GB. If PROCESSOR shows a CPU share on a model that should fit, the passthrough is the problem, not the model.',
        bodyZh: 'Ollama 装不下或找不到 GPU 时会退回 CPU 而不是报错，所以"回答很慢"通常是透传坏了，而不是显卡慢。两个检查点：ollama ps 的 PROCESSOR 一列，整个模型都在显卡上时显示 100% GPU；WSL 里的 nvidia-smi 应该能看到 ollama 进程占着大约模型大小的显存。Qwen3 8B 在 Q4_K_M、Ollama 默认 4096 token 上下文下，本站计算器给出的是约 5.8 GB。如果一个本该装得下的模型 PROCESSOR 里出现了 CPU 占比，问题在透传，不在模型。',
        code: {
          lang: 'bash',
          content: 'ollama ps\n# NAME        ID     SIZE    PROCESSOR   UNTIL\n# qwen3:8b    <id>   ...     100% GPU    4 minutes from now\n\nnvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv',
        },
      },
      {
        heading: 'Reaching the API from Windows',
        headingZh: '从 Windows 访问 API',
        body: 'WSL2 forwards localhost by default, so http://localhost:11434 from a Windows browser or PowerShell reaches the server inside WSL with no extra configuration. In WSL\'s default NAT networking, nothing on your LAN can reach that server — Microsoft\'s docs say LAN access needs a netsh portproxy rule. That changes in mirrored networking mode (networkingMode=mirrored, Windows 11 22H2+), which connects WSL directly to the LAN: there, an Ollama bound to 0.0.0.0 is reachable by every machine on the network, with no authentication in front of it. Leave OLLAMA_HOST at its default unless you mean that.',
        bodyZh: 'WSL2 默认会转发 localhost，所以在 Windows 浏览器或 PowerShell 里访问 http://localhost:11434 就能连到 WSL 内的服务，不需要额外配置。在 WSL 默认的 NAT 网络模式下，局域网里的其他机器访问不到这个服务 —— 微软文档写明局域网访问需要配一条 netsh portproxy 规则。换成镜像网络模式（networkingMode=mirrored，Windows 11 22H2+）就不一样了：WSL 直接接入局域网，绑定在 0.0.0.0 上的 Ollama 对网络里每台机器都可见，而且前面没有任何鉴权。除非你确实想这样，否则 OLLAMA_HOST 保持默认。',
        code: {
          lang: 'powershell',
          content: '# From Windows PowerShell\ncurl http://localhost:11434/api/tags',
        },
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'wsl nvidia-smi fails: update the Windows driver, then wsl --update and wsl --shutdown; do not install a driver inside WSL. It worked and then stopped after an apt upgrade: check whether a cuda or cuda-drivers package got installed — that is the Linux driver overwriting the stub. "could not connect to ollama app": the server is not running, almost always because systemd is off (see the install step). nvidia-smi works but Ollama uses CPU: usually a second Ollama (the Windows app) already holding the port, or a model too large for the card — check ollama ps. Disk fills up: the WSL virtual disk grows to hold pulled models and does not shrink by itself; ollama rm removes a model, and getting the space back needs the vhdx compacted (sparseVhd=true in .wslconfig only applies to newly created disks). First load painfully slow: the model is probably under /mnt/c.',
        bodyZh: 'wsl nvidia-smi 失败：更新 Windows 驱动，然后 wsl --update 与 wsl --shutdown；不要在 WSL 里装驱动。原本好好的，一次 apt upgrade 之后不行了：检查是不是装进了 cuda 或 cuda-drivers 包 —— 那是 Linux 驱动把映射进来的驱动覆盖了。"could not connect to ollama app"：服务没在运行，几乎都是因为 systemd 没开（见安装一节）。nvidia-smi 正常但 Ollama 走 CPU：通常是另一份 Ollama（Windows 应用）占着端口，或者模型对这张卡太大 —— 用 ollama ps 看。磁盘被占满：WSL 虚拟磁盘会为拉取的模型扩容，但不会自己缩回去；ollama rm 能删模型，要真正回收空间得压缩 vhdx（.wslconfig 里的 sparseVhd=true 只对新建的磁盘生效）。首次加载极慢：模型多半放在 /mnt/c 下。',
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
    ],
  },
  {
    id: 'docker-ollama-gpu',
    relatedModelIds: ['llama-3.1-8b'],
    title: 'Docker: Ollama with NVIDIA GPU Passthrough',
    titleZh: 'Docker：Ollama NVIDIA GPU 透传',
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
    title: 'AMD GPU + llama.cpp via ROCm (Quick Start)',
    titleZh: 'AMD 显卡 + llama.cpp ROCm 快速入门',
    description: 'Run GGUF models on Radeon RX 7900 / 6800 series with llama.cpp HIP backend — what works and what does not.',
    descriptionZh: '用 llama.cpp HIP 后端在 RX 7900 / 6800 系列上跑 GGUF — 能做什么、不能做什么。',
    category: 'edge',
    difficulty: 'advanced',
    tags: ['AMD', 'ROCm', 'llama.cpp', 'HIP', 'Linux'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on 2026-09-08; FAQs + LLAMA_HIPBLAS wording 2026-10-03.
    updatedAt: '2026-10-03',
    // Expanded 2026-09-08; commands re-checked against llama.cpp docs/build.md
    // and ggml-hip/CMakeLists.txt on 2026-10-02. No `verifiedAt`: this environment has no Radeon
    // card, so the added build flags and checks are written from the
    // documented interfaces, not from a run. Saying otherwise would make the
    // badge meaningless on the other guides too.
    verifiedStack: {
      en: 'Linux (Ubuntu 22.04/24.04) · ROCm 6.1+ · llama.cpp built with GGML_HIP=ON · RX 7900 / 6800 class · GGUF',
      zh: 'Linux（Ubuntu 22.04/24.04）· ROCm 6.1+ · 以 GGML_HIP=ON 编译的 llama.cpp · RX 7900 / 6800 级显卡 · GGUF',
    },
    content: [
      {
        heading: 'Who this is for, and what actually works',
        headingZh: '适用于谁，以及哪些真的能用',
        body: 'A Radeon card on Linux, running GGUF through llama.cpp. Two things to settle before you start. ROCm on consumer Radeon is Linux-first: llama.cpp does document a Windows HIP build, but the HSA_OVERRIDE_GFX_VERSION workaround below does not work on Windows, so a card outside AMD’s official list is usually better served there by the Vulkan backend. And format choice is narrower than on NVIDIA — GGUF works, and vLLM ships official ROCm builds for AWQ/GPTQ serving (RX 7700 XT and up, RX 9000 — not RX 6000 or the 7600 XT), but EXL2 is CUDA-only and no amount of ROCm setup will change that.',
        bodyZh: '一张跑在 Linux 上的 Radeon 显卡，用 llama.cpp 跑 GGUF。开始前先明确两点。消费级 Radeon 的 ROCm 以 Linux 为主：llama.cpp 文档里也有 Windows 上的 HIP 构建方法，但下面的 HSA_OVERRIDE_GFX_VERSION 变通办法在 Windows 上无效，所以不在 AMD 官方支持列表里的显卡，在 Windows 上通常更适合用 Vulkan 后端。另外可选格式比 NVIDIA 窄 —— GGUF 可用，vLLM 也有官方 ROCm 构建可用于 AWQ/GPTQ 服务（限 RX 7700 XT 及以上、RX 9000 系列，不含 RX 6000 和 7600 XT），但 EXL2 是 CUDA 独占，再怎么配 ROCm 也没用。',
        code: {
          lang: 'text',
          content: 'Best reports:  RX 7900 XTX / XT (gfx1100), W7900\nWorks:         RX 7800 XT / 7700 XT (gfx1101), RX 6800 XT / 6900 XT (gfx1030)\nPatchy:        RX 6700 XT (gfx1031), older Polaris\nNot supported: integrated Radeon graphics',
        },
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Install ROCm 6.1 or newer from AMD’s repository for your distribution — llama.cpp’s HIP build refuses anything older — then add your user to the render and video groups and log out and back in. Missing group membership is the classic first failure: rocminfo reports no agents, and every later step looks like a build problem when it is a permissions problem. Find your card’s gfx target now — you need it for the build.',
        bodyZh: '按你的发行版从 AMD 仓库安装 ROCm 6.1 或更新版本（llama.cpp 的 HIP 构建会拒绝更旧的版本），然后把用户加入 render 和 video 组，并重新登录。忘记加组是最典型的第一个坑：rocminfo 报告找不到设备，而后面每一步看起来都像编译问题，其实是权限问题。现在先确认显卡的 gfx 目标，编译时要用。',
        code: {
          lang: 'bash',
          content: 'sudo usermod -aG render,video $USER   # then log out and back in\n\nrocminfo | grep -i gfx      # e.g. gfx1100 for RX 7900 XTX\nrocm-smi                    # card, VRAM, temperature',
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
        body: 'ROCm refuses to initialise on gfx targets it does not officially support, even when the card is architecturally close to one that is. HSA_OVERRIDE_GFX_VERSION tells the runtime to treat it as the nearest supported target: 11.0.0 for RDNA3, 10.3.0 for RDNA2. This is a workaround, not a supported configuration — it is widely used and it can also produce wrong results or hangs on some kernels, so validate output before trusting it.',
        bodyZh: 'ROCm 对于官方未支持的 gfx 目标会直接拒绝初始化，哪怕架构上和某个受支持型号很接近。HSA_OVERRIDE_GFX_VERSION 让运行时把它当作最接近的受支持目标：RDNA3 用 11.0.0，RDNA2 用 10.3.0。这是绕过手段而非受支持配置 —— 用的人很多，但在部分内核上也可能出现结果错误或卡死，采信前请先验证输出。',
        code: {
          lang: 'bash',
          content: '# RDNA2 card reporting gfx1031, treated as gfx1030\nexport HSA_OVERRIDE_GFX_VERSION=10.3.0\n\n# RDNA3\n# export HSA_OVERRIDE_GFX_VERSION=11.0.0',
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
    ],
    faqs: [
      {
        q: 'Should I use ROCm or Vulkan for llama.cpp on a Radeon?',
        qZh: 'Radeon 上跑 llama.cpp，该用 ROCm 还是 Vulkan？',
        a: 'On Linux with a card AMD officially supports, ROCm (the HIP build in this guide) is the documented path. Vulkan is the fallback that needs no ROCm install at all: build with -DGGML_VULKAN=ON instead of GGML_HIP. It is the better choice on Windows for a card outside AMD’s list, because llama.cpp’s build docs note that HSA_OVERRIDE_GFX_VERSION is not supported on Windows. This site has not measured either backend on a Radeon, so it does not say which is faster — run both on your card with the same model and context and compare.',
        aZh: '在 Linux 上、且显卡在 AMD 官方支持列表里时，ROCm（也就是本指南的 HIP 构建）是文档给出的路径。Vulkan 是完全不需要安装 ROCm 的后备方案：编译时用 -DGGML_VULKAN=ON 代替 GGML_HIP。在 Windows 上、显卡又不在 AMD 列表里时，它是更好的选择，因为 llama.cpp 的构建文档写明 HSA_OVERRIDE_GFX_VERSION 在 Windows 上不受支持。本站没有在 Radeon 上实测过任何一个后端，所以不下“谁更快”的结论 —— 用同一个模型和上下文在你的卡上两个都跑一遍再比较。',
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
        a: 'At 4K context, 69 of the 87 models in this index fit the RX 7900 XTX comfortably, against 53 on a 16GB RX 7800 XT or RX 9070 XT. The difference is the 30B class. Qwen3 30B-A3B at Q4_K_M is about 20.2 GB at 8K context — 84% of a 7900 XTX, comfortable — and does not fit a 16GB card. GPT-OSS 20B at MXFP4 is about 12.9 GB at 8K context, so it runs on either. These are memory figures only; this site has no Radeon speed measurements.',
        aZh: '在 4K 上下文下，本索引 87 个模型中有 69 个能宽裕地放进 RX 7900 XTX，而 16GB 的 RX 7800 XT 或 RX 9070 XT 是 53 个。差距在 30B 这一档。Qwen3 30B-A3B 的 Q4_K_M 在 8K 上下文下约 20.2 GB —— 占 7900 XTX 的 84%，属于宽裕 —— 而 16GB 卡放不下。GPT-OSS 20B 的 MXFP4 在 8K 上下文下约 12.9 GB，两种卡都能跑。以上只是显存数字；本站没有 Radeon 上的速度实测。',
      },
    ],
  },
  {
    id: 'windows-ollama-native',
    title: 'Ollama on Windows (Native, No WSL)',
    titleZh: 'Windows 原生 Ollama（不用 WSL）',
    description: 'Install the Windows Ollama app for the simplest path — GPU works on NVIDIA; AMD is CPU-only for now.',
    descriptionZh: '安装 Windows 版 Ollama 最简单 — NVIDIA 可用 GPU；AMD 目前仅 CPU。',
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
];