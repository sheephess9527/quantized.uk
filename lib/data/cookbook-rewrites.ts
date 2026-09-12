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
};
