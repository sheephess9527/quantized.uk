export interface ChangelogEntry {
  date: string;
  en: string;
  zh: string;
}

export const dataLastUpdated = '2026-10-03';

export const dataSources = {
  models: {
    en: 'Hugging Face model cards, community quant releases (bartowski, turboderp, unsloth, city96), WikiText-2 PPL benchmarks',
    zh: 'Hugging Face 模型卡、社区量化发布（bartowski、turboderp、unsloth、city96）、WikiText-2 PPL 基准',
  },
  benchmarks: {
    en: 'Local inference runs on RTX 4090 / 3090 / M3 Max / M2 Ultra; llama.cpp b4000+, ExLlamaV2 0.2.x, vLLM 0.6.x, Ollama 0.3.x',
    zh: 'RTX 4090 / 3090 / M3 Max / M2 Ultra 本地实测；llama.cpp b4000+、ExLlamaV2 0.2.x、vLLM 0.6.x、Ollama 0.3.x',
  },
  formatHeat: {
    en: 'Editorial judgement from which formats Hugging Face uploads and community threads favour. It is not measured, so it is shown as an order, not a percentage — the per-format model counts above are the measured part.',
    zh: '依据 Hugging Face 上传与社区讨论更偏向哪种格式做出的编辑判断。它不是测量值，因此只给出排序、不给百分比 —— 上面每种格式的模型数才是实测的部分。',
  },
} as const;

export const benchmarkMethodology = {
  model: 'Meta Llama 3.1 8B Instruct',
  dataset: 'WikiText-2',
  context: 4096,
  batch: 1,
  /** Structured out of the free-text `notes` below rather than duplicated by hand. */
  promptLen: 128,
  genLen: 128,
  /** WikiText-2 PPL on the reference model's FP16 weights — the number `pplSubtitle` already cites. */
  baselinePpl: 6.14,
  drivers: 'NVIDIA 550.x / CUDA 12.4',
  frameworks: {
    llamacpp: 'b4217 (CUDA backend)',
    exllama: 'ExLlamaV2 0.2.1',
    vllm: 'v0.6.3',
    ollama: '0.3.14',
  },
  notes: {
    en: 'Speed tests use prompt_len=128, gen_len=128, single sequence. PPL measured on WikiText-2 test split. Your results may vary ±10% depending on driver, batch size, and context length.',
    zh: '速度测试：prompt_len=128，gen_len=128，单序列。PPL 在 WikiText-2 测试集上测量。实际结果因驱动、batch size 和上下文长度可能偏差 ±10%。',
  },
} as const;

/**
 * What the runtimes are at today, separate from what the benchmarks were run on.
 *
 * The methodology block above records the versions those figures were actually
 * measured with — that is a fact about the measurement and must not be edited
 * to look current. But leaving only that on the page made the site look
 * abandoned to exactly the reader it is written for: `llama.cpp b4000+,
 * vLLM 0.6.x, Ollama 0.3.x` is two major generations behind, and a geek
 * checking whether a reference site is still alive checks precisely this.
 *
 * So both are shown, and the gap between them is stated rather than hidden.
 * `checkedAt` is when the right-hand column was last verified against the
 * projects' own release pages — update it only when actually re-checked.
 */
export const runtimeVersions = {
  checkedAt: '2026-09-30',
  current: {
    llamacpp: 'b11277',
    vllm: 'v0.30.0',
    ollama: 'v0.35.0',
    // ExLlamaV2 has stalled at v0.3.2 (2025-07-13) — see the `note` below for
    // where the project's actual activity moved to. Keeping this key as
    // `exllama` (matching `benchmarkMethodology.frameworks.exllama` above) so
    // the two line up when read side by side.
    exllama: 'v0.3.2 (stalled)',
  },
  note: {
    en: 'The figures on this page were measured on the stack in the left column. Those releases are now well behind current — speed numbers in particular move with the runtime, so treat them as a ranking between formats rather than as what you will see today. One thing this comparison cannot show: ExLlamaV2 has had no release since 2025-07, and the maintainer\'s active project has moved to a separate repository, ExLlamaV3 (v1.5.3 as of the date above, and shipping fast). Its own README describes a genuinely new quantization format, EXL3, not a version bump of EXL2 — this index does not track it yet, since no model here ships it, but a format this site tracks going quiet is itself worth knowing.',
    zh: '本页的数字是在左列那套软件栈上测得的。这些版本如今已明显落后于当前版本 —— 速度尤其会随运行时变化，因此请把它们当作格式之间的排序参考，而不是你今天会跑出的数值。这个对比说明不了的一件事：ExLlamaV2 自 2025-07 起再没有发布过新版本，维护者的主要精力已经转到另一个仓库 ExLlamaV3（截至上面的日期已到 v1.5.3，更新很勤）。它自己的 README 说得很清楚，这是一个全新的量化格式 EXL3，而不是 EXL2 的版本升级——本索引目前还没有任何模型提供这个格式，所以暂不收录，但本站在跟踪的一个格式陷入停滞，这件事本身值得让读者知道。',
  },
} as const;

