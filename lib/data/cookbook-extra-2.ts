import type { Article } from './cookbook';

export const extraArticles2: Article[] = [
  {
    id: '8gb-gpu-starter-guide',
    gpuPreset: { gpuId: 'rtx4060', ctx: 4096 },
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b', 'qwen3-4b', 'phi-4-mini', 'qwen3-vl-8b'],
    title: '8GB GPU Starter Guide: 3060 / 4060 / 3070',
    titleZh: '8GB 显卡入门指南：3060 / 4060 / 3070',
    description: 'The most common local LLM hardware tier — which models, quants, and context lengths actually fit in 8GB VRAM.',
    descriptionZh: '最常见的本地 LLM 硬件档位 — 8GB 显存能跑哪些模型、量化和上下文长度。',
    category: 'edge',
    difficulty: 'beginner',
    tags: ['8GB VRAM', 'RTX 3060', 'RTX 4060', 'GGUF', 'Ollama'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on this date; see README §9, 2026-09-08.
    updatedAt: '2026-09-08',
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
          content: 'Model                       Level    Context   Estimate   On 8GB\n----------------------------------------------------------------------\nPhi-4 Mini 3.8B             Q4_K_M   4K        2.9 GB     fits, large margin\nQwen3 4B                    Q6_K     4K        4.1 GB     fits\nQwen2.5 7B                  Q4_K_M   4K        5.1 GB     fits\nLlama 3.1 8B                Q4_K_M   4K        5.6 GB     fits\nQwen3 8B                    Q4_K_M   4K        5.8 GB     fits\nLlama 3.1 8B                Q4_K_M   16K       7.1 GB     fits, little margin\nQwen3 14B                   Q4_K_M   2K        9.7 GB     over the card — see below\nQwen2.5 32B                 any      4K        21.7 GB    not on 8GB',
        },
      },
      {
        heading: 'What "over the card" actually means',
        headingZh: '“超出显卡容量”到底意味着什么',
        body: 'A 14B at Q4_K_M needs about 9.7GB against 8GB of VRAM. That is not "tight" — it will not load fully on the GPU. Two real options: use the AWQ/GPTQ INT4 build of the same model, which the index puts at about 8.1GB and which is still above the comfortable band, or keep GGUF and offload part of the model to system RAM. Partial offload works and is what Ollama does by default when a model does not fit, but the layers left on the CPU are read over PCIe every token, so throughput falls sharply — how far depends on your PCIe link and RAM speed, and this guide has not measured it on your hardware. Budget for the offloaded weights in system RAM on top of what the OS needs: roughly 2GB for the 14B case above, and keep 16GB total system RAM as the floor.',
        bodyZh: '14B 的 Q4_K_M 约需 9.7GB，而显卡只有 8GB。这不是“勉强”，而是根本无法完整装入 GPU。两条现实路径：改用同一模型的 AWQ/GPTQ INT4 版本（索引给出约 8.1GB，仍高于宽裕区间），或者继续用 GGUF 并把一部分模型卸载到系统内存。部分卸载确实可行，Ollama 在装不下时默认就这么做，但留在 CPU 上的层每生成一个 token 都要经 PCIe 读取，吞吐会大幅下降 —— 具体降多少取决于你的 PCIe 带宽和内存速度，本指南没有在你的硬件上实测过。请为卸载出去的权重额外预留系统内存：上面这个 14B 的例子约 2GB，系统内存建议不低于 16GB。',
        code: {
          lang: 'bash',
          content: '# llama.cpp: choose the split yourself, and watch the log line\n# "offloaded N/M layers to GPU" to confirm what actually landed on the card\nllama-server -m qwen3-14b-Q4_K_M.gguf -ngl 28 -c 2048 --host 127.0.0.1\n\n# Fewer layers on the GPU = less VRAM, slower generation.\n# Drop -ngl until it loads, rather than guessing.',
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
          content: 'ollama ps\n# NAME            SIZE     PROCESSOR    UNTIL\n# qwen2.5:7b      5.6 GB   100% GPU     4 minutes from now\n\nnvidia-smi --query-compute-apps=pid,used_memory --format=csv',
        },
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'Out of memory on load: the context is usually the cause, not the weights — the KV cache grows linearly with it, so 16K costs a 8B model about 2GB over its 4K figure. Lower the context first. Slow generation with a model that should fit: check `ollama ps` as above; something else on the card (a browser, a game, a second model still resident) is the usual culprit, and `ollama stop <model>` frees the previous one. Windows specifically: the desktop compositor holds VRAM that never appears in your model\'s own accounting, so treat the 88% band as the real ceiling.',
        bodyZh: '加载时显存不足：多数情况是上下文而不是权重造成的 —— KV 缓存随上下文线性增长，8B 模型从 4K 提到 16K 大约要多占 2GB。先降上下文。本该装得下却很慢：按上面的方法看 `ollama ps`；通常是显卡上还有别的东西（浏览器、游戏、上一个还驻留的模型），`ollama stop <模型>` 可以释放前一个。Windows 特别注意：桌面合成器占用的显存不会出现在模型自己的统计里，所以请把 88% 这条线当作真正的上限。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'Put your own card into the VRAM calculator to see the full list of what fits at the context you actually use — the numbers above are one row of that table. If you are on Windows, the WSL2 + Ollama GPU guide covers driver passthrough, which is where most 8GB setups actually get stuck.',
        bodyZh: '把你自己的显卡填进显存计算器，就能看到在你实际使用的上下文下完整的可运行列表 —— 上面的表格只是其中几行。如果你用 Windows，WSL2 + Ollama GPU 指南讲的是驱动直通，这才是多数 8GB 配置真正卡住的地方。',
      },
    ],
  },
  {
    id: 'm1-8gb-ollama-limits',
    gpuPreset: { gpuId: 'm3-8', ctx: 4096 },
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
    gpuPreset: { gpuId: 'rtx4060ti16', ctx: 8192 },
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b', 'gpt-oss-20b'],
    title: 'WSL2 + Ollama GPU Passthrough on Windows',
    titleZh: 'Windows WSL2 + Ollama GPU 透传',
    description: 'Run Ollama with NVIDIA GPU acceleration inside WSL2 — the most reliable Windows path for local LLMs.',
    descriptionZh: '在 WSL2 内用 NVIDIA GPU 加速运行 Ollama — Windows 本地 LLM 最稳妥的路线。',
    category: 'edge',
    difficulty: 'intermediate',
    tags: ['WSL2', 'Windows', 'Ollama', 'NVIDIA', 'CUDA'],
    publishedAt: '2026-06-24',
    // Rewritten from the index on this date; see README §9, 2026-09-08.
    updatedAt: '2026-09-08',
    // Expanded 2026-09-08 with prerequisites, verification and the failure
    // modes readers actually hit. The new steps have not been re-run on a
    // Windows box since, so this carries a target stack but no verified date.
    verifiedStack: {
      en: 'Windows 11 (or Win10 21H2+) · WSL2 Ubuntu 22.04/24.04 · recent NVIDIA Windows driver · Ollama Linux install · GGUF Q4_K_M',
      zh: 'Windows 11（或 Win10 21H2+）· WSL2 Ubuntu 22.04/24.04 · 较新的 NVIDIA Windows 驱动 · Ollama Linux 版 · GGUF Q4_K_M',
    },
    content: [
      {
        heading: 'Who this is for',
        headingZh: '适用于谁',
        body: 'A Windows machine with an NVIDIA GPU, where you want the Linux tooling (Ollama, llama.cpp, Python) without dual-booting. If you only want to chat with a model and never touch a terminal, the native Windows Ollama app is simpler — this guide is for the case where you also want the Linux side.',
        bodyZh: '一台带 NVIDIA 显卡的 Windows 机器，你想用 Linux 那套工具（Ollama、llama.cpp、Python）又不想装双系统。如果你只是想聊天、完全不碰终端，Windows 原生版 Ollama 更简单 —— 本指南面向的是同时还要 Linux 环境的情况。',
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Windows 11 (or Windows 10 21H2+), an NVIDIA GPU, and a current NVIDIA driver installed on Windows. The single most important rule: do not install an NVIDIA driver inside WSL. The Windows driver projects CUDA into the WSL kernel through /usr/lib/wsl/lib, and installing a Linux driver on top overwrites those stubs and breaks passthrough — this is the most common way a working setup stops working.',
        bodyZh: 'Windows 11（或 Windows 10 21H2+）、一张 NVIDIA 显卡，以及 Windows 侧安装好的较新 NVIDIA 驱动。最重要的一条规则：不要在 WSL 里安装 NVIDIA 驱动。Windows 驱动通过 /usr/lib/wsl/lib 把 CUDA 投射进 WSL 内核，再在里面装一份 Linux 驱动会覆盖这些桩文件、直接破坏透传 —— 这是本来能用的环境突然坏掉最常见的原因。',
        code: {
          lang: 'powershell',
          content: '# PowerShell (Administrator)\nwsl --install\nwsl --update\nwsl --status          # want: default version 2\n\n# The check that matters — GPU visible from inside the WSL VM\nwsl nvidia-smi',
        },
      },
      {
        heading: 'Give the WSL VM enough RAM',
        headingZh: '给 WSL 虚拟机足够内存',
        body: 'WSL2 runs in a lightweight VM with its own memory limit, historically about half of host RAM. That ceiling is invisible until a model needs CPU offload and the VM runs out well before Windows does. Set it explicitly in %UserProfile%\\.wslconfig, then wsl --shutdown to apply. Leave several GB for Windows itself.',
        bodyZh: 'WSL2 跑在一个轻量虚拟机里，有自己的内存上限，通常约为主机内存的一半。这个上限平时看不见，直到模型需要 CPU 卸载时，虚拟机会远早于 Windows 先耗尽内存。在 %UserProfile%\\.wslconfig 里显式设置，然后 wsl --shutdown 生效。记得给 Windows 本身留出若干 GB。',
        code: {
          lang: 'text',
          content: '# %UserProfile%\\.wslconfig   (example for a 32GB machine)\n[wsl2]\nmemory=20GB\nswap=8GB\n\n# then, in PowerShell:\n# wsl --shutdown',
        },
      },
      {
        heading: 'Install Ollama inside WSL',
        headingZh: '在 WSL 中安装 Ollama',
        body: 'Install the Linux build inside Ubuntu, not the Windows app — running both leaves two servers competing for port 11434 and for the GPU. Keep models on the WSL filesystem (~/.ollama); putting them under /mnt/c crosses the 9p filesystem boundary on every read and is dramatically slower to load.',
        bodyZh: '在 Ubuntu 里安装 Linux 版，而不是 Windows 应用 —— 两者同时装会有两个服务同时抢 11434 端口和 GPU。模型放在 WSL 文件系统里（~/.ollama）；放到 /mnt/c 下每次读取都要跨 9p 文件系统边界，加载会慢得多。',
        code: {
          lang: 'bash',
          content: 'curl -fsSL https://ollama.com/install.sh | sh\n\n# Default tag is Q4_K_M for most models, regardless of your card\nollama pull qwen2.5:7b\nollama run qwen2.5:7b',
        },
      },
      {
        heading: 'Verify it is actually on the GPU',
        headingZh: '确认真的用上了 GPU',
        body: 'Ollama will fall back to CPU rather than fail, so a model that answers slowly is the symptom of a broken passthrough, not of a slow card. Two checks: ollama ps shows a PROCESSOR column that reads 100% GPU when the whole model is resident on the card, and nvidia-smi inside WSL should show the ollama process holding roughly the model size. If PROCESSOR shows a CPU share on a model that should fit, the passthrough is the problem, not the model.',
        bodyZh: 'Ollama 装不下时会退回 CPU 而不是报错，所以“回答很慢”通常是透传坏了，而不是显卡慢。两个检查点：ollama ps 的 PROCESSOR 一列，整模型在显卡上时显示 100% GPU；在 WSL 里跑 nvidia-smi，应能看到 ollama 进程占用约等于模型大小的显存。如果一个本该装得下的模型出现了 CPU 占比，问题出在透传而不是模型。',
        code: {
          lang: 'bash',
          content: 'ollama ps\n# NAME            SIZE     PROCESSOR    UNTIL\n# qwen2.5:7b      5.1 GB   100% GPU     4 minutes from now\n\nnvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv',
        },
      },
      {
        heading: 'Reaching the API from Windows',
        headingZh: '从 Windows 访问 API',
        body: 'WSL2 forwards localhost, so http://localhost:11434 from a Windows browser or PowerShell reaches the server inside WSL with no extra configuration. Prefer that over binding Ollama to 0.0.0.0: the WSL VM sits on a bridged network, and a server bound to all interfaces there is reachable from your LAN with no authentication in front of it.',
        bodyZh: 'WSL2 会转发 localhost，所以在 Windows 浏览器或 PowerShell 里访问 http://localhost:11434 就能连到 WSL 内的服务，不需要额外配置。优先用这种方式，而不是把 Ollama 绑到 0.0.0.0：WSL 虚拟机处于桥接网络，绑定到所有网卡的服务在局域网内可直接访问，且前面没有任何鉴权。',
        code: {
          lang: 'powershell',
          content: '# From Windows PowerShell\ncurl http://localhost:11434/api/tags',
        },
      },
      {
        heading: 'Common problems',
        headingZh: '常见问题',
        body: 'wsl nvidia-smi fails: update the Windows driver, then wsl --update and wsl --shutdown; do not install a driver inside WSL. nvidia-smi works but Ollama uses CPU: usually a second Ollama (the Windows app) already holding the port, or a model too large for the card — check ollama ps. Disk fills up: the WSL virtual disk grows to hold pulled models and does not shrink on its own; ollama rm removes a model, and reclaiming the space needs a manual compact of the vhdx. First load painfully slow: the model is probably under /mnt/c.',
        bodyZh: 'wsl nvidia-smi 失败：更新 Windows 驱动，然后 wsl --update 与 wsl --shutdown；不要在 WSL 里装驱动。nvidia-smi 正常但 Ollama 走 CPU：通常是另一份 Ollama（Windows 应用）已经占住端口，或模型对显卡来说太大 —— 用 ollama ps 确认。磁盘被占满：WSL 虚拟磁盘会随拉取的模型增长且不会自动收缩；ollama rm 可删除模型，但回收空间需要手动压缩 vhdx。首次加载极慢：模型多半放在 /mnt/c 下。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'Put your card into the VRAM calculator to see what else fits at the context you actually use before pulling a larger model — on Windows, subtract the 0.5–1.5GB the desktop already holds.',
        bodyZh: '在拉更大的模型之前，把你的显卡填进显存计算器，看看在你实际使用的上下文下还有什么装得下 —— Windows 上记得先减去桌面本身占用的 0.5–1.5GB。',
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
    // Rewritten from the index on this date; see README §9, 2026-09-08.
    updatedAt: '2026-09-08',
    // Expanded 2026-09-08. No `verifiedAt`: this environment has no Radeon
    // card, so the added build flags and checks are written from the
    // documented interfaces, not from a run. Saying otherwise would make the
    // badge meaningless on the other guides too.
    verifiedStack: {
      en: 'Linux (Ubuntu 22.04/24.04) · ROCm 6.x · llama.cpp built with GGML_HIP=ON · RX 7900 / 6800 class · GGUF',
      zh: 'Linux（Ubuntu 22.04/24.04）· ROCm 6.x · 以 GGML_HIP=ON 编译的 llama.cpp · RX 7900 / 6800 级显卡 · GGUF',
    },
    content: [
      {
        heading: 'Who this is for, and what actually works',
        headingZh: '适用于谁，以及哪些真的能用',
        body: 'A Radeon card on Linux, running GGUF through llama.cpp. Two things to settle before you start. ROCm on consumer Radeon is Linux-first: the Windows story for llama.cpp is still experimental, and the practical Windows path is Vulkan rather than HIP. And format choice is narrower than on NVIDIA — GGUF works, and vLLM ships official ROCm builds for AWQ/GPTQ serving, but EXL2 is CUDA-only and no amount of ROCm setup will change that.',
        bodyZh: '一张跑在 Linux 上的 Radeon 显卡，用 llama.cpp 跑 GGUF。开始前先明确两点。消费级 Radeon 的 ROCm 以 Linux 为主：llama.cpp 的 Windows 支持仍属实验性，Windows 上更现实的路线是 Vulkan 而非 HIP。另外可选格式比 NVIDIA 窄 —— GGUF 可用，vLLM 也有官方 ROCm 构建可用于 AWQ/GPTQ 服务，但 EXL2 是 CUDA 独占，再怎么配 ROCm 也没用。',
        code: {
          lang: 'text',
          content: 'Best reports:  RX 7900 XTX / XT (gfx1100), W7900\nWorks:         RX 7800 XT / 7700 XT (gfx1101), RX 6800 XT / 6900 XT (gfx1030)\nPatchy:        RX 6700 XT (gfx1031), older Polaris\nNot supported: integrated Radeon graphics',
        },
      },
      {
        heading: 'Prerequisites',
        headingZh: '前置条件',
        body: 'Install ROCm 6.x from AMD’s repository for your distribution, then add your user to the render and video groups and log out and back in. Missing group membership is the classic first failure: rocminfo reports no agents, and every later step looks like a build problem when it is a permissions problem. Find your card’s gfx target now — you need it for the build.',
        bodyZh: '按你的发行版从 AMD 仓库安装 ROCm 6.x，然后把用户加入 render 和 video 组，并重新登录。忘记加组是最典型的第一个坑：rocminfo 报告找不到设备，而后面每一步看起来都像编译问题，其实是权限问题。现在先确认显卡的 gfx 目标，编译时要用。',
        code: {
          lang: 'bash',
          content: 'sudo usermod -aG render,video $USER   # then log out and back in\n\nrocminfo | grep -i gfx      # e.g. gfx1100 for RX 7900 XTX\nrocm-smi                    # card, VRAM, temperature',
        },
      },
      {
        heading: 'Build llama.cpp with the HIP backend',
        headingZh: '用 HIP 后端编译 llama.cpp',
        body: 'The flag is GGML_HIP=ON. The older LLAMA_HIPBLAS name is gone, and CMake ignores unknown -D options silently — pass the old name and you get a build that compiles cleanly, runs, and is CPU-only. Set AMDGPU_TARGETS to your gfx target so the kernels are actually compiled for your card.',
        bodyZh: '编译开关是 GGML_HIP=ON。旧的 LLAMA_HIPBLAS 名称已被移除，而 CMake 对不认识的 -D 参数是静默忽略的 —— 用旧名字会得到一个编译顺利、能运行、但纯 CPU 的构建。同时把 AMDGPU_TARGETS 设为你的 gfx 目标，确保内核真的为你的卡编译。',
        code: {
          lang: 'bash',
          content: 'git clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\n\ncmake -B build \\\n  -DGGML_HIP=ON \\\n  -DAMDGPU_TARGETS=gfx1100 \\\n  -DCMAKE_BUILD_TYPE=Release \\\n  -DCMAKE_C_COMPILER=hipcc -DCMAKE_CXX_COMPILER=hipcc\ncmake --build build -j$(nproc)',
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
          content: './build/bin/llama-server \\\n  -m ./models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\\n  -ngl 99 -c 8192 --host 127.0.0.1 --port 8080\n\n# In the startup log, look for the ROCm device line and:\n#   llm_load_tensors: offloaded 33/33 layers to GPU\n\nrocm-smi --showmemuse',
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
        body: 'rocminfo finds no agents: group membership, or the kernel module did not load — check dmesg for amdgpu. hipErrorNoBinaryForGpu at load: the build did not include your gfx target; rebuild with the right AMDGPU_TARGETS, or set HSA_OVERRIDE_GFX_VERSION. Builds fine but runs on CPU: almost always the old LLAMA_HIPBLAS flag, silently ignored — check the startup log for the backend line. Hangs or garbage output after an override: the override is not a supported path; drop back to a lower context or a different quant before assuming the model is at fault.',
        bodyZh: 'rocminfo 找不到设备：要么是用户组没加，要么是内核模块没加载 —— 用 dmesg 查 amdgpu。加载时报 hipErrorNoBinaryForGpu：编译时没有包含你的 gfx 目标；用正确的 AMDGPU_TARGETS 重新编译，或设置 HSA_OVERRIDE_GFX_VERSION。能编译但跑在 CPU 上：几乎都是用了被静默忽略的旧 LLAMA_HIPBLAS 开关 —— 看启动日志里的后端那一行。设置 override 后卡死或输出乱码：override 本就不是受支持路径；先降低上下文或换一个量化档位，再去怀疑模型本身。',
      },
      {
        heading: 'Next steps',
        headingZh: '下一步',
        body: 'The models linked below are the ones this guide is written around. Open any of them with your Radeon selected in the calculator to see the context length it can actually hold.',
        bodyZh: '下方链接的模型就是本指南所围绕的那几个。在计算器里选好你的 Radeon 再打开其中任意一个，就能看到它实际能撑住多长的上下文。',
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
    content: [
      {
        heading: 'The one thing to get right: MXFP4 is the original',
        headingZh: '最关键的一点：MXFP4 就是原版',
        body: 'Almost every other model on this site is published in BF16 and quantized by the community afterwards, so "find the Q4_K_M" is the right reflex. GPT-OSS breaks that reflex. OpenAI post-trained it with the MoE weights already in MXFP4 (~4.25 bits), and those MoE weights are over 90% of the parameters. The MXFP4 checkpoint is not a lossy copy of something better — it is the model. Converting it up to Q8_0, or sideways to Q4_K_M, gives you a file that is larger and no more accurate, because the precision it is padding back was never there.',
        bodyZh: '本站几乎所有其他模型都是 BF16 发布、社区事后量化，所以"找 Q4_K_M"是对的直觉。GPT-OSS 打破了这个直觉：OpenAI 在后训练阶段就把 MoE 权重做成了 MXFP4（约 4.25 bit），而 MoE 权重占参数量 90% 以上。这份 MXFP4 权重不是某个更好版本的有损副本——它本身就是模型。把它转成 Q8_0 或平移到 Q4_K_M，只会得到一个更大但并不更准的文件，因为你补回去的精度从来就不存在。',
        code: {
          lang: 'text',
          content: 'gpt-oss-20b   MXFP4 (native) ~12.8 GB   ← use this\ngpt-oss-20b   Q8_0  (upcast)  ~13.8 GB   bigger, not better\n\ngpt-oss-120b  MXFP4 (native) ~61 GB     ← use this\n\nRule: for GPT-OSS, "bigger quant" buys you nothing.\nSpend the VRAM on context length instead.',
        },
      },
      {
        heading: 'Sizing it for your card',
        headingZh: '按你的显卡估算',
        body: 'The 20B fits a 16GB card with room for a useful context window. Note that GPT-OSS uses a head dimension of 64 rather than the usual 128, which halves its KV cache compared to a same-layer-count model — long context is unusually cheap here. Use the VRAM calculator with the MXFP4 level selected; picking Q4_K_M instead will overstate your weights by roughly 14%.',
        bodyZh: '20B 在 16GB 卡上可跑，且还剩下够用的上下文空间。注意 GPT-OSS 的 head dim 是 64 而非常见的 128，同层数下 KV cache 直接减半——长上下文在这个模型上便宜得反常。用显存计算器时记得选 MXFP4 档；选 Q4_K_M 会把权重高估约 14%。',
        code: {
          lang: 'text',
          content: 'gpt-oss-20b @ MXFP4, batch=1\n  weights                    ~12.8 GB\n  KV cache @  8K ctx          ~0.4 GB\n  KV cache @ 32K ctx          ~1.5 GB\n  KV cache @ 131K ctx         ~6.2 GB\n\n16GB card  → comfortable to ~32K ctx\n24GB card  → full 131K ctx with headroom',
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
          content: '# 20B, all layers on a 16GB+ GPU\nllama-server \\\n  -hf ggml-org/gpt-oss-20b-GGUF \\\n  --jinja \\\n  -ngl 99 \\\n  --ctx-size 32768 \\\n  --host 0.0.0.0 --port 8080\n\n# --jinja       applies the harmony chat template  (do not omit)\n# -ngl 99       offload every layer to the GPU\n# --ctx-size    raise freely — KV cache is cheap on this model',
        },
      },
      {
        heading: 'Running the 120B on a 24GB consumer card',
        headingZh: '在 24GB 消费级显卡上跑 120B',
        body: 'This is where the MoE architecture pays off. Only 5.1B parameters are active per token, so the expert weights are read sparsely — which makes them the ideal thing to leave in system RAM. Keep attention and the dense layers on the GPU, push the MoE experts to CPU, and a 61GB model becomes usable on a 24GB card. It is not fast, but it is a genuinely different outcome from "does not fit".',
        bodyZh: '这正是 MoE 架构的价值所在。每个 token 只激活 5.1B 参数，专家权重是稀疏读取的——因此它们最适合留在系统内存里。把注意力层和稠密层放显卡、MoE 专家推给 CPU，61GB 的模型就能在 24GB 卡上跑起来。速度不快，但这和"装不下"是两种结果。',
        code: {
          lang: 'bash',
          content: '# Offload the MoE experts of N layers to CPU RAM\nllama-server \\\n  -hf ggml-org/gpt-oss-120b-GGUF \\\n  --jinja \\\n  -ngl 99 \\\n  --n-cpu-moe 28 \\\n  --ctx-size 16384\n\n# Tune --n-cpu-moe down until you OOM, then back off by 2.\n# Lower value = more experts on GPU = faster.\n# Needs ~64GB system RAM. Expect single-digit tok/s.',
        },
      },
      {
        heading: 'Reasoning effort is a dial, not a fixed cost',
        headingZh: '推理强度是可调的，不是固定开销',
        body: 'GPT-OSS exposes low / medium / high reasoning effort. High spends far more tokens thinking before answering, which on local hardware is the difference between a snappy assistant and one that pauses for a minute. Set it low for chat and autocomplete, high only for problems that actually need the chain of thought.',
        bodyZh: 'GPT-OSS 支持 low / medium / high 三档推理强度。high 会在回答前消耗多得多的 token 思考，在本地硬件上这就是"响应利落的助手"和"卡一分钟"的区别。日常对话和补全用 low，只在真正需要思维链的问题上开 high。',
        code: {
          lang: 'text',
          content: 'Simplest portable form — put it in the system message:\n\n  System: Reasoning: low\n\nRough local cost on a 16GB card (20B):\n  low     fast, chat-grade latency\n  medium  noticeably more thinking tokens\n  high    can multiply time-to-first-answer several times over\n\nStart at low. Raise it per-task, not globally.',
        },
      },
      {
        heading: 'Common failure modes',
        headingZh: '常见故障对照',
        body: 'Most GPT-OSS problems reported locally are one of four things, and none of them are the quantization. Check these before hunting for a different build.',
        bodyZh: '本地跑 GPT-OSS 报的问题绝大多数是以下四种之一，且没有一种是量化的锅。换构建之前先对照检查。',
        code: {
          lang: 'text',
          content: 'Channel markers in the output, or it never stops\n  → missing --jinja (harmony template not applied)\n\n"unknown model architecture" on load\n  → llama.cpp / Ollama predates gpt-oss support; update\n\nSlower than expected on the 120B\n  → --n-cpu-moe too high; lower it until GPU VRAM is nearly full\n\nFile is much bigger than ~12.8GB (20B)\n  → you downloaded an upcast build; get the MXFP4 one',
        },
      },
    ],
  },
];