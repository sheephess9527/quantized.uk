import type { Article } from '@/lib/data/cookbook';

/**
 * Guides rewritten from the thin originals, merged over them by id.
 *
 * **What a rewrite is allowed to claim.** Every VRAM figure here comes from
 * `calcVRAM` on the model's own row, read off before the prose was written —
 * the 8GB starter guide spent its life ~2GB high and the Mac guide told 18GB
 * readers a 14B "needs 36GB+" when it needs 11.0, and both carried a
 * `verifiedAt`. Commands were checked against the projects' current
 * documentation (llama.cpp `docs/build.md`, Ollama `docs/api.md`), which is a
 * **documentation check, not a run**: there is no GPU in the environment these
 * were written in, so `verifiedAt` is removed rather than refreshed and
 * `updatedAt` records the rewrite. `verifiedStack` survives — it says what the
 * guide is written against, which is still true.
 *
 * Structure follows the six guides rewritten on 2026-09-08: what you need
 * first, the steps, **a way to check the model really ran on the GPU**, what
 * the numbers should look like, and what to do when it does not work.
 */
export const cookbookRewrites: Record<string, Partial<Article>> = {
  'rtx4060ti-what-to-run': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['qwen3-14b', 'gpt-oss-20b', 'qwen3-30b-a3b'],
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A 16GB RTX 4060 Ti — not the 8GB card of the same name, which is a different machine for this purpose. A recent NVIDIA driver, and either Ollama (simplest) or a CUDA build of llama.cpp. Nothing here needs more than 16GB of system RAM, because the weights live on the card.',
        bodyZh: '一张 16GB 版的 RTX 4060 Ti —— 不是同名的 8GB 版，对本文的用途来说那是另一台机器。一个较新的 NVIDIA 驱动，以及 Ollama（最省事）或 llama.cpp 的 CUDA 构建。本文不需要超过 16GB 系统内存，因为权重都在显卡上。',
        code: { lang: 'bash', content: '# Confirm you have the 16GB card, not the 8GB one\nnvidia-smi --query-gpu=name,memory.total --format=csv' },
      },
      {
        heading: 'The honest summary of this card',
        headingZh: '关于这张卡的实话',
        body: 'Capacity is generous and bandwidth is not. 52 of the models in this index fit it comfortably at 4K context and 61 load at all, which is the same list a 16GB RTX 4080 Super returns — but the 4060 Ti reads its weights at 288 GB/s against that card’s 736. Generating a token means reading every weight once, so the ceiling on throughput is roughly a third of what the same file does on the faster card. Pick models expecting that, not the capacity.',
        bodyZh: '容量宽裕，带宽不宽裕。本索引中有 52 个模型能在 4K 上下文下从容装进这张卡，61 个至少能加载 —— 这份清单和 16GB 的 RTX 4080 Super 完全相同，但 4060 Ti 读取权重的速度是 288 GB/s，而那张卡是 736。每生成一个 token 都要把全部权重读一遍，所以吞吐上限大约只有同一个文件在快卡上的三分之一。选模型时要按这一点来预期，而不是按容量。',
      },
      {
        heading: 'The three worth starting with',
        headingZh: '值得从这三个开始',
        body: 'Qwen3 14B at Q4_K_M needs 10.0 GB at 4K context and gives up 2.6% perplexity against FP16 — the best general-purpose fit, with 6 GB spare for a longer window. GPT-OSS 20B needs 11.4 GB: it is a mixture-of-experts model, so it reads only a fraction of its weights per token and runs faster than its size suggests, and its 4-bit weights are the released checkpoint rather than a conversion. Mistral Small 24B at AWQ INT4 is the largest thing that fits at all, at 13.2 GB — 82% of the card, with nothing left for context.',
        bodyZh: 'Qwen3 14B 在 Q4_K_M 下 4K 上下文需要 10.0 GB，相对 FP16 损失 2.6% 困惑度 —— 通用场景最合适，还剩 6 GB 给更长的窗口。GPT-OSS 20B 需要 11.4 GB：它是 MoE 模型，每个 token 只读取一部分权重，实际速度比体积暗示的更快，而且它的 4-bit 权重就是发布出来的检查点，不是转换来的。Mistral Small 24B 在 AWQ INT4 下是这张卡能装下的最大模型，13.2 GB —— 占满显存的 82%，几乎没有余量留给上下文。',
        code: { lang: 'bash', content: 'ollama pull qwen3:14b\nollama run qwen3:14b' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'This is the step people skip. Both Ollama and llama.cpp fall back to the CPU silently when a layer will not fit, and the only symptom is that everything is slow. Watch the card while a prompt is generating: memory used should jump by roughly the model size, and utilisation should be high rather than near zero.',
        bodyZh: '这一步最容易被跳过。Ollama 和 llama.cpp 在某一层放不下时都会静默回落到 CPU，唯一的症状就是「怎么这么慢」。生成过程中盯着显卡看：显存占用应当上升约等于模型体积的量，利用率应当很高而不是接近零。',
        code: { lang: 'bash', content: '# While a prompt is generating, in a second terminal:\nnvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1\n\n# llama.cpp prints the split at load time — every layer should be on the GPU:\n#   load_tensors: offloaded 41/41 layers to GPU' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'At 288 GB/s, Qwen3 14B at Q4_K_M is 8.5 GB of weights, which puts a hard ceiling near 34 tok/s — arithmetic on two published numbers, not a benchmark, and real throughput lands below it. If you are seeing single digits on a model that fits, you are on the CPU. Memory is the other number to watch: Qwen3 14B goes from 10.0 GB at 4K to 12.1 GB at 16K and 14.9 GB at 32K. The weights do not change; the KV cache is what grows.',
        bodyZh: '在 288 GB/s 下，Qwen3 14B 的 Q4_K_M 权重是 8.5 GB，硬上限约 34 tok/s —— 这是两个公开数字的算术结果，不是跑分，实际吞吐会低于它。如果一个明明装得下的模型只有个位数的速度，那你是在用 CPU 跑。另一个要盯的数字是显存：Qwen3 14B 从 4K 时的 10.0 GB 涨到 16K 的 12.1 GB、32K 的 14.9 GB。权重没变，涨的是 KV 缓存。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Out of memory at a context length that used to work: the KV cache grew, not the model — drop the window or the quant level. Everything is slow and nvidia-smi shows low utilisation: layers went to the CPU, so lower the offload count until it fits entirely or pick a smaller quant. A 30B model will not load: Qwen3 30B-A3B needs 19.7 GB, which is 3.7 GB over this card — offloading part of it to system RAM will load it at a speed set by your DIMMs, which is a different machine rather than a smaller quant. And on Windows, the NVIDIA control panel’s System Memory Fallback silently spills VRAM into system RAM instead of failing: that turns an out-of-memory error into a mysteriously slow model, so turn it off while you are measuring.',
        bodyZh: '此前能用的上下文长度突然爆显存：涨的是 KV 缓存不是模型 —— 缩短窗口或降一档量化。速度很慢而 nvidia-smi 显示利用率很低：有层被放到了 CPU 上，减少 offload 层数直到完全装下，或换更小的量化档位。30B 模型加载不了：Qwen3 30B-A3B 需要 19.7 GB，比这张卡多 3.7 GB —— 把一部分卸载到系统内存确实能加载，但速度由你的内存条决定，那是另一台机器，不是换个更小的量化档位。还有，Windows 上 NVIDIA 控制面板的「系统内存回退」会把超出的显存静默溢出到系统内存而不是报错：这会把一个明确的 OOM 变成一个莫名其妙很慢的模型，测量时请把它关掉。',
      },
    ],
    faqs: [
      {
        q: 'Is the 16GB RTX 4060 Ti good for local LLMs?',
        qZh: '16GB 的 RTX 4060 Ti 适合跑本地大模型吗？',
        a: 'For capacity, yes — 52 of the models in this index fit it comfortably at 4K context, including 14B models at Q4_K_M with room to spare. For speed, it is the slowest 16GB card here: 288 GB/s against 736 on an RTX 4080 Super holding exactly the same models. It is a good card for running larger models slowly and a poor one for running small models fast.',
        aZh: '就容量而言适合 —— 本索引中有 52 个模型能在 4K 上下文下从容装进它，包括 Q4_K_M 的 14B 模型并且还有余量。就速度而言，它是本站收录的 16GB 显卡里最慢的一张：288 GB/s，而装着完全相同模型的 RTX 4080 Super 是 736。它适合「慢慢地跑大模型」，不适合「快快地跑小模型」。',
      },
      {
        q: 'Can an RTX 4060 Ti 16G run a 30B model?',
        qZh: 'RTX 4060 Ti 16G 能跑 30B 的模型吗？',
        a: 'Not entirely on the card. Qwen3 30B-A3B at Q4_K_M needs about 19.7 GB at 4K context, 3.7 GB more than the card has. The largest model that does clear it comfortably is Mistral Small 24B at AWQ INT4, at 13.2 GB. Splitting a model between VRAM and system RAM works, at a speed set by the slower half.',
        aZh: '不能完全放在显卡上。Qwen3 30B-A3B 在 Q4_K_M、4K 上下文下约需 19.7 GB，比这张卡多 3.7 GB。真正能从容装下的最大模型是 AWQ INT4 的 Mistral Small 24B，13.2 GB。把模型拆在显存和系统内存之间是可行的，但速度由慢的那一半决定。',
      },
      {
        q: 'How many tokens per second should I expect on a 14B model?',
        qZh: '14B 模型大概能跑多少 tok/s？',
        a: 'This index has no measured run on this card, so it does not publish a figure. What the specification allows: Qwen3 14B at Q4_K_M is 8.5 GB of weights and the card moves 288 GB/s, so generation cannot exceed roughly 34 tok/s and will land below it. Single-digit throughput on a model that fits means layers are on the CPU.',
        aZh: '本索引没有这张卡的实测记录，因此不公布具体数字。规格允许的上限是：Qwen3 14B 的 Q4_K_M 权重为 8.5 GB，而这张卡带宽 288 GB/s，所以生成速度不可能超过约 34 tok/s，实际会更低。一个装得下的模型却只有个位数速度，说明有层跑在 CPU 上。',
      },
    ],
  },

  'mac-ollama-setup': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'macOS 14 or later on Apple silicon. Ollama’s macOS build uses Metal automatically — there is no CUDA-style toolkit to install and no flag to turn the GPU on. What you do need to understand is the memory model: the GPU and the CPU share one pool, so "VRAM" is a share of your total memory rather than a separate number.',
        bodyZh: 'macOS 14 或更高版本，Apple 芯片。Ollama 的 macOS 版会自动使用 Metal —— 没有类似 CUDA 的工具链要装，也没有「开启 GPU」的开关。真正需要理解的是内存模型：GPU 和 CPU 共享同一块内存池，所以这里的「显存」是总内存的一部分，而不是一个独立的数字。',
        code: { lang: 'bash', content: 'brew install ollama\nbrew services start ollama\n\n# Or download the app from ollama.com — same daemon, adds a menu bar item.\nollama --version' },
      },
      {
        heading: 'Pull a model and run it',
        headingZh: '拉一个模型跑起来',
        body: 'Start with an 8B at Q4_K_M. On this index’s numbers Llama 3.1 8B needs 5.6 GB at 4K context and Qwen3 8B needs 5.8 GB, so either is comfortable even on a 16GB Mac. A 48GB M3 Max runs 71 of the 81 models here comfortably — the largest being GLM-4.5-Air at 37.2 GB.',
        bodyZh: '从 Q4_K_M 的 8B 开始。按本索引的数字，Llama 3.1 8B 在 4K 上下文下需要 5.6 GB，Qwen3 8B 需要 5.8 GB，所以即使是 16GB 的 Mac 也很从容。48GB 的 M3 Max 能从容运行本站 81 个模型中的 71 个 —— 最大的是 37.2 GB 的 GLM-4.5-Air。',
        code: { lang: 'bash', content: 'ollama pull llama3.1:8b\nollama run llama3.1:8b "Summarise the difference between Q4_K_M and Q5_K_M."' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'Unified memory makes the usual check useless — there is no separate VRAM figure to watch climb. Use the system’s own GPU counter instead, or ask Ollama what it decided. If a model was partly placed on the CPU, `ollama ps` says so in the PROCESSOR column.',
        bodyZh: '统一内存让常规的检查方式失效了 —— 没有一个独立的显存数字可以看它往上爬。改用系统自带的 GPU 计数器，或者直接问 Ollama 它是怎么决定的。如果模型有一部分被放到了 CPU 上，`ollama ps` 的 PROCESSOR 一列会写明。',
        code: { lang: 'bash', content: 'ollama ps\n# NAME            SIZE     PROCESSOR    UNTIL\n# llama3.1:8b     6.1 GB   100% GPU     4 minutes from now\n\n# Or watch Metal directly while generating:\nsudo powermetrics --samplers gpu_power -i 1000 -n 5' },
      },
      {
        heading: 'The limit nobody mentions',
        headingZh: '没人提的那个上限',
        body: 'macOS reserves part of the unified pool for the system and caps how much a single process may wire down, so the practical budget is meaningfully below the number on the box — a 16GB Mac does not give a model 16GB. The cap is adjustable, but raising it too far will make the machine swap rather than make the model faster. Budget below nameplate and you will not meet it.',
        bodyZh: 'macOS 会为系统保留一部分统一内存，并限制单个进程能锁定的量，所以实际可用预算明显低于机器标称容量 —— 16GB 的 Mac 不会把 16GB 都给模型。这个上限可以调整，但调得过高只会让机器开始换页，而不会让模型变快。按低于标称的容量来规划，你就不会撞上它。',
        code: { lang: 'bash', content: '# Current cap, in MB (0 means "use the default policy")\nsysctl iogpu.wired_limit_mb\n\n# Raising it is possible but resets on reboot, and over-raising causes swapping\n# rather than speed. Prefer choosing a model that fits the default.' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'An M3 Max moves 400 GB/s. Llama 3.1 8B at Q4_K_M is 4.6 GB of weights, so generation cannot exceed roughly 87 tok/s — a ceiling from two published numbers, not a benchmark. This index has one measured run on an M3 Max 48G: Llama 3.1 8B at Q4_K_M under Ollama, at 68 tok/s, which is 83% of that ceiling and about what a well-behaved Metal setup looks like. Memory climbs with context, not with use: the same model needs 5.6 GB at 4K and 9.5 GB at 32K.',
        bodyZh: 'M3 Max 的带宽是 400 GB/s。Llama 3.1 8B 的 Q4_K_M 权重为 4.6 GB，所以生成速度不可能超过约 87 tok/s —— 这是两个公开数字给出的上限，不是跑分。本索引在 M3 Max 48G 上有一条实测记录：Ollama 跑 Llama 3.1 8B 的 Q4_K_M，68 tok/s，是该上限的 83%，也就是一套正常工作的 Metal 环境该有的样子。显存随上下文增长而不是随使用量增长：同一个模型 4K 时 5.6 GB，32K 时 9.5 GB。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: '`ollama ps` shows a CPU share: the model did not fit the wired limit — take a smaller quant or a shorter context rather than raising the cap. The whole machine becomes unresponsive while generating: you are swapping, which means the model plus the system exceeded physical memory; nothing about the model will fix that except being smaller. A model that ran yesterday will not load today: something else is holding memory — `ollama stop` unloads it, and models unload themselves after five minutes idle by default.',
        bodyZh: '`ollama ps` 显示有一部分在 CPU 上：说明模型没能装进锁定上限 —— 换更小的量化或更短的上下文，而不是去调高上限。生成时整机卡顿：说明在换页，模型加上系统超出了物理内存；除了换更小的模型，调什么都没用。昨天能跑的模型今天加载不了：有别的东西占着内存 —— `ollama stop` 可以卸载它，而且模型默认空闲五分钟后会自行卸载。',
        code: { lang: 'bash', content: 'ollama stop llama3.1:8b\n\n# Keep a model resident for an hour instead of the 5-minute default:\ncurl http://localhost:11434/api/generate -d \'{"model":"llama3.1:8b","keep_alive":"1h"}\'' },
      },
    ],
    faqs: [
      {
        q: 'Does a Mac’s unified memory count as VRAM for Ollama?',
        qZh: 'Mac 的统一内存对 Ollama 来说算显存吗？',
        a: 'Mostly. The GPU addresses the same pool as the CPU, so a 48GB Mac holds models a 24GB discrete card cannot — 71 of the 81 models in this index fit an M3 Max 48G comfortably. What is not true is that all of it is available: macOS reserves part of the pool and caps what one process may wire down, so budget meaningfully below the figure on the box.',
        aZh: '大体上算。GPU 和 CPU 寻址同一块内存池，所以 48GB 的 Mac 能装下 24GB 独显装不下的模型 —— 本索引 81 个模型中有 71 个能从容装进 M3 Max 48G。不成立的是「全部可用」：macOS 会保留一部分，并限制单个进程能锁定多少，所以请按明显低于标称的容量规划。',
      },
      {
        q: 'How do I tell whether Ollama used the GPU on a Mac?',
        qZh: '怎么判断 Ollama 在 Mac 上用没用 GPU？',
        a: 'Run `ollama ps` while a model is loaded. The PROCESSOR column reads `100% GPU` when the whole model is on Metal, and names a CPU share when part of it was not placed there. Unified memory means the usual trick of watching VRAM climb tells you nothing, because there is no separate figure to watch.',
        aZh: '在模型加载状态下运行 `ollama ps`。当整个模型都在 Metal 上时，PROCESSOR 一列会显示 `100% GPU`；如果有一部分没放上去，它会写明 CPU 占比。统一内存意味着「看显存往上涨」这个常规手段在这里没有意义，因为根本没有一个独立的数字可看。',
      },
      {
        q: 'Which model should I start with on Apple silicon?',
        qZh: 'Apple 芯片上该从哪个模型开始？',
        a: 'An 8B at Q4_K_M. Llama 3.1 8B needs 5.6 GB at 4K context and Qwen3 8B needs 5.8 GB, so both are comfortable on any Apple silicon Mac with 16GB or more, and both leave room to raise the context window later. Move up only once you have seen what the smaller model does — capacity is the easy part on a Mac, and bandwidth decides the rest.',
        aZh: '从 Q4_K_M 的 8B 开始。Llama 3.1 8B 在 4K 上下文下需要 5.6 GB，Qwen3 8B 需要 5.8 GB，所以 16GB 及以上的 Apple 芯片 Mac 跑起来都很从容，而且都留有余量供之后加大上下文。先看清楚小模型的表现再往上走 —— 在 Mac 上容量是容易的那一半，剩下的由带宽决定。',
      },
    ],
  },
  'llamacpp-windows-cuda': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'Visual Studio 2022 with the "Desktop development with C++" workload — that one checkbox also installs CMake and the MSVC toolchain, so there is nothing else to fetch. The CUDA Toolkit, matching a driver new enough for it. And the habit that saves the most time: every command below runs in a Developer Command Prompt for VS 2022, not a plain terminal, because a plain terminal has none of the compiler paths set.',
        bodyZh: '安装 Visual Studio 2022，勾选「使用 C++ 的桌面开发」工作负载 —— 这一个勾选项会一并装好 CMake 和 MSVC 工具链，不需要再单独下载什么。再装 CUDA Toolkit，以及与之匹配的较新驱动。还有一个最省时间的习惯：下面所有命令都要在「VS 2022 开发人员命令提示符」里运行，而不是普通终端，因为普通终端没有设置编译器路径。',
        code: { lang: 'powershell', content: '# In a Developer Command Prompt / PowerShell for VS 2022\ncmake --version\nnvcc --version\nnvidia-smi' },
      },
      {
        heading: 'Build with CUDA on',
        headingZh: '开启 CUDA 编译',
        body: 'The flag is `GGML_CUDA`, not `LLAMA_CUDA`. This matters more than it looks: CMake ignores an unknown `-D` without complaining, so the old name produces a clean, successful, CPU-only build — and the first sign of trouble is a model that runs at a tenth of the speed you expected.',
        bodyZh: '开关是 `GGML_CUDA`，不是 `LLAMA_CUDA`。这一点比看上去重要得多：CMake 遇到不认识的 `-D` 会默默忽略，所以用旧名字会得到一次干净、成功、但纯 CPU 的构建 —— 而你发现不对劲的第一个迹象，是模型只有预期十分之一的速度。',
        code: { lang: 'powershell', content: 'git clone https://github.com/ggml-org/llama.cpp\ncd llama.cpp\n\n# CMAKE_CUDA_ARCHITECTURES is optional but cuts build time a lot:\n#   86 = RTX 30-series, 89 = RTX 40-series, 120 = RTX 50-series\ncmake -B build -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES="89"\ncmake --build build --config Release -j' },
      },
      {
        heading: 'Run the server',
        headingZh: '启动服务',
        body: 'The binaries land in `build\\bin\\Release\\` and are named `llama-server.exe` and `llama-cli.exe` — the old `server.exe` and `main.exe` names are gone, which is the other thing that sends people to a search engine. Bind to localhost unless you actually intend to expose the machine.',
        bodyZh: '生成的可执行文件在 `build\\bin\\Release\\` 目录下，名字是 `llama-server.exe` 和 `llama-cli.exe` —— 旧的 `server.exe`、`main.exe` 已经不存在了，这是另一个会让人去搜索引擎的地方。除非你真的打算把这台机器暴露出去，否则就绑定到本机。',
        code: { lang: 'powershell', content: '.\\build\\bin\\Release\\llama-server.exe ^\n  --model C:\\models\\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf ^\n  --n-gpu-layers 99 ^\n  --ctx-size 4096 ^\n  --host 127.0.0.1 --port 8080' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'llama.cpp prints its layer placement at load time, and that line is the whole answer — if the offload count is lower than the layer count, the rest is on your CPU and every token pays for it. A CPU-only build reports no CUDA device at all, which is how you catch the wrong-flag build described above.',
        bodyZh: 'llama.cpp 在加载时会打印层的分配情况，那一行就是全部答案 —— 如果 offload 的层数少于总层数，剩下的就在 CPU 上，每个 token 都要为此付出代价。纯 CPU 构建则完全不会报告 CUDA 设备，这正是发现上面那个「用错开关」问题的方法。',
        code: { lang: 'text', content: '# What a working CUDA build prints:\nggml_cuda_init: found 1 CUDA devices:\n  Device 0: NVIDIA GeForce RTX 4060 Ti, compute capability 8.9\nload_tensors: offloaded 33/33 layers to GPU\n\n# A CPU-only build never mentions a CUDA device at all.' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Token generation reads the whole weight set once per token, so your card\u2019s memory bandwidth is the ceiling. Llama 3.1 8B at Q4_K_M is 4.6 GB of weights: on a 288 GB/s RTX 4060 Ti that caps generation near 62 tok/s, on a 1,008 GB/s RTX 4090 near 218. Those are arithmetic on published specifications rather than benchmarks, and real throughput lands below them — but an order of magnitude below means you are on the CPU.',
        bodyZh: '每生成一个 token 都要把整套权重读一遍，所以显卡的显存带宽就是上限。Llama 3.1 8B 的 Q4_K_M 权重是 4.6 GB：在 288 GB/s 的 RTX 4060 Ti 上，生成速度上限约 62 tok/s；在 1,008 GB/s 的 RTX 4090 上约 218。这些是基于公开规格的算术结果而不是跑分，实际吞吐会低于它们 —— 但如果低了一个数量级，那说明你在用 CPU 跑。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: '`nvcc` not found: you are not in a Developer Command Prompt, or the CUDA Toolkit went in after Visual Studio and its MSBuild integration never registered. The build succeeds but there is no CUDA device: you passed `LLAMA_CUDA` instead of `GGML_CUDA`, and CMake ignored it — delete `build\\` and configure again, because a stale cache keeps the old answer. Everything is mysteriously slow rather than failing: Windows has System Memory Fallback on by default in the NVIDIA control panel, which spills VRAM into system RAM instead of reporting an out-of-memory error, so a model that does not fit becomes a model that crawls. Turn it off while you are measuring. And an unspecified compiler error deep in a CUDA header usually means the toolkit and the Visual Studio version disagree — check the toolkit\u2019s supported MSVC range before suspecting your code.',
        bodyZh: '找不到 `nvcc`：要么你不在开发人员命令提示符里，要么 CUDA Toolkit 是在 Visual Studio 之后装的，MSBuild 集成没有注册上。编译成功但没有 CUDA 设备：你传的是 `LLAMA_CUDA` 而不是 `GGML_CUDA`，CMake 直接忽略了它 —— 删掉 `build\\` 重新配置，因为旧的缓存会保留之前的结论。不报错但莫名很慢：Windows 的 NVIDIA 控制面板默认开启「系统内存回退」，它会把超出的显存溢出到系统内存而不是报 OOM，于是「装不下的模型」变成了「爬着走的模型」。测量时请关掉它。至于 CUDA 头文件深处那种没头没尾的编译错误，通常是工具链版本和 Visual Studio 版本不匹配 —— 先去查该 CUDA 版本支持的 MSVC 区间，再怀疑自己的代码。',
      },
    ],
    faqs: [
      {
        q: 'Why does my llama.cpp build ignore the GPU on Windows?',
        qZh: 'Windows 上编译出来的 llama.cpp 为什么不用 GPU？',
        a: 'Almost always the build flag. It is `-DGGML_CUDA=ON`; the older `LLAMA_CUDA` name no longer does anything, and CMake ignores an unknown `-D` silently, so you get a successful CPU-only build with no warning. Delete the `build` directory before reconfiguring — a stale CMake cache will keep the previous answer. A working build prints its CUDA device and its layer offload count at load time.',
        aZh: '几乎总是编译开关的问题。正确的是 `-DGGML_CUDA=ON`；旧的 `LLAMA_CUDA` 已经不起任何作用，而 CMake 遇到不认识的 `-D` 会静默忽略，于是你得到一次成功的、纯 CPU 的构建，没有任何警告。重新配置前请删掉 `build` 目录 —— 旧的 CMake 缓存会保留之前的结论。正常的构建会在加载时打印 CUDA 设备和层的 offload 数量。',
      },
      {
        q: 'Do I need WSL to run llama.cpp with CUDA on Windows?',
        qZh: 'Windows 上用 CUDA 跑 llama.cpp 需要 WSL 吗？',
        a: 'No. llama.cpp builds natively with MSVC and the CUDA Toolkit, and the resulting `llama-server.exe` uses the GPU directly. WSL is a reasonable choice if you want a Linux toolchain for other reasons, but it adds a layer rather than removing one, and native builds avoid the filesystem performance question entirely.',
        aZh: '不需要。llama.cpp 可以直接用 MSVC 加 CUDA Toolkit 原生编译，生成的 `llama-server.exe` 会直接使用 GPU。如果你出于别的原因想要一套 Linux 工具链，用 WSL 是合理的，但它是多加了一层而不是省掉一层，而原生编译还完全绕开了文件系统性能的问题。',
      },
      {
        q: 'What is System Memory Fallback and should I turn it off?',
        qZh: '「系统内存回退」是什么，要关掉吗？',
        a: 'It is an NVIDIA driver feature on Windows that spills VRAM into system RAM when a workload does not fit, instead of failing with an out-of-memory error. For gaming that is a kindness; for local inference it turns a clear error into a model that runs at a fraction of its speed for no visible reason. Turn it off while you are sizing models, so that "does not fit" fails loudly.',
        aZh: '这是 Windows 上 NVIDIA 驱动的一个特性：当负载装不下时，把超出的显存溢出到系统内存，而不是报显存不足的错误。对游戏来说这是好事；对本地推理来说，它把一个明确的报错变成了一个莫名其妙慢到几分之一的模型。在你测量模型大小的时候把它关掉，让「装不下」明确地失败。',
      },
    ],
  },

  'windows-ollama-native': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b'],
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'Windows 11 and a recent NVIDIA driver. That is genuinely the list — Ollama\u2019s Windows installer ships the GPU runtime it needs, so there is no CUDA Toolkit to install and no build step. If you already run WSL for other work you can keep it; this guide is for the case where you would rather not.',
        bodyZh: 'Windows 11，以及一个较新的 NVIDIA 驱动。清单真的就这么长 —— Ollama 的 Windows 安装包自带它需要的 GPU 运行时，不用装 CUDA Toolkit，也没有编译步骤。如果你因为别的工作已经在用 WSL，留着就好；这篇指南是写给「能不用就不想用」的情况。',
        code: { lang: 'powershell', content: '# Download and run the installer from ollama.com, then:\nollama --version\nnvidia-smi' },
      },
      {
        heading: 'Pull a model and run it',
        headingZh: '拉一个模型跑起来',
        body: 'Start with an 8B at Q4_K_M — Llama 3.1 8B needs 5.6 GB at 4K context on this index\u2019s numbers, so it fits an 8GB card with room to spare. Ollama picks the GPU by itself; there is no flag to turn it on.',
        bodyZh: '从 Q4_K_M 的 8B 开始 —— 按本索引的数字，Llama 3.1 8B 在 4K 上下文下需要 5.6 GB，所以 8GB 的显卡装得下还有余量。Ollama 会自己选择 GPU，没有「开启 GPU」的开关。',
        code: { lang: 'powershell', content: 'ollama pull llama3.1:8b\nollama run llama3.1:8b' },
      },
      {
        heading: 'Where the models actually go',
        headingZh: '模型到底存在哪',
        body: 'On Windows the blobs land under your user profile, which is usually the C: drive, and a handful of models will fill a small SSD without ever telling you why. Move the store before you download rather than after: `OLLAMA_MODELS` is read at service start, so set it as a user environment variable and restart Ollama from the tray.',
        bodyZh: '在 Windows 上，模型文件默认存在你的用户目录下，通常就是 C 盘，几个模型就能把一块小 SSD 塞满，而且不会告诉你原因。请在下载之前而不是之后挪走存储位置：`OLLAMA_MODELS` 在服务启动时读取，所以把它设为用户环境变量，然后从托盘重启 Ollama。',
        code: { lang: 'powershell', content: '# Default: %USERPROFILE%\\.ollama\\models\nsetx OLLAMA_MODELS "D:\\ollama\\models"\n# Then quit Ollama from the system tray and start it again.' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'Ollama will quietly place part of a model on the CPU when it does not fit, and the only symptom is slowness. `ollama ps` reports what it decided, per loaded model — the PROCESSOR column is the answer, and anything other than 100% GPU on a model that should fit is worth chasing.',
        bodyZh: 'Ollama 在模型装不下时会悄悄把一部分放到 CPU 上，唯一的症状就是慢。`ollama ps` 会逐个报告它对每个已加载模型的决定 —— PROCESSOR 那一列就是答案，一个本该装得下的模型如果不是 100% GPU，就值得追查。',
        code: { lang: 'powershell', content: 'ollama ps\n# NAME            SIZE     PROCESSOR    UNTIL\n# llama3.1:8b     6.1 GB   100% GPU     4 minutes from now\n\nnvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1' },
      },
      {
        heading: 'Using it from other programs',
        headingZh: '从其他程序调用它',
        body: 'The daemon serves an HTTP API on port 11434 whether or not you ever open a terminal, and that is what editor plugins and desktop clients talk to. By default it listens on localhost only. `OLLAMA_HOST` changes that — and exposing it to your network means anyone on that network can use your GPU, so it deserves a deliberate decision rather than a copied command.',
        bodyZh: '不管你有没有打开终端，守护进程都会在 11434 端口提供 HTTP API，编辑器插件和桌面客户端就是通过它通信的。默认只监听本机。`OLLAMA_HOST` 可以改变这一点 —— 但把它暴露到局域网意味着网络上的任何人都能用你的 GPU，所以这应该是一个有意识的决定，而不是复制粘贴一条命令。',
        code: { lang: 'powershell', content: 'curl http://localhost:11434/api/generate -d \'{\"model\":\"llama3.1:8b\",\"prompt\":\"hello\",\"stream\":false}\'\n\n# Keep a model resident for an hour instead of the 5-minute default:\ncurl http://localhost:11434/api/generate -d \'{\"model\":\"llama3.1:8b\",\"keep_alive\":\"1h\"}\'' },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: '`ollama ps` shows a CPU share on a model that should fit: something else is holding VRAM — a browser with hardware acceleration is the usual culprit — or System Memory Fallback is on in the NVIDIA control panel, which spills VRAM into system RAM instead of failing and turns "does not fit" into "inexplicably slow". The C: drive fills up: that is the model store, and `OLLAMA_MODELS` has to be set before the download, not after. A plugin cannot reach the API: the daemon is bound to localhost by default, which is correct — change it deliberately or point the plugin at `127.0.0.1:11434`. And a model that ran yesterday will not load today usually means another model is still resident; they unload after five minutes idle, or immediately with `ollama stop`.',
        bodyZh: '一个本该装得下的模型在 `ollama ps` 里显示有 CPU 占比：要么有别的东西占着显存 —— 开着硬件加速的浏览器是最常见的元凶 —— 要么是 NVIDIA 控制面板里的「系统内存回退」开着，它会把超出的显存溢出到系统内存而不是报错，于是「装不下」变成了「莫名其妙地慢」。C 盘被塞满：那是模型存储目录，`OLLAMA_MODELS` 必须在下载之前设置，而不是之后。插件连不上 API：守护进程默认绑定到本机，这是正确的行为 —— 要么有意识地修改它，要么让插件指向 `127.0.0.1:11434`。至于昨天能跑今天加载不了，通常是另一个模型还驻留在显存里；它们空闲五分钟后会卸载，也可以用 `ollama stop` 立刻卸载。',
      },
    ],
    faqs: [
      {
        q: 'Do I need WSL to run Ollama on Windows?',
        qZh: 'Windows 上跑 Ollama 需要 WSL 吗？',
        a: 'No. The native Windows installer ships the GPU runtime it needs and uses an NVIDIA card directly — no CUDA Toolkit, no build step. WSL remains a reasonable choice if you want a Linux environment for other reasons, but it adds a layer rather than removing one.',
        aZh: '不需要。原生 Windows 安装包自带所需的 GPU 运行时，会直接使用 NVIDIA 显卡 —— 不用装 CUDA Toolkit，也没有编译步骤。如果你出于别的原因想要一个 Linux 环境，WSL 依然是合理的选择，但它是多加了一层而不是省掉一层。',
      },
      {
        q: 'How do I move Ollama models off the C: drive?',
        qZh: '怎么把 Ollama 的模型从 C 盘挪走？',
        a: 'Set `OLLAMA_MODELS` to the path you want and restart the Ollama service from the system tray — it is read at service start, so a running daemon will not pick it up. Do this before downloading rather than after: the default store is under your user profile, and a handful of models will fill a small system drive without explaining itself.',
        aZh: '把 `OLLAMA_MODELS` 设为你想要的路径，然后从系统托盘重启 Ollama 服务 —— 它在服务启动时读取，正在运行的守护进程不会自动生效。请在下载之前而不是之后做这件事：默认存储在用户目录下，几个模型就能把一块小系统盘塞满，而且不会解释原因。',
      },
      {
        q: 'How do I know whether Ollama is using my GPU?',
        qZh: '怎么知道 Ollama 有没有在用我的 GPU？',
        a: 'Run `ollama ps` while a model is loaded. The PROCESSOR column reads `100% GPU` when the whole model is on the card, and names a CPU share otherwise. If it reports a CPU share on a model that should fit, check what else is holding VRAM and whether System Memory Fallback is enabled in the NVIDIA control panel.',
        aZh: '在模型加载状态下运行 `ollama ps`。整个模型都在显卡上时，PROCESSOR 一列显示 `100% GPU`，否则会写明 CPU 占比。如果一个本该装得下的模型显示有 CPU 占比，检查还有什么在占显存，以及 NVIDIA 控制面板里的「系统内存回退」是不是开着。',
      },
    ],
  },
  'docker-llm-compose': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['llama-3.1-8b', 'qwen3-8b'],
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'Docker Engine with Compose v2 — `docker compose` as a subcommand, not the old `docker-compose` binary. For GPU inference you also need the NVIDIA Container Toolkit, which is the piece that lets a container see the card; without it the stack still runs, on the CPU, and nothing tells you that is what happened.',
        bodyZh: '需要带 Compose v2 的 Docker Engine —— 也就是 `docker compose` 子命令，而不是旧的 `docker-compose` 可执行文件。要用 GPU 推理还需要 NVIDIA Container Toolkit，正是它让容器能看见显卡；没有它整套服务照样能起来，只是跑在 CPU 上，而且没有任何提示告诉你发生了这件事。',
        code: { lang: 'bash', content: 'docker compose version          # expect v2.x\nnvidia-ctk --version            # NVIDIA Container Toolkit\n\n# Prove a container can see the GPU before going further:\ndocker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi' },
      },
      {
        heading: 'The compose file',
        headingZh: 'compose 文件',
        body: 'Two services: Ollama holds the models and serves the API, Open WebUI is the browser front end that talks to it. Both get named volumes, because the alternative is re-downloading tens of gigabytes the first time you recreate a container. The GPU reservation is the block people leave out.',
        bodyZh: '两个服务：Ollama 负责存放模型并提供 API，Open WebUI 是与之通信的浏览器前端。两者都挂命名卷，否则你第一次重建容器时就要重新下载几十 GB。GPU 预留是最容易被漏掉的那一段。',
        code: { lang: 'yaml', content: 'services:\n  ollama:\n    image: ollama/ollama\n    container_name: ollama\n    ports:\n      - "127.0.0.1:11434:11434"\n    volumes:\n      - ollama_data:/root/.ollama\n    restart: unless-stopped\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu]\n\n  open-webui:\n    image: ghcr.io/open-webui/open-webui:main\n    container_name: open-webui\n    ports:\n      - "127.0.0.1:3000:8080"\n    environment:\n      - OLLAMA_BASE_URL=http://ollama:11434\n    depends_on:\n      - ollama\n    volumes:\n      - webui_data:/app/backend/data\n    restart: unless-stopped\n\nvolumes:\n  ollama_data:\n  webui_data:' },
      },
      {
        heading: 'Start it and pull a model',
        headingZh: '启动并拉取模型',
        body: 'Bring the stack up, then pull a model into the running container. Llama 3.1 8B at Q4_K_M needs 5.6 GB at 4K context on this index’s numbers, so it is a safe first pull on any 8GB card. Note the port bindings above are `127.0.0.1:` prefixed — without that prefix Docker publishes to every interface, and on many setups that goes straight past the host firewall.',
        bodyZh: '把服务拉起来，然后向运行中的容器拉取模型。按本索引的数字，Llama 3.1 8B 在 Q4_K_M、4K 上下文下需要 5.6 GB，所以对任何 8GB 显卡来说都是一次安全的首拉。注意上面的端口绑定都带了 `127.0.0.1:` 前缀 —— 不加这个前缀，Docker 会发布到所有网络接口，而在很多环境下这会直接绕过主机防火墙。',
        code: { lang: 'bash', content: 'docker compose up -d\ndocker exec ollama ollama pull llama3.1:8b\n\n# Then open http://localhost:3000' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'This is the step that separates a working GPU stack from one that has been quietly running on the CPU since the day it was set up. Ask the container, not the host: `ollama ps` inside it reports where each loaded model was placed.',
        bodyZh: '正是这一步把「真正在用 GPU」和「从搭起来那天起就悄悄跑在 CPU 上」区分开。要问容器，而不是问宿主机：在容器里执行 `ollama ps`，它会报告每个已加载模型被放在了哪里。',
        code: { lang: 'bash', content: '# Load a model first, then ask where it went:\ndocker exec ollama ollama run llama3.1:8b "hi" >/dev/null\ndocker exec ollama ollama ps\n# NAME            SIZE     PROCESSOR    UNTIL\n# llama3.1:8b     6.1 GB   100% GPU     4 minutes from now\n\n# And from the host, while generating:\nnvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Containerisation costs nothing measurable at inference time — the weights are on the card either way, and the ceiling is your card’s memory bandwidth. Llama 3.1 8B at Q4_K_M is 4.6 GB of weights, so a 288 GB/s card caps generation near 62 tok/s and a 1,008 GB/s RTX 4090 near 218. What containerisation does cost is disk: the model volume grows with every pull and nothing prunes it for you.',
        bodyZh: '容器化在推理时的开销小到测不出来 —— 反正权重都在显卡上，上限依然是显卡的显存带宽。Llama 3.1 8B 的 Q4_K_M 权重是 4.6 GB，所以 288 GB/s 的卡生成上限约 62 tok/s，1,008 GB/s 的 RTX 4090 约 218。容器化真正的代价在磁盘：模型卷会随每次 pull 不断增长，而且没有任何东西会替你清理。',
        code: { lang: 'bash', content: 'docker exec ollama ollama list\ndocker system df -v | grep ollama_data' },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: '`ollama ps` says CPU inside the container while the host sees the GPU fine: the `deploy.resources.reservations.devices` block is missing or the NVIDIA Container Toolkit is not installed — the `docker run --gpus=all … nvidia-smi` check above isolates which. Models disappear after `docker compose down`: you used a bind mount that did not survive, or no volume at all; the named volume above is what keeps them. Open WebUI cannot reach Ollama: it must use the service name `http://ollama:11434`, not `localhost`, because inside the compose network `localhost` is the WebUI container itself. And if the ports are reachable from other machines, check for the `127.0.0.1:` prefix — publishing a bare port exposes it on every interface.',
        bodyZh: '宿主机能正常看到 GPU，但容器内 `ollama ps` 显示 CPU：要么缺了 `deploy.resources.reservations.devices` 那一段，要么没装 NVIDIA Container Toolkit —— 上面那条 `docker run --gpus=all … nvidia-smi` 正是用来区分这两种情况的。`docker compose down` 之后模型消失了：你用的是没能保留下来的 bind mount，或者根本没挂卷；上面那个命名卷才是留住它们的东西。Open WebUI 连不上 Ollama：它必须用服务名 `http://ollama:11434`，不能用 `localhost`，因为在 compose 网络里 `localhost` 指的是 WebUI 容器自己。如果这些端口能被局域网其他机器访问到，检查有没有加 `127.0.0.1:` 前缀 —— 直接发布裸端口会暴露在所有网络接口上。',
      },
    ],
    faqs: [
      {
        q: 'How do I give a Docker container access to my NVIDIA GPU?',
        qZh: '怎么让 Docker 容器用上我的 NVIDIA 显卡？',
        a: 'Install the NVIDIA Container Toolkit on the host, then declare the device in compose under `deploy.resources.reservations.devices` with `driver: nvidia` and `capabilities: [gpu]`. Verify it independently first with `docker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi` — if that fails, the problem is the toolkit rather than your compose file.',
        aZh: '先在宿主机上安装 NVIDIA Container Toolkit，然后在 compose 的 `deploy.resources.reservations.devices` 中声明设备，写上 `driver: nvidia` 和 `capabilities: [gpu]`。请先用 `docker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi` 单独验证一次 —— 如果这一步就失败，问题出在工具包上，而不是你的 compose 文件。',
      },
      {
        q: 'Why can Open WebUI not reach Ollama in the same compose file?',
        qZh: '同一个 compose 文件里，Open WebUI 为什么连不上 Ollama？',
        a: 'Because `localhost` inside a container means that container. Use the service name: `OLLAMA_BASE_URL=http://ollama:11434`. Compose puts both services on one network and resolves service names for you, so no IP address or host networking is needed.',
        aZh: '因为容器内的 `localhost` 指的是这个容器自己。请使用服务名：`OLLAMA_BASE_URL=http://ollama:11434`。Compose 会把两个服务放在同一个网络里并自动解析服务名，所以不需要写 IP，也不需要 host 网络模式。',
      },
      {
        q: 'Do I lose my downloaded models when I recreate the containers?',
        qZh: '重建容器会丢掉已下载的模型吗？',
        a: 'Only if you did not use a named volume. The `ollama_data:/root/.ollama` mapping keeps the blobs outside the container lifecycle, so `docker compose down` and `up` again costs nothing. Without it you re-download tens of gigabytes, which is the most common reason people think local models are slow to set up.',
        aZh: '只有在没用命名卷的情况下才会。`ollama_data:/root/.ollama` 这个映射把模型文件放在容器生命周期之外，所以 `docker compose down` 再 `up` 不会有任何损失。没有它的话你要重新下载几十 GB —— 这也是很多人觉得「本地模型搭起来很慢」的最常见原因。',
      },
    ],
  },
  'rtx4090-vllm-api': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'RTX 4090 24GB · vLLM (uv install) · AWQ INT4 · OpenAI-compatible API on :8000',
      zh: 'RTX 4090 24GB · vLLM（uv 安装）· AWQ INT4 · OpenAI 兼容 API，端口 :8000',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'An NVIDIA card with enough memory for the model plus its KV cache, a recent driver, and Python 3.12. vLLM is a server, not a chat app — reach for it when you want an OpenAI-compatible endpoint serving concurrent requests, and reach for llama.cpp or Ollama when you want one person talking to one model.',
        bodyZh: '一张显存足够容纳模型和 KV 缓存的 NVIDIA 显卡、较新的驱动，以及 Python 3.12。vLLM 是服务端，不是聊天应用 —— 当你需要一个能并发处理请求的 OpenAI 兼容端点时用它；如果只是一个人和一个模型对话，用 llama.cpp 或 Ollama。',
        code: { lang: 'bash', content: '# uv is the documented install path now; it picks the right torch build\n# from your installed CUDA driver.\npip install --upgrade uv\nuv pip install vllm --torch-backend=auto\n\nvllm --version' },
      },
      {
        heading: 'Serve the model',
        headingZh: '启动服务',
        body: 'The entrypoint is the `vllm serve` CLI. The older `python -m vllm.entrypoints.openai.api_server` invocation is what most tutorials still show and is no longer the documented form. vLLM reads the quantization method out of the model config, so `--quantization` is not something you normally pass for an AWQ checkpoint.',
        bodyZh: '入口是 `vllm serve` 这个 CLI。大多数教程里仍在用的 `python -m vllm.entrypoints.openai.api_server` 已经不是官方文档推荐的形式了。vLLM 会从模型配置里读出量化方式，所以对 AWQ 检查点来说通常不需要手动传 `--quantization`。',
        code: { lang: 'bash', content: 'vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ \\\n  --max-model-len 32768 \\\n  --gpu-memory-utilization 0.85 \\\n  --host 127.0.0.1 --port 8000\n\n# Bind to 127.0.0.1 unless you mean to expose the machine. The default\n# server has no authentication of its own.' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的起来了',
        body: 'The server speaks the OpenAI protocol, so the first check is the models endpoint — it answers only once weights are loaded and the KV cache is allocated, which is also the slow part of startup. Then send one completion.',
        bodyZh: '这个服务说的是 OpenAI 协议，所以第一步检查 models 端点 —— 只有在权重加载完、KV 缓存分配完之后它才会响应，而那正是启动过程中慢的那一段。然后发一个补全请求。',
        code: { lang: 'bash', content: 'curl http://127.0.0.1:8000/v1/models\n\ncurl http://127.0.0.1:8000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model":"Qwen/Qwen2.5-7B-Instruct-AWQ","messages":[{"role":"user","content":"hi"}]}\'' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Qwen2.5 7B at AWQ INT4 is 3.6 GB of weights and needs 4.2 GB in total at 4K context, rising to 5.9 GB at 32K — the weights do not move, the KV cache does. On an RTX 4090 at 1,008 GB/s that puts a single-stream ceiling near 278 tok/s. This index has one measured vLLM run to compare against: Llama 3.1 8B at AWQ INT4 on a 4090, at 218 tok/s. Batched throughput is a different number entirely and this site has not measured it — continuous batching is the reason to run vLLM, but any specific multiple you read for it came from someone else’s hardware.',
        bodyZh: 'Qwen2.5 7B 在 AWQ INT4 下权重为 3.6 GB，4K 上下文合计需要 4.2 GB，32K 时升到 5.9 GB —— 权重不变，变的是 KV 缓存。在带宽 1,008 GB/s 的 RTX 4090 上，单流上限约 278 tok/s。本索引有一条可对照的 vLLM 实测记录：4090 上 Llama 3.1 8B 的 AWQ INT4，218 tok/s。批量吞吐完全是另一个数字，本站没有测过 —— 连续批处理正是使用 vLLM 的理由，但你看到的任何具体倍数都来自别人的硬件。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'The server logs a preemption warning mentioning `PreemptionMode.RECOMPUTE` and throughput collapses: there is not enough KV cache space for the requests in flight. Raise `--gpu-memory-utilization`, or lower `--max-num-seqs` so fewer requests are batched, or shorten `--max-model-len` — that last one is what most people actually need, because a 128K window reserves cache for a context nobody sends. Out of memory at start-up rather than under load: `--gpu-memory-utilization` is a fraction of the whole card, so anything else holding VRAM comes out of vLLM’s share. Startup takes minutes: that is compilation and CUDA-graph capture; `--enforce-eager` skips both and costs steady-state decode speed, which is a good trade while you are iterating and a bad one in production.',
        bodyZh: '日志里出现提到 `PreemptionMode.RECOMPUTE` 的抢占警告，吞吐随之崩塌：说明在途请求的 KV 缓存空间不够。提高 `--gpu-memory-utilization`，或降低 `--max-num-seqs` 减少批内请求数，或缩短 `--max-model-len` —— 多数人真正需要的是最后一个，因为 128K 的窗口会为一个根本没人发送的上下文预留缓存。启动时（而不是压力下）就显存不足：`--gpu-memory-utilization` 是相对整张卡的比例，所以任何别的东西占用的显存都会从 vLLM 的份额里扣。启动要好几分钟：那是编译和 CUDA graph 捕获；`--enforce-eager` 会跳过这两步，代价是稳态解码速度变慢 —— 这在调试迭代时是划算的，在生产里不是。',
      },
    ],
    faqs: [
      {
        q: 'What is the current command to start a vLLM server?',
        qZh: '现在启动 vLLM 服务的命令是什么？',
        a: '`vllm serve <model-repo>`. The `python -m vllm.entrypoints.openai.api_server` form that most tutorials still show is no longer the documented entrypoint. Install with `uv pip install vllm --torch-backend=auto`, which selects the torch build matching your installed CUDA driver.',
        aZh: '是 `vllm serve <模型仓库>`。大多数教程里仍在用的 `python -m vllm.entrypoints.openai.api_server` 已不再是官方文档的入口形式。安装用 `uv pip install vllm --torch-backend=auto`，它会根据你已安装的 CUDA 驱动选择匹配的 torch 构建。',
      },
      {
        q: 'Does vLLM only run on NVIDIA?',
        qZh: 'vLLM 只能在 NVIDIA 上跑吗？',
        a: 'No — that is a common claim and it is wrong. vLLM publishes official ROCm wheels (`uv pip install vllm --extra-index-url https://wheels.vllm.ai/rocm/`) and ROCm Docker images, alongside backends for Intel XPU and TPU. CUDA is the best-trodden path, not the only one.',
        aZh: '不是 —— 这是一个常见但错误的说法。vLLM 提供官方 ROCm wheel（`uv pip install vllm --extra-index-url https://wheels.vllm.ai/rocm/`）和 ROCm Docker 镜像，另外还有 Intel XPU 与 TPU 后端。CUDA 是走得最熟的路，不是唯一的路。',
      },
      {
        q: 'Why does vLLM reserve so much VRAM before I send a request?',
        qZh: 'vLLM 为什么在我还没发请求时就占了那么多显存？',
        a: 'By design. It pre-allocates the KV cache up front — `--gpu-memory-utilization` is the fraction of the whole card it may take — so that batching never has to allocate mid-request. That is why a 128K `--max-model-len` costs memory even when every request is 2K long, and why shortening it is usually the first fix for preemption warnings.',
        aZh: '这是刻意设计。它会预先分配 KV 缓存 —— `--gpu-memory-utilization` 就是它可以占用整张卡的比例 —— 这样批处理过程中就不必再临时分配。所以即使每个请求都只有 2K 长，设成 128K 的 `--max-model-len` 也会一直占着内存；这也是为什么遇到抢占警告时，第一个该改的通常就是把它调小。',
      },
    ],
  },

  'vllm-awq-production': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['qwen2.5-7b', 'llama-3.1-8b'],
    verifiedStack: {
      en: 'vLLM (uv install) · AWQ INT4 · gpu-memory-utilization 0.75–0.90 · max-model-len tuned to real traffic',
      zh: 'vLLM（uv 安装）· AWQ INT4 · gpu-memory-utilization 0.75–0.90 · max-model-len 按真实流量调整',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A working `vllm serve` before you tune anything — the settings below only make sense once you have a baseline to move. You also need to know what your traffic actually looks like: the longest prompt you really receive and how many requests overlap. Every knob here trades those two against each other, and tuning without knowing them is guessing.',
        bodyZh: '在调优之前先要有一个能跑起来的 `vllm serve` —— 下面这些设置只有在你已经有一个可以对照的基线时才有意义。你还需要知道自己的流量长什么样：真实收到的最长提示有多长、有多少请求会重叠。这里每一个旋钮都是在这两者之间做权衡，不了解它们的调优就是在猜。',
        code: { lang: 'bash', content: 'vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ --host 127.0.0.1 --port 8000' },
      },
      {
        heading: 'The three knobs that matter',
        headingZh: '真正重要的三个旋钮',
        body: '`--max-model-len` is the one to set first and the one most people leave alone: vLLM reserves KV cache for the window you declare, so a 128K default spends memory on a context your users never send. `--gpu-memory-utilization` is the share of the whole card vLLM may claim — it is a fraction of total, not of free, so anything else on the card comes out of its budget. `--max-num-seqs` caps how many requests are batched at once, which is the direct lever on how much cache each one gets.',
        bodyZh: '`--max-model-len` 是最该先设、也最常被放着不管的一个：vLLM 会按你声明的窗口预留 KV 缓存，所以默认的 128K 是在为用户根本不会发送的上下文花显存。`--gpu-memory-utilization` 是 vLLM 可以占用整张卡的比例 —— 它是相对总量而不是相对空闲量，所以卡上任何别的东西都会从它的预算里扣。`--max-num-seqs` 限制同时批处理的请求数，直接决定每个请求能分到多少缓存。',
        code: { lang: 'bash', content: 'vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ \\\n  --max-model-len 8192 \\\n  --gpu-memory-utilization 0.90 \\\n  --max-num-seqs 16 \\\n  --host 127.0.0.1 --port 8000' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认调优真的生效了',
        body: 'Tuning is only real if you can see it. The server exposes Prometheus metrics, and the two that answer "did this help" are the KV cache utilisation and the preemption counter — a counter that stays at zero under your real load is the goal, not a number you guess at.',
        bodyZh: '调优只有能被看见才算数。服务端暴露了 Prometheus 指标，能回答「这次改动有没有用」的是 KV 缓存利用率和抢占计数 —— 目标是这个计数在你的真实负载下保持为零，而不是去猜一个数字。',
        code: { lang: 'bash', content: 'curl -s http://127.0.0.1:8000/metrics | grep -E "kv_cache|preemption|num_requests"\n\n# A preemption counter climbing under load means the cache is too small\n# for the requests in flight — not that the GPU is too slow.' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Memory first: Qwen2.5 7B at AWQ INT4 is 3.6 GB of weights, 4.2 GB in total at 4K and 5.9 GB at 32K. That difference is entirely KV cache, and it is what `--max-model-len` is spending. Throughput: a single stream cannot exceed bandwidth divided by weight size, so ~278 tok/s on a 1,008 GB/s RTX 4090 — this index measured 218 tok/s for Llama 3.1 8B AWQ under vLLM on that card. Batched throughput is higher and is the reason vLLM exists, but this site has not measured it and will not quote a multiple it did not observe.',
        bodyZh: '先看显存：Qwen2.5 7B 的 AWQ INT4 权重是 3.6 GB，4K 下合计 4.2 GB，32K 下 5.9 GB。这个差额全部是 KV 缓存，也正是 `--max-model-len` 花掉的东西。再看吞吐：单流不可能超过「带宽 ÷ 权重体积」，所以在 1,008 GB/s 的 RTX 4090 上约 278 tok/s —— 本索引在该卡上实测 vLLM 跑 Llama 3.1 8B AWQ 为 218 tok/s。批量吞吐会更高，那也是 vLLM 存在的意义，但本站没有测过，也不会引用一个自己没观察到的倍数。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Preemption warnings naming `PreemptionMode.RECOMPUTE`: the cache cannot hold the in-flight requests, so vLLM throws work away and redoes it — throughput falls off a cliff rather than degrading gently. Shorten `--max-model-len`, lower `--max-num-seqs`, or raise `--gpu-memory-utilization`, in that order. Out of memory at start-up: something else holds VRAM, and the utilisation fraction is of the whole card. Crash at start-up with chunked prefill disabled: `--max-num-batched-tokens` must exceed `--max-model-len` in that configuration. And if latency is fine but throughput is poor under concurrency, check you are not running `--enforce-eager` left over from debugging — it skips CUDA-graph capture, which is exactly the steady-state decode path you want in production.',
        bodyZh: '出现提到 `PreemptionMode.RECOMPUTE` 的抢占警告：缓存装不下在途请求，vLLM 会丢弃已完成的工作并重算 —— 吞吐是断崖式下跌而不是缓慢劣化。按这个顺序处理：缩短 `--max-model-len`、降低 `--max-num-seqs`、提高 `--gpu-memory-utilization`。启动时显存不足：有别的东西占着显存，而利用率比例是相对整张卡算的。在禁用 chunked prefill 的配置下启动崩溃：此时 `--max-num-batched-tokens` 必须大于 `--max-model-len`。如果延迟正常但并发下吞吐很差，检查是不是把调试时的 `--enforce-eager` 留下了 —— 它会跳过 CUDA graph 捕获，而那正是生产环境需要的稳态解码路径。',
      },
    ],
    faqs: [
      {
        q: 'What should I set gpu-memory-utilization to?',
        qZh: 'gpu-memory-utilization 应该设多少？',
        a: 'High, on a card doing nothing else — 0.90 is reasonable when vLLM is the only tenant. It is a fraction of the card’s total memory rather than of what is free, so a desktop session or another process comes straight out of vLLM’s budget. Raise it to cure preemption only after shortening `--max-model-len`, which is usually the real cause.',
        aZh: '在没有别的负载的卡上可以设高 —— vLLM 独占时 0.90 是合理的。它是相对显卡总容量而不是相对空闲容量的比例，所以桌面会话或别的进程都会直接从 vLLM 的预算里扣。只有在先缩短过 `--max-model-len` 之后，才用提高它来解决抢占问题 —— 那通常才是真正的原因。',
      },
      {
        q: 'Why is my vLLM throughput collapsing under load?',
        qZh: 'vLLM 一上负载吞吐就崩，是为什么？',
        a: 'Almost always KV cache pressure. The log names it: a preemption warning mentioning `PreemptionMode.RECOMPUTE` means requests are being evicted and recomputed, which costs more than it saves. It is a memory problem rather than a compute one — shorten the declared context window first, then reduce the batch width.',
        aZh: '几乎总是 KV 缓存压力。日志里会写明：提到 `PreemptionMode.RECOMPUTE` 的抢占警告意味着请求被踢出并重算，得不偿失。这是显存问题而不是算力问题 —— 先缩短声明的上下文窗口，再减小批宽度。',
      },
      {
        q: 'Is AWQ the right format for serving?',
        qZh: '做服务端该用 AWQ 吗？',
        a: 'It is what this stack is built around: AWQ quantizes with the activation distribution in hand and is a first-class citizen in vLLM. 53 of the 81 models in this index ship an AWQ build. If your model has no AWQ build, that is a real constraint rather than something a conversion solves — going from one lossy format to another stacks a second round of loss on the first.',
        aZh: '这套技术栈就是围绕它构建的：AWQ 在量化时掌握激活分布，并且在 vLLM 里是一等公民。本索引 81 个模型中有 53 个提供 AWQ 版本。如果你的模型没有 AWQ 版本，那是一个真实的约束，而不是靠格式转换能解决的问题 —— 从一种有损格式转到另一种，只是在第一次损失之上再叠一次。',
      },
    ],
  },
  'exllama-rtx4090-setup': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'Python 3.10+ · CUDA 12.x · ExLlamaV2 (turboderp-org) · EXL2 model directory · NVIDIA Ampere or newer',
      zh: 'Python 3.10+ · CUDA 12.x · ExLlamaV2（turboderp-org）· EXL2 模型目录 · NVIDIA Ampere 及更新架构',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'An NVIDIA card — ExLlamaV2 is CUDA-only, with no ROCm or Metal path, so this is the one runtime where the hardware question is settled before anything else. Ampere or newer is recommended. Python 3.10 or later, and a CUDA 12.x toolchain if you build from source. The repository now lives under `turboderp-org`; the old `turboderp/exllamav2` URL still redirects, which is why half the tutorials online still use it.',
        bodyZh: '一张 NVIDIA 显卡 —— ExLlamaV2 只支持 CUDA，没有 ROCm 也没有 Metal 路径，所以这是唯一一个「硬件问题在别的事情之前就已经定了」的运行时。推荐 Ampere 及更新架构。Python 3.10 或更高版本；如果从源码编译还需要 CUDA 12.x 工具链。仓库现在在 `turboderp-org` 名下；旧的 `turboderp/exllamav2` 地址仍会重定向，这也是网上一半教程还在用它的原因。',
        code: { lang: 'bash', content: 'pip install exllamav2\n\n# Or from source, which is what you want if you need the latest kernels:\ngit clone https://github.com/turboderp-org/exllamav2\ncd exllamav2\npip install -r requirements.txt\npip install .' },
      },
      {
        heading: 'Get an EXL2 model',
        headingZh: '获取 EXL2 模型',
        body: 'EXL2 is a directory, not a single file — this trips people who arrive from GGUF expecting one `.gguf` to download. Quantization is per-layer and the bit-rate is a continuous dial rather than a menu, which is where the format’s accuracy-per-bit advantage comes from. This index carries 21 models with an EXL2 build, mostly at 4.65bpw.',
        bodyZh: 'EXL2 是一个目录，不是单个文件 —— 从 GGUF 过来、期待下载一个 `.gguf` 的人常在这里卡住。它的量化是逐层进行的，位宽是一个连续的旋钮而不是一份菜单，这正是这个格式「每比特精度更高」的来源。本索引收录了 21 个提供 EXL2 版本的模型，大多是 4.65bpw。',
        code: { lang: 'bash', content: 'pip install huggingface_hub\nhuggingface-cli download turboderp/Llama-3.1-8B-Instruct-exl2 \\\n  --revision 4.65bpw \\\n  --local-dir ./models/Llama-3.1-8B-exl2-4.65bpw' },
      },
      {
        heading: 'Run inference',
        headingZh: '跑起来',
        body: 'The bundled chat example is the quickest way to confirm the install. `-gs auto` lets it work out the split across your cards, which is the current documented form — older tutorials pass explicit per-GPU gigabyte numbers like `-gs 16`, and those are only worth writing by hand when you deliberately want to reserve memory on one card.',
        bodyZh: '自带的 chat 示例是验证安装最快的方式。`-gs auto` 会让它自己算出在你的显卡之间怎么切分，这是当前文档推荐的写法 —— 旧教程会手写每张卡多少 GB（比如 `-gs 16`），那种写法只有在你刻意要给某张卡留出显存时才值得用。',
        code: { lang: 'bash', content: 'python examples/chat.py \\\n  -m ./models/Llama-3.1-8B-exl2-4.65bpw \\\n  -mode llama \\\n  -gs auto' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的跑起来了',
        body: 'ExLlamaV2 has no CPU fallback, so unlike llama.cpp it fails loudly rather than running slowly — which is genuinely convenient. The check that matters is memory: watch the card while the model loads, and compare what it takes against what it should take.',
        bodyZh: 'ExLlamaV2 没有 CPU 回退路径，所以不像 llama.cpp 那样会变慢，它会直接报错 —— 这其实很方便。真正要检查的是显存：加载模型时盯着显卡，把实际占用和应该占用的量对照一下。',
        code: { lang: 'bash', content: 'nvidia-smi --query-gpu=memory.used --format=csv -l 1\n\n# Llama 3.1 8B at 4.65bpw should settle around 5.4 GB at 4K context.\n# Substantially more usually means the context length is larger than you think.' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Llama 3.1 8B at EXL2 4.65bpw is 4.4 GB of weights and 5.4 GB in total at 4K context, rising to 9.3 GB at 32K — the KV cache nearly matches the weights by then. This index has measured runs for exactly this configuration: **235 tok/s on an RTX 4090** and **175 tok/s on an RTX 3090**. That 4090 figure sits essentially at the bandwidth ceiling for this file size, which is what ExLlamaV2 is known for and why it beats the same model’s GGUF build on the same card.',
        bodyZh: 'Llama 3.1 8B 在 EXL2 4.65bpw 下权重 4.4 GB，4K 上下文合计 5.4 GB，32K 时升到 9.3 GB —— 到那时 KV 缓存几乎和权重一样大。本索引对这个配置有实测记录：**RTX 4090 上 235 tok/s**、**RTX 3090 上 175 tok/s**。那个 4090 的数字基本上就顶在这个文件体积对应的带宽上限上，这正是 ExLlamaV2 出名的地方，也是它在同一张卡上快过同模型 GGUF 版本的原因。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'An import error about a compiled extension: the wheel does not match your Python or CUDA version — installing from source with `pip install .` builds against what you actually have, at the cost of a long compile. Out of memory at a context length that used to load: the KV cache scales with the window, and at 32K this model’s cache is almost as large as its weights, so the fix is the context rather than the quant. A model directory that will not load at all: check it is an EXL2 conversion rather than the original weights — the directory layouts look similar and only one of them has the quantized tensors. And there is no CPU offload here by design, so "it fits with a little help from system RAM" is not an option the way it is in llama.cpp.',
        bodyZh: '报错提示某个编译扩展导入失败：说明 wheel 和你的 Python 或 CUDA 版本不匹配 —— 用 `pip install .` 从源码编译会针对你实际的环境构建，代价是编译时间很长。此前能加载的上下文长度现在爆显存：KV 缓存随窗口线性增长，在 32K 时这个模型的缓存几乎和权重一样大，所以该改的是上下文而不是量化档位。模型目录完全加载不了：确认它是 EXL2 转换版而不是原始权重 —— 两者的目录结构看起来很像，但只有一个含有量化后的张量。另外这里没有 CPU offload，这是设计使然，所以 llama.cpp 里那种「靠系统内存搭把手就装下了」在这里不成立。',
      },
    ],
    faqs: [
      {
        q: 'Is ExLlamaV2 faster than llama.cpp?',
        qZh: 'ExLlamaV2 比 llama.cpp 快吗？',
        a: 'On a single NVIDIA card, on this index’s own measurements, yes: Llama 3.1 8B on an RTX 4090 measured 235 tok/s under ExLlamaV2 at EXL2 4.65bpw against 148 tok/s under llama.cpp at GGUF Q4_K_M. The trade is reach — ExLlamaV2 is CUDA-only, while llama.cpp runs on CPU, AMD and Apple silicon as well.',
        aZh: '在单张 NVIDIA 卡上，按本索引自己的实测数据，是的：RTX 4090 上 Llama 3.1 8B 用 ExLlamaV2 跑 EXL2 4.65bpw 实测 235 tok/s，而用 llama.cpp 跑 GGUF Q4_K_M 是 148 tok/s。代价是适用面 —— ExLlamaV2 只支持 CUDA，而 llama.cpp 还能跑在 CPU、AMD 和 Apple 芯片上。',
      },
      {
        q: 'Why is an EXL2 model a folder instead of one file?',
        qZh: 'EXL2 模型为什么是一个文件夹而不是一个文件？',
        a: 'Because the quantization is per-layer with a continuous bit-rate, so the format keeps the model’s structure rather than packing everything into a single container the way GGUF does. Download a specific bit-rate with `--revision` — the same repository holds several, and grabbing the default gets you whichever the publisher made the main branch.',
        aZh: '因为它的量化是逐层进行、位宽连续的，所以这个格式保留了模型本身的结构，而不像 GGUF 那样把所有东西打包进一个容器。用 `--revision` 下载指定的位宽 —— 同一个仓库里通常有好几个，直接拉默认分支得到的是发布者设为主分支的那一个。',
      },
      {
        q: 'Can I run EXL2 on an AMD card or a Mac?',
        qZh: 'A 卡或者 Mac 能跑 EXL2 吗？',
        a: 'No. ExLlamaV2 is CUDA-only — there is no ROCm build and no Metal path, so the format is unavailable on AMD and Apple silicon regardless of how much memory you have. GGUF is the format that runs everywhere, and 81 of the 81 models in this index ship it.',
        aZh: '不能。ExLlamaV2 只支持 CUDA —— 没有 ROCm 构建，也没有 Metal 路径，所以不管你有多少显存，这个格式在 AMD 和 Apple 芯片上都用不了。什么硬件都能跑的格式是 GGUF，本索引 81 个模型全部提供它。',
      },
    ],
  },

  'tabbyapi-exllama-server': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['llama-3.1-8b'],
    verifiedStack: {
      en: 'TabbyAPI · ExLlamaV2 backend · Python 3.10–3.14 · EXL2 models/ directory · OpenAI-compatible API',
      zh: 'TabbyAPI · ExLlamaV2 后端 · Python 3.10–3.14 · EXL2 放在 models/ 目录 · OpenAI 兼容 API',
    },
    content: [
      {
        heading: 'What you need first, and what this is not',
        headingZh: '开始之前，以及它不是什么',
        body: 'An NVIDIA card and a working EXL2 model directory — TabbyAPI is a wrapper, so everything the ExLlamaV2 guide requires applies here unchanged. TabbyAPI wraps ExLlamaV2 in an OpenAI-compatible server, which is what makes EXL2 usable from editor plugins and desktop clients that only speak that protocol. Read the project’s own framing before you build on it: its README states plainly that it is a hobby project for a small number of users and **is not meant to run on production servers**. That is the maintainers’ assessment, not this site’s — take it at face value and use vLLM where you need a service.',
        bodyZh: '一张 NVIDIA 显卡和一个可用的 EXL2 模型目录 —— TabbyAPI 是个包装层，所以 ExLlamaV2 那篇指南要求的一切在这里原样适用。TabbyAPI 把 ExLlamaV2 包装成一个 OpenAI 兼容的服务，这让只会说这套协议的编辑器插件和桌面客户端也能用上 EXL2。在把它当作基础设施之前，请先看项目自己的定位：它的 README 明确写着这是一个面向少量用户的业余项目，**不适合跑在生产服务器上**。这是维护者自己的判断，不是本站的评价 —— 请照字面理解，需要做服务时用 vLLM。',
        code: { lang: 'bash', content: 'git clone https://github.com/theroyallab/tabbyAPI\ncd tabbyAPI' },
      },
      {
        heading: 'Install and configure',
        headingZh: '安装与配置',
        body: 'Python 3.10 through 3.14 is supported. The start scripts set up a virtual environment and pull the right ExLlamaV2 wheel for your platform, which is the part worth letting them do — matching wheels by hand is where most failed installs come from. Configuration lives in `config.yml`, copied from the sample.',
        bodyZh: '支持 Python 3.10 到 3.14。启动脚本会创建虚拟环境并为你的平台拉取匹配的 ExLlamaV2 wheel，这一段值得交给它做 —— 大多数安装失败都出在手动配 wheel 版本上。配置写在 `config.yml` 里，从示例文件复制而来。',
        code: { lang: 'bash', content: 'cp config_sample.yml config.yml\n\n# Linux / macOS\n./start.sh\n\n# Windows\nstart.bat' },
      },
      {
        heading: 'Point it at a model',
        headingZh: '指向一个模型',
        body: 'EXL2 models go in `models/` as directories — one folder per model, not one file. Set the model name and the context length in `config.yml`; the context length is the setting that decides whether the thing loads, because the KV cache scales with it.',
        bodyZh: 'EXL2 模型以目录形式放在 `models/` 下 —— 一个模型一个文件夹，不是一个文件。在 `config.yml` 里设置模型名和上下文长度；上下文长度是决定它能不能加载起来的那个设置，因为 KV 缓存随它增长。',
        code: { lang: 'yaml', content: 'model:\n  model_dir: models\n  model_name: Llama-3.1-8B-exl2-4.65bpw\n  max_seq_len: 4096\n\nnetwork:\n  host: 127.0.0.1\n  port: 5000' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的起来了',
        body: 'Ask the OpenAI-compatible endpoints, the same way you would check any other server of this shape. If the models endpoint answers, weights are loaded and the cache is allocated.',
        bodyZh: '像检查任何同类服务一样，去问它的 OpenAI 兼容端点。如果 models 端点有响应，说明权重已加载、缓存已分配完成。',
        code: { lang: 'bash', content: 'curl http://127.0.0.1:5000/v1/models\n\ncurl http://127.0.0.1:5000/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{"messages":[{"role":"user","content":"hi"}]}\'\n\nnvidia-smi --query-gpu=memory.used --format=csv' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'The backend is ExLlamaV2, so the throughput is ExLlamaV2’s: this index measured Llama 3.1 8B at EXL2 4.65bpw at 235 tok/s on an RTX 4090 and 175 tok/s on an RTX 3090. Memory is 5.4 GB at 4K context and 9.3 GB at 32K for that model — and `max_seq_len` in the config is what picks which of those you pay.',
        bodyZh: '后端是 ExLlamaV2，所以吞吐就是 ExLlamaV2 的吞吐：本索引实测 Llama 3.1 8B 的 EXL2 4.65bpw 在 RTX 4090 上 235 tok/s、RTX 3090 上 175 tok/s。显存方面，该模型 4K 上下文 5.4 GB、32K 时 9.3 GB —— 配置里的 `max_seq_len` 决定你付的是哪一个。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'The server starts but no model loads: `model_name` must match the directory name under `models/` exactly, and it is a directory rather than a file. Out of memory on load: lower `max_seq_len` first — the cache scales with it and the weights do not. A wheel or import error: let `start.sh` build the environment rather than installing ExLlamaV2 yourself into an existing one, since it resolves the wheel against your Python and CUDA. And if you are reaching for authentication, rate limiting or multi-tenancy, that is the signal the README already gave — this is not the project for it.',
        bodyZh: '服务起来了但没有模型被加载：`model_name` 必须和 `models/` 下的目录名完全一致，而且那是个目录不是文件。加载时显存不足：先调低 `max_seq_len` —— 缓存随它增长，权重不会。wheel 或 import 报错：让 `start.sh` 去建环境，不要自己往已有环境里装 ExLlamaV2，因为脚本会按你的 Python 和 CUDA 版本解析 wheel。如果你开始需要鉴权、限流或多租户，那正是 README 已经给过的信号 —— 这不是干这个的项目。',
      },
    ],
    faqs: [
      {
        q: 'Is TabbyAPI suitable for production?',
        qZh: 'TabbyAPI 适合用在生产环境吗？',
        a: 'Its own README says no: "a hobby project made for a small amount of users… not meant to run on production servers." That is the maintainers’ statement and it is worth respecting. Use it to make EXL2 reachable from editor plugins and desktop clients on your own machine; use vLLM when the thing you are building is a service.',
        aZh: '它自己的 README 说不适合：「一个面向少量用户的业余项目……不适合跑在生产服务器上。」这是维护者自己的表述，值得尊重。把它用来让编辑器插件和桌面客户端在你自己的机器上用到 EXL2；当你要做的是一个服务时，用 vLLM。',
      },
      {
        q: 'Why will my model not load in TabbyAPI?',
        qZh: 'TabbyAPI 里模型为什么加载不了？',
        a: 'The two usual causes are the name and the window. `model_name` has to match the directory under `models/` exactly — EXL2 models are folders, not single files — and `max_seq_len` decides how much KV cache is allocated, so a window larger than your card can hold fails at load rather than at request time.',
        aZh: '两个常见原因是名字和窗口。`model_name` 必须和 `models/` 下的目录名完全一致 —— EXL2 模型是文件夹而不是单个文件 —— 而 `max_seq_len` 决定分配多少 KV 缓存，所以设了一个显卡装不下的窗口，会在加载时就失败，而不是等到请求时。',
      },
      {
        q: 'What throughput should I see through TabbyAPI?',
        qZh: '通过 TabbyAPI 能有多少吞吐？',
        a: 'Whatever ExLlamaV2 gives, since it is the backend. On this index’s measured runs, Llama 3.1 8B at EXL2 4.65bpw reached 235 tok/s on an RTX 4090 and 175 tok/s on an RTX 3090. The HTTP layer is not where the time goes; the card’s memory bandwidth is.',
        aZh: '取决于 ExLlamaV2，因为后端就是它。按本索引的实测记录，Llama 3.1 8B 的 EXL2 4.65bpw 在 RTX 4090 上达到 235 tok/s、RTX 3090 上 175 tok/s。时间不花在 HTTP 这一层，而是花在显卡的显存带宽上。',
      },
    ],
  },
  'nginx-llm-api-proxy': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'Nginx · TLS via certbot · proxy_buffering off for SSE · long read timeouts · limit_req rate limiting',
      zh: 'Nginx · certbot 签发 TLS · SSE 需关闭 proxy_buffering · 长读超时 · limit_req 限流',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A local inference server already answering on loopback — Ollama on 11434, llama.cpp on 8080, vLLM on 8000 — a domain pointing at the host, and a certificate. Nginx is doing three jobs here: terminating TLS, holding connections open long enough for generation, and being the only thing on the public interface. The backend stays bound to 127.0.0.1; if it is listening on 0.0.0.0 the proxy is decoration.',
        bodyZh: '先要有一个已经在本机回环地址上响应的推理服务 —— Ollama 在 11434、llama.cpp 在 8080、vLLM 在 8000 —— 一个指向这台主机的域名，以及一张证书。Nginx 在这里做三件事：终结 TLS、把连接保持得足够久以完成生成、以及成为公网接口上唯一的东西。后端必须继续绑定在 127.0.0.1；如果它监听的是 0.0.0.0，那这层反向代理就只是装饰。',
        code: { lang: 'bash', content: '# The backend must NOT be publicly bound. Check before you proxy:\nss -tlnp | grep -E "11434|8080|8000"\n# Expect 127.0.0.1:11434, not 0.0.0.0:11434\n\nsudo certbot --nginx -d llm.example.com' },
      },
      {
        heading: 'The two settings that break streaming',
        headingZh: '会弄坏流式输出的两个设置',
        body: 'This is the part people get wrong, and the symptom is confusing: the API "works" in curl with a non-streaming request and appears to hang with a streaming one. Nginx buffers proxied responses by default, so server-sent events arrive in one lump at the end instead of token by token. And the default read timeout is 60 seconds — long enough for a short reply and not for a long generation, which then looks like the model crashed.',
        bodyZh: '这是最容易配错的一段，而且症状很迷惑人：用 curl 发非流式请求时 API「是好的」，一发流式请求就像卡住了。Nginx 默认会缓冲被代理的响应，于是 SSE 事件不再逐 token 到达，而是在最后一次性吐出来。另外默认读超时是 60 秒 —— 够短回复用，不够长生成用，而那看起来就像模型崩了。',
        code: { lang: 'nginx', content: 'server {\n    listen 443 ssl;\n    http2 on;\n    server_name llm.example.com;\n\n    ssl_certificate     /etc/letsencrypt/live/llm.example.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/llm.example.com/privkey.pem;\n\n    location /v1/ {\n        proxy_pass http://127.0.0.1:11434;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n\n        # Stream tokens instead of buffering the whole reply:\n        proxy_buffering off;\n        proxy_cache off;\n\n        # A long generation is not a hung connection:\n        proxy_read_timeout 600s;\n        proxy_send_timeout 600s;\n    }\n}' },
      },
      {
        heading: 'Put something in front of it',
        headingZh: '在它前面加一道门',
        body: 'An open endpoint on the public internet is a GPU anyone can spend. Nginx can do the cheap half of that — a shared secret and a rate limit — and it should, because the backends mostly have no authentication of their own. `limit_req` with a burst absorbs a normal client’s bursty behaviour while still stopping a script.',
        bodyZh: '一个暴露在公网上的开放端点，等于把你的 GPU 交给任何人花。Nginx 能做掉其中便宜的那一半 —— 一个共享密钥加上限流 —— 而且应该做，因为这些后端大多自己没有任何鉴权。带 burst 的 `limit_req` 既能容纳正常客户端的突发行为，又能挡住脚本。',
        code: { lang: 'nginx', content: 'limit_req_zone $binary_remote_addr zone=llm:10m rate=10r/m;\n\nmap $http_authorization $api_ok {\n    default                  0;\n    "Bearer YOUR_LONG_RANDOM_TOKEN" 1;\n}\n\nlocation /v1/ {\n    if ($api_ok = 0) { return 401; }\n    limit_req zone=llm burst=5 nodelay;\n    # …proxy settings from above…\n}' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的生效了',
        body: 'Three checks, because three different things can be wrong. Test that the endpoint answers over TLS, that a streaming request actually streams rather than arriving all at once, and — most importantly — that the backend is not reachable directly from outside.',
        bodyZh: '要检查三件事，因为可能出问题的是三个不同的地方：TLS 下端点是否有响应、流式请求是不是真的在流式返回而不是最后一次性到达，以及最重要的 —— 后端能不能被外部直接访问到。',
        code: { lang: 'bash', content: '# 1. Does it answer at all?\ncurl -H "Authorization: Bearer YOUR_LONG_RANDOM_TOKEN" \\\n     https://llm.example.com/v1/models\n\n# 2. Does it stream? Tokens should appear progressively, not in one burst.\ncurl -N -H "Authorization: Bearer YOUR_LONG_RANDOM_TOKEN" \\\n     -H "Content-Type: application/json" \\\n     -d \'{"model":"llama3.1:8b","messages":[{"role":"user","content":"count to 20"}],"stream":true}\' \\\n     https://llm.example.com/v1/chat/completions\n\n# 3. From ANOTHER machine — this must fail:\ncurl --max-time 5 http://llm.example.com:11434/api/tags' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'The proxy adds no measurable latency to generation — the time is spent reading weights on the GPU, not forwarding bytes. What changes is time-to-first-token as perceived by the client: with `proxy_buffering on` it equals the whole generation, and with it off it is milliseconds. If throughput through the proxy differs from throughput measured locally by more than noise, you are looking at buffering rather than at the network.',
        bodyZh: '反向代理不会给生成过程增加可测量的延迟 —— 时间花在 GPU 读取权重上，不是转发字节上。真正变化的是客户端感受到的首 token 时间：`proxy_buffering on` 时它等于整次生成的时长，关掉之后它是毫秒级。如果通过代理测到的吞吐和本地测到的差距超出正常波动，你看到的是缓冲问题，不是网络问题。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Streaming requests deliver everything at once at the end: `proxy_buffering off` is missing from that location block. A 504 partway through a long generation: `proxy_read_timeout` is still the 60-second default. 502 on every request: the backend is not listening where `proxy_pass` points, or it bound to a different interface — check with `ss -tlnp` rather than assuming. Clients get 401 with a correct token: header matching is exact, so a trailing space or a different capitalisation of `Bearer` fails. And if step 3 above succeeds from another machine, stop and fix that first: a proxy in front of a publicly-bound backend protects nothing.',
        bodyZh: '流式请求的内容在最后一次性到达：那个 location 块里漏了 `proxy_buffering off`。长生成进行到一半返回 504：`proxy_read_timeout` 还是默认的 60 秒。每个请求都 502：后端没有监听在 `proxy_pass` 指向的地址，或者绑到了别的网卡 —— 用 `ss -tlnp` 确认，不要靠猜。客户端带着正确的 token 却收到 401：请求头是精确匹配的，多一个尾随空格或者 `Bearer` 大小写不同都会失败。还有，如果上面第 3 步在另一台机器上成功了，请先停下来解决那个问题：后端本身对公网开放时，前面加多少层代理都保护不了任何东西。',
      },
    ],
    faqs: [
      {
        q: 'Why does streaming stop working behind Nginx?',
        qZh: '为什么套上 Nginx 之后流式输出就不工作了？',
        a: 'Nginx buffers proxied responses by default, so server-sent events are held and delivered in one piece at the end of the generation. Set `proxy_buffering off` (and `proxy_cache off`) in the location block that proxies the API. The request still succeeds, which is why this is usually diagnosed as a client bug first.',
        aZh: 'Nginx 默认会缓冲被代理的响应，于是 SSE 事件被攒着，在生成结束时一次性发出。请在代理 API 的那个 location 块里设置 `proxy_buffering off`（以及 `proxy_cache off`）。由于请求本身是成功的，这个问题通常会先被误判成客户端的 bug。',
      },
      {
        q: 'Why do long generations return 504?',
        qZh: '长生成为什么会返回 504？',
        a: 'The default `proxy_read_timeout` is 60 seconds, and a long answer on a local model can easily exceed that — Nginx closes the connection and reports a gateway timeout while the model is still working. Raise `proxy_read_timeout` and `proxy_send_timeout` to something matching your longest realistic reply.',
        aZh: '`proxy_read_timeout` 默认是 60 秒，而本地模型的长回复很容易超过这个时长 —— 于是 Nginx 在模型还在工作时就关掉连接并报网关超时。把 `proxy_read_timeout` 和 `proxy_send_timeout` 调到与你最长的真实回复相称的值。',
      },
      {
        q: 'Is a reverse proxy enough to secure a local LLM API?',
        qZh: '一层反向代理足以保护本地大模型 API 吗？',
        a: 'Only if the backend is not reachable without it. Ollama, llama.cpp and vLLM ship with no authentication, so the proxy must be the only route in — bind the backend to `127.0.0.1` and verify from another machine that its port refuses connections. Adding a token check and a `limit_req` rate limit at the proxy covers the cheap half of the problem; leaving the backend on `0.0.0.0` means none of it counts.',
        aZh: '只有在「没有它就访问不到后端」的前提下才够。Ollama、llama.cpp 和 vLLM 出厂都不带鉴权，所以反向代理必须是唯一的入口 —— 把后端绑定到 `127.0.0.1`，并从另一台机器验证它的端口拒绝连接。在代理层加 token 校验和 `limit_req` 限流能解决问题中便宜的那一半；而把后端留在 `0.0.0.0` 上，前面做的一切都不作数。',
      },
    ],
  },
  'qwen-coder-32b-single-4090': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'RTX 4090 24GB · llama.cpp or vLLM · GGUF Q4_K_M or AWQ INT4 · 4K–16K context',
      zh: 'RTX 4090 24GB · llama.cpp 或 vLLM · GGUF Q4_K_M 或 AWQ INT4 · 4K–16K 上下文',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'An RTX 4090 or another 24GB card, and a decision about which quant format before you download anything — the two shipped builds land in different verdict bands on this card, which the rest of this guide is about.',
        bodyZh: '一张 RTX 4090 或其他 24GB 显卡，以及在下载之前先做一个决定：选哪种量化格式 —— 本站收录的两种构建在这张卡上落在不同的判定区间，这正是本文接下来要讲的。',
        code: { lang: 'bash', content: 'nvidia-smi --query-gpu=name,memory.total --format=csv' },
      },
      {
        heading: 'The quant choice actually matters here',
        headingZh: '量化选择在这里真的很关键',
        body: 'GGUF Q4_K_M is 18.7 GB of weights and 21.7 GB in total at 4K context — 90% of a 24GB card, which this index calls tight rather than comfortable. It loads and runs, with no margin for a longer window. AWQ INT4 is smaller at the same nominal bit depth (weights compress differently per format) at 18.1 GB total, 75% of the card — comfortable, with room to grow. If your workflow needs more than 4K of context, that difference is the one that decides whether the model fits at all.',
        bodyZh: 'GGUF Q4_K_M 权重 18.7 GB，4K 上下文下合计 21.7 GB —— 占 24GB 显卡的 90%，本索引把这归为「勉强」而不是「从容」。它能加载运行，但没有余量留给更长的窗口。AWQ INT4 虽然名义位宽相同（不同格式的压缩方式不同），合计只要 18.1 GB，占卡的 75% —— 从容，还有余量可以往上加。如果你的工作流需要超过 4K 的上下文，这个差异就是决定模型到底装不装得下的关键。',
        code: { lang: 'bash', content: '# GGUF: simplest path, tight at 4K on a 24GB card\nollama pull qwen2.5-coder:32b\n\n# AWQ: more headroom, needs vLLM\nvllm serve Qwen/Qwen2.5-Coder-32B-Instruct-AWQ --max-model-len 8192' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'At 90% of the card, GGUF Q4_K_M leaves little slack for a display or a second process — if anything else is using VRAM, this is the model that will not load rather than one that degrades gracefully. Watch memory at load time, not just after.',
        bodyZh: '在占用显卡 90% 的情况下，GGUF Q4_K_M 几乎没有余量留给显示器或第二个进程 —— 如果别的东西正占着显存，这个模型会直接加载失败，而不是优雅地降级。加载时就要盯着显存，而不是等它跑起来之后。',
        code: { lang: 'bash', content: 'nvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1\n\n# llama.cpp: confirm every layer offloaded\n# load_tensors: offloaded 65/65 layers to GPU' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'This index has a measured run on the base Qwen2.5 32B (same parameter count and architecture family, so the memory-bandwidth story is the same): 44 tok/s at GGUF Q4_K_M on an RTX 4090. That is not a Coder-specific measurement, but the roofline it implies — bandwidth divided by weight size — applies to the Coder build too, since the file sizes are nearly identical. AWQ INT4’s smaller weight size gives it a slightly higher ceiling, though this index has no measured AWQ run at this size to compare against.',
        bodyZh: '本索引在基座模型 Qwen2.5 32B（参数量和架构族相同，因此带宽故事也相同）上有一条实测记录：RTX 4090 上 GGUF Q4_K_M 为 44 tok/s。这不是针对 Coder 版本的实测，但它暗示的上限 —— 带宽除以权重体积 —— 同样适用于 Coder 版本，因为两者文件大小几乎一样。AWQ INT4 权重更小，理论上限略高，但本索引在这个体量上没有 AWQ 的实测记录可以对照。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Out of memory loading GGUF Q4_K_M with anything else running: that is expected at 90% of the card — close other GPU consumers or switch to AWQ. Out of memory only once you raise the context: the GGUF build has almost no room for KV cache growth; AWQ buys headroom but even it does not fit at 32K on this card (107%). Slow prompt processing on long files: that is expected on a 32B model regardless of format — it is compute-bound on prefill, not something a quant level changes. And if you need long-context coding work on one 24GB card, the honest answer is a smaller model at a higher quant, not this one pushed past its comfortable range.',
        bodyZh: '在有别的东西占用显存时加载 GGUF Q4_K_M 就爆显存：这在占用 90% 的情况下是预期行为 —— 关掉别的显存消耗者，或者换 AWQ。只有在加大上下文之后才爆显存：GGUF 版本几乎没有余量留给 KV 缓存增长；AWQ 能买到一些余量，但即便如此在这张卡上 32K 也装不下（107%）。处理长文件时提示词阶段很慢：这是 32B 模型在任何格式下都会有的情况 —— 那是预填充阶段的算力瓶颈，量化档位改变不了这个。如果你需要在一张 24GB 的卡上做长上下文的编码工作，诚实的答案是换一个更小、量化档位更高的模型，而不是把这个模型硬推过它舒适的范围。',
      },
    ],
    faqs: [
      {
        q: 'Does Qwen2.5-Coder 32B fit comfortably on an RTX 4090?',
        qZh: 'Qwen2.5-Coder 32B 能从容装进 RTX 4090 吗？',
        a: 'It depends on the format. GGUF Q4_K_M is 21.7 GB at 4K context — 90% of the card, which this index calls tight rather than comfortable. AWQ INT4 is 18.1 GB — 75%, comfortable, with room for a somewhat longer window. Neither fits 32K context on this card.',
        aZh: '取决于格式。GGUF Q4_K_M 在 4K 上下文下是 21.7 GB —— 占卡的 90%，本索引把它归为「勉强」而不是「从容」。AWQ INT4 是 18.1 GB —— 75%，从容，还能留一点余量给稍长的窗口。两种格式在这张卡上都装不下 32K 上下文。',
      },
      {
        q: 'AWQ or GGUF for Qwen2.5-Coder 32B?',
        qZh: 'Qwen2.5-Coder 32B 该用 AWQ 还是 GGUF？',
        a: 'AWQ if you want headroom and are willing to run vLLM; GGUF if you want the simpler Ollama/llama.cpp path and can live with 4K context and no margin. The published perplexity loss is similar between them (2.5% GGUF, 3.5% AWQ against FP16), so the decision is about memory and tooling, not quality.',
        aZh: '想要余量、愿意跑 vLLM 就选 AWQ；想要更简单的 Ollama/llama.cpp 路径、能接受 4K 上下文且没有余量就选 GGUF。两者公开的困惑度损失相近（GGUF 2.5%，AWQ 3.5%，相对 FP16），所以这个决定关乎显存和工具链，不关乎质量。',
      },
      {
        q: 'How many tokens per second should I expect?',
        qZh: '大概能有多少 tok/s？',
        a: 'This index measured 44 tok/s for the same-size base Qwen2.5 32B at GGUF Q4_K_M on an RTX 4090 — a reasonable proxy for the Coder build, since the file sizes and therefore the bandwidth ceiling are nearly identical. There is no measured AWQ run at this size here, though its smaller weight size implies a somewhat higher ceiling.',
        aZh: '本索引在体量相同的基座模型 Qwen2.5 32B 上，用 GGUF Q4_K_M 在 RTX 4090 上实测得到 44 tok/s —— 对 Coder 版本来说是个合理的参照，因为文件大小、进而带宽上限几乎一致。本站在这个体量上没有 AWQ 的实测记录，不过它更小的权重体积意味着理论上限会稍高一些。',
      },
    ],
  },

  'deepseek-r1-exl2-vs-gguf': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'RTX 4090 24GB · ExLlamaV2 (EXL2 4.65bpw) or llama.cpp (GGUF Q4_K_M) · DeepSeek-R1-Distill-Qwen-14B',
      zh: 'RTX 4090 24GB · ExLlamaV2（EXL2 4.65bpw）或 llama.cpp（GGUF Q4_K_M）· DeepSeek-R1-Distill-Qwen-14B',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'An NVIDIA card with at least 10 GB free — both builds fit comfortably on a 24GB RTX 4090 with plenty to spare, and either format also fits a 16GB card. The choice here is not about whether it fits; it is about speed versus reach, which the rest of this guide measures rather than asserts.',
        bodyZh: '一张至少有 10 GB 空闲显存的 NVIDIA 显卡 —— 两种构建在 24GB 的 RTX 4090 上都能从容装下且余量充足，16GB 的卡同样能装下任意一种格式。这里要选的不是「装不装得下」，而是「速度还是适用面」，接下来会用实测而不是断言来说明。',
        code: { lang: 'bash', content: 'nvidia-smi --query-gpu=memory.total --format=csv' },
      },
      {
        heading: 'What each build actually costs',
        headingZh: '两种构建各自的实际开销',
        body: 'EXL2 at 4.65bpw is 8.1 GB of weights, 9.8 GB in total at 4K context. GGUF Q4_K_M is 8.5 GB of weights, 10.1 GB in total — a small difference despite the same nominal bit depth, because the two formats quantize differently under the hood. Both are comfortable on anything 16GB or larger.',
        bodyZh: 'EXL2 4.65bpw 权重 8.1 GB，4K 上下文合计 9.8 GB。GGUF Q4_K_M 权重 8.5 GB，合计 10.1 GB —— 尽管名义位宽相同，两者仍有小差异，因为两种格式底层的量化方式不同。在 16GB 及以上的卡上，两种都很从容。',
        code: { lang: 'bash', content: '# EXL2 via ExLlamaV2\nhuggingface-cli download turboderp/DeepSeek-R1-Distill-Qwen-14B-exl2 \\\n  --revision 4.65bpw --local-dir ./models/r1-14b-exl2\n\n# GGUF via llama.cpp / Ollama\nollama pull deepseek-r1:14b' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'ExLlamaV2 has no CPU fallback and fails loudly if it does not fit, which is its own kind of confirmation. For the GGUF/Ollama path, check the placement explicitly — Ollama silently uses the CPU for whatever does not fit, and a reasoning model that is quietly running on the CPU looks like it is "thinking" rather than like it is broken.',
        bodyZh: 'ExLlamaV2 没有 CPU 回退，装不下时会直接报错，这本身就是一种确认方式。走 GGUF/Ollama 这条路的话，请明确检查放置位置 —— Ollama 会把装不下的部分静默放到 CPU 上，而一个悄悄跑在 CPU 上的推理模型看起来像是在「思考」，而不像是坏了。',
        code: { lang: 'bash', content: 'ollama ps\n# PROCESSOR should read 100% GPU\n\nnvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'This index has a measured EXL2 run: 128 tok/s on an RTX 4090, which is close to the bandwidth-derived ceiling for 8.1 GB of weights on a 1,008 GB/s card (≈124 tok/s — measured slightly above a rounded ceiling is normal variance in the estimate, not an error). There is no measured GGUF run for this specific model at this size, so this guide will not repeat the "~95 tok/s" figure the old version quoted — nobody here ran it. The GGUF file’s slightly larger weight size (8.5 GB against 8.1 GB) implies a marginally lower ceiling, on the order of a few percent, not the ~35% gap once claimed.',
        bodyZh: '本索引有一条 EXL2 的实测记录：RTX 4090 上 128 tok/s，接近 8.1 GB 权重在 1,008 GB/s 带宽的卡上推算出的上限（约 124 tok/s —— 实测略高于取整后的上限，这是估算本身的正常波动，不是错误）。本站没有在这个体量上对这个模型做过 GGUF 的实测，所以本文不会重复旧版本里「约 95 tok/s」的说法 —— 没有人在这里跑过那个数字。GGUF 文件权重略大（8.5 GB 对 8.1 GB），理论上限会略低几个百分点，而不是当初说的约 35% 那么大的差距。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'ExLlamaV2 throws an import error rather than loading: a wheel/CUDA version mismatch — build from source with `pip install .` to match your environment exactly. GGUF via Ollama reports a CPU share: check nothing else is holding VRAM before assuming the model is too big, since both builds comfortably fit 16GB. A "reasoning" model that never seems to finish thinking: that is DeepSeek-R1’s distillation behaviour — it genuinely emits a long chain-of-thought block before the answer, on both formats, and is not a sign anything is broken.',
        bodyZh: 'ExLlamaV2 抛出 import 错误而不是正常加载：wheel 和 CUDA 版本不匹配 —— 用 `pip install .` 从源码编译，精确匹配你的环境。走 Ollama 的 GGUF 报告有 CPU 占比：先检查有没有别的东西占着显存，再怀疑模型太大，因为两种构建在 16GB 上都很从容。一个「推理」模型看起来永远想不完：这是 DeepSeek-R1 蒸馏版本本身的行为 —— 它确实会在给出答案前输出一大段思维链，两种格式都一样，不是出了问题。',
      },
    ],
    faqs: [
      {
        q: 'Is EXL2 really faster than GGUF for this model?',
        qZh: '这个模型上 EXL2 真的比 GGUF 快吗？',
        a: 'On this index’s own measurement, yes for EXL2 (128 tok/s on an RTX 4090) — but there is no measured GGUF run for this model here to compare against directly. The two files are close in size (8.1 GB vs 8.5 GB), so the bandwidth-derived ceilings are close too; a large gap between them would be surprising rather than expected.',
        aZh: '按本索引自己的实测，EXL2 更快（RTX 4090 上 128 tok/s）—— 但本站没有对这个模型做过 GGUF 的实测可以直接对照。两个文件体积接近（8.1 GB 对 8.5 GB），所以带宽推算出的上限也接近；两者出现巨大差距才是意外，而不是预期。',
      },
      {
        q: 'Does this model fit on a 16GB card?',
        qZh: '这个模型能装进 16GB 的卡吗？',
        a: 'Yes, comfortably, in either format. GGUF Q4_K_M is 10.1 GB and EXL2 4.65bpw is 9.8 GB at 4K context — both well under a 16GB budget, with room for a longer context window than the 4K used here.',
        aZh: '可以，无论哪种格式都很从容。4K 上下文下 GGUF Q4_K_M 是 10.1 GB，EXL2 4.65bpw 是 9.8 GB —— 都明显低于 16GB 的预算，还留有余量支持比这里用的 4K 更长的上下文。',
      },
      {
        q: 'Why does DeepSeek-R1 take so long to answer?',
        qZh: 'DeepSeek-R1 为什么回答要等这么久？',
        a: 'It is a reasoning-distilled model: it generates an explicit chain-of-thought block before its final answer, which is real generated content rather than a stall. That behaviour is the same on both EXL2 and GGUF builds — it is a property of the model, not the format or the runtime.',
        aZh: '它是一个推理蒸馏模型：在给出最终答案之前，它会生成一段明确的思维链，那是真实生成的内容，不是卡住了。这个行为在 EXL2 和 GGUF 两种构建上是一样的 —— 这是模型本身的特性，与格式或运行时无关。',
      },
    ],
  },
  'quantize-own-model-gguf': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A fine-tuned or merged model in Hugging Face safetensors format, a built copy of llama.cpp, and enough free disk for three copies of the model at once: the original weights, an intermediate high-precision GGUF, and the final quantized file. For a 7B model in BF16 that is roughly 14 GB + 14 GB + 5 GB — budget 35–40 GB of scratch space, not just the size of the model you started with.',
        bodyZh: '一个 Hugging Face safetensors 格式的微调或合并模型、一份编译好的 llama.cpp，以及足够同时容纳三份模型的磁盘空间：原始权重、中间的高精度 GGUF、最终的量化文件。以 BF16 的 7B 模型为例大约是 14 GB + 14 GB + 5 GB —— 要按这个总量预留磁盘，而不是只按起始模型的大小。',
        code: { lang: 'bash', content: 'pip install -r requirements.txt   # inside your llama.cpp checkout\ndf -h .' },
      },
      {
        heading: 'Convert to GGUF',
        headingZh: '转换为 GGUF',
        body: 'The conversion script is `convert_hf_to_gguf.py`. The older `convert.py` name that circulates in older tutorials no longer exists in the repository — if a guide you are reading elsewhere still uses it, that guide predates the rename. Convert to a high-precision intermediate first; converting straight to a low bit-depth from safetensors is not how the pipeline works.',
        bodyZh: '转换脚本是 `convert_hf_to_gguf.py`。旧教程里流传的 `convert.py` 这个名字在仓库里已经不存在了 —— 如果你在别处看到的指南还在用它，说明那篇指南是改名之前写的。先转换成高精度的中间文件；直接从 safetensors 转成低位宽不是这套流程的工作方式。',
        code: { lang: 'bash', content: 'python convert_hf_to_gguf.py /path/to/my-model \\\n  --outfile my-model-f16.gguf \\\n  --outtype f16' },
      },
      {
        heading: 'Quantize it',
        headingZh: '量化',
        body: 'The quantization binary is `llama-quantize` — the bare `quantize` name from older tutorials was renamed along with the rest of the CLI tools. Q4_K_M is the level almost everyone should start with: this index’s own median published quality loss at that level is 2.9% against FP16, and every model in this index that ships GGUF ships this level.',
        bodyZh: '量化的可执行文件是 `llama-quantize` —— 旧教程里那个裸 `quantize` 的名字随着 CLI 工具的重命名一起变了。Q4_K_M 是几乎所有人都该从这里开始的档位：本索引在这个档位上公布的质量损失中位数相对 FP16 是 2.9%，而且本站每一个提供 GGUF 的模型都提供这个档位。',
        code: { lang: 'bash', content: './build/bin/llama-quantize my-model-f16.gguf my-model-Q4_K_M.gguf Q4_K_M' },
      },
      {
        heading: 'Do it properly: an importance matrix',
        headingZh: '做得更好：重要性矩阵',
        body: 'A plain quantization treats every weight the same. An importance matrix (imatrix), computed by running representative text through the F16 model first, tells the quantizer which weights matter more and protects them — the same idea behind why Q4_K_M already beats a naive 4-bit round-off, taken further. This step is what separates a quant you would publish from one that is merely usable.',
        bodyZh: '普通量化会一视同仁地对待每一个权重。重要性矩阵（imatrix）先用有代表性的文本跑一遍 F16 模型算出来，告诉量化器哪些权重更重要、该被保护 —— 这正是 Q4_K_M 已经优于朴素 4-bit 取整的原因，只是做得更彻底。这一步是「值得发布的量化版本」和「勉强能用的量化版本」之间的分水岭。',
        code: { lang: 'bash', content: './build/bin/llama-imatrix \\\n  -m my-model-f16.gguf \\\n  -f calibration-data.txt \\\n  -o my-model.imatrix\n\n./build/bin/llama-quantize \\\n  --imatrix my-model.imatrix \\\n  my-model-f16.gguf my-model-Q4_K_M.gguf Q4_K_M' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的没问题',
        body: 'Load the quantized file and run a real prompt — a successful conversion that produces garbage output is a real failure mode, usually from a tokenizer or chat-template mismatch during conversion rather than from quantization itself. Compare the file size against expectation: a Q4_K_M file should land near params × 0.6 bytes per parameter, and a figure wildly off that suggests the conversion picked up the wrong precision.',
        bodyZh: '加载量化后的文件、跑一个真实的提示词 —— 转换「成功」但输出乱码是一种真实的失败模式，通常是转换过程中分词器或聊天模板不匹配，而不是量化本身的问题。把文件大小和预期对比一下：Q4_K_M 文件大小应该接近「参数量 × 每参数 0.6 字节」，如果差得很远，说明转换过程选错了精度。',
        code: { lang: 'bash', content: './build/bin/llama-cli -m my-model-Q4_K_M.gguf -p "Explain quantization in one sentence." -n 64\n\nls -lh my-model-Q4_K_M.gguf   # sanity-check the size' },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'The conversion script fails with an unknown architecture: your model uses a layer type `convert_hf_to_gguf.py` does not yet recognise — check the script’s supported-architecture list before assuming your model is fine and the tool is broken. Output is fluent but wrong (repeats itself, ignores the prompt): usually a chat-template mismatch carried over from the original model, not a quantization artifact — verify with the F16 intermediate before blaming the quant step. Running out of disk mid-conversion: this is the three-copies problem from the first section: clean up the F16 intermediate once the quantized file is verified, but not before. And if you would rather not run any of this yourself, the GGUF-my-repo Space on Hugging Face runs the same pipeline and syncs from llama.cpp’s main branch every six hours.',
        bodyZh: '转换脚本报未知架构错误：你的模型用了 `convert_hf_to_gguf.py` 还不认识的层类型 —— 先查一下脚本支持的架构列表，别急着认为是工具坏了。输出通顺但答非所问（自我重复、无视提示词）：通常是原模型自带的聊天模板不匹配，而不是量化的问题 —— 先用 F16 中间文件验证一下，再怀疑量化那一步。转换到一半磁盘满了：这就是开头说的「三份拷贝」问题 —— 确认量化文件没问题之后再清理 F16 中间文件，而不是提前清。如果你不想自己跑这一套，Hugging Face 上的 GGUF-my-repo Space 跑的是同一套流程，每六小时从 llama.cpp 的 main 分支同步一次。',
      },
    ],
    faqs: [
      {
        q: 'What is convert_hf_to_gguf.py, and where did convert.py go?',
        qZh: 'convert_hf_to_gguf.py 是什么，convert.py 去哪了？',
        a: '`convert_hf_to_gguf.py` is the current script for turning Hugging Face safetensors weights into a GGUF file. `convert.py` was the older name and no longer exists in the repository — any tutorial still referencing it predates the rename.',
        aZh: '`convert_hf_to_gguf.py` 是当前把 Hugging Face safetensors 权重转成 GGUF 文件的脚本。`convert.py` 是旧名字，仓库里已经不存在了 —— 任何还在用这个名字的教程都是改名之前写的。',
      },
      {
        q: 'What is llama-quantize, and is it the same as quantize?',
        qZh: 'llama-quantize 是什么，跟 quantize 是一回事吗？',
        a: 'It is the same tool under its current name. The binary was renamed from the bare `quantize` along with the rest of llama.cpp’s CLI tools (`llama-server`, `llama-cli`), so an older tutorial referencing `./quantize` is naming a file that no longer exists in a fresh build.',
        aZh: '是同一个工具，只是现在的名字变了。这个可执行文件和 llama.cpp 的其他 CLI 工具（`llama-server`、`llama-cli`）一起，从裸名字 `quantize` 改了名，所以旧教程里的 `./quantize` 在新版编译出来的目录里已经不存在了。',
      },
      {
        q: 'Do I need an importance matrix (imatrix) to quantize a model?',
        qZh: '量化一定要用重要性矩阵（imatrix）吗？',
        a: 'No — quantization works without one. An imatrix improves the result by telling the quantizer which weights matter most, computed by running representative text through the F16 model first. Skip it for a quick personal test; use it before publishing a quant anyone else will rely on.',
        aZh: '不需要 —— 没有它量化也能跑。imatrix 会先用有代表性的文本跑一遍 F16 模型，告诉量化器哪些权重更重要，从而提升效果。自己快速测试可以跳过；要发布给别人用的量化版本，就该做这一步。',
      },
    ],
  },

  'cpu-inference-optimization': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['llama-3.1-8b'],
    verifiedStack: {
      en: 'llama.cpp CPU build · thread count tuned to physical cores · GGUF Q4_K_M · no measured tok/s claims',
      zh: 'llama.cpp CPU 构建 · 线程数按物理核心调整 · GGUF Q4_K_M · 不引用未实测的 tok/s',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A build of llama.cpp, and an honest question about what you are actually optimizing: token generation and prompt processing are bottlenecked by different things, and the fix for one does not touch the other. This guide covers both, separately, because conflating them is the most common mistake in CPU tuning advice.',
        bodyZh: '一份编译好的 llama.cpp，以及一个诚实的问题：你到底在优化哪一个环节——token 生成和提示词处理受限于不同的东西，优化一个不会影响另一个。本文分开讲这两者，因为把它们混为一谈正是 CPU 调优建议里最常见的错误。',
        code: { lang: 'bash', content: 'nproc --all       # logical (with hyperthreads)\nlscpu | grep -E "^Core|^Socket"   # physical cores' },
      },
      {
        heading: 'What actually speeds up generation',
        headingZh: '真正能让生成变快的是什么',
        body: 'Generating each token means reading every weight once, so on CPU — exactly as on a GPU — the ceiling is memory bandwidth divided by weight size. Nothing about a BLAS library changes that arithmetic. The two levers that do matter: thread count set to your physical core count (not the hyperthread-doubled figure `nproc` reports, which mostly adds contention past that point), and the quant level, since a smaller file is fewer bytes to read per token.',
        bodyZh: '每生成一个 token 都要把所有权重读一遍，所以在 CPU 上——和 GPU 一模一样——上限就是「带宽 ÷ 权重体积」。BLAS 库改变不了这个算术。真正管用的是两个杠杆：线程数设成物理核心数（而不是 `nproc` 报出来的、把超线程也算进去翻倍的数字，超过物理核心数之后主要是增加争用），以及量化档位，因为文件越小，每个 token 要读的字节就越少。',
        code: { lang: 'bash', content: './build/bin/llama-server \\\n  -m ./models/Llama-3.1-8B-Q4_K_M.gguf \\\n  -t 8 \\\n  -c 4096 \\\n  --host 127.0.0.1 --port 8080\n\n# -t 8 assumes 8 PHYSICAL cores — check with lscpu, not nproc' },
      },
      {
        heading: 'What OpenBLAS actually helps',
        headingZh: 'OpenBLAS 真正能帮上什么忙',
        body: 'This is the correction this guide exists to make: llama.cpp’s own build documentation states plainly that BLAS acceleration helps prompt processing at batch sizes above 32, and that it does not affect generation speed at all. If your use case is chat — short prompts, long generations — OpenBLAS buys you close to nothing. If it is bulk document processing with large batched prompts, it is worth building with `-DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS`.',
        bodyZh: '这正是本文要纠正的地方：llama.cpp 自己的构建文档明确写着，BLAS 加速只在批大小超过 32 的提示词处理阶段有用，对生成速度完全没有影响。如果你的场景是聊天——短提示词、长生成——OpenBLAS 几乎买不到什么。如果是批量处理大段文档、批大小很大的场景，用 `-DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS` 编译才值得。',
        code: { lang: 'bash', content: 'sudo apt install -y libopenblas-dev\ncmake -B build -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS\ncmake --build build --config Release -j$(nproc)\n\n# This changes prompt-processing speed on large batches.\n# It will not change your tokens-per-second while chatting.' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认调整真的有效',
        body: 'Measure generation and prompt processing separately — llama.cpp prints both at the end of a run. If you built with BLAS expecting faster chat and the generation number did not move, that is not a broken build; it is the documented behaviour above.',
        bodyZh: '把生成速度和提示词处理速度分开测——llama.cpp 在每次运行结束时会分别打印这两个数字。如果你为了让聊天变快而编译了 BLAS，结果生成速度的数字没动，那不是构建坏了，而是上面文档写明的行为。',
        code: { lang: 'bash', content: './build/bin/llama-cli -m ./models/Llama-3.1-8B-Q4_K_M.gguf \\\n  -p "Write a short paragraph about coffee." -n 128\n\n# Look for two separate lines at the end:\n#   prompt eval time = ... tokens per second\n#   eval time         = ... tokens per second   <- this is generation' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Llama 3.1 8B at Q4_K_M is 4.6 GB of weights. This index does not have a measured CPU throughput row, and system RAM bandwidth varies far more between machines than GPU VRAM bandwidth does — it depends on your DIMM count, speed and channel configuration, not just the CPU model — so this guide will not repeat the old version’s unsourced "~12 tok/s" and "~15 tok/s" cloud-instance figures. What you can compute for your own machine: find your system’s real memory bandwidth (from its specification, not the CPU’s marketing number) and divide by 4.6 GB for a personal ceiling.',
        bodyZh: 'Llama 3.1 8B 的 Q4_K_M 权重是 4.6 GB。本索引没有实测的 CPU 吞吐记录，而系统内存带宽在不同机器之间的差异，比显卡显存带宽的差异大得多——它取决于你的内存条数量、速度和通道配置，不只是 CPU 型号——所以本文不会重复旧版本里那个没有来源的「Hetzner 约 12 tok/s」「AWS 约 15 tok/s」的说法。你可以自己算：找到你机器的真实内存带宽（查规格，不是查 CPU 的宣传数字），除以 4.6 GB，就是你自己的理论上限。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Generation did not speed up after building with BLAS: expected — see above. Setting `-t` above your physical core count makes things slower, not faster: hyperthreads share execution units, and past the physical count you are adding scheduling overhead rather than throughput. Prompt processing is fast but generation is still slow: that is normal and is the bandwidth ceiling, not a misconfiguration — the only real levers left are a smaller quant or more RAM channels. And if you need consistently fast interactive chat rather than occasional CPU inference, the honest answer is a GPU, even a small one: any discrete card’s memory bandwidth is typically several times a consumer CPU’s.',
        bodyZh: '编译了 BLAS 之后生成速度没变快：符合预期——见上文。把 `-t` 设得比物理核心数还高会更慢而不是更快：超线程共享执行单元，超过物理核心数之后增加的是调度开销，不是吞吐量。提示词处理很快但生成还是慢：这是正常的，是带宽上限，不是配置问题——剩下真正管用的杠杆只有换更小的量化档位或加内存通道。如果你需要的是持续稳定的快速交互式聊天，而不是偶尔用一下 CPU 推理，诚实的答案是上一张 GPU，哪怕是小的：任何一张独显的显存带宽通常都是消费级 CPU 的好几倍。',
      },
    ],
    faqs: [
      {
        q: 'Does OpenBLAS make llama.cpp generate tokens faster?',
        qZh: 'OpenBLAS 能让 llama.cpp 生成 token 更快吗？',
        a: 'No. llama.cpp’s own build documentation states that BLAS acceleration helps prompt processing at batch sizes above 32 and does not affect generation performance at all. If your workload is interactive chat, building with OpenBLAS will not change your tokens-per-second.',
        aZh: '不能。llama.cpp 自己的构建文档写明，BLAS 加速只在批大小超过 32 的提示词处理阶段有用，对生成性能完全没有影响。如果你的场景是交互式聊天，编译 OpenBLAS 不会改变你的 tok/s。',
      },
      {
        q: 'How many threads should I use for CPU inference?',
        qZh: 'CPU 推理该用多少线程？',
        a: 'Your physical core count, checked with `lscpu`, not the number `nproc` reports if hyperthreading is on — that figure is doubled and pushing thread count past the physical count typically adds contention rather than throughput. Set it with `-t`.',
        aZh: '用 `lscpu` 查到的物理核心数，而不是开了超线程时 `nproc`报出来的数字——那个数字是翻倍的，线程数超过物理核心数通常只会增加争用，而不是吞吐量。用 `-t` 设置这个数。',
      },
      {
        q: 'How fast is CPU inference compared to a GPU?',
        qZh: 'CPU 推理和 GPU 比起来有多慢？',
        a: 'This index has no measured CPU throughput row to quote a number from, and system RAM bandwidth varies too much between machines for one figure to be meaningful. What is measurable: any discrete GPU’s memory bandwidth is typically several times higher than system RAM, and generation speed scales with that bandwidth divided by the model’s weight size — so the gap is usually large, in the GPU’s favour.',
        aZh: '本索引没有实测的 CPU 吞吐数据可以引用，而且系统内存带宽在不同机器间差异太大，给一个数字也没什么意义。可以确定的是：任何一张独显的显存带宽通常是系统内存的好几倍，而生成速度正比于「带宽 ÷ 模型权重体积」——所以差距通常很大，GPU 占优。',
      },
    ],
  },
  'm1-8gb-ollama-limits': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'M1/M2 8GB Mac · Ollama 0.6+ · GGUF Q4_K_M · 3B-class models · short context',
      zh: 'M1/M2 8GB Mac · Ollama 0.6+ · GGUF Q4_K_M · 3B 级模型 · 短上下文',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'An M1 or M2 Mac with the base 8GB unified memory configuration, and a realistic expectation set before you start: this is the tightest capacity tier this site covers, and the honest goal is a genuinely usable 3B-class assistant, not a smaller version of what a 24GB card runs.',
        bodyZh: '一台基础 8GB 统一内存配置的 M1 或 M2 Mac，以及在开始之前先建立一个现实的预期：这是本站覆盖的显存档位中最紧张的一档，诚实的目标是一个真正可用的 3B 级助手，而不是 24GB 显卡上跑的东西的缩小版。',
        code: { lang: 'bash', content: 'brew install ollama\nollama --version' },
      },
      {
        heading: 'This index has no M1/M2 base entry — here is the substitute',
        headingZh: '本索引没有 M1/M2 基础版条目 —— 这是替代方案',
        body: 'The GPU database behind this site’s calculator has no M1 or M2 base-tier row — only M2 Max and M2 Ultra, the higher configurations. The 8GB capacity figures below use the Mac M3 8G entry as a stand-in, since the calculator only reads capacity, and 8GB is 8GB regardless of chip generation. Bandwidth is not: the M3 entry is rated at 100 GB/s, while the M2 base chip is close to that at 100 GB/s and the original M1 base chip is meaningfully slower at roughly 68 GB/s. On an M1 specifically, expect generation speed below what the M3-based numbers here would suggest; on an M2, expect them to be close.',
        bodyZh: '本站计算器背后的显卡数据库里没有 M1 或 M2 基础版的条目 —— 只有更高配置的 M2 Max 和 M2 Ultra。下面的 8GB 容量数字用 Mac M3 8G 条目作为替代，因为计算器只读取容量，而不管芯片是哪一代，8GB 就是 8GB。带宽则不一样：M3 条目标称 100 GB/s，M2 基础版芯片与此接近同为 100 GB/s，而最初的 M1 基础版芯片明显更慢，约 68 GB/s。如果你用的具体是 M1，实际生成速度会低于这里按 M3 数字推算出的结果；如果是 M2，会比较接近。',
      },
      {
        heading: 'What actually fits',
        headingZh: '实际能装下什么',
        body: 'At Q4_K_M and 4K context: Llama 3.2 3B is 2.5 GB total, Qwen2.5 3B is 2.2 GB, Phi-3.5 Mini is 4.1 GB — all comfortable on 8GB with macOS and a browser running. An 8B model at Q4_K_M is 5.6 GB on its own, which sounds like it should fit, but the unified-memory reality below is what actually decides it.',
        bodyZh: '在 Q4_K_M、4K 上下文下：Llama 3.2 3B 合计 2.5 GB，Qwen2.5 3B 是 2.2 GB，Phi-3.5 Mini 是 4.1 GB —— 在 macOS 和浏览器都开着的情况下，8GB 都能从容装下。8B 模型在 Q4_K_M 下自身就要 5.6 GB，听起来似乎该装得下，但下面这条统一内存的现实才是真正决定它的因素。',
        code: { lang: 'bash', content: 'ollama pull llama3.2:3b\nollama run llama3.2:3b' },
      },
      {
        heading: 'The unified-memory limit nobody mentions',
        headingZh: '没人提的统一内存上限',
        body: 'macOS reserves part of the 8GB pool for the system and caps what one process may wire down — on an 8GB machine that cap leaves meaningfully less than 8GB for a model, and it is why an 8B model that "should" fit by the raw arithmetic often does not in practice. This is the same mechanism every Mac on this site is subject to; it simply has no slack to spare at 8GB the way it does at 48GB.',
        bodyZh: 'macOS 会为系统保留一部分 8GB 的内存池，并限制单个进程能锁定的量——在 8GB 的机器上，这个上限留给模型的明显少于 8GB，这也是为什么一个按纯算术「应该」装得下的 8B 模型，实际往往装不下。这是本站每一台 Mac 都受制于的同一种机制；只是在 8GB 上没有像 48GB 那样的余量可以挥霍。',
        code: { lang: 'bash', content: 'sysctl iogpu.wired_limit_mb   # 0 = default policy, not "no limit"' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'On unified memory there is no separate VRAM figure to watch, so ask Ollama directly. If `ollama ps` reports anything other than 100% GPU on a 3B model, something else is holding memory — close browser tabs with hardware acceleration before assuming the model itself is the problem.',
        bodyZh: '统一内存下没有一个独立的显存数字可以盯着看，所以要直接问 Ollama。如果 `ollama ps` 在一个 3B 模型上显示的不是 100% GPU，说明有别的东西占着内存——先关掉开着硬件加速的浏览器标签页，再怀疑模型本身有问题。',
        code: { lang: 'bash', content: 'ollama ps\n# NAME           SIZE     PROCESSOR    UNTIL\n# llama3.2:3b    2.9 GB   100% GPU     4 minutes from now' },
      },
      {
        heading: 'Settings worth changing on 8GB specifically',
        headingZh: '在 8GB 上特别值得改的设置',
        body: 'Keep one model loaded at a time and do not run parallel requests — both defaults already favour this, but it is worth being explicit on the tightest tier, where a second model loading while the first has not finished unloading is what causes real thrashing.',
        bodyZh: '一次只保留一个模型加载，不要并发请求——这两个设置默认本来就是这个方向，但在最紧张的这一档，值得明确设置，因为「第一个还没卸载完，第二个就开始加载」正是真正引发换页的原因。',
        code: { lang: 'bash', content: 'export OLLAMA_NUM_PARALLEL=1        # already the default\nexport OLLAMA_MAX_LOADED_MODELS=1\nollama run llama3.2:3b' },
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'The whole machine slows to a crawl while a model is loaded: that is swapping, and it means the model plus everything else exceeded the practical wired limit — the fix is a smaller model, not a setting, since there is no headroom left to tune away. `ollama ps` shows a CPU share on a 3B model: something else is holding memory; check Activity Monitor before assuming the model is too big for its own numbers. An 8B model refuses to run well: this is expected at 8GB — the 3B tier is the honest ceiling here, not a limitation of this particular guide’s settings.',
        bodyZh: '模型加载着的时候整机变得极慢：这是在换页，说明模型加上其他东西超出了实际的锁定上限——解决办法是换更小的模型，不是调设置，因为已经没有余量可以调了。`ollama ps` 在一个 3B 模型上显示有 CPU 占比：有别的东西占着内存；先看活动监视器，别急着怀疑模型对自己的体量来说太大了。8B 模型跑得很差：这在 8GB 上是预期的——3B 档位就是这里诚实的上限，不是这篇指南某个设置没调好。',
      },
    ],
    faqs: [
      {
        q: 'Can an 8GB M1 or M2 Mac run an 8B model?',
        qZh: '8GB 的 M1 或 M2 Mac 能跑 8B 模型吗？',
        a: 'Poorly, if at all. Llama 3.1 8B at Q4_K_M needs 5.6 GB on its own, and macOS reserves part of the 8GB pool for the system while capping what one process may wire down — on the tightest tier that cap leaves little slack. A 3B-class model is the realistic ceiling for consistently usable performance on 8GB.',
        aZh: '即便能跑也很勉强。Llama 3.1 8B 在 Q4_K_M 下自身就要 5.6 GB，而 macOS 会为系统保留一部分 8GB 内存池，并限制单个进程能锁定的量——在最紧张的这一档，这个上限留下的余量很少。3B 级模型才是 8GB 上能稳定可用的现实上限。',
      },
      {
        q: 'Does this guide’s data apply to the original M1 the same as an M2?',
        qZh: '这篇指南的数据对原版 M1 和 M2 一样适用吗？',
        a: 'The capacity numbers do — 8GB is 8GB. Speed does not: this site’s calculator has no M1 or M2 base-tier entry and substitutes the Mac M3 8G row for capacity, which is rated at 100 GB/s. The original M1 base chip is meaningfully slower, around 68 GB/s, so expect generation speed below what the figures here imply; the M2 base chip is close to the M3 figure.',
        aZh: '容量数字适用——8GB 就是 8GB。速度不适用：本站计算器没有 M1 或 M2 基础版的条目，容量方面用 Mac M3 8G 那一行代替，标称 100 GB/s。原版 M1 基础版芯片明显更慢，约 68 GB/s，所以实际生成速度会低于这里数字暗示的水平；M2 基础版芯片则和 M3 的数字比较接近。',
      },
      {
        q: 'How do I stop Ollama from thrashing my 8GB Mac?',
        qZh: '怎么防止 Ollama 把 8GB 的 Mac 拖到换页？',
        a: 'Keep one model loaded at a time (`OLLAMA_MAX_LOADED_MODELS=1`), avoid parallel requests (`OLLAMA_NUM_PARALLEL=1`, already the default), and pick a 3B-class model rather than pushing an 8B into a budget that has no slack for it. If the whole machine slows down while a model is loaded, that is swapping, and the fix is a smaller model, not a setting.',
        aZh: '一次只保留一个模型加载（`OLLAMA_MAX_LOADED_MODELS=1`），避免并发请求（`OLLAMA_NUM_PARALLEL=1`，本就是默认值），选 3B 级模型，而不是把 8B 硬塞进一个毫无余量的预算里。如果模型加载时整机变慢，那是在换页，解决办法是换更小的模型，不是调设置。',
      },
    ],
  },

  'docker-ollama-gpu': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    relatedModelIds: ['llama-3.1-8b'],
    verifiedStack: {
      en: 'Docker Engine + NVIDIA Container Toolkit · ollama/ollama image · GGUF Q4_K_M · GPU passthrough',
      zh: 'Docker Engine + NVIDIA Container Toolkit · ollama/ollama 镜像 · GGUF Q4_K_M · GPU 直通',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'Docker Engine, and the NVIDIA Container Toolkit specifically — an ordinary Docker install has no idea a GPU exists, and a container run without it silently falls back to the CPU with no error. Verify the toolkit works before touching Ollama at all; debugging "Ollama is slow in Docker" is much harder than debugging "does my container see the GPU".',
        bodyZh: '需要 Docker Engine，以及**专门的** NVIDIA Container Toolkit ——普通的 Docker 安装完全不知道显卡的存在，没装这个工具包时容器会静默回落到 CPU，不会报任何错误。在碰 Ollama 之前先验证这个工具包能用；调试「Ollama 在 Docker 里很慢」比调试「我的容器看不看得到 GPU」难得多。',
        code: { lang: 'bash', content: '# Verify BEFORE running Ollama:\ndocker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi\n\n# If that fails, install the toolkit first — nothing below will work.' },
      },
      {
        heading: 'The compose file',
        headingZh: 'compose 文件',
        body: 'The GPU reservation block is what most copy-pasted examples get wrong or omit entirely. Bind the port to loopback unless you intend to expose the API — Ollama has no authentication of its own.',
        bodyZh: 'GPU 预留那一段正是大多数抄来的示例会配错或者干脆漏掉的地方。除非你打算把 API 暴露出去，否则端口要绑定到回环地址——Ollama 自己没有任何鉴权。',
        code: { lang: 'yaml', content: 'services:\n  ollama:\n    image: ollama/ollama\n    container_name: ollama\n    ports:\n      - "127.0.0.1:11434:11434"\n    volumes:\n      - ollama_data:/root/.ollama\n    restart: unless-stopped\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu]\n\nvolumes:\n  ollama_data:' },
      },
      {
        heading: 'Start it and pull a model',
        headingZh: '启动并拉取模型',
        body: 'Bring the container up, then pull a model into it — the model store lives in the named volume, so it survives `down` and `up` without a re-download. Llama 3.1 8B at Q4_K_M is 5.6 GB at 4K context, a reasonable first pull on any 8GB+ card.',
        bodyZh: '把容器起来，然后向里面拉取模型——模型存储在命名卷里，所以 `down` 再 `up` 不需要重新下载。Llama 3.1 8B 的 Q4_K_M 在 4K 上下文下是 5.6 GB，对任何 8GB 以上的卡来说都是一个合理的首次拉取。',
        code: { lang: 'bash', content: 'docker compose up -d\ndocker exec ollama ollama pull llama3.1:8b' },
      },
      {
        heading: 'Check it actually ran on the GPU',
        headingZh: '确认它真的跑在 GPU 上',
        body: 'This is the step containerisation makes easy to skip, because the container starts successfully either way — on the CPU or the GPU — and only speed tells the difference. Ask the container, not the host.',
        bodyZh: '容器化让这一步特别容易被跳过，因为不管是在 CPU 还是 GPU 上，容器都会正常启动——只有速度能看出区别。要问容器，而不是问宿主机。',
        code: { lang: 'bash', content: 'docker exec ollama ollama run llama3.1:8b "hi" >/dev/null\ndocker exec ollama ollama ps\n# PROCESSOR should read 100% GPU\n\nnvidia-smi --query-gpu=memory.used,utilization.gpu --format=csv -l 1' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Containerisation adds no measurable overhead to inference — the GPU does the same work either way. Llama 3.1 8B at Q4_K_M is 4.6 GB of weights; on an RTX 4090 at 1,008 GB/s that puts a ceiling near 218 tok/s, which is what this index measured for this exact model and quant on that card, in Ollama, without a container. A containerised run should land at essentially the same figure.',
        bodyZh: '容器化不会给推理增加可测量的开销——GPU 干的是同一份工作。Llama 3.1 8B 的 Q4_K_M 权重是 4.6 GB；在带宽 1,008 GB/s 的 RTX 4090 上，上限约 218 tok/s，这也正是本索引在那张卡上、不套容器直接用 Ollama 跑同一个模型和档位实测到的数字。套上容器之后应该落在基本相同的数字上。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: '`ollama ps` inside the container reports a CPU share while `nvidia-smi` on the host works fine: the `deploy.resources.reservations.devices` block is missing from the compose file, or the NVIDIA Container Toolkit is not installed — the verification command from the first section isolates which. Container starts but the toolkit check from step one already failed: fix that first; nothing about Ollama’s configuration will work around a missing toolkit. Models disappear after `docker compose down`: no named volume was used, or it was removed with `-v` — the `ollama_data` volume above is what survives a recreate. And on Windows, this requires the WSL2 backend with GPU support enabled in Docker Desktop’s settings; without that, the toolkit check fails the same way it would on a host with no toolkit at all.',
        bodyZh: '容器内 `ollama ps` 报告有 CPU 占比，而宿主机上 `nvidia-smi` 一切正常：compose 文件里缺了 `deploy.resources.reservations.devices` 那一段，或者没装 NVIDIA Container Toolkit——用第一段的验证命令就能区分是哪种情况。容器启动了，但第一步的工具包检查就已经失败：先解决那个问题；Ollama 自己的配置解决不了缺工具包的问题。`docker compose down` 之后模型消失了：没用命名卷，或者用 `-v` 把它删掉了——上面那个 `ollama_data` 卷就是重建后能保留下来的东西。另外在 Windows 上，这需要在 Docker Desktop 设置里启用带 GPU 支持的 WSL2 后端；不启用的话，工具包检查会像宿主机完全没装工具包一样失败。',
      },
    ],
    faqs: [
      {
        q: 'Why does Ollama in Docker use my CPU instead of my GPU?',
        qZh: 'Docker 里的 Ollama 为什么用 CPU 而不是 GPU？',
        a: 'Almost always the NVIDIA Container Toolkit is missing, or the compose file is missing its `deploy.resources.reservations.devices` block. Verify the toolkit independently first with `docker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi` — if that fails, the problem is the toolkit, not Ollama or your compose file.',
        aZh: '几乎总是因为没装 NVIDIA Container Toolkit，或者 compose 文件里漏了 `deploy.resources.reservations.devices` 那一段。先单独用 `docker run --rm --gpus=all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi` 验证工具包——如果这一步就失败，问题出在工具包上，不是 Ollama 或你的 compose 文件。',
      },
      {
        q: 'Does running Ollama in Docker slow it down?',
        qZh: '在 Docker 里跑 Ollama 会变慢吗？',
        a: 'No, once the GPU is actually passed through. This index measured 218 tok/s for Llama 3.1 8B at Q4_K_M on an RTX 4090 running Ollama directly; a correctly configured container does the same work on the same GPU and should land at essentially the same figure. Overhead only appears when the GPU passthrough is not working and the container has silently fallen back to the CPU.',
        aZh: '不会，前提是 GPU 真的被正确直通了。本索引实测 RTX 4090 上直接用 Ollama 跑 Llama 3.1 8B 的 Q4_K_M 是 218 tok/s；配置正确的容器在同一张 GPU 上干的是同一份工作，应该落在基本相同的数字上。只有在 GPU 直通没生效、容器静默回落到 CPU 时才会出现明显的开销。',
      },
      {
        q: 'How do I keep my downloaded models after recreating the container?',
        qZh: '重建容器之后怎么保留已下载的模型？',
        a: 'Use a named volume mapped to `/root/.ollama`, as in the compose file above. That keeps the model blobs outside the container’s own lifecycle, so `docker compose down` followed by `up` does not trigger a re-download. Removing the volume explicitly with `down -v` does delete them — that is the one command to avoid.',
        aZh: '像上面 compose 文件那样，用一个命名卷映射到 `/root/.ollama`。这样模型文件就存放在容器生命周期之外，`docker compose down` 再 `up` 不会触发重新下载。用 `down -v` 显式删除卷才会真的删掉它们——这是唯一要避免的命令。',
      },
    ],
  },

  'llama-vps-llamacpp': {
    updatedAt: '2026-09-12',
    verifiedAt: undefined,
    verifiedStack: {
      en: 'Ubuntu 22.04/24.04 VPS · llama.cpp CPU build (GGML_BLAS optional) · GGUF Q4_K_M · llama-server',
      zh: 'Ubuntu 22.04/24.04 VPS · llama.cpp CPU 构建（GGML_BLAS 可选）· GGUF Q4_K_M · llama-server',
    },
    content: [
      {
        heading: 'What you need first',
        headingZh: '开始之前',
        body: 'A Linux VPS with at least 16 GB RAM — 32 GB gives more comfortable headroom for the OS and a longer context window. CPU-only inference on a small model is genuinely usable for personal use, which is the honest case for this whole guide: it is not a production API, it is a private assistant that costs less than a coffee subscription.',
        bodyZh: '一台至少 16 GB 内存的 Linux VPS——32 GB 能给系统和更长的上下文窗口留出更舒适的余量。小模型的纯 CPU 推理对个人使用来说是真的可用，这也是这整篇指南存在的理由：它不是一个生产 API，而是一个花费不到一杯咖啡订阅费的私人助手。',
        code: { lang: 'bash', content: '# Tested on Ubuntu 22.04/24.04 LTS. Typical cost: ~€15-25/month\n# for an 8-core, 16-32GB instance (Hetzner CX32-class or similar).\nfree -h\nnproc --all' },
      },
      {
        heading: 'Build llama.cpp',
        headingZh: '编译 llama.cpp',
        body: 'A plain CPU build works out of the box. OpenBLAS is worth adding only if you plan to process long documents in large batches — llama.cpp’s own documentation states BLAS acceleration helps prompt processing above batch size 32 and does not change generation speed, so skip it for a pure chat API.',
        bodyZh: '普通的 CPU 构建开箱即用。只有在你打算批量处理长文档时才值得加上 OpenBLAS——llama.cpp 自己的文档写明 BLAS 加速只在批大小超过 32 的提示词处理阶段有用，不会改变生成速度，所以纯聊天场景的 API 可以跳过它。',
        code: { lang: 'bash', content: 'sudo apt update && sudo apt install -y build-essential cmake git\ngit clone https://github.com/ggml-org/llama.cpp\ncd llama.cpp\ncmake -B build\ncmake --build build --config Release -j$(nproc)' },
      },
      {
        heading: 'Download the model and start the server',
        headingZh: '下载模型并启动服务',
        body: 'Q4_K_M is the right default — 4.6 GB of weights, comfortable in 16 GB of RAM with room for the OS and a real context window. Set the thread count to your physical core count, bind to loopback, and put an API key in front of it if this box has any public exposure at all.',
        bodyZh: 'Q4_K_M 是合适的默认选择——权重 4.6 GB，在 16 GB 内存里很从容，还能给系统和真正的上下文窗口留出空间。线程数设成物理核心数，绑定到回环地址，如果这台机器有任何公网暴露，就在前面加一个 API key。',
        code: { lang: 'bash', content: 'pip install huggingface_hub\nhuggingface-cli download bartowski/Meta-Llama-3.1-8B-Instruct-GGUF \\\n  --include "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf" --local-dir ./models\n\n./build/bin/llama-server \\\n  -m ./models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\\n  --host 127.0.0.1 --port 8080 \\\n  -c 8192 -t $(nproc) \\\n  --api-key "your-secret-key"' },
      },
      {
        heading: 'Check it actually worked',
        headingZh: '确认它真的没问题',
        body: 'A successful start is not the same as a usably fast one on a VPS — confirm both. The binary is `llama-server`; older tutorials referencing a bare `server` binary predate the CLI rename.',
        bodyZh: '在 VPS 上，「启动成功」和「速度可用」不是一回事——两个都要确认。可执行文件是 `llama-server`；旧教程里那个裸 `server` 的名字是 CLI 改名之前的写法。',
        code: { lang: 'bash', content: 'curl -H "Authorization: Bearer your-secret-key" \\\n  http://127.0.0.1:8080/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{"messages":[{"role":"user","content":"hi"}]}\'\n\n# Watch resident memory while it runs:\nps aux | grep llama-server' },
      },
      {
        heading: 'What the numbers should look like',
        headingZh: '数字大概该是什么样',
        body: 'Llama 3.1 8B at Q4_K_M is 4.6 GB of weights. Generation speed is bandwidth divided by that figure, and system RAM bandwidth on a shared VPS varies far more than GPU VRAM bandwidth does — it depends on what the host actually allocates you, not just the advertised vCPU count — so this guide will not quote a specific tok/s figure nobody here measured on your specific provider. Memory is the number worth watching: 4.6 GB of weights plus the OS should sit comfortably inside 16 GB, leaving room for a context window past the 8K used above.',
        bodyZh: 'Llama 3.1 8B 的 Q4_K_M 权重是 4.6 GB。生成速度是「带宽除以这个数字」，而共享型 VPS 的系统内存带宽差异，比显卡显存带宽的差异大得多——它取决于宿主机实际分配给你的资源，而不只是宣传的 vCPU 数量——所以本文不会引用一个没有人在你具体的服务商上实测过的 tok/s 数字。真正值得盯的是内存：4.6 GB 权重加上系统开销应该能舒适地放进 16 GB，还能给比上面用的 8K 更长的上下文留出空间。',
      },
      {
        heading: 'When it does not work',
        headingZh: '出问题时',
        body: 'Out of memory on a 16 GB box: check what else is running — a database or a web server sharing the same VPS competes for the same RAM the model needs. Generation is slower than you expected: system RAM bandwidth on budget VPS tiers is often the real bottleneck, and no amount of thread tuning fixes a shared, oversubscribed memory bus — a bigger instance tier is the actual fix, not a flag. The server binds but nothing outside the box can reach it: that is correct if you bound to `127.0.0.1`, which you should have — put a reverse proxy with TLS in front rather than binding to `0.0.0.0` directly. And if you skipped `--api-key` on a box with any public exposure, that is the first thing to fix, not the last.',
        bodyZh: '在 16 GB 的机器上爆内存：检查还有什么在跑——和模型共用同一台 VPS 的数据库或 Web 服务器会争抢模型需要的那份内存。生成速度比预期慢：低价 VPS 档位的系统内存带宽常常才是真正的瓶颈，再怎么调线程数也解决不了一条共享、超售的内存总线——真正的解法是换更高的实例档位，不是加参数。服务绑定成功了但外部访问不到：如果你绑定的是 `127.0.0.1`，那是对的——在前面加一层带 TLS 的反向代理，而不是直接绑定到 `0.0.0.0`。如果这台机器有任何公网暴露而你还没加 `--api-key`，那应该是第一件要修的事，不是最后一件。',
      },
    ],
    faqs: [
      {
        q: 'Is a €20/month VPS actually usable for running an 8B model?',
        qZh: '一台 €20/月 的 VPS 真的能跑 8B 模型吗？',
        a: 'For personal use, yes. Llama 3.1 8B at Q4_K_M needs 4.6 GB of weights, comfortable on a 16GB instance. Generation speed depends on the provider’s system RAM bandwidth, which this index has not measured across providers — treat it as usable for a private assistant, not as a production API with guaranteed throughput.',
        aZh: '个人使用的话可以。Llama 3.1 8B 的 Q4_K_M 权重需要 4.6 GB，16 GB 的实例很从容。生成速度取决于服务商的系统内存带宽，本索引没有跨服务商测过这个数字——把它当作一个可用的私人助手，而不是有吞吐保证的生产级 API。',
      },
      {
        q: 'Should I build llama.cpp with OpenBLAS on a VPS?',
        qZh: '在 VPS 上编译 llama.cpp 要不要加 OpenBLAS？',
        a: 'Only if you process long documents in large batches. llama.cpp’s documentation states BLAS acceleration helps prompt processing above batch size 32 and has no effect on generation speed — for a chat API, a plain CPU build is enough.',
        aZh: '只有在你要批量处理长文档时才需要。llama.cpp 的文档写明 BLAS 加速只在批大小超过 32 的提示词处理阶段有用，对生成速度没有影响——对聊天类 API 来说，普通的 CPU 构建就够了。',
      },
      {
        q: 'How do I secure a llama.cpp server on a public VPS?',
        qZh: '在公网 VPS 上怎么保护 llama.cpp 服务？',
        a: 'Bind the server to `127.0.0.1`, not `0.0.0.0`, always pass `--api-key`, and put a reverse proxy with TLS in front for anything reachable from the internet — llama.cpp’s built-in server has no rate limiting or user management of its own.',
        aZh: '把服务绑定到 `127.0.0.1`，不要绑 `0.0.0.0`，务必带上 `--api-key`，并且给任何能从公网访问到的服务加一层带 TLS 的反向代理——llama.cpp 内置的服务本身没有限流，也没有用户管理。',
      },
    ],
  },
};