export const changelog: ChangelogEntry[] = [
  {
    date: '2026-10-03',
    en: 'GPT-OSS sizes corrected. We were sizing GPT-OSS 20B and 120B as if every weight were stored at MXFP4\'s 4.25 bits, but only the expert layers are — the real files, per llama.cpp\'s own guide, are 11.3 GiB and 59 GiB. GPT-OSS 20B now needs about 12.8GB at 4K context rather than 11.7GB, so it no longer counts as fitting a 12GB card or a 16GB Mac, and it is tight on an 18GB M3 Pro. The GPT-OSS guide also quotes llama.cpp\'s own, higher totals beside ours. Four guides that printed the old figures were corrected, and the site now checks every size printed in a guide against the calculator whenever it is rebuilt.',
    zh: 'GPT-OSS 的体积已更正。我们此前按"所有权重都是 MXFP4 的 4.25 bit"来估算 GPT-OSS 20B 和 120B，但实际上只有专家层是 —— 按 llama.cpp 官方指南，真实文件是 11.3 GiB 和 59 GiB。GPT-OSS 20B 在 4K 上下文下现在约需 12.8GB，而不是 11.7GB，因此不再算作能装进 12GB 显卡或 16GB 的 Mac，在 18GB 的 M3 Pro 上也属于偏紧。GPT-OSS 指南还在本站数字旁边列出了 llama.cpp 自己给出的、更高的总量。四篇印着旧数字的指南已更正；此后每次构建，网站都会把指南里印出的每个体积和计算器重新核对一遍。',
  },
  {
    date: '2026-10-03',
    en: 'The 8GB GPU starter guide was re-run against the calculator. Three figures had drifted after earlier model-data corrections, and one verdict changed: Llama 3.1 8B at 16K context is 7.3GB, which is 91% of an 8GB card — tight, not a comfortable fit. The guide now lists two models that take images and still fit (Gemma 4 E4B and Qwen3-VL 8B), notes that the AWQ route needs Linux or WSL2 because vLLM does not run on Windows directly, reflects llama.cpp choosing the GPU layer count itself by default, and answers three common questions.',
    zh: '8GB 显卡入门指南按计算器重新核对了一遍。早先修正模型数据后，有三个数字发生了变化，其中一个结论也变了：Llama 3.1 8B 在 16K 上下文下是 7.3GB，占 8GB 显卡的 91% —— 偏紧，而不是从容运行。指南现在列出了两个能看图、仍然装得下的模型（Gemma 4 E4B 和 Qwen3-VL 8B），注明 AWQ 路线需要 Linux 或 WSL2（vLLM 不能直接在 Windows 上运行），反映了 llama.cpp 默认会自行决定放多少层到 GPU，并新增三个常见问答。',
  },
  {
    date: '2026-10-03',
    en: 'The Mac M3 Pro guide corrected one wrong claim: it said a model too big for the Mac\'s GPU memory would fail to load or swap. Ollama actually splits it, running the layers that do not fit on the CPU, and its status shows that as a CPU/GPU percentage, which is the real sign you are over the limit. The guide now also gives the speed ceiling the M3 Pro\'s memory bandwidth sets (about 8 tokens per second for a 32B at 4-bit, clearly labelled as an upper bound rather than a measurement) and answers three questions.',
    zh: 'Mac M3 Pro 指南改正了一处错误说法：它说超出 Mac GPU 内存的模型会加载失败或触发换页。实际上 Ollama 会把它拆开，放不下的层跑在 CPU 上，状态里会显示 CPU/GPU 百分比 —— 这才是超限的真正信号。指南还新增了 M3 Pro 内存带宽决定的速度上限（4-bit 的 32B 约每秒 8 个 token，明确标注为上限而非实测），并新增三个问答。',
  },
  {
    date: '2026-10-02',
    en: 'EXL2 advice brought up to date. ExLlamaV2, the runtime behind the EXL2 format, is now archived, and TabbyAPI and text-generation-webui load the newer EXL3 format instead — so EXL2 still runs locally, but nothing maintained serves it as an API. The command generator\'s ExLlamaV2 option had been printing a server command and a Docker image that do not exist; it now gives the library\'s real local chat command, with the right chat template for the model. The TabbyAPI guide is rewritten for TabbyAPI as it is today, the format wizard no longer recommends EXL2 for an API, and the ExLlamaV2 guide uses the correct template for Llama 3. Every download command on the site now uses the hf command; the older huggingface-cli has been removed from current versions of the Hugging Face tools.',
    zh: 'EXL2 相关建议已更新到当前状态。EXL2 格式背后的运行时 ExLlamaV2 已经归档，TabbyAPI 和 text-generation-webui 改为加载更新的 EXL3 格式 —— 所以 EXL2 仍能在本机运行，但已经没有仍在维护的工具把它作为 API 提供。命令生成器的 ExLlamaV2 选项此前给出的服务端命令和 Docker 镜像根本不存在；现在给出的是这个库真实的本机聊天命令，并按模型选对聊天模板。TabbyAPI 指南按它现在的样子重写，格式向导不再为 API 场景推荐 EXL2，ExLlamaV2 指南也改用了 Llama 3 的正确模板。站内所有下载命令改用 hf 命令；旧的 huggingface-cli 已经从当前版本的 Hugging Face 工具中移除。',
  },
  {
    date: '2026-10-02',
    en: 'The two-GPU 70B guide now reflects how current llama.cpp behaves: its automatic memory fitting is on by default and keeps 1 GB free on each card, which can quietly push some of a 70B onto the CPU, so the guide passes the GPU-layer and context settings explicitly. It also covers mixing two different cards and the new experimental split mode, and answers three questions. Separately, we had been telling readers that llama.cpp\'s old build-flag names are silently ignored; they are not — one still works with a warning and the other stops the build — so that advice is corrected on every page. Docker and Compose commands from the command generator now publish their port on this machine only (127.0.0.1) instead of on every network interface, and the vLLM and Ollama commands no longer listen on the whole network by default.',
    zh: '双卡 70B 指南现在反映了 llama.cpp 当前的行为：它的自动显存适配默认开启，会在每张卡上留出 1 GB，可能悄悄把 70B 的一部分挪到 CPU 上，所以指南改为显式指定 GPU 层数和上下文长度。指南还补充了两张不同显卡混用的情况、新的实验性切分模式，并新增三个问答。另外，我们此前一直说 llama.cpp 的旧编译开关名会被静默忽略，其实不是 —— 一个仍然有效、只是附带警告，另一个会让构建直接报错 —— 所有页面上的这条说法都已更正。命令生成器给出的 Docker 和 Compose 命令现在只把端口发布在本机（127.0.0.1）上，不再暴露到所有网卡；vLLM 和 Ollama 命令默认也不再监听整个网络。',
  },
  {
    date: '2026-10-02',
    en: 'The WSL2 + Ollama guide was re-checked against Microsoft\'s, NVIDIA\'s and Ollama\'s current documentation. Two claims were wrong: in WSL\'s default networking mode your LAN cannot reach the server at all (the real exposure risk is mirrored mode), and the sample status output was missing a column. It now also covers the two failures readers most often hit — the "cuda" package quietly installing a Linux driver that breaks GPU passthrough, and systemd being off so Ollama never starts — and ends with three answered questions.',
    zh: 'WSL2 + Ollama 指南按微软、NVIDIA 和 Ollama 当前的文档重新核对了一遍。有两处说错了：在 WSL 默认的网络模式下，局域网根本访问不到这个服务（真正有暴露风险的是镜像模式）；示例里的状态输出少了一列。现在还补上了读者最常碰到的两个故障 —— "cuda" 包悄悄装上 Linux 驱动、把 GPU 透传弄坏，以及 systemd 没开导致 Ollama 根本没启动 —— 文末新增三个问答。',
  },
  {
    date: '2026-10-02',
    en: 'Two new models: Gemma 4 E2B and E4B, Google\'s on-device sizes with image and audio input and a 128K window. Most of their layers reuse an earlier layer\'s cache, so long context is cheap: at Q4, E2B needs about 3.0 GB at 4K and 3.8 GB at the full window, E4B about 4.9 GB and 7.0 GB — both run comfortably on an 8 GB card or an 8 GB Mac. The format wizard\'s AMD advice now names the cards vLLM supports.',
    zh: '新增两个模型：Gemma 4 E2B 和 E4B，Google 面向端侧的两个尺寸，支持图像和音频输入，128K 上下文。它们大部分层复用前面层的缓存，所以长上下文很便宜：Q4 下 E2B 在 4K 时约 3.0 GB、用满窗口约 3.8 GB，E4B 约 4.9 GB 和 7.0 GB——8 GB 显卡或 8 GB 的 Mac 都能从容运行。格式向导给 AMD 的建议现在会写明 vLLM 支持哪些显卡。',
  },
  {
    date: '2026-10-02',
    en: 'AMD recommendations now match what each Radeon card can actually run. AWQ and GPTQ builds on AMD are served by vLLM, and vLLM supports the RX 7700 XT and up, the RX 9000 series and Instinct MI200 or newer — so the RX 6000 series, the RX 7600 XT and the MI100 no longer get AWQ picks they could not load, and their "fits comfortably" counts drop by up to four models. GPTQ, which we had wrongly called NVIDIA-only, is now offered on the supported AMD cards. The "can this card run …" answers on GPU pages also stopped saying a format would not run when the model ships a GGUF build that does — they now size that build instead.',
    zh: 'AMD 显卡的推荐现在与每张 Radeon 卡的实际能力一致。AMD 上的 AWQ 和 GPTQ 构建靠 vLLM 运行，而 vLLM 支持的是 RX 7700 XT 及以上、RX 9000 系列和 Instinct MI200 及更新型号——所以 RX 6000 系列、RX 7600 XT 和 MI100 不再收到它们加载不了的 AWQ 推荐，「可从容运行」的数量最多减少 4 个。GPTQ 此前被我们误称为只能在 NVIDIA 上跑，现在会在受支持的 AMD 卡上提供。GPU 页面里「这张卡能跑……吗」的回答，也不再在模型其实有可用 GGUF 构建时说「格式跑不了」——现在会按那个 GGUF 构建计算大小。',
  },
  {
    date: '2026-10-02',
    en: 'The command generator\'s vLLM output now covers AMD cards and matches vLLM\'s current documentation. AMD owners get vLLM\'s official ROCm Docker image with the flags its documentation lists, and the ROCm install command; Radeon cards outside vLLM\'s supported list (such as the RX 6000 series and RX 7600 XT) get a note pointing to llama.cpp or Ollama instead. The non-Docker command now installs with uv and starts the server with "vllm serve", as vLLM documents it — it had still shown an older install and entrypoint that contradicted this site\'s own vLLM guide.',
    zh: '命令生成器的 vLLM 输出现在覆盖 AMD 显卡，并与 vLLM 当前文档一致。AMD 用户会拿到 vLLM 官方的 ROCm Docker 镜像、文档列出的运行参数，以及 ROCm 版的安装命令；不在 vLLM 支持名单上的 Radeon 显卡（如 RX 6000 系列和 RX 7600 XT）会看到提示，建议改用 llama.cpp 或 Ollama。非 Docker 命令现在用 uv 安装、用 "vllm serve" 启动服务，与 vLLM 文档一致——此前它仍显示旧的安装方式和入口，和本站自己的 vLLM 指南相矛盾。',
  },
  {
    date: '2026-10-02',
    en: 'The command generator\'s Docker and Docker Compose output now follows the GPU you picked. Before, everyone got NVIDIA commands: an AMD card was handed a CUDA image it cannot use, and the Ollama Compose file had its GPU section commented out, so even NVIDIA owners ran on the CPU without being told. Now NVIDIA gets the CUDA image with the GPU passed through, AMD gets the ROCm image with the devices ROCm needs, and on a Mac the generator says plainly that Docker cannot reach the Apple GPU and points you to running natively. The notes under each command are now in Chinese on the Chinese site.',
    zh: '命令生成器的 Docker 和 Docker Compose 输出现在会跟随你选择的显卡。以前所有人拿到的都是 NVIDIA 的命令：AMD 显卡拿到的是它用不了的 CUDA 镜像；Ollama 的 Compose 文件里 GPU 配置还是被注释掉的，所以连 NVIDIA 用户也在不知情的情况下跑在 CPU 上。现在 NVIDIA 用户拿到 CUDA 镜像并透传 GPU，AMD 用户拿到 ROCm 镜像和 ROCm 所需的设备，Mac 用户会看到明确提示：Docker 用不了苹果 GPU，请直接在本机运行。每条命令下方的说明在中文站也已改为中文。',
  },
  {
    date: '2026-10-02',
    en: 'Re-checked the AMD ROCm guide against llama.cpp\'s current build documentation. The build command now matches the documented form, the guide says ROCm 6.1 or newer is required (older versions are refused at build time), and the note on Windows now says what is actually true: a Windows HIP build is documented, but the workaround for unlisted cards does not work there. The log line that confirms a model is on the GPU now reads "load_tensors: offloaded …" — the older name the AMD and dual-GPU guides told you to look for no longer appears. Also fixed in the command generator: its Docker commands used the CPU-only llama.cpp image while asking for the GPU, so they ran entirely on the CPU without an error. They now use the CUDA image.',
    zh: '对照 llama.cpp 当前的构建文档重新核对了 AMD ROCm 指南。构建命令改为文档中的写法；指南注明需要 ROCm 6.1 或更新版本（更旧的版本会在构建时被拒绝）；关于 Windows 的说法也改为实际情况：文档里有 Windows 上的 HIP 构建方法，但针对未列入支持名单显卡的变通办法在 Windows 上无效。确认模型跑在 GPU 上的那行日志现在是 "load_tensors: offloaded …"——AMD 和双卡指南此前让你找的旧名称已经不会出现了。另外修正了命令生成器：它的 Docker 命令用的是纯 CPU 版本的 llama.cpp 镜像，却又要求使用 GPU，结果全程在 CPU 上运行且不报错。现在改用 CUDA 镜像。',
  },
  {
    date: '2026-10-02',
    en: 'Six popular Macs added, each with its own page and a place in the calculator: the M4 with 16 GB and 24 GB (the base Mac mini and its common upgrade), the M2 with 16 GB, the M1 with 8 GB and 16 GB, and the M1 Max with 64 GB. As on every Mac here, only about three quarters of the memory is counted as usable by a model. Apple does not list the original M1\'s memory bandwidth directly, so its page gives a figure derived from Apple\'s own comparisons and says so. The guide for 8 GB M1 Macs now uses the M1\'s own entry instead of borrowing the M3\'s.',
    zh: '新增六款热门 Mac，各有自己的页面，计算器里也能选择：M4 的 16 GB 和 24 GB 版本（Mac mini 基础款和常见的升级款）、M2 16 GB、M1 的 8 GB 和 16 GB 版本，以及 M1 Max 64 GB。和本站所有 Mac 一样，只按约四分之三的内存计为模型可用。苹果没有直接列出初代 M1 的内存带宽，所以它的页面给出的是由苹果官方对比推算的数字，并注明了这一点。8 GB M1 Mac 的指南现在直接使用 M1 自己的条目，不再借用 M3 的。',
  },
  {
    date: '2026-10-02',
    en: 'Five popular budget cards now have their own pages and appear in the calculator: GeForce RTX 3060 12G, GeForce RTX 5050, Radeon RX 7600 XT, and Radeon RX 9060 XT in both its 16 GB and 8 GB versions. Capacities and memory speeds come from NVIDIA\'s and AMD\'s own specification pages. NVIDIA\'s page for the RTX 5050 does not give its memory speed, so that page shows the card\'s capacity but no bandwidth figure rather than a guessed one.',
    zh: '五张热门入门显卡现在有了自己的页面，计算器里也能选择：GeForce RTX 3060 12G、GeForce RTX 5050、Radeon RX 7600 XT，以及 Radeon RX 9060 XT 的 16 GB 和 8 GB 两个版本。显存容量和速率取自 NVIDIA、AMD 官方规格页。NVIDIA 官方页面没有给出 RTX 5050 的显存速率，所以它的页面只显示容量、不显示带宽，而不是填一个猜测的数字。',
  },
  {
    date: '2026-10-01',
    en: 'Added Google\'s Gemma 4 26B-A4B and Gemma 4 31B, the two Gemma 4 sizes that run on a single 16–32 GB card or a Mac. Both have a 256K window, but only one layer in six keeps a cache that grows with context, and those layers use fewer, wider heads — so the calculator now sizes the two kinds of layer separately. The result: the 26B-A4B needs about 17 GB at 32K context at Q4 and fits a 24 GB card comfortably; the 31B is about 21 GB at short context, so a 24 GB card holds it only at short context and a 32 GB card is the comfortable choice. The smaller E2B and E4B models share their cache between layers in a way the calculator cannot yet describe, so they are not listed yet.',
    zh: '新增 Google 的 Gemma 4 26B-A4B 和 Gemma 4 31B，这是 Gemma 4 中能在单张 16–32 GB 显卡或一台 Mac 上运行的两个尺寸。两者都支持 256K 上下文，但每六层中只有一层的缓存随上下文增长，而且这些层用的是更少、更宽的注意力头——所以计算器现在对两种层分开计算。结果是：26B-A4B 在 Q4、32K 上下文下约需 17 GB，24 GB 显卡可以从容运行；31B 短上下文下约 21 GB，24 GB 显卡只能跑短上下文，32 GB 显卡才是从容的选择。更小的 E2B 和 E4B 在层与层之间共享缓存，计算器暂时还无法准确描述，所以暂未收录。',
  },
  {
    date: '2026-09-30',
    en: 'Speeds now say where they came from wherever they appear. This site has run benchmarks on 10 models; the speeds listed for the rest were never run here, but the model cards, homepage picks, calculator list and GPU pages showed them exactly like measured ones. Each unmeasured speed now carries an "Estimated" tag. In the compare tool, a model with no speed figure used to count as zero, so the other model won that row by default, and every speed was labelled "published"; the row now says "measured here" or "unverified", and names a faster model only when both figures were measured. Model cards also showed context length in thousands (131K, 1049K) while the rest of the site uses 128K and 1M; they now match.',
    zh: '速度数字现在在所有出现的地方都注明来源。本站只实测过 10 个模型，其余模型的速度从未在本站跑过，但模型卡片、首页推荐、计算器列表和 GPU 页面把它们和实测数字显示得一模一样。现在每个未实测的速度都带"估算"标签。对比工具中，没有速度数据的模型此前按 0 计算，另一方就在这一行默认"胜出"，而且所有速度都被标为"已发布"；现在这一行标注"本站实测"或"未核实"，只有双方都是实测数字时才判定谁更快。模型卡片的上下文长度此前按千位显示（131K、1049K），与全站其他地方的 128K、1M 不一致，现已统一。',
  },
  {
    date: '2026-09-30',
    en: 'The site said it covered 63 GPUs; four of those entries are CPU-only RAM sizes (16, 32, 64 and 128 GB) kept so the calculator can answer "no GPU". Every place that says "GPUs" now counts the 59 cards and Macs, and the CPU sizes are named separately. The Command R 35B page now says its sizes assume 8 KV heads and that the original March 2024 release keeps about eight times as much cache (about 40 GB at 32K), since which release the entry describes is not recorded.',
    zh: '本站此前写"覆盖 63 张显卡"，其中 4 项其实是纯 CPU 的内存规格（16、32、64、128 GB），保留它们是为了让计算器能回答"没有显卡"的情况。现在凡是写"显卡"的地方都只统计 59 张显卡和 Mac，CPU 规格单独说明。Command R 35B 页面现在注明：体积按 8 个 KV 头计算，而 2024 年 3 月的原版缓存约为 8 倍（32K 下约 40 GB）——该条目对应的是哪个版本没有记录。',
  },
  {
    date: '2026-09-30',
    en: 'Llama 4 Scout and Maverick attend within 8,192-token chunks on three of every four layers, and llama.cpp stores only a chunk\'s worth of cache for those layers. The calculator had been sizing all 48 layers at full context. At 128K context Scout now needs about 77 GB at Q4 instead of about 95 GB; at its full 10-million-token window the cache estimate falls from about 1.9 TB to about 480 GB. Every other model in the index was checked against llama.cpp\'s own list of sliding-window architectures; none is affected.',
    zh: 'Llama 4 Scout 和 Maverick 每四层中有三层只在 8192 token 的分块内做注意力，llama.cpp 对这些层只保存一个分块大小的缓存。计算器此前把 48 层全部按完整上下文计算。现在 Scout 在 128K 上下文、Q4 下约需 77 GB，而不是约 95 GB；用满 1000 万 token 窗口时，缓存估算从约 1.9 TB 降到约 480 GB。索引中其他模型都已对照 llama.cpp 自己的滑动窗口架构清单核查过，没有受影响的。',
  },
  {
    date: '2026-09-30',
    en: 'Checked every model\'s layer and attention-head figures against published configs and fixed the ones that were wrong. Eight models — Gemma 2 (2B, 9B, 27B), Gemma 3 (4B, 12B, 27B) and GPT-OSS (20B, 120B) — keep a full cache on only some layers; the rest use a short sliding window, which llama.cpp stores at just the window\'s size. The calculator had been sizing every layer at full context, so long-context figures were far too high: Gemma 3 27B at 32K drops from about 34 GB to about 21 GB and now fits a 24 GB card, and at its full 128K from about 86 GB to about 29 GB. Qwen2.5 3B had the wrong layer and head counts (cache overstated about 1.6×), Phi-4-mini\'s cache was understated by a quarter, Gemma 3 12B had the wrong head size, and WizardLM-2 7B had been given another model\'s size and shape — it is a Mistral 7B fine-tune. The GPT-OSS, RTX 4060 Ti and Mac M3 Pro guides were updated to match.',
    zh: '把每个模型的层数和注意力头参数与公开配置逐一核对，修正了错误的条目。Gemma 2（2B、9B、27B）、Gemma 3（4B、12B、27B）和 GPT-OSS（20B、120B）这八个模型只有部分层保留完整缓存，其余层使用较短的滑动窗口，llama.cpp 只按窗口大小存储这部分缓存。计算器此前把所有层都按完整上下文计算，所以长上下文下的数字严重偏高：Gemma 3 27B 在 32K 下从约 34 GB 降到约 21 GB，现在能装进 24 GB 显卡；用满 128K 时从约 86 GB 降到约 29 GB。Qwen2.5 3B 的层数和头数有误（缓存高估约 1.6 倍），Phi-4-mini 的缓存低估了四分之一，Gemma 3 12B 的 head 维度有误，WizardLM-2 7B 此前被填成了另一个模型的规模和结构——它其实是基于 Mistral 7B 微调的。GPT-OSS、RTX 4060 Ti 和 Mac M3 Pro 三篇指南已同步更新。',
  },
  {
    date: '2026-09-30',
    en: 'Removed 47 "tok/s on RTX 4090" figures that could not be RTX 4090 numbers. 43 were on builds too large for the card\'s 24 GB (a 70B model at Q4 is 43 GB, yet was listed at 38 tok/s); 4 were on dense models and faster than the card\'s memory bandwidth allows. Those models now show no speed rather than an impossible one, and the build rejects either fault from now on. Model pages had also said "the fastest level measured here" for every model; only 10 models have been benchmarked on this site, and the other pages now say their speed is an estimate. Jamba 1.5 Mini had been sized as a 12B model; it is 52B total with 12B active, so at Q4 it needs about 31 GB, not 8.5 GB, and it no longer appears as fitting on 10–16 GB cards. Mistral Large 3 uses the same compressed attention as DeepSeek; its exact dimensions could not be verified, so its page now says its long-context cache figure is an upper bound.',
    zh: '删除了 47 个不可能是 RTX 4090 实际表现的"RTX 4090 tok/s"数字。其中 43 个属于超出该卡 24 GB 显存的版本（70B 模型 Q4 约 43 GB，却标着 38 tok/s）；另外 4 个是稠密模型，速度超过了该卡显存带宽所允许的上限。这些模型现在不显示速度，而不是显示一个不可能的数字；今后构建会直接拒绝这两类错误。模型页此前对所有模型都写"本站实测最快的档位"，实际上本站只实测过 10 个模型，其余页面现在注明速度为估算值。Jamba 1.5 Mini 此前按 12B 模型计算体积；它实际总参数 52B、激活 12B，Q4 约需 31 GB 而不是 8.5 GB，不再显示为能在 10–16 GB 显卡上运行。Mistral Large 3 与 DeepSeek 一样采用压缩注意力，但具体结构参数无法核实，页面现在注明长上下文下的缓存数字是上限。',
  },
  {
    date: '2026-09-30',
    en: 'Corrected the memory estimates for DeepSeek-V3, DeepSeek-R1, DeepSeek-V2-Lite and DeepSeek-Coder-V2-Lite. All four use MLA attention, which current llama.cpp stores as one compressed vector per token per layer, but this index had been sizing them as conventional attention — too high for current GGUF files, and far too low for old ones. The estimates now follow current files: DeepSeek-V2-Lite at its full 160K context drops from about 47 GB to about 15 GB, and both Lite models now fit comfortably on 10 GB and 16 GB-class hardware. Each page also says what an older conversion costs instead and how to tell the two apart, since the difference is large — about 150 GB of cache at 32K for DeepSeek-V3.',
    zh: '修正了 DeepSeek-V3、DeepSeek-R1、DeepSeek-V2-Lite 和 DeepSeek-Coder-V2-Lite 的显存估算。四者都采用 MLA 注意力，当前的 llama.cpp 每层每个 token 只存一个压缩向量，但本站此前按常规注意力计算——对当前的 GGUF 文件偏高，对旧文件又严重偏低。现在的估算按当前文件计算：DeepSeek-V2-Lite 用满 16 万上下文所需显存从约 47 GB 降到约 15 GB，两个 Lite 模型现在都能在 10 GB 和 16 GB 级别的硬件上从容运行。由于差别很大（DeepSeek-V3 在 32K 下旧版转换的缓存约 150 GB），每个页面也写明了旧版转换的代价以及如何区分两者。',
  },
  {
    date: '2026-09-30',
    en: 'Two models added, both around 3B active parameters so they run on one card or a Mac: GLM-4.7-Flash (Zhipu, 30B total, 128K context — comfortable on a 24 GB card at Q4) and Kimi Linear 48B-A3B (Moonshot, 1M context — comfortable on a 48 GB Mac at Q4, tight on a 32 GB card). Both use compressed attention caches, and the memory estimates count them the way llama.cpp stores them rather than as conventional keys and values. No GGUF file sizes could be checked for this batch, so their sizes use the calculator\'s generic rates and are marked estimated. Several larger releases from the same weeks (780B and 744B models) were left out as beyond single-machine hardware.',
    zh: '新增两个模型，激活参数都在 3B 左右，单卡或一台 Mac 就能跑：GLM-4.7-Flash（智谱，总参数 30B，128K 上下文——Q4 下 24 GB 显卡可以从容运行）和 Kimi Linear 48B-A3B（月之暗面，100 万上下文——Q4 下 48 GB 的 Mac 可以从容运行，32 GB 显卡只能勉强装下）。两者都使用压缩的注意力缓存，显存估算按 llama.cpp 实际的存储方式计算，而不是当作常规的 K 和 V。这一批未能核对到 GGUF 文件大小，所以体积使用计算器的通用比特率，并标为估算。同期的几个更大的发布（780B、744B 模型）超出单机硬件的范围，没有收录。',
  },
  {
    date: '2026-09-30',
    en: 'Re-checked the current releases of the runtimes named on the benchmarks page against each project\'s own release list: llama.cpp b11277, vLLM v0.30.0, Ollama v0.35.0 (the newest release marked stable — pre-releases were skipped). ExLlamaV2 is still at 0.3.2 from July 2025; ExLlamaV3, where its maintainer now works, is at v1.5.3. The benchmark figures themselves were not re-measured and still describe the older stack they were run on.',
    zh: '对照各项目自己的发布列表，重新核对了基准测试页上各运行时的当前版本：llama.cpp b11277、vLLM v0.30.0、Ollama v0.35.0（取最新的正式版，跳过了预发布版）。ExLlamaV2 仍停在 2025 年 7 月的 0.3.2；其维护者现在工作的 ExLlamaV3 已到 v1.5.3。基准测试数字本身没有重测，仍然对应当初测试时的旧软件栈。',
  },
  {
    date: '2026-09-29',
    en: 'Each tool page\'s breadcrumb now reads Home › Tools › the tool, so the page listing all four tools is one click away from any of them — before, nothing inside the tools linked back to it.',
    zh: '每个工具页的面包屑现在是「首页 › 工具 › 当前工具」，从任一工具都能一键回到列出全部四个工具的页面——此前工具页内部没有任何地方链接回去。',
  },
  {
    date: '2026-09-29',
    en: 'Thirty-one Chinese page titles were long enough to be cut off in search results — every model page with a long English name, the "best for your VRAM" pages and a few section pages. They were shortened, and titles that would still overflow now drop the site name before losing any of their own words. The build now fails if any title runs long or two pages share one.',
    zh: '有 31 个中文页面标题长到会在搜索结果里被截断——英文名较长的模型页、「按显存推荐」各页以及几个栏目页。这些标题都已缩短；仍会超长的标题，现在会先去掉网站名，而不是截掉自己的字。今后只要有标题超长或两个页面标题重复，构建就会失败。',
  },
  {
    date: '2026-09-29',
    en: 'The site now checks itself on every build. Many of the errors fixed this month were two hand-typed files drifting apart — a pick naming a quant its model does not ship, a guide linking a model id that no longer exists, a superseded model pointing at a successor that is itself superseded — or a page quietly growing past a limit. Each of those now stops the build with a message saying exactly what is wrong, instead of shipping a page that looks fine and is not. Nothing a reader sees changed today; this is what keeps the recent corrections corrected.',
    zh: '网站现在每次构建都会自检。本月修掉的很多错误，要么是两个手写文件彼此走样——推荐里写了一个模型并不提供的量化档位、指南链接了一个已不存在的模型、一个过时模型指向的「继任者」本身也已过时——要么是页面悄悄超出了某个限制。这些情况现在都会让构建直接失败，并准确说明哪里出了错，而不是发布一个看起来正常、其实有问题的页面。今天读者看到的内容没有变化；这是为了让最近的修正保持修正。',
  },
  {
    date: '2026-09-26',
    en: 'The VRAM calculator page now carries a quick-reference table by model size — memory at 4K and 32K context and the smallest card that holds each whole size class — so its answers are readable without JavaScript, which the interactive calculator needs. Every figure is the calculator\'s own arithmetic. The 32K column counts only models whose context window actually reaches 32K; one it does include, Phi-3.5 Mini, needs about 15.6 GB there because it keeps a full-size cache for every attention head, a real property of the model rather than an error.',
    zh: '显存计算器页面新增了一张按模型规模的速查表——4K 与 32K 上下文下的显存，以及能装下整个规模档位的最小显卡——这样即使不运行 JavaScript（交互式计算器需要它），也能直接读到答案。表中每个数字都是计算器自己的算法。32K 一列只统计上下文窗口真正达到 32K 的模型；其中 Phi-3.5 Mini 在 32K 下约需 15.6 GB，因为它为每个注意力头都保留完整的缓存——这是模型本身的特性，不是计算错误。',
  },
  {
    date: '2026-09-26',
    en: 'Search-result descriptions now fit what a results page shows. 92 English and a dozen Chinese pages had descriptions long enough to be cut off mid-sentence — every GPU page among them — and a few model pages had the opposite problem, a single short line. Long ones now keep whole sentences up to the limit or were rewritten shorter; short model descriptions gain one computed line with the model\'s size. Two errors turned up on the way: a GPU page description named a model already marked as superseded as the largest one that fits, and the AWQ format was described as NVIDIA-only although this site\'s own guidance, and its fit calculations, allow it on AMD through vLLM.',
    zh: '搜索结果里的页面摘要，现在都控制在结果页能完整显示的长度内。此前有 92 个英文页面和十几个中文页面的摘要长到会被从句子中间截断——所有显卡页都在其中——另有几个模型页正好相反，只有一句很短的话。过长的摘要现在会在限度内保留完整句子，或已改写得更短；过短的模型摘要会补上一句计算出的显存体积。顺带发现两处错误：一个显卡页的摘要把一个已标为过时的模型说成是「能装下的最大模型」；AWQ 格式被描述成只支持 NVIDIA，而本站自己的说明和装载计算都允许它通过 vLLM 在 AMD 上运行。',
  },
  {
    date: '2026-09-26',
    en: 'Every guide now shows when it was published and, if it has changed since, when it was last updated — the dates were already in each page\'s search metadata but nowhere a reader could see them. The sitemap also now reports a guide\'s real last change: it had been ignoring content updates, so the seventeen guides rewritten this month told search engines they had not changed since their 2025 publication.',
    zh: '每篇指南现在都会显示发布日期，以及（如果之后有改动）最近更新日期——这些日期此前只写在页面的搜索元数据里，读者看不到。站点地图现在也会报告指南真实的最近改动时间：它此前忽略内容更新，导致本月重写的十七篇指南对搜索引擎声称自己自 2025 年发布以来从未改动。',
  },
  {
    date: '2026-09-26',
    en: 'The Format Heat Index on /formats/ no longer prints percentages, and the format comparison pages no longer have an "adoption estimate" row. Those numbers (GGUF 89%, AWQ 45% and so on) were an editorial judgement with no source anyone could re-check, and on the comparison pages they sat directly beside real counts of how many models in this index ship each format, as if the two were the same kind of fact. The ranking stays, labelled as an opinion; the measured part is the per-format model count.',
    zh: '/formats/ 页上的「格式热度指数」不再显示百分比，格式对比页也去掉了「采用率估算」这一行。那些数字（GGUF 89%、AWQ 45% 等）是编辑判断，没有任何人能复核的来源；在对比页上，它们就摆在「本索引中有多少模型提供该格式」这个真实计数旁边，看起来像是同一类事实。排序保留，并注明是判断；实测的部分是每种格式的模型数。',
  },
  {
    date: '2026-09-26',
    en: 'The homepage Editor\'s Picks now compute the size and the card beside each pick, the same way the model pages do, instead of carrying them as typed text. The typed versions had drifted: Magistral Small 1.2 was listed for a 16 GB card it only just squeezes onto, Seed-OSS 36B for two RTX 3090s when one 32 GB card holds it, and several named cards were not in this site\'s GPU list at all. Each pick now shows its size at 4K context and the smallest card that runs it comfortably.',
    zh: '首页「编辑推荐」里每一项旁边的体积和显卡，现在和模型页一样由计算得出，不再是手写的文字。手写版本已经走样：Magistral Small 1.2 标的是一张只能勉强装下它的 16 GB 显卡，Seed-OSS 36B 标的是两张 RTX 3090，其实一张 32 GB 显卡就能装下，还有好几张写到的显卡根本不在本站的显卡列表里。现在每一项都显示 4K 上下文下的体积，以及能从容运行它的最小显卡。',
  },
  {
    date: '2026-09-26',
    en: 'Model counts per card now say what they count. The site gives two honest numbers for a card — how many models fit comfortably (at most 88% of memory) and how many load at all — and a GPU page shows both, but the homepage card list said only "52 models fit" and the GPU index "52/81", which read as the looser number. Both now say "fit comfortably". The numbers themselves were already consistent everywhere; only the labels were missing.',
    zh: '每张卡「能跑多少模型」的数字，现在都写明了统计口径。本站对一张卡给出两个数字——能从容运行的模型数（占用不超过显存的 88%）和勉强能加载的模型数——显卡页会同时显示两者，但首页的显卡列表只写了「52 个模型可跑」，显卡索引页只写了「52/81」，读起来像是更宽松的那个数。两处现在都标明「可从容运行」。这些数字本身在全站早已一致，缺的只是标注。',
  },
  {
    date: '2026-09-26',
    en: 'Speed figures now say which card they come from. Every model\'s speed in this index was reported on an RTX 4090, but the model table on each GPU page headed that column simply "tok/s" — so the RTX 4060 page, or a Mac page, showed RTX 4090 speeds as if they were that card\'s own. The column is now labelled "tok/s on RTX 4090", every GPU page except the 4090\'s says the column is a reference rather than a speed on that card, and the calculator\'s per-card list labels its speeds the same way. Speeds actually measured on a card still appear under "Measured on this card".',
    zh: '速度数字现在会写明来自哪张卡。本索引里每个模型的速度都是在 RTX 4090 上报告的，但每个显卡页的模型表格里，这一列的表头只写了「tok/s」——于是 RTX 4060 的页面、Mac 的页面，都把 RTX 4090 的速度当成了这张卡自己的速度来展示。现在这一列标为「RTX 4090 上的 tok/s」，除 4090 之外的每个显卡页都会说明这一列只是参考、不是这张卡的速度，计算器里按显卡列出的结果也同样标注。真正在某张卡上实测的速度，仍然列在「在这张卡上的实测数据」里。',
  },
  {
    date: '2026-09-26',
    en: 'Model pages now size a model the way it was released. GPT-OSS 20B and 120B ship natively in MXFP4, but their pages described that build and then sized everything at Q4_K_M, a community requantization that loses quality — so the description, the table and the "where it fits" block quoted different numbers. The "smallest card" line on every model page was also misleading: when several cards share the smallest size that fits, it named whichever the database listed first (an RTX 5080 for a model any 16 GB card runs); it now names the size, how many cards share it, and the entry card among them. It also no longer calls a system-RAM row a card, which on four 70B-class models put "64 GB RAM (CPU)" where a GPU belonged. "Just misses" now lists the closest misses rather than an 8 GB Mac 5.4 GB short, and the note that a mixture-of-experts model must keep every expert in memory now appears on all 13 MoE models, not 4.',
    zh: '模型页现在按模型的发布形态来估算显存。GPT-OSS 20B 和 120B 原生以 MXFP4 发布，但页面介绍的是这个版本，估算却全部按 Q4_K_M ——一个会损失精度的社区二次量化——来算，于是介绍、表格和「能跑在哪些卡上」三处给出的数字对不上。每个模型页上「最小显卡」那句话也有误导：当多张卡同为能跑的最小容量时，它直接报出数据库里排在最前的那张（一个任何 16 GB 卡都能跑的模型，写的却是 RTX 5080）；现在改为写明容量、这个容量有几张卡、以及其中的入门型号。它也不会再把系统内存那一行当成显卡——此前 4 个 70B 级模型的页面上，本该是显卡的位置写着「64 GB RAM (CPU)」。「差一点」现在列出的是差得最少的卡，而不是差 5.4 GB 的 8 GB Mac；「MoE 模型所有专家都得驻留显存」的提示，现在出现在全部 13 个 MoE 模型上，而不是只有 4 个。',
  },
  {
    date: '2026-09-23',
    en: 'Chinese pages: the footer\'s "Navigate" and "Ecosystem" headings were still in English on every page, and the "read next" guide links at the end of each Chinese guide showed the English title of the guide they pointed to, although every guide has a Chinese title. Both fixed, along with two calculator labels ("Batch Size", and the "Full" precision chip, now 全精度).',
    zh: '中文页面：页脚的「Navigate」「Ecosystem」两个标题此前在每个页面上都还是英文；每篇中文教程末尾「接着看」里的教程链接，显示的也是目标教程的英文标题——而每篇教程其实都有中文标题。两处都已修复，顺带修了计算器里的两个标签（「Batch Size」，以及「Full」精度选项，现为「全精度」）。',
  },
  {
    date: '2026-09-23',
    en: 'The homepage block that used to say "This week\'s updates" is now "Latest additions": the six newest models in the index, newest first, each with the date it was added. It had been showing only the models inside a 45-day window, in file order rather than by date, so it was down to two and would have gone empty within weeks while still claiming to be this week\'s news. The NEW badge on model cards now counts those 45 days back from the latest data update rather than from the moment you open the page, so the badge, the homepage and the Hub\'s "recently added" filter always agree, and a page no longer renders one set of badges in its HTML and a different one once the browser takes over.',
    zh: '首页原来叫「本周更新」的那一块，现在改叫「最近收录」：列出索引里最新加入的 6 个模型，按收录日期从新到旧排，每个都标了收录日期。它原先只显示 45 天窗口内的模型，而且按文件顺序而不是日期排，已经只剩两个，再过几周就会变空，标题却还写着「本周」。模型卡片上的「新」标记，现在从最近一次数据更新往前算 45 天，而不是从你打开页面那一刻算——这样卡片标记、首页和 Hub 的「最近新增」筛选始终一致，页面也不会出现 HTML 里是一组标记、浏览器接管后又变成另一组的情况。',
  },
  {
    date: '2026-09-21',
    en: 'Two more older models now point to a newer choice: Mixtral 8x7B Instruct to Qwen3 30B-A3B (longer context, about 19 GB instead of 28.5 GB at Q4, and faster), and Stable LM 2 12B Chat to Falcon 3 10B Instruct (32K context instead of 4K, smaller and faster). Their pages stay up with every figure intact; they are simply no longer recommended first. DeepSeek-V2-Lite Chat was considered and left alone: nothing else its size matches its 160K context and 11 GB footprint.',
    zh: '又有两个较老的模型标注了更新的替代选择：Mixtral 8x7B Instruct → Qwen3 30B-A3B（上下文更长，Q4 下约 19 GB 而不是 28.5 GB，速度也更快）；Stable LM 2 12B Chat → Falcon 3 10B Instruct（上下文 32K 而不是 4K，更小也更快）。它们的页面和全部数据都保留，只是不再被优先推荐。DeepSeek-V2-Lite Chat 也考虑过，但没有标注：同体量里没有别的模型能比得上它 16 万的上下文和 11 GB 的占用。',
  },
  {
    date: '2026-09-21',
    en: 'Recommendations now check whether your hardware can actually run a format, and Macs are sized by the memory macOS lets the GPU use. Before, a Mac, CPU or AMD page could recommend AWQ, GPTQ or EXL2 builds those systems cannot load (AMD still gets AWQ, which vLLM supports on ROCm). A Mac\'s unified memory was also counted in full; by default macOS lets the GPU use about 75% of it, so that is the figure used now. This applies to the GPU pages, /best/, the FAQ, the format pages and the VRAM calculator, which now says plainly when a format will not run on your hardware. On a 16 GB Mac M3, 44 of 81 models now fit comfortably, down from 52.',
    zh: '推荐现在会检查你的硬件能不能运行某个格式，Mac 也按 macOS 实际允许 GPU 使用的内存来计算。此前 Mac、纯 CPU 或 AMD 的页面可能推荐 AWQ、GPTQ 或 EXL2 版本，而这些系统根本加载不了（AMD 仍可使用 AWQ，因为 vLLM 在 ROCm 上支持它）。Mac 的统一内存此前也是按全部容量计算的；macOS 默认只让 GPU 使用约 75%，现在按这个比例计算。修正覆盖 GPU 页、/best/、FAQ、格式页和显存计算器；计算器在格式不被支持时会直接说明。16 GB 的 Mac M3 上，能从容运行的模型从 52 个变为 81 个中的 44 个。',
  },
  {
    date: '2026-09-21',
    en: 'A round of small corrections: two homepage picks named a card that does not exist ("RTX 4070 Ti 16G" — the 16 GB model is the Ti Super); the About page still said "79+ models"; and the footer\'s llama.cpp and ExLlamaV2 links pointed at the projects\' old GitHub organisations. The contact address is now marked so Cloudflare\'s email protection leaves it unchanged, a likely cause of occasional page errors — not yet confirmed on the live site.',
    zh: '一批小修正：首页有两处推荐写了一张并不存在的显卡（"RTX 4070 Ti 16G"——16 GB 的型号是 Ti Super）；关于页还写着"79+ 个模型"；页脚里 llama.cpp 和 ExLlamaV2 的链接还指向这两个项目旧的 GitHub 组织。联系邮箱现在做了标记，让 Cloudflare 的邮箱保护不再改写它——这很可能是偶发页面报错的原因，但尚未在线上确认。',
  },
  {
    date: '2026-09-15',
    en: 'The homepage now leads with the question most visitors arrive with — "Will it fit on your card?" — and its main button goes to the GPU pages ("Find models for my GPU") instead of the full model list, with a link to the 8 GB starter guide for first-time readers. The runtime versions on the benchmarks page were refreshed (llama.cpp b10978, Ollama v0.34.1; vLLM v0.29.0 unchanged). ExLlamaV2 has had no release since July 2025; its maintainer now works on ExLlamaV3, which uses a new format, EXL3. The benchmarks page notes this; no model here ships EXL3 yet, so it is not listed as a format.',
    zh: '首页现在直接回答大多数访客带着来的问题——"这张显卡，到底能跑多大模型？"——主按钮改为通往按显卡分类的页面（"看我的显卡能跑什么"），不再是完整的模型列表，并为第一次来的读者加了 8 GB 显卡入门指南的链接。基准测试页上的运行时版本已更新（llama.cpp b10978、Ollama v0.34.1；vLLM v0.29.0 不变）。ExLlamaV2 自 2025 年 7 月以来没有新版本，维护者已转向 ExLlamaV3，它使用新的 EXL3 格式。基准测试页注明了这一点；目前本站没有模型提供 EXL3，所以暂不列为格式。',
  },
  {
    date: '2026-09-14',
    en: 'Checked the Chinese edition against what Chinese readers actually search for. One common question had no answer — whether CPU-only inference with 32 GB of RAM is realistic — and the FAQ now answers it from the index\'s own 32 GB RAM entry: what fits is known, speed is not, because it depends on your memory setup. Two popular used cards were added with NVIDIA\'s published specs: Tesla P40 24G and Tesla P100 16G. The modified "2080 Ti 22G" was not added, since it has no published specification.',
    zh: '对照中文读者实际会搜的问题检查了一遍中文站。有一个常见问题没有答案——32 GB 内存纯 CPU 跑大模型现实吗——现在 FAQ 用索引里的"32 GB 内存"条目回答了它：能装下哪些模型是确定的，速度则不确定，因为取决于你的内存配置。新增两张热门二手卡，规格取自 NVIDIA 官方：Tesla P40 24G 和 Tesla P100 16G。改装版"2080 Ti 22G"没有收录，因为它没有官方规格。',
  },
  {
    date: '2026-09-14',
    en: 'GPU, model, guide, /best/ and format pages now each have their own share image instead of one generic picture for the whole site. Fixed along the way: links shared on Twitter/X from any page, the homepage included, showed the site\'s general tagline instead of that page\'s own title and description.',
    zh: 'GPU、模型、指南、/best/ 和格式页面现在各有自己的分享图片，不再全站共用一张通用图。顺带修正了一个问题：从任何页面（包括首页）分享到 Twitter/X 的链接，此前显示的都是网站的通用标语，而不是该页面自己的标题和简介。',
  },
  {
    date: '2026-09-14',
    en: 'Looked into a report of the mobile homepage getting stuck while scrolling. It could not be reproduced: in a clean mobile browser, both scrolling and jump links reached the bottom of the page normally, which points to the preview tool used in the report rather than the site. Not yet checked on a real iPhone or Android phone.',
    zh: '排查了"移动端首页滚动卡住"的反馈。问题无法复现：在干净的移动端浏览器里，滚动和页内跳转都能正常到达页面底部，说明问题更可能出在反馈所用的预览工具，而不是网站本身。尚未在真实的 iPhone 或 Android 手机上确认。',
  },
  {
    date: '2026-09-14',
    en: 'The benchmarks page now says how much it covers: 16 runs on 4 of the 61 cards. A new section lists which cards were measured, what the other 57 rely on instead (the calculator\'s formula), and what has never been tested here — multi-GPU beyond the dual-3090 guide, batches above 1, prompt-processing speed. The methodology is now shown open rather than collapsed, and anything never recorded, such as tools, machine details and dates, says "not recorded". The page description no longer mentions RTX 4060 Ti results that had been removed earlier.',
    zh: '基准测试页现在说明了自己的覆盖范围：61 张卡中的 4 张，共 16 次运行。新增的板块列出了实测过哪些卡、其余 57 张依赖什么（计算器的公式），以及本站从未测过的内容——双 3090 指南之外的多卡、大于 1 的 batch、提示词处理速度。方法说明现在默认展开，从未记录过的内容（测量工具、机器配置、日期）都标为"未记录"。页面简介也不再提及早先已删除的 RTX 4060 Ti 数据。',
  },
  {
    date: '2026-09-14',
    en: 'The site\'s structured data now describes what quantized.uk covers (GGUF, AWQ, EXL2, GPTQ and the runtimes that load them), how to contact it and when it started. It deliberately names no founder and links no social accounts: the site is run by an unnamed maintainer and has no public accounts, and it will not invent either.',
    zh: '网站的结构化数据现在说明了 quantized.uk 涵盖的内容（GGUF、AWQ、EXL2、GPTQ 以及加载它们的运行时）、联系方式和创建时间。它刻意不写创始人，也不链接任何社交账号：本站由一位不具名的维护者运营，没有公开账号，也不会编造。',
  },
  {
    date: '2026-09-13',
    en: 'The "page not found" screen now helps you find your way: it shows the address that failed, suggests the closest real model, GPU or guide (/quant-hub/qwen3-8/ suggests Qwen3 8B Instruct), offers a search box, and links every section with its current count. It returns a genuine 404 status, and Chinese addresses get the Chinese version.',
    zh: '"页面不存在"页现在能帮你找到方向：显示出错的地址，推荐最接近的真实模型、显卡或指南（/quant-hub/qwen3-8/ 会推荐 Qwen3 8B Instruct），提供搜索框，并列出各板块入口和当前数量。它返回真正的 404 状态码，中文地址会显示中文版。',
  },
  {
    date: '2026-09-13',
    en: 'Twelve older models (Zephyr 7B Beta, WizardLM-2 7B, OpenChat 3.6 8B, Aya 23 8B, SOLAR 10.7B, both InternLM2 sizes, DBRX Instruct, Jamba 1.5 Mini, StarCoder2 15B, Command R 35B, Yi 1.5 34B) now say which current model to prefer and why — longer context, more quant options, or builds that are still maintained — with a one-click comparison. The model list hides the 13 legacy models by default; a toggle shows them, and their pages stay up. Fixed along the way: the homepage and /best/ had been recommending legacy models — Qwen2-VL-7B held the vision pick on almost every GPU.',
    zh: '12 个较老的模型（Zephyr 7B Beta、WizardLM-2 7B、OpenChat 3.6 8B、Aya 23 8B、SOLAR 10.7B、InternLM2 两个尺寸、DBRX Instruct、Jamba 1.5 Mini、StarCoder2 15B、Command R 35B、Yi 1.5 34B）现在会注明建议改用哪个当前模型及原因——上下文更长、量化选择更多，或者仍有人在维护新版本——并可一键对比。模型库默认隐藏这 13 个旧模型，打开开关即可显示，它们的页面也都保留。顺带修正：首页和 /best/ 此前会推荐旧模型——Qwen2-VL-7B 几乎在每张显卡上都占着多模态推荐位。',
  },
  {
    date: '2026-09-13',
    en: 'The sitemap now tells search engines when each page actually changed — model pages by the date they were added, guides by their own dates — instead of stamping every page with the latest build date. robots.txt now explicitly welcomes the AI search crawlers (OpenAI, Anthropic, Perplexity, Google, Apple) and points to /llms.txt, while shareable filter links stay open to crawling.',
    zh: '站点地图现在会告诉搜索引擎每个页面真正更新的时间——模型页用收录日期，指南用各自的日期——而不是给所有页面都打上最近一次构建的日期。robots.txt 现在明确欢迎各家 AI 搜索爬虫（OpenAI、Anthropic、Perplexity、Google、Apple），并指向 /llms.txt；可分享的筛选链接仍然允许抓取。',
  },
  {
    date: '2026-09-12',
    en: 'Page titles tidied up: 63 were long enough to be cut off in search results, mostly model pages and guides carrying redundant suffixes. All now fit, none are duplicated, and none are shortened with "…". The About page\'s title now says what the page is.',
    zh: '整理了页面标题：有 63 个长到会在搜索结果里被截断，主要是带着多余后缀的模型页和指南。现在全部控制在长度内，没有重复，也没有用"…"截断。关于页的标题现在也说明了这一页是做什么的。',
  },
  {
    date: '2026-09-12',
    en: 'The site had exactly one return-visit mechanism — a feedback mailto — on a site that ships new data every few weeks. The Footer now has a "Stay current" column, on every page, pointing to /feed.xml and /changelog/ with a line on what each actually is (no email, no tracking); model and GPU pages carry a one-line reminder that their own numbers change with the data, next to the RSS link. The real fix was underneath: four templates — the two dynamic model-page routes and their /zh mirrors — built their own <head> metadata by hand and never included RSS autodiscovery, so roughly 200 of the site\'s most-visited pages had a working feed nothing could find without knowing the URL by memory. /feed.xml itself already carried real pubDate/guid/link/description on both changelog and model entries — checked, not assumed. No email newsletter: the site\'s privacy posture (no tracking, no account) is stated on /privacy/ and /about/, and a mailing list would contradict it for an audience RSS already suits',
    zh: '本站唯一的回访机制是一个反馈用的 mailto 链接，而这是一个每隔几周就有新数据的站点。Footer 现在在每一页都新增了「保持关注」一栏，指向 /feed.xml 与 /changelog/，并各自说明是什么（不收邮箱、不追踪）；模型页与 GPU 页在页尾加了一行提醒——本页数字会随数据变化——旁边就是 RSS 链接。真正的问题在底层：四个模板——两个动态模型页路由及其 /zh 镜像——是手写 <head> 元数据的，从未包含 RSS 自动发现标签，导致站上访问量最大的约 200 个页面里，有一个能用的订阅源却没有任何方式能被发现，除非读者记得完整网址。/feed.xml 本身已经在 changelog 与模型两类条目里带着真实的 pubDate/guid/link/description——这是核实过的，不是想当然。没有做邮件订阅：站点的隐私立场（不追踪、不建账号）写在 /privacy/ 与 /about/ 里，对这批读者而言邮件列表会与之矛盾，而 RSS 已经够用',
  },
  {
    date: '2026-09-12',
    en: 'The last seven thin guides rewritten, closing out the cookbook: all 23 guides now sit between 1,464 and 1,824 words, none reports the fictional "1 min read" any longer, and none carries an unearned verification date. Checking rather than remembering caught real content, not just gaps: OpenBLAS was advertised as a CPU speed-up, and llama.cpp\'s own build documentation says it helps prompt processing above batch size 32 and does nothing for generation speed at all — the old numbers for what a budget VPS achieves were invented and are gone. A 32B coding model was called a comfortable fit on a 24GB card at a quant level that this site\'s own calculator puts at 90% of the card — tight, not comfortable — and the two builds now get the honest comparison. And the 8GB Mac guide states plainly that this index has no M1 or M2 base-chip entry and explains exactly what stands in for it and where that substitution overstates the real speed',
    zh: '最后七篇单薄的指南已重写，至此整个 cookbook 完工：现在全部 23 篇正文都在 1,464 到 1,824 词之间，没有一篇还挂着编造的「1 分钟阅读」，也没有一篇带着并未赚到的验证日期。核对而不是凭记忆写作，这次揪出的是实质内容问题，不只是篇幅问题：此前 OpenBLAS 被当作能提升 CPU 速度的东西来讲，而 llama.cpp 自己的构建文档写明它只在批大小超过 32 的提示词处理阶段有用，对生成速度毫无帮助——旧版本里那些「某低价 VPS 能跑多少 tok/s」的数字是编的，已经删掉。一个 32B 编程模型被说成能从容装进 24GB 显卡，用的量化档位在本站自己的计算器里其实占了显卡的 90%——是「勉强」，不是「从容」——现在两种构建给出的是诚实的对比。8GB 的 Mac 指南则直说本索引没有 M1 或 M2 基础版芯片的条目，并说明具体用什么代替、这种替代在哪里会高估真实速度',
  },
  {
    date: '2026-09-12',
    en: 'The five server-side guides rewritten, and two of them were teaching a command that no longer exists. Both vLLM guides still showed \'python -m vllm.entrypoints.openai.api_server\' and an install pinned to a CUDA 12.1 wheel index; the documented form is now \'vllm serve\' with a uv install that picks the torch build from your driver. The ExLlamaV2 repository has moved organisation. And TabbyAPI\'s own README says it is a hobby project not meant for production servers — that now appears at the top of its guide, because the maintainers saying it outranks anything this site could add. One invented figure came out: a claim of ~1400 tok/s at batch 8 that nothing here measured. The guides now cite the runs this index actually holds — 235 tok/s for ExLlamaV2 on a 4090, 218 for vLLM on the same card — and say plainly that batched throughput is not something this site has measured',
    zh: '五篇服务端指南已重写，其中两篇教的命令已经不存在了。两篇 vLLM 指南仍在用 \'python -m vllm.entrypoints.openai.api_server\'，安装也还钉在 CUDA 12.1 的 wheel 源上；现在官方文档的形式是 \'vllm serve\'，安装用 uv 并根据你的驱动自动选择 torch 构建。ExLlamaV2 的仓库已经换了组织名。而 TabbyAPI 自己的 README 写明它是一个业余项目、不适合跑在生产服务器上 —— 这句话现在放在该指南的开头，因为维护者自己的判断比本站能补充的任何话都更有分量。还揪出一个编造的数字：一处「batch 8 时约 1400 tok/s」的说法，本站从未测过。现在这些指南引用的是本索引真正持有的实测记录 —— 4090 上 ExLlamaV2 的 235 tok/s、同一张卡上 vLLM 的 218 tok/s —— 并且直说批量吞吐不是本站测过的东西',
  },
  {
    date: '2026-09-12',
    en: 'Five thin guides rewritten, the first of three batches. Seventeen of the 23 guides were under 365 words of body while their titles promised a full tutorial — one called "llama.cpp on Windows with CUDA" was eighteen words long. The five with the widest beginner intent now follow the structure the six already-rewritten guides established: what you need first, the steps, a way to check the model really ran on the GPU rather than falling back to the CPU silently, what the numbers should look like on that hardware, and what to do when it does not work. Each carries three questions answered in the page and in its structured data. Every memory figure comes from the calculator on the model\'s own row, and the commands were checked against the projects\' current documentation — a documentation check, not a run, so the unearned "verified" date these seventeen had been carrying since July is removed rather than refreshed',
    zh: '五篇单薄的指南已重写，这是三批中的第一批。23 篇指南里有 17 篇正文不足 365 词，标题却承诺了完整教程 —— 其中一篇叫《Windows 上用 CUDA 编译 llama.cpp》的正文只有 18 个词。入门意图最广的这五篇现在采用了此前六篇重写稿建立的结构：开始之前要准备什么、具体步骤、如何确认模型真的跑在 GPU 上而不是静默回落到 CPU、在该硬件上数字大概该是什么样，以及出问题时怎么办。每篇都带三个问题，页面上和结构化数据里都有。所有显存数字都取自计算器对该模型自身数据行的计算，命令则对照各项目当前的官方文档核对过 —— 这是文档核对，不是实机运行，所以这 17 篇从七月起一直挂着的、并未真正赚到的「已验证」日期是被移除，而不是被刷新',
  },
  {
    date: '2026-09-11',
    en: 'The four sections of this site now link to each other. Measured first: the internal link graph ran almost entirely through the header and footer — fourteen hub addresses appeared on every page while the four format pages had one inbound link each, eight hardware pages had fewer than three, and a model page pointed at similar models and guides but never at a format, a card or a recommendation. Model pages now say where the model fits — the cheapest cards that clear it, the ones it just misses and by how much, the formats it ships in — and guides say what they use: the hardware, the models, the runtime\'s format and what to read next. Every relationship is computed from data the site already held, so none of it can rot. No content page is now reachable from fewer than three others, and the format pages went from one inbound link to a median of 25',
    zh: '本站四个板块现在互相链接了。先做了测量：站内链接几乎全部走页头和页脚 —— 十四个枢纽地址出现在每一个页面上，而四个格式页各自只有一条入站链接，八个硬件页不足三条，模型页指向相似模型和指南，却从不指向格式、显卡或推荐。现在模型页会说明这个模型能跑在哪 —— 能从容装下它的最便宜的几张卡、差一点装不下的是哪几张以及差多少、它提供哪些格式 —— 指南页则会说明自己用到了什么：硬件、模型、所用运行时对应的格式，以及接着该读什么。所有关系都由站点已有的数据算出，因此不会随时间失效。现在没有任何一个内容页的入站链接少于三条，格式页则从一条入站链接提升到中位数 25 条',
  },
  {
    date: '2026-09-11',
    en: 'The site finally answers "what should I run", not just "what fits". A card page gave you a list and the Hub gave you another list, but nobody searching for the best model for a 16GB card wants a list — they want a pick. There are now seven pages, one per memory budget from 8GB to 32GB plus Apple silicon, each naming the model for general use, for coding and for images, with what it costs, what headroom is left, and the published quality loss. Every one is computed from the index by the same function behind the homepage hero, so a tier page and the homepage cannot recommend different models for the same card, and adding a model changes all seven with no edit. Each page also names the nearest model that does **not** fit and by how much, because the boundary is the half a list never gives you',
    zh: '本站终于开始回答「我该跑哪个」，而不只是「哪些装得下」。显卡页给你一份清单，Hub 给你另一份清单，但搜「16G 显卡最好的模型」的人要的不是清单，是一个推荐。现在有七个页面，从 8G 到 32G 每个显存档位一个，外加 Apple 芯片，各自给出通用、写代码、图像三种用途下该跑的模型，附显存占用、剩余余量和已公开的质量损失。这些推荐全部由索引算出，用的是首页 hero 背后的同一个函数 —— 所以档位页和首页不可能对同一张卡给出不同推荐，而新增一个模型会让七个页面同时更新，无需改动任何一行文案。每页还会点名**装不下**的那个最接近的模型以及差多少，因为「边界在哪」正是清单从来不会告诉你的那一半',
  },
  {
    date: '2026-09-11',
    en: 'The model search is a real search box now. Every page advertises a search interface at /quant-hub/?q=…, and that URL did filter correctly — but the control producing it was an input with no name and no form around it, so nothing could submit it without JavaScript and nothing reading the markup could find the interface. It is now a proper search form, so pressing Enter produces the URL the site has been advertising all along. Searching also stopped failing on the obvious words: "coding", "vision", "gguf" and "7b" all returned nothing, because the box only looked at model names — it now covers size, task, hardware and format, and understands that people type "coding" where the data says "code". An empty result offers four suggestions drawn from the index instead of a blank page, and filtered URLs ask not to be indexed while still being crawled, so a shareable filter link cannot turn into thousands of near-duplicate pages',
    zh: '模型搜索框现在是真正的搜索框了。全站每个页面都声明了 /quant-hub/?q=… 这个搜索接口，而这个网址确实能正确筛选 —— 但产生它的那个控件是一个没有 name、也没有表单包裹的输入框，所以没有 JavaScript 就无法提交，读取页面代码的程序也发现不了这个接口。现在它是一个规范的搜索表单，按下回车就会得到站点一直在对外声明的那个网址。搜索也不再在最常见的词上失灵：此前输入「coding」「vision」「gguf」「7b」都是零结果，因为搜索只看模型名 —— 现在它覆盖参数量、用途、硬件和格式，也知道人们打的是「coding」而数据里写的是「code」。搜索无结果时会给出四个来自索引、点了一定有结果的建议，而不是一片空白；带筛选参数的网址会声明不要被收录但仍可被抓取，这样一条可分享的筛选链接不会变成成千上万个近乎重复的页面',
  },
  {
    date: '2026-09-11',
    en: 'There is now a FAQ, and every answer in it is computed rather than written. "How much VRAM do I need for a 7B" had a calculator on this site but no answer — 24 questions across sizing, quantization quality, formats, hardware and where the numbers come from now answer from the same index, each ending in a link to where you can check it. Because they are computed, they cannot drift from the calculator the way the guides once did: editing one model row moves the answers that depend on it. Three questions the index genuinely cannot settle — whether quantization hurts coding more than chat, whether an official QAT build beats a community one, and how much Q5 buys over Q4 for models that publish only one of the two — say so instead of guessing',
    zh: '现在有了常见问题页，而且每个答案都是算出来的，不是写出来的。「7B 要多少显存」这个问题，本站一直有计算器，却没有答案 —— 现在围绕体积与显存、量化掉点、格式与运行时、硬件、数据来源五个主题的 24 个问题，全部由同一份索引作答，每条末尾都带一个可以自己核对的站内链接。因为是算出来的，它们不会像当初的指南那样与计算器脱节：改动一行模型数据，依赖它的答案就会跟着变。有三个索引确实回答不了的问题 —— 量化对写代码的影响是否更大、官方 QAT 是否优于社区量化、以及只公布了单一档位数据的模型上 Q5 比 Q4 值不值 —— 页面会直说，而不是猜一个',
  },
  {
    date: '2026-09-11',
    en: 'Every format the index ships now has its own page. "What is AWQ" had nowhere to land on a site named after quantization — there were comparisons of one format against another, but nothing that simply explained one, and the 53 models shipping AWQ had no shared parent. GGUF, AWQ, EXL2 and GPTQ each now get what the format is, which runtimes read it, what one real model costs in it at 4K, the quant levels this index actually carries with their median published loss, and every indexed model that ships it — 159 new links from a format to its models. MXFP4 is explained on the GGUF page rather than made a fifth format, because that is what it is: GPT-OSS\'s native 4-bit weights are distributed as GGUF files, not as a different container',
    zh: '本索引收录的每种格式现在都有了自己的页面。「AWQ 是什么」此前在一个以量化命名的站点上无处可落 —— 有格式之间的两两对比，却没有一个页面单纯讲清楚一种格式，而提供 AWQ 的 53 个模型也没有共同的归属页。GGUF、AWQ、EXL2、GPTQ 现在各有：这个格式是什么、哪些运行时能读它、一个真实模型在 4K 下要多少显存、本索引实际收录了哪些量化档位及其公开损失中位数，以及提供该格式的全部模型 —— 从格式指向模型的新增内链共 159 条。MXFP4 放在 GGUF 页面里讲，而没有被单列为第五种格式，因为它本来就是这样：GPT-OSS 的原生 4-bit 权重是以 GGUF 文件分发的，不是另一种容器',
  },
  {
    date: '2026-09-11',
    en: 'Two comparison pages that could not compare anything are gone. "AWQ vs GPTQ" and "EXL2 vs GPTQ" each had an intersection of exactly zero — not one of the 81 models here ships both formats — so neither page could put a single row of the same weights side by side, and both filled ~650 words restating two descriptions next to each other. A pair with no model in common is no longer generated at all; the question itself is answered on the GGUF vs GPTQ page, which now says plainly that nobody ever chooses between GPTQ and AWQ for one model, and what to use instead. The old URLs redirect there permanently rather than 404',
    zh: '两个无从比起的对比页已经下线。「AWQ vs GPTQ」与「EXL2 vs GPTQ」的交集恰好为零 —— 本站 81 个模型中没有任何一个同时提供这两种格式 —— 所以这两个页面连一行「同一份权重的两种格式」都摆不出来，只能用约 650 词把两段说明并排放着。现在，没有共同模型的格式组合根本不会生成页面；这个问题改由 GGUF vs GPTQ 页面回答，它直白地说明了没有人会为同一个模型在 GPTQ 与 AWQ 之间做选择，以及该用什么替代。旧网址会永久重定向到那里，而不是变成 404',
  },
  {
    date: '2026-09-11',
    en: 'Hardware pages now say something about the hardware. All 61 were the same page with a different name on it, because what fits is decided by memory alone — every 16 GB card returned an identical list. Each page now opens with the card\'s memory bandwidth, the biggest model it holds, one that leaves room to grow, and a speed ceiling computed from the specification: generating a token means reading every weight once, so an 8B at Q4_K_M tops out near 62 tok/s on a 288 GB/s RTX 4060 Ti and near 159 on a 736 GB/s RTX 4080 Super — the same 16 GB, the same models, very different machines. That ceiling is arithmetic on published numbers, never a benchmark, and the pages say so. Doing the arithmetic also caught three of our own benchmark rows claiming speeds the card they name cannot physically reach; they have been removed rather than adjusted',
    zh: '硬件页现在真的在讲硬件。此前 61 个页面只是换了名字的同一个页面 —— 因为能装下什么完全由显存决定，每张 16 GB 的卡返回的清单一模一样。现在每页开头都会给出该卡的显存带宽、能装下的最大模型、一个留有余量的选择，以及一个由规格推算出的速度上限：生成一个 token 就要把每个权重读一遍，所以 8B 的 Q4_K_M 在 288 GB/s 的 RTX 4060 Ti 上约 62 tok/s 封顶，在 736 GB/s 的 RTX 4080 Super 上约 159 —— 同样 16 GB、同样的模型，却是两台很不一样的机器。这个上限是公开数字的算术结果，不是跑分，页面上也如实说明。做这个算术的同时还发现本站自己有三条基准数据，其速度是所标显卡在物理上达不到的；这些行已被删除，而不是调整数值',
  },
  {
    date: '2026-09-11',
    en: 'The formats page now says something. It was 65 words — the thinnest page on a site named after quantization, and the only way in to the six format comparisons. It now opens with a table counted from the index: how many of the 81 models ship each format, the median published perplexity loss at 4-bit and how many measurements that median is drawn from, and the quant levels this index actually carries. HQQ appears in it as 0 of 81, with a line saying so — it is documented here as reference, and you will not find it in the Hub. Formats where nobody published a perplexity figure show a dash rather than an estimate',
    zh: '格式页终于有内容了。此前它只有 65 词 —— 一个以量化命名的站点上最单薄的页面，却是六个格式对比页唯一的入口。现在页面开头是一张由索引统计出来的表：81 个模型中有多少个提供该格式、4-bit 档位已公布困惑度损失的中位数及其样本量，以及本索引实际收录的量化档位。HQQ 在表中显示为 0 / 81，并附有说明 —— 它作为参考资料收录，Hub 里找不到它。没有公开困惑度数据的格式显示为短横线，而不是估算值',
  },
  {
    date: '2026-09-11',
    en: 'Model pages now explain themselves. Each of the 81 was a table and little else — around 220 words, nothing a person could skim for "will this run on my card" and nothing an AI assistant could quote. Every page now carries three short sections and three questions answered from that model\'s own numbers: what it costs at 4K, what longer context adds, and which build to download. Nothing is written by hand, so nothing can drift from the data — and a hybrid-attention model gets visibly different text from a conventional one. Deployment guides also declare when they were last changed, and which models and hardware they are actually about',
    zh: '模型页现在会自己讲清楚。此前 81 个页面几乎只有表格 —— 约 220 词，人扫一眼看不出「我的卡跑不跑得动」，AI 助手也无从引用。现在每页都有三段简短说明和三个由该模型自身数字回答的问题：4K 下要多少显存、上下文变长会多花多少、该下载哪个版本。这些文字全部由数据生成，因此不会与数据脱节 —— 混合注意力的模型得到的文案与常规模型明显不同。部署指南也开始声明最近一次修改时间，以及它们实际讲的是哪些模型和硬件',
  },
  {
    date: '2026-09-11',
    en: 'The hardware database reaches the current generation. Blackwell (RTX 5090 down to 5060), RDNA 4 (RX 9070 XT and 9070) and the M4 and M5 Macs — including the 256GB and 512GB Mac Studio configurations — now have pages, 18 cards in all. Until today the newest NVIDIA consumer card here was the RTX 4090 from 2022, so "what can an RTX 5090 run" had no answer on a site whose whole premise is that question. None of these cards has been benchmarked here, and each page says so rather than implying its estimates were measured',
    zh: '硬件数据库更新到当代。Blackwell（RTX 5090 到 5060）、RDNA 4（RX 9070 XT 与 9070），以及 M4、M5 系列 Mac（含 256GB 与 512GB 的 Mac Studio 配置）现在都有了独立页面，共 18 张卡。在今天之前，站内最新的 NVIDIA 消费级显卡还是 2022 年的 RTX 4090 —— 而「RTX 5090 能跑什么」恰恰是本站存在的理由。这些卡都没有在本站实测过，每个页面都会如实说明，而不是让估算值看起来像实测值',
  },
  {
    date: '2026-09-11',
    en: 'Findability and honest labels. Every hardware page now has a description that names the card and the largest model it runs — 36 of the 43 previously shared just nine descriptions between them, because the template only knew the memory size. The tools index and the data changelog are real pages instead of 404s, the navigation finally links the 43 hardware pages and the format comparisons, and the homepage stopped printing the same update three times. Model counts are computed from the index rather than typed in six places, and the date beside a NEW badge now says "added" — it is when this index picked the model up, not when the model was released',
    zh: '可发现性与标签诚实度。每个硬件页面的描述现在会写明具体显卡和它能跑的最大模型 —— 此前 43 个页面中有 36 个只共用九条描述，因为模板里只有显存大小这一个变量。工具索引与数据更新日志从 404 变成了真实页面，导航里终于有了 43 个硬件页和格式对比的入口，首页也不再把同一条更新印三遍。模型数量改为从索引实时计算，而不是在六个地方手写；NEW 徽章旁的日期现在标注为「收录」—— 那是本索引收录它的时间，不是模型的发布时间',
  },
  {
    date: '2026-09-11',
    en: 'The calculator learned that 2026 models do not all cache attention the same way, and the first two are in. Qwen3.8 27B runs only 16 of its 64 layers on full attention — the rest keep a fixed recurrent state — so the old arithmetic overstated its KV cache fourfold, claiming 8GB at 32K context where the measured figure is 2GB. Sizing now follows the model\'s actual attention shape and reproduces published measurements at 8K, 32K and 262K. Ministral 3 8B joins it, sized from Mistral\'s own GGUF releases. Where nobody has published a per-level quality loss, the column now shows a dash instead of a number',
    zh: '计算器现在知道 2026 年的模型并非都用同一种方式缓存注意力，首批两个模型也已入库。Qwen3.8 27B 的 64 层里只有 16 层是全注意力、其余保留固定大小的循环状态，旧算法把它的 KV 缓存高估了四倍 —— 在 32K 上下文下算出 8GB，而实测是 2GB。现在按模型真实的注意力结构计算，并与 8K、32K、262K 三个公开实测值吻合。同批加入的还有 Ministral 3 8B，其体积来自 Mistral 官方发布的 GGUF。凡是没有人公布过逐档质量损失的，该列现在显示一个破折号，而不是一个数字',
  },
  {
    date: '2026-09-11',
    en: 'Two crawling faults fixed. Every internal link to a model whose name contains a version number — llama-3.1-8b, qwen2.5-7b, phi-3.5-mini — was losing its trailing slash and redirecting: 2,101 links across 46 URLs, and 27 model pages had no direct link to their own canonical address. And the language switcher was a button rather than a link, so the 164 Chinese pages had no crawlable route into them from anywhere on the site. Both are now checked by the build, so neither can come back quietly',
    zh: '修掉两处抓取层面的缺陷。凡是名字里带版本号的模型 —— llama-3.1-8b、qwen2.5-7b、phi-3.5-mini —— 指向它们的站内链接都会丢掉尾部斜杠并触发跳转：涉及 46 个 URL、2,101 条链接，其中 27 个模型页在自己的规范地址上没有任何直接内链。另外语言切换器是按钮而不是链接，导致 164 个中文页面在全站没有任何可抓取的入口。两处现在都由构建检查把关，不会再悄悄回退',
  },
  {
    date: '2026-09-08',
    en: 'Search and feedback groundwork. Hardware pages now say when a card has real measured runs behind it — four of the 43 do — and name the other cards that share its memory budget, because the model list is decided by VRAM and those pages were otherwise near-copies of each other. Structured data was claiming 73 models on pages that listed 30; it now matches what is on the page, on all 329 of them. And guides and the command generator ask whether the thing actually ran: copying a command is not the same as it working, and the correction email shows you its exact text before your mail app opens',
    zh: '搜索与反馈的基础工作。硬件页面现在会说明这张卡是否有真实实测记录（43 张里有 4 张），并列出显存预算相同的其他显卡 —— 因为能跑哪些模型由显存决定，否则这些页面彼此几乎是副本。结构化数据此前在只列出 30 个模型的页面上声称有 73 个；现在全部 329 个页面都与页面实际内容一致。另外，指南和命令生成器会问你「它真的跑起来了吗」：复制命令不等于它能用；而勘误邮件在打开你的邮件应用之前，会先把要发送的原文完整展示给你',
  },
  {
    date: '2026-09-08',
    en: 'Two fixes found by running the verification matrix rather than reading the code. Switching models in the VRAM calculator kept the previous model\'s quant level selected — pick Llama 3.1 8B at EXL2, switch to GPT-OSS 20B, and it confidently sized a file that does not exist; the level now snaps to one the model ships, and any level the index has no build for is labelled as an estimate from the generic table. And the calculator was deleting the card from its own address bar in forward mode, so a shared link lost the hardware the verdict was about',
    zh: '两处修复，来自实际跑验证矩阵而不是读代码。在显存计算器里切换模型时会保留上一个模型的量化档位 —— 选中 Llama 3.1 8B 的 EXL2 再切到 GPT-OSS 20B，它会一本正经地给出一个并不存在的文件的体积；现在档位会自动切到该模型确实提供的一档，而索引中没有对应构建的档位会被标注为「仅为通用表估算」。另外计算器在正向模式下会把显卡从自己的地址栏里删掉，导致分享出去的链接丢失了这个结论所针对的硬件',
  },
  {
    date: '2026-09-08',
    en: 'Guides and legibility. The 8GB starter guide was overstating VRAM by about 2GB against this site’s own calculator and told readers a 14B "needs 36GB+" when it needs 11 — those and the Mac and dual-GPU guides are rewritten from the index, with prerequisites, a way to check the model really ran on the GPU, and what to do when it does not fit. Reading times are now derived from the article instead of typed by hand (22 of 23 were fiction), a guide rewritten since its last real run says "written against" rather than claiming a verification date, and every text colour on the site now clears the WCAG AA contrast floor — 3,175 text nodes checked, none failing. Charts carry a table of the same figures in the static HTML, filter chips announce whether they are selected, and context lengths print the exact token count',
    zh: '教程与可读性。8GB 入门指南的显存数字比本站计算器高出约 2GB，还告诉读者 14B「需要 36GB 以上」（实际 11GB）—— 该指南连同 Mac 与双卡指南已按索引重写，补上前置条件、如何确认模型真的跑在 GPU 上，以及装不下时该怎么办。阅读时长改为从正文推算而不再手写（23 篇里有 22 篇是虚构的）；最近修改后未重新实机运行的指南改为标注「面向的技术栈」，不再声称验证日期；站内所有文字颜色现已达到 WCAG AA 对比度下限 —— 实测 3,175 个文本节点，无一不达标。图表在静态 HTML 中附带同数据的表格，筛选按钮会播报是否选中，上下文长度会标出精确 token 数',
  },
  {
    date: '2026-09-08',
    en: 'The homepage now starts with your hardware. Pick your card and what you want it for, and it answers with the largest model that fits, one that leaves room for longer context, and the fastest measured — each with the memory maths and a link into the calculator. Popular cards, a sample of the real-hardware benchmark rows, and a place to report a wrong number sit below it; the format heat index and radar moved to the formats page, and the full changelog is still here, collapsed',
    zh: '首页现在从你的硬件开始。选好显卡和用途，它会给出装得下的最大模型、留有余量的一个，以及实测最快的一个 —— 每个都附显存算法和进入计算器的链接。下方是常见显卡、真机基准的样本行，以及反馈数字错误的入口；格式热度与雷达图移到了格式页，完整更新日志仍在本页，默认折叠',
  },
  {
    date: '2026-09-08',
    en: 'The tools now remember what you picked. Choosing a model in the VRAM calculator and moving to the command generator no longer means entering it again — model, quant level and context length carry across, with a shared link always taking precedence over what you have stored. The calculator also links straight to the command for the configuration on screen, and when a model does not fit your card it says what to change and what that would cost',
    zh: '工具之间现在会记住你的选择。在显存计算器里选好模型再去命令生成器，不必重新输入一遍 —— 模型、量化档位与上下文长度会带过去，而分享链接始终优先于你本地保存的配置。计算器还能直接跳到当前配置对应的命令；当模型装不进你的显卡时，它会说明该改什么、以及改完是多少',
  },
  {
    date: '2026-09-08',
    en: 'Numbers now say where they come from. The compare tool had a "Q4_K_M VRAM" row that never moved when you changed the context length, beside copy claiming it did — it now shows an estimated row that tracks the control and a published row that is fixed, each labelled. The 6:1 "8B wins" scoreboard is gone: it counted memory twice, counted how much of each model this site happens to index, and treated fewer parameters as an advantage',
    zh: '数字现在会交代自己的来源。对比工具此前有一行 "Q4_K_M 显存" 在切换上下文时纹丝不动，而旁边的说明却声称它会随之变化 —— 现在拆成会跟随控件的预估行和固定的已发布行，各自标注。6:1 "8B 胜出" 的比分已移除：它把内存算了两次、把本站收录了多少变体也算进去，还把参数更少当成优势',
  },
  {
    date: '2026-09-08',
    en: 'Model cards stopped combining configurations. The stats row showed the smallest VRAM of any quant beside the fastest speed of another, as if both were available at once; it now reports one named configuration (Q4_K_M · RTX 4090 · batch 1). The GPU chips and hardware pages still count differently — 60 versus 51 on a 4060 Ti 16G — but both now share one function and each says which rule it used',
    zh: '模型卡片不再拼接不同配置。统计行此前把某个档位的最低显存与另一个档位的最快速度并排展示，仿佛两者可以同时获得；现在统一为一套具名配置（Q4_K_M · RTX 4090 · batch 1）。显卡快捷筛选与硬件页的计数仍然不同 —— 4060 Ti 16G 上是 60 与 51 —— 但两者现在共用同一个函数，且各自说明了所用规则',
  },
  {
    date: '2026-09-08',
    en: 'Correctness fixes in the generated commands: the local llama.cpp server now binds 127.0.0.1 instead of publishing an unauthenticated endpoint on every interface, the download step installs the CLI it uses, and the claim that vLLM is CUDA-only was simply wrong — it ships official ROCm builds. The Chinese homepage no longer carries English text in Editor\'s Picks, and its RSS link points at the Chinese feed the page header already advertised',
    zh: '生成命令的修正：本机 llama.cpp 服务改为绑定 127.0.0.1，不再把未鉴权的端点暴露在所有网卡上；下载步骤会先安装它所需的 CLI；此前"vLLM 仅支持 CUDA"的说法是错的 —— 它提供官方 ROCm 构建。中文首页的编辑推荐不再夹带英文，其 RSS 链接也指向页面头部早已声明的中文订阅源',
  },
  {
    date: '2026-09-01',
    en: 'New: format comparison pages. GGUF vs AWQ, GGUF vs EXL2 and four more, each comparing hardware support, runtime and adoption — and then listing the models that publish weights in both formats, where the two rows describe the same model and the comparison stops being editorial. Where no model ships both, the page says so rather than implying otherwise',
    zh: '新增：格式对比页。GGUF 与 AWQ、GGUF 与 EXL2 等六组，对比硬件支持、运行时与采用率，并列出同时发布两种格式权重的模型 —— 此时两行描述的是同一个模型，对比不再只是编辑判断。若没有模型同时提供两种格式，页面会如实说明，而不是含糊带过',
  },
  {
    date: '2026-09-01',
    en: 'The calculator answers instead of listing. Its hardware panel showed 43 bars, almost all green — a lot of ink for very little answer. It now leads with the fact you came for ("fits comfortably on 16 of 43 cards — smallest is the Instinct MI100 32G"), gives a verdict for your own card if you have set one, and keeps the full list one click away. The 79-model dropdowns in all three tools are grouped by size instead of listed in data-entry order',
    zh: '计算器改为给结论，而不是罗列。硬件面板此前平铺 43 根柱子且大多为绿色 —— 占了大量篇幅却几乎没有回答问题。现在它先给出你真正想要的事实（"43 张卡中 16 张可从容运行 —— 最小的是 Instinct MI100 32G"），如果你设置了自己的显卡还会单独给出裁决，完整列表则收在一次点击之后。三个工具里 79 项的模型下拉也改为按尺寸分组，不再按录入顺序排列',
  },
  {
    date: '2026-09-01',
    en: 'New: a page per GPU. All 43 cards in the database now have one — "RTX 4060 Ti 16G — what LLMs can it run?" answers with 51 of the 79 indexed models, each at the best quant level that still leaves headroom at 4K context, grouped by size. The data always existed; it had only ever been a filter parameter, never a page. 88 new pages across both languages',
    zh: '新增：每张显卡一个页面。数据库中全部 43 张卡都已覆盖 —— "RTX 4060 Ti 16G 能跑哪些大模型？"给出 79 个索引模型中的 51 个，各自取 4K 上下文下仍留有余量的最佳量化档位，并按尺寸分组。这些数据一直都在，只是此前仅作为筛选参数存在，从未成为页面。中英合计新增 88 个页面',
  },
  {
    date: '2026-09-01',
    en: 'The four tool pages now explain themselves. Each carried a single heading and no body text — a bare widget with nothing to calibrate against. They now document how the VRAM estimate is derived, why context length dominates it, where the CLI identifiers come from, and why some commands show a placeholder, plus a FAQ on each, in both languages',
    zh: '四个工具页现在会自我说明。此前每页只有一个标题、没有任何正文 —— 一个孤立的交互控件，读者无从校准。现在它们分别说明显存估算如何得出、为何上下文长度主导结果、CLI 命令里的标识符从哪来、以及为什么有些命令是占位符，并各配一组常见问题，中英双语',
  },
  {
    date: '2026-09-01',
    en: 'The inference speed chart is readable again: 13 of its 18 bars were all labelled "RTX 4090", so nothing on screen said which model each one measured. Every bar now names its model and hardware, and a key explains what the colours mean (they encode the framework, which was never stated). Tap targets on phones meet the 44px minimum',
    zh: '推理速度图恢复可读：18 根柱子里有 13 根标签都是 "RTX 4090"，屏幕上没有任何信息表明每根对应哪个模型。现在每根柱子都标注模型与硬件，并新增图例说明颜色含义（颜色一直代表推理框架，但此前从未说明）。手机端点击目标达到 44px 下限',
  },
  {
    date: '2026-09-01',
    en: 'The homepage quality figure now names the level it describes: 97.1% retained at Q4_K_M, median across all 79 models, with the 1.4–5.2% spread shown beside it. The old "98.4% avg accuracy" averaged whichever quant level happened to be each model\'s best, so it moved whenever a level was added to the data. The Chinese benchmarks table is also fully translated — its notes column had been English-only',
    zh: '首页的质量数字现在会说明自己描述的是哪一档：Q4_K_M 下保留 97.1%，取全部 79 个模型的中位数，并在旁标注 1.4–5.2% 的区间。旧的"98.4% 平均精度"是对每个模型各自最好的那一档求平均，因此往数据里补一个档位就会让它变动。中文版基准表格也已完整翻译 —— 此前备注列整列是英文',
  },
  {
    date: '2026-09-01',
    en: 'The model index is now in the HTML. /quant-hub/ was rendered entirely in the browser, so its static page carried no headings and none of the 79 model names — the site\'s most valuable page was blank to search engines and to anyone without JavaScript. It now ships all 79 cards and filters on top of them',
    zh: '模型索引进入 HTML。此前 /quant-hub/ 完全由浏览器渲染，静态页面里没有任何标题、也没有 79 个模型名 —— 全站最核心的页面对搜索引擎和无 JavaScript 环境等于空白。现在 79 张卡片直接写入 HTML，筛选在其之上叠加',
  },
  {
    date: '2026-09-01',
    en: 'VRAM calculator no longer answers a question you did not ask: with no model selected it used to fall through to a generic 7B and print 4.98 GB plus a green verdict on all 43 GPUs. Chinese readers get their own RSS feed at /zh/feed.xml, every page now advertises its feed, and /rss.xml resolves instead of 404ing',
    zh: '显存计算器不再回答你没问的问题：此前未选模型时会回落到通用 7B，给出 4.98 GB 并对全部 43 张显卡打绿灯。中文读者现在有独立的 /zh/feed.xml 订阅源，每个页面都声明了自己的 feed，/rss.xml 也不再 404',
  },
  {
    date: '2026-09-01',
    en: 'Homepage paints without waiting for JavaScript: the headline was being shipped as opacity:0 and only became visible after the bundle loaded, which put real-user LCP at P75 3.1s on a prerendered site. Entrance animation is now pure CSS and framer-motion is gone — 33 kB less JavaScript on first load',
    zh: '首页无需等待 JavaScript 即可绘制：此前标题以 opacity:0 发出，要等 bundle 加载后才可见，导致预渲染站点的真实用户 LCP P75 达 3.1 秒。入场动画改为纯 CSS，framer-motion 已移除 —— 首屏 JavaScript 减少 33 kB',
  },
  {
    date: '2026-08-23',
    en: 'Format surfaces now agree with the index: the homepage badges, the "formats tracked" stat and the Hub filters all derive from the formats an indexed model actually ships (4). HQQ stays in the format explainer as reference, but no longer advertises a browse path with no results',
    zh: '格式相关的展示与索引对齐：首页徽章、"格式追踪"统计与 Hub 筛选均改为从实际有模型的格式推导（4 种）。HQQ 仍保留在格式科普中作为参考，但不再引导到没有结果的浏览路径',
  },
  {
    date: '2026-08-23',
    en: 'Format wizard: quant levels are now per-format — choosing "easiest setup" used to print EXL2 · Q4_K_M and AWQ · Q4_K_M, levels that exist in neither format. The runtime column also follows the format, so an AMD reader no longer sees EXL2 recommended with a ROCm runtime next to the reason explaining EXL2 cannot run on ROCm',
    zh: '格式向导：量化档位改为按格式区分 —— 此前选择"最易上手"会给出 EXL2 · Q4_K_M、AWQ · Q4_K_M 这类两种格式里都不存在的档位。框架推荐也改为跟随格式，AMD 读者不会再看到 EXL2 配 ROCm 运行时，却在旁边读到"EXL2 无法在 ROCm 上运行"',
  },
  {
    date: '2026-08-23',
    en: 'Homepage layout: the stats bar had been painted on top of the job-path cards since those were introduced, covering all three descriptions, and the hero was clipped on phones — the VRAM calculator button and format badges were partly unreachable. Navbar no longer overflows at tablet width',
    zh: '首页排版：统计条自 job path 卡片引入后就一直盖在卡片上，遮住全部三行说明；Hero 在手机上被裁切，显存计算器按钮与格式徽章有一部分点不到。导航栏在平板宽度下不再溢出',
  },
  {
    date: '2026-08-20',
    en: 'CLI generator now emits commands that actually run: the real GGUF repo and filename instead of a placeholder, `ollama run hf.co/…` instead of a tag that 404s, and a repo id for vLLM instead of the model\'s display name. llama.cpp build flags updated to the GGML_* names (the old LLAMA_* ones are ignored, giving a silent CPU-only build)',
    zh: 'CLI 生成器现在给出真能跑的命令：用真实 GGUF 仓库与文件名替代占位符，Ollama 改用 `ollama run hf.co/…`（原先生成的 tag 会 404），vLLM 传仓库 id 而非模型展示名。llama.cpp 编译参数改为 GGML_* 新命名（旧的 LLAMA_* 会被忽略，静默编出纯 CPU 版本）',
  },
  {
    date: '2026-08-20',
    en: 'VRAM calculator: forward mode now uses each model\'s own measured bits-per-weight instead of the generic per-level table, matching what reverse mode always did. GPT-OSS 20B at Q8_0 was overstated by 67% (21.1GB → 12.7GB). EXL2 3.5bpw is selectable again',
    zh: '显存计算器：正向模式改用模型自身实测 bpw，而非通用档位表（反向模式一直如此）。GPT-OSS 20B 的 Q8_0 此前被高估 67%（21.1GB → 12.7GB）。EXL2 3.5bpw 档位恢复可选',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition fixes: every /zh page now declares Chinese in the page itself, the 23 guide links on /zh/cookbook no longer send readers to the English site, and the structured data on 102 Chinese pages describes the Chinese page rather than the English one',
    zh: '中文站修正：/zh 页面的 HTML 现在自身声明 zh-Hans；/zh/cookbook 上 23 个指南链接不再把读者弹回英文站；102 个中文页面的结构化数据改为描述中文页本身',
  },
  {
    date: '2026-08-18',
    en: 'Chinese edition is now indexable: /zh/** mirrors all 113 pages with hreflang pairing, and the Chinese text is baked into the static HTML rather than swapped in after load',
    zh: '中文站现已可被索引：/zh/** 镜像全部 113 个页面并配对 hreflang，中文文本直接写入静态 HTML，而非加载后再替换',
  },
  {
    date: '2026-08-08',
    en: 'Model index +4 → 79: Qwen3-VL 8B / 30B-A3B, Magistral Small 1.2, Seed-OSS 36B — picked for constrained hardware (multimodal on a 12GB card, small-active MoE for unified memory, 512K context at dual-GPU size). Qwen2-VL 7B marked superseded',
    zh: '模型索引 +4 → 79：Qwen3-VL 8B / 30B-A3B、Magistral Small 1.2、Seed-OSS 36B —— 面向受限硬件挑选（12GB 卡上的多模态、适合统一内存的小激活 MoE、双卡尺寸的 512K 上下文）。Qwen2-VL 7B 标记为过时',
  },
  {
    date: '2026-08-08',
    en: 'New cookbook: running GPT-OSS 20B/120B locally without re-quantizing (23 guides). VRAM calculator now offers MXFP4 — picking Q4_K_M for GPT-OSS overstated weights by ~14%',
    zh: '新增 Cookbook：本地运行 GPT-OSS 20B/120B 且不重新量化（共 23 篇）。显存计算器新增 MXFP4 档 —— 此前给 GPT-OSS 选 Q4_K_M 会把权重高估约 14%',
  },
  {
    date: '2026-08-07',
    en: 'Model index +4 → 75: GPT-OSS 20B/120B (native MXFP4), GLM-4.5-Air 106B-A12B, Devstral Small 1.1 — MoE-heavy batch for 16GB cards and unified-memory Macs',
    zh: '模型索引 +4 → 75：GPT-OSS 20B/120B（原生 MXFP4）、GLM-4.5-Air 106B-A12B、Devstral Small 1.1 —— 面向 16GB 显卡与统一内存 Mac 的 MoE 批次',
  },
  {
    date: '2026-07-22',
    en: 'Polish: re-rendered og.png (71+ models), all 22 cookbook guides have verified stack banners',
    zh: '打磨：重渲 og.png（71+ 模型文案），全部 22 篇 Cookbook 已加验证技术栈条',
  },
  {
    date: '2026-07-22',
    en: 'Cadence pack: +4 models (Gemma 3 27B, R1-Llama-8B, Phi-4, Qwen3 1.7B), superseded tags, measured/estimated labels, Hub “recent”, weekly updates, RSS, cookbook verified stack (71 models)',
    zh: '保鲜组合：+4 模型（Gemma 3 27B、R1-Llama-8B、Phi-4、Qwen3 1.7B）、过时标注、实测/估算、Hub「最近新增」、本周更新、RSS、Cookbook 验证栈（共 71 个）',
  },
  {
    date: '2026-06-26',
    en: 'UX for real traffic: job paths, mobile GPU profile, OG/favicon, honest format heat, feedback email',
    zh: '面向真实访问：任务入口、移动端 GPU 档案、OG/图标、格式热度诚实标注、反馈邮箱',
  },
  {
    date: '2026-06-26',
    en: 'Model index +4: Qwen3 4B, Qwen3-Coder 30B-A3B, Mistral Large 3, GLM-4-9B (67 total)',
    zh: '模型库 +4：Qwen3 4B、Qwen3-Coder 30B-A3B、Mistral Large 3、GLM-4-9B（共 67 个）',
  },
  {
    date: '2026-06-26',
    en: 'QA fixes: HF stats merge on failure, ≤3B filter, CLI/VRAM tool bugs, i18n polish',
    zh: 'QA 修复：HF 统计合并、≤3B 筛选、CLI/VRAM 工具 bug、i18n 优化',
  },
  {
    date: '2026-06-26',
    en: 'Model index +5: Qwen3 32B, 30B-A3B MoE, 235B-A22B, DeepSeek-V3, DeepSeek-R1 (63 total)',
    zh: '模型库 +5：Qwen3 32B、30B-A3B MoE、235B-A22B、DeepSeek-V3、DeepSeek-R1（共 63 个）',
  },
  {
    date: '2026-06-26',
    en: 'Model index +7: Qwen3 8B/14B, Gemma 3 4B/12B, Llama 4 Scout/Maverick, Llama 3.1 405B (58 total)',
    zh: '模型库 +7：Qwen3 8B/14B、Gemma 3 4B/12B、Llama 4 Scout/Maverick、Llama 3.1 405B（共 58 个）',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook TOC scroll highlight, code block copy, Quant Hub Markdown export',
    zh: 'Cookbook 目录滚动高亮、代码块一键复制、Quant Hub Markdown 导出',
  },
  {
    date: '2026-06-25',
    en: 'Cookbook reading progress bar, model HF link copy, Quant Hub shareable filter URLs',
    zh: 'Cookbook 阅读进度条、模型 HF 链接复制、Quant Hub 可分享筛选 URL',
  },
  {
    date: '2026-06-25',
    en: 'Breadcrumb nav + JSON-LD, cookbook article TOC, Quant Hub GPU quick-filter chips',
    zh: '面包屑导航 + JSON-LD、Cookbook 文章目录锚点、Quant Hub GPU 一键筛选芯片',
  },
  {
    date: '2026-06-25',
    en: 'Related cookbook guides, similar-model cards on detail pages, hero latest-update badge',
    zh: 'Cookbook 相关指南推荐、模型详情页相似模型卡片、首页 Hero 最新更新徽章',
  },
  {
    date: '2026-06-25',
    en: 'Homepage explore strip, 404 page, multi-model benchmarks (Qwen 7B/32B, DeepSeek-R1 14B), llms.txt for AI crawlers',
    zh: '首页探索区块、404 页面、多模型基准测试（Qwen 7B/32B、DeepSeek-R1 14B）、AI 爬虫 llms.txt',
  },
  {
    date: '2026-06-24',
    en: 'Added About page (/about) — maintainer story, update cadence, contribution guide',
    zh: '新增关于页面（/about）— 维护者介绍、更新频率、参与贡献方式',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: default to all 51 models visible; scale stats bar; clearer GPU filter UX',
    zh: 'Quant Hub：默认显示全部 51 个模型；规模统计条；GPU 筛选提示更清晰',
  },
  {
    date: '2026-06-24',
    en: 'SEO: canonical URLs, JSON-LD, per-page metadata, Google/Bing verification env vars',
    zh: 'SEO：canonical URL、JSON-LD 结构化数据、页面级 metadata、Google/Bing 验证环境变量',
  },
  {
    date: '2026-06-24',
    en: 'Quant Hub: show-all toggle when GPU profile active; Cookbook +7 guides (8GB GPU, WSL2, Docker GPU, Nginx, AMD ROCm)',
    zh: 'Quant Hub：GPU 档案筛选时可一键显示全部模型；Cookbook 新增 7 篇（8GB 显卡、WSL2、Docker GPU、Nginx、AMD ROCm）',
  },
  {
    date: '2026-06-24',
    en: 'Privacy Policy + Plausible analytics, cookbook standalone pages (/cookbook/[slug]), model index expanded to 51',
    zh: '隐私政策 + Plausible 分析、Cookbook 独立文章页（/cookbook/[slug]）、模型库扩展至 51 个',
  },
  {
    date: '2026-06-24',
    en: 'Added Terms & Disclaimer page (/legal) with trademark notice and liability disclaimer',
    zh: '新增使用条款与免责声明页面（/legal），含商标声明和责任限制',
  },
  {
    date: '2026-06-24',
    en: 'Phase 3: HF live stats pipeline, model A vs B compare tool, cookbook expanded to 15 guides',
    zh: 'Phase 3：HF 实时数据管道、模型 A vs B 对比工具、Cookbook 扩展至 15 篇',
  },
  {
    date: '2026-06-24',
    en: 'Expanded model index to 30+ entries; added format wizard, hardware profile, ExLlamaV2 CLI, SEO (sitemap/OG), data transparency',
    zh: '模型库扩展至 30+；新增格式向导、硬件档案、ExLlamaV2 CLI、SEO（sitemap/OG）、数据透明度改进',
  },
  {
    date: '2026-06-24',
    en: 'Model detail pages, GPU reverse lookup, shareable VRAM calculator URLs, real homepage stats',
    zh: '模型详情页、GPU 反向查询、可分享显存计算器 URL、真实首页统计',
  },
  {
    date: '2025-06-10',
    en: 'Initial launch: Quant Hub, VRAM calculator, CLI generator, benchmarks, cookbook',
    zh: '首次上线：模型库、显存计算器、CLI 生成器、基准测试、部署指南',
  },
];