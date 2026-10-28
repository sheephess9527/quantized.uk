/**
 * Error lookup (`/errors/`): the messages people hit when a local model will
 * not load, what each one means, and what fixes it.
 *
 * Rules for an entry:
 * - `message` is the text as the program prints it, copied from the source
 *   file linked in `sources` (read on `checkedAt`), with run-time values shown
 *   as `<…>`. Nothing is quoted from memory or from forum posts; a message we
 *   could not find in source is not listed.
 * - A fix names a real flag, variable or command, from the project's own docs
 *   or source, or a check against this site's own calculator.
 * - Everything a reader sees is `{ en, zh }`.
 */

export type ErrorRuntime = 'llama.cpp' | 'Ollama' | 'vLLM' | 'PyTorch' | 'ROCm' | 'Docker' | 'huggingface_hub';

export interface Bi { en: string; zh: string }

export interface RuntimeErrorEntry {
  /** URL slug under /errors/. Dot-free (next/link strips the slash after a dotted segment). */
  id: string;
  runtime: ErrorRuntime;
  /** Where it shows up — drives the index grouping and the hardware note. */
  hardware: 'nvidia' | 'amd' | 'apple' | 'any';
  /** As printed; `<…>` marks values that change from run to run. */
  message: string;
  /** The entry is a setting people search for, not a printed error. */
  setting?: boolean;
  /** Short page title (the `<title>` adds the site name when it fits). */
  title: Bi;
  /** One or two sentences: what it means. Also the meta description, so 100–160 width. */
  summary: Bi;
  causes: Bi[];
  fixes: Bi[];
  /** Offer the VRAM calculator as the first check — for memory errors. */
  calc?: boolean;
  guides?: string[];
  seeAlso?: string[];
  sources: { label: string; url: string }[];
  checkedAt: string;
}

const LLAMA = 'https://github.com/ggml-org/llama.cpp/blob/master/';
const OLLAMA = 'https://github.com/ollama/ollama/blob/main/';
const CHECKED = '2026-10-26';
const HF_HUB = 'https://github.com/huggingface/huggingface_hub/blob/main/';

export const errorsIndexSummary: Bi = {
  en: 'The messages llama.cpp, Ollama, vLLM, ROCm and Docker print when a model will not load or will not use the GPU — each quoted from the project\'s own source, with what it means and what fixes it.',
  zh: 'llama.cpp、Ollama、vLLM、ROCm 和 Docker 在模型加载失败或没用上显卡时打印的报错 —— 每条都从项目源码里逐字核对，并说明含义和解决办法。',
};

export const runtimeErrors: RuntimeErrorEntry[] = [
  // ── Out of memory ──────────────────────────────────────────────────────────
  {
    id: 'cuda-out-of-memory',
    runtime: 'llama.cpp',
    hardware: 'nvidia',
    message: 'CUDA error: out of memory',
    title: { en: 'CUDA error: out of memory (llama.cpp)', zh: 'CUDA error: out of memory 怎么解决' },
    summary: {
      en: 'llama.cpp asked the card for memory and none was left: the weights, the KV cache for your context and the compute buffers add up to more than the free VRAM.',
      zh: 'llama.cpp 向显卡申请显存时已经没有剩余：权重、你设定的上下文所需的 KV 缓存和计算缓冲区加起来，超过了显卡的空闲显存。',
    },
    causes: [
      { en: 'The model at this quant level, at this context, does not fit the card. Context is the part people forget: the KV cache grows with every token of `-c`.', zh: '这个量化档位加上这个上下文长度，显卡本来就装不下。最容易被忽略的是上下文：KV 缓存会随 `-c` 的每个 token 增长。' },
      { en: 'You passed `-ngl all` (or a large `-ngl`) or a large `-c`. llama.cpp\'s automatic fitting (`--fit`, on by default) only adjusts arguments you did not set, so a forced value can push it over.', zh: '你传了 `-ngl all`（或很大的 `-ngl`）或很大的 `-c`。llama.cpp 默认开启的自动适配（`--fit`）只会调整你没设定的参数，强制指定的值可能让它超出显存。' },
      { en: 'Something else holds VRAM: another model server, a game, the desktop on the same card. `nvidia-smi` lists every process and what it uses.', zh: '别的程序占着显存：另一个模型服务、游戏、或同一张卡上的桌面。`nvidia-smi` 会列出每个进程占用多少。' },
      { en: 'On AMD builds the same failure prints `ROCm error: out of memory` — the cause and fixes are the same.', zh: 'AMD（HIP）版本出现同样的问题时打印的是 `ROCm error: out of memory`，原因和解决办法相同。' },
    ],
    fixes: [
      { en: 'Check the size first: put the model, level and context into the VRAM calculator with your card. If it is red, no flag will make it fit — pick a smaller level or a shorter context.', zh: '先核对大小：把模型、量化档位、上下文和你的显卡填进显存计算器。如果是红色，什么参数都没法让它装下 —— 换更小的档位或更短的上下文。' },
      { en: 'Shorten the context: `-c 8192` instead of the model\'s full window. Omitting `-c` starts from the context the model was trained for.', zh: '缩短上下文：用 `-c 8192`，不要开满模型的整个窗口。不加 `-c` 时会从模型训练时的上下文长度开始。' },
      { en: 'Quantize the KV cache: `-ctk q8_0 -ctv q8_0` roughly halves it, with a very small quality cost.', zh: '量化 KV 缓存：`-ctk q8_0 -ctv q8_0` 大约把缓存减半，质量损失很小。' },
      { en: 'Offload fewer layers: drop `-ngl` (or set a number below the layer count) so the rest runs from system RAM. It loads, but generation slows sharply. For MoE models `--n-cpu-moe N` moves only expert weights and costs less speed.', zh: '少放几层到显卡：去掉 `-ngl`（或设成小于总层数的值），剩下的层放在内存里跑。能加载，但生成速度会明显下降。MoE 模型用 `--n-cpu-moe N` 只把专家权重放到 CPU，速度损失更小。' },
    ],
    calc: true,
    guides: ['8gb-gpu-starter-guide', 'llamacpp-windows-cuda', 'dual-gpu-70b-llamacpp'],
    seeAlso: ['unable-to-allocate-buffer', 'failed-to-allocate-kv-cache'],
    sources: [{ label: 'llama.cpp ggml/src/ggml-cuda/ggml-cuda.cu (ggml_cuda_error, ggml_backend_cuda_buffer_type_alloc_buffer)', url: `${LLAMA}ggml/src/ggml-cuda/ggml-cuda.cu` }],
    checkedAt: CHECKED,
  },
  {
    id: 'unable-to-allocate-buffer',
    runtime: 'llama.cpp',
    hardware: 'any',
    message: 'unable to allocate CUDA0 buffer',
    title: { en: 'unable to allocate CUDA0 buffer (llama.cpp)', zh: 'unable to allocate CUDA0 buffer 报错' },
    summary: {
      en: 'llama.cpp could not reserve room for the model\'s weights on that device. The device name follows your backend: CUDA0, ROCm0, Vulkan0 or Metal.',
      zh: 'llama.cpp 加载模型时，没能在这块设备上为权重分配到空间。设备名随后端不同而变化：CUDA0、ROCm0、Vulkan0 或 Metal。',
    },
    causes: [
      { en: 'The weights alone are larger than the free memory on that device — before any context is added.', zh: '仅权重本身就超过了这块设备的空闲显存 —— 还没算上下文。' },
      { en: 'Too many layers were forced onto the card with `-ngl`.', zh: '用 `-ngl` 强制放到显卡上的层太多。' },
      { en: 'Another process already holds part of the card.', zh: '其他进程已经占用了显卡的一部分。' },
    ],
    fixes: [
      { en: 'Compare the file size with your card in the VRAM calculator; the weights are roughly `params × bits ÷ 8`.', zh: '在显存计算器里把文件大小和你的显卡对比；权重大约是 `参数量 × 比特数 ÷ 8`。' },
      { en: 'Download a smaller level of the same model, or let llama.cpp choose the layer split by not passing `-ngl`.', zh: '下载同一模型更小的量化档位，或者不传 `-ngl`，让 llama.cpp 自己决定放多少层到显卡。' },
      { en: 'Free the card: stop other servers (`nvidia-smi` on NVIDIA, `rocm-smi` on AMD shows what is using it).', zh: '腾出显卡：停掉其他服务（NVIDIA 用 `nvidia-smi`，AMD 用 `rocm-smi` 查看谁在占用）。' },
    ],
    calc: true,
    guides: ['12gb-gpu-what-to-run', 'amd-rocm-llamacpp'],
    seeAlso: ['cuda-out-of-memory', 'metal-failed-to-allocate-buffer'],
    sources: [{ label: 'llama.cpp src/llama-model.cpp (load_tensors)', url: `${LLAMA}src/llama-model.cpp` }],
    checkedAt: CHECKED,
  },
  {
    id: 'failed-to-allocate-kv-cache',
    runtime: 'llama.cpp',
    hardware: 'any',
    message: 'failed to allocate buffer for kv cache',
    title: { en: 'failed to allocate buffer for kv cache', zh: 'failed to allocate buffer for kv cache 报错' },
    summary: {
      en: 'The weights loaded, but there was no room left for the KV cache at the context you asked for. It is usually followed by "failed to initialize the context".',
      zh: '权重已经加载成功，但按你要求的上下文长度，已经没有空间放 KV 缓存。后面通常还会跟一行 "failed to initialize the context"。',
    },
    causes: [
      { en: 'The context (`-c`, or Ollama\'s `num_ctx`) is too long for what the weights left free.', zh: '上下文（`-c`，或 Ollama 的 `num_ctx`）太长，权重剩下的显存装不下。' },
    ],
    fixes: [
      { en: 'Lower `-c`. The context-length page lists how far common models go on common cards, and the calculator finds the longest context for any pair.', zh: '调低 `-c`。上下文长度页列出了常见显卡上常见模型能开多长；任意组合都可以用计算器算出最长上下文。' },
      { en: 'Quantize the cache with `-ctk q8_0 -ctv q8_0` (Ollama: `OLLAMA_KV_CACHE_TYPE=q8_0`) to fit about twice the context.', zh: '用 `-ctk q8_0 -ctv q8_0` 量化缓存（Ollama 用 `OLLAMA_KV_CACHE_TYPE=q8_0`），大约能多装一倍上下文。' },
      { en: 'Or use a smaller quant level, which leaves more room for the cache.', zh: '或者换更小的量化档位，给缓存留出更多空间。' },
    ],
    calc: true,
    seeAlso: ['cuda-out-of-memory'],
    sources: [
      { label: 'llama.cpp src/llama-kv-cache.cpp', url: `${LLAMA}src/llama-kv-cache.cpp` },
      { label: 'llama.cpp src/llama-context.cpp', url: `${LLAMA}src/llama-context.cpp` },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'metal-failed-to-allocate-buffer',
    runtime: 'llama.cpp',
    hardware: 'apple',
    message: 'ggml_metal_buffer_init: error: failed to allocate buffer, size = <n> MiB',
    title: { en: 'Metal: failed to allocate buffer on a Mac', zh: 'Mac 上 Metal failed to allocate buffer' },
    summary: {
      en: 'On a Mac, Metal would not give llama.cpp a GPU buffer that large. macOS lets the GPU use only part of unified memory, by default about three quarters.',
      zh: '在 Mac 上，llama.cpp 没能从 Metal 拿到这么大的 GPU 缓冲区。macOS 默认只允许 GPU 使用统一内存的一部分 —— 大多数机器上约为四分之三。',
    },
    causes: [
      { en: 'The model plus context is larger than the GPU\'s share of unified memory, even though the machine\'s total RAM looks big enough.', zh: '模型加上下文超过了 GPU 能用的那部分统一内存，尽管整机内存看起来够。' },
      { en: 'Other apps already use a lot of memory, so less is free for the GPU.', zh: '其他应用已经占了很多内存，留给 GPU 的更少了。' },
    ],
    fixes: [
      { en: 'Size it against the usable share, not the number on the box: the calculator judges Macs at about 75% of their memory.', zh: '按可用的那部分来算，而不是按机器标称内存：计算器对 Mac 按约 75% 的内存来判断。' },
      { en: 'Pick a smaller level or a shorter context; close memory-hungry apps.', zh: '换更小的档位或更短的上下文；关掉占内存多的应用。' },
      { en: 'Advanced: `sudo sysctl iogpu.wired_limit_mb=<MB>` raises the GPU\'s limit until the next reboot. Leave several GB for macOS itself, or the whole machine starts swapping.', zh: '进阶：`sudo sysctl iogpu.wired_limit_mb=<MB>` 可以提高 GPU 的上限，重启后失效。要给 macOS 自己留出几 GB，否则整台机器会开始频繁换页。' },
    ],
    calc: true,
    guides: ['mac-ollama-setup', 'mac-m3-pro-limits', 'm1-8gb-ollama-limits'],
    seeAlso: ['unable-to-allocate-buffer'],
    sources: [{ label: 'llama.cpp ggml/src/ggml-metal/ggml-metal-device.m (ggml_metal_buffer_init)', url: `${LLAMA}ggml/src/ggml-metal/ggml-metal-device.m` }],
    checkedAt: CHECKED,
  },
  {
    id: 'torch-cuda-out-of-memory',
    runtime: 'vLLM',
    hardware: 'nvidia',
    message: 'CUDA out of memory. Tried to allocate <n> GiB. GPU 0 has a total capacity of <n> GiB of which <n> MiB is free.',
    title: { en: 'CUDA out of memory. Tried to allocate (vLLM)', zh: 'CUDA out of memory. Tried to allocate 报错' },
    summary: {
      en: 'PyTorch, which vLLM runs on, could not allocate the next tensor. In vLLM it usually means the model plus its KV cache does not fit at your settings.',
      zh: 'vLLM 和 Transformers 底层的 PyTorch 没能分配下一个张量。在 vLLM 里，这通常意味着按你给的设置，模型加上预留的 KV 缓存装不下。',
    },
    causes: [
      { en: 'The weights at this format do not fit, or leave too little for vLLM\'s KV cache and CUDA graphs.', zh: '这个格式的权重装不下，或者装下后留给 vLLM 的 KV 缓存和 CUDA graph 的空间太少。' },
      { en: '`--max-model-len` is long, so the minimum cache vLLM needs is large.', zh: '`--max-model-len` 太长，vLLM 需要的最小缓存也就很大。' },
      { en: 'Another process holds part of the card.', zh: '其他进程占用了部分显存。' },
    ],
    fixes: [
      { en: 'Shorten `--max-model-len` first; raise `--gpu-memory-utilization` only after that, and not past what the card can actually give.', zh: '先缩短 `--max-model-len`；之后再考虑调高 `--gpu-memory-utilization`，且不要超过显卡实际能给的量。' },
      { en: 'Use a 4-bit AWQ or GPTQ build of the model; check it in the calculator against your card.', zh: '换成模型的 4 比特 AWQ 或 GPTQ 版本；先在计算器里对照你的显卡核对。' },
      { en: '`--enforce-eager` skips CUDA graph capture, which frees some memory at a cost in speed.', zh: '`--enforce-eager` 跳过 CUDA graph 捕获，能省出一些显存，但速度会下降。' },
    ],
    calc: true,
    guides: ['vllm-awq-production', 'rtx4090-vllm-api'],
    seeAlso: ['vllm-free-memory-less-than-utilization'],
    sources: [{ label: 'PyTorch c10/cuda/CUDACachingAllocator.cpp', url: 'https://github.com/pytorch/pytorch/blob/main/c10/cuda/CUDACachingAllocator.cpp' }],
    checkedAt: CHECKED,
  },
  {
    id: 'vllm-free-memory-less-than-utilization',
    runtime: 'vLLM',
    hardware: 'nvidia',
    message: 'Free memory on device <dev> (<free>/<total> GiB) on startup is less than desired GPU memory utilization (<u>, <n> GiB). Decrease GPU memory utilization or reduce GPU memory used by other processes.',
    title: { en: 'vLLM: free memory less than GPU memory utilization', zh: 'vLLM 启动报 Free memory on device 不足' },
    summary: {
      en: 'vLLM reserves a fixed share of the card at startup (--gpu-memory-utilization, 0.92 in current releases unless you set it). Something else already uses enough of the card that this share is not free.',
      zh: 'vLLM 启动时会预留显卡的固定比例（--gpu-memory-utilization，当前版本不设时为 0.92）。显卡已经被别的东西占用了一部分，这个比例的显存已经不空闲。',
    },
    causes: [
      { en: 'A desktop session, a browser or another model server on the same card.', zh: '同一张卡上有桌面会话、浏览器或另一个模型服务。' },
      { en: 'A previous vLLM process that did not exit cleanly.', zh: '之前的 vLLM 进程没有正常退出。' },
    ],
    fixes: [
      { en: 'Lower the share: `--gpu-memory-utilization 0.85` (this site\'s generated commands use 0.85).', zh: '调低比例：`--gpu-memory-utilization 0.85`（本站生成的命令用的就是 0.85）。' },
      { en: 'Find and stop whatever holds the card with `nvidia-smi`.', zh: '用 `nvidia-smi` 找到占用显卡的进程并停掉。' },
    ],
    guides: ['vllm-awq-production', 'rtx4090-vllm-api'],
    seeAlso: ['torch-cuda-out-of-memory'],
    sources: [{ label: 'vLLM vllm/v1/worker/utils.py (request_memory)', url: 'https://github.com/vllm-project/vllm/blob/main/vllm/v1/worker/utils.py' }],
    checkedAt: CHECKED,
  },

  // ── The file or the model is the problem ─────────────────────────────────
  {
    id: 'unknown-model-architecture',
    runtime: 'llama.cpp',
    hardware: 'any',
    message: "llama_model_load: error loading model: unknown model architecture: '<arch>'",
    title: { en: "llama.cpp: unknown model architecture", zh: 'llama.cpp 报 unknown model architecture' },
    summary: {
      en: 'Your llama.cpp build does not know this model family yet. New architectures reach llama.cpp first, then Ollama and LM Studio when they update.',
      zh: '这个 GGUF 文件所属的模型架构，你用的 llama.cpp 版本还不认识。新架构会先合入 llama.cpp，Ollama 和 LM Studio 要等更新内置的 llama.cpp 后才支持。',
    },
    causes: [
      { en: 'Your llama.cpp (or the app embedding it) is older than the model.', zh: '你的 llama.cpp（或内置它的应用）比这个模型旧。' },
      { en: 'The architecture has not been added to llama.cpp at all yet — the GGUF came from a fork.', zh: 'llama.cpp 主线根本还没加入这个架构 —— 这个 GGUF 来自某个分支版本。' },
    ],
    fixes: [
      { en: 'Update: pull and rebuild llama.cpp, or install the latest Ollama / LM Studio.', zh: '更新：拉取并重新编译 llama.cpp，或安装最新版 Ollama / LM Studio。' },
      { en: 'Check the name in the error against llama.cpp\'s `src/llama-arch.cpp`; if it is not there, no release can load the file yet. This site\'s pending page lists released models still waiting on runtime support.', zh: '把报错里的架构名和 llama.cpp 的 `src/llama-arch.cpp` 对照；如果里面没有，任何正式版本都还加载不了这个文件。本站的待收录页列出了已发布、但还在等运行时支持的模型。' },
    ],
    seeAlso: ['wrong-number-of-tensors', 'ollama-model-incompatible'],
    sources: [
      { label: 'llama.cpp src/llama-model.cpp (llama_model_create)', url: `${LLAMA}src/llama-model.cpp` },
      { label: 'llama.cpp src/llama-arch.cpp', url: `${LLAMA}src/llama-arch.cpp` },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'wrong-number-of-tensors',
    runtime: 'llama.cpp',
    hardware: 'any',
    message: 'done_getting_tensors: wrong number of tensors; expected <n>, got <m>',
    title: { en: 'llama.cpp: wrong number of tensors', zh: 'llama.cpp 报 wrong number of tensors' },
    summary: {
      en: 'The file holds more or fewer tensors than this llama.cpp expects for its architecture — the file and the program disagree about the model\'s layout. A sibling message reads "tensor … has wrong shape".',
      zh: '文件里的张量数量和这个版本的 llama.cpp 对该架构的预期不一致 —— 文件和程序对模型结构的理解不同。类似的报错还有 "tensor … has wrong shape"。',
    },
    causes: [
      { en: 'The GGUF was converted with a newer llama.cpp than the one loading it (new tensors were added to that architecture).', zh: '这个 GGUF 是用比当前更新的 llama.cpp 转换的（该架构新增了张量）。' },
      { en: 'Or the reverse: an old conversion that a newer llama.cpp no longer matches.', zh: '或者反过来：旧的转换文件和新版 llama.cpp 已经对不上。' },
      { en: 'A vision model\'s projector (`mmproj`) file loaded as the main model.', zh: '把视觉模型的投影器（`mmproj`）文件当成主模型加载了。' },
    ],
    fixes: [
      { en: 'Update llama.cpp (or Ollama / LM Studio) first; that fixes the common case.', zh: '先更新 llama.cpp（或 Ollama / LM Studio），常见情况这样就能解决。' },
      { en: 'If it persists, download the file again from a recent conversion, and make sure `-m` points at the model, with `--mmproj` for the projector.', zh: '如果还不行，重新下载近期转换的文件，并确认 `-m` 指向模型本体，投影器用 `--mmproj` 指定。' },
    ],
    seeAlso: ['unknown-model-architecture', 'gguf-invalid-magic'],
    sources: [{ label: 'llama.cpp src/llama-model-loader.cpp', url: `${LLAMA}src/llama-model-loader.cpp` }],
    checkedAt: CHECKED,
  },
  {
    id: 'gguf-invalid-magic',
    runtime: 'llama.cpp',
    hardware: 'any',
    message: "gguf_init_from_reader: invalid magic characters: '<xxxx>', expected 'GGUF'",
    title: { en: "invalid magic characters, expected 'GGUF'", zh: 'invalid magic characters：不是 GGUF 文件' },
    summary: {
      en: 'Every GGUF file starts with the bytes "GGUF" and this one does not. It is usually a web page, a Git LFS pointer or a safetensors file named .gguf.',
      zh: '每个 GGUF 文件都以 "GGUF" 这四个字节开头。这个文件不是，所以它根本不是 GGUF 文件 —— 通常是网页、Git LFS 指针文件，或改名成 .gguf 的 safetensors 文件。',
    },
    causes: [
      { en: 'The download saved Hugging Face\'s HTML page (a `/blob/` link instead of `/resolve/`), or a login page for a gated repo.', zh: '下载保存的是 Hugging Face 的网页（用了 `/blob/` 链接而不是 `/resolve/`），或者是受限仓库的登录页。' },
      { en: '`git clone` without Git LFS left a small text pointer in place of the weights.', zh: '没装 Git LFS 就 `git clone`，权重位置只留下一个很小的文本指针。' },
      { en: 'The file is in another format (safetensors, PyTorch) and needs converting first. A truncated file reports "failed to read magic" instead.', zh: '文件是其他格式（safetensors、PyTorch），需要先转换。文件被截断时报的则是 "failed to read magic"。' },
    ],
    fixes: [
      { en: 'Look at the first bytes: `head -c 4 model.gguf` must print `GGUF`. A tiny file size is the other giveaway.', zh: '看文件开头：`head -c 4 model.gguf` 应该输出 `GGUF`。文件特别小也是一个明显信号。' },
      { en: 'Download with the Hugging Face CLI: `hf download <repo> <file>.gguf --local-dir .`', zh: '用 Hugging Face 命令行下载：`hf download <repo> <file>.gguf --local-dir .`' },
      { en: 'For safetensors, convert with llama.cpp\'s `convert_hf_to_gguf.py` first.', zh: 'safetensors 需要先用 llama.cpp 的 `convert_hf_to_gguf.py` 转换。' },
    ],
    guides: ['quantize-own-model-gguf'],
    seeAlso: ['wrong-number-of-tensors'],
    sources: [{ label: 'llama.cpp ggml/src/gguf.cpp', url: `${LLAMA}ggml/src/gguf.cpp` }],
    checkedAt: CHECKED,
  },

  // ── The GPU is not being used ─────────────────────────────────────────────
  {
    id: 'failed-to-initialize-cuda',
    runtime: 'llama.cpp',
    hardware: 'nvidia',
    message: 'ggml_cuda_init: failed to initialize CUDA: <reason>',
    title: { en: 'ggml_cuda_init: failed to initialize CUDA', zh: 'failed to initialize CUDA：没识别到显卡' },
    summary: {
      en: 'A CUDA build of llama.cpp started but could not talk to any NVIDIA GPU, so it falls back to the CPU. The text after the colon is CUDA\'s own reason.',
      zh: 'CUDA 版本的 llama.cpp 启动了，但连接不上任何 NVIDIA 显卡，于是退回 CPU 运行。冒号后面是 CUDA 自己给出的原因。',
    },
    causes: [
      { en: 'Inside Docker: the container was started without GPU access (`--gpus all`), or the NVIDIA Container Toolkit is missing.', zh: '在 Docker 里：容器启动时没给 GPU 权限（`--gpus all`），或没装 NVIDIA Container Toolkit。' },
      { en: 'The installed driver is older than the CUDA version the binary was built with.', zh: '已安装的驱动比编译这个程序所用的 CUDA 版本旧。' },
      { en: 'In WSL2: a Linux NVIDIA driver was installed inside WSL over the Windows passthrough driver.', zh: '在 WSL2 里：在 WSL 内部装了 Linux 版 NVIDIA 驱动，覆盖了 Windows 的直通驱动。' },
    ],
    fixes: [
      { en: 'Run `nvidia-smi` where llama.cpp runs (host, container or WSL). If it fails there too, fix the driver first.', zh: '在 llama.cpp 运行的环境里（宿主机、容器或 WSL）执行 `nvidia-smi`。如果它也失败，先修好驱动。' },
      { en: 'Update the NVIDIA driver; prebuilt CUDA binaries name the CUDA version they need.', zh: '更新 NVIDIA 驱动；预编译的 CUDA 版本会标明它需要的 CUDA 版本。' },
      { en: 'In WSL2 install only the CUDA toolkit inside Linux (`cuda-toolkit-12-x`), never the `cuda` or `cuda-drivers` packages.', zh: '在 WSL2 里，Linux 内只装 CUDA toolkit（`cuda-toolkit-12-x`），不要装 `cuda` 或 `cuda-drivers` 包。' },
    ],
    guides: ['wsl2-ollama-gpu', 'docker-ollama-gpu', 'llamacpp-windows-cuda'],
    seeAlso: ['docker-could-not-select-device-driver', 'ollama-100-percent-cpu'],
    sources: [{ label: 'llama.cpp ggml/src/ggml-cuda/ggml-cuda.cu (ggml_cuda_init)', url: `${LLAMA}ggml/src/ggml-cuda/ggml-cuda.cu` }],
    checkedAt: CHECKED,
  },
  {
    id: 'docker-could-not-select-device-driver',
    runtime: 'Docker',
    hardware: 'nvidia',
    message: 'could not select device driver "" with capabilities: [[gpu]]',
    title: { en: 'Docker: could not select device driver with [[gpu]]', zh: 'Docker 报 could not select device driver' },
    summary: {
      en: 'Docker was asked for a GPU (--gpus all) but has no GPU driver registered. On NVIDIA it comes from the NVIDIA Container Toolkit, missing or unconfigured.',
      zh: 'Docker 收到了使用 GPU 的请求（--gpus all），但没有注册任何 GPU 设备驱动。在 NVIDIA 上，这个驱动来自 NVIDIA Container Toolkit，它没有安装或没有配置好。',
    },
    causes: [
      { en: 'The NVIDIA Container Toolkit is not installed on the host.', zh: '宿主机上没有安装 NVIDIA Container Toolkit。' },
      { en: 'It is installed, but Docker was not configured to use it or not restarted afterwards.', zh: '装了，但没有配置 Docker 使用它，或配置后没有重启 Docker。' },
      { en: 'The card is AMD: `--gpus` is NVIDIA-only.', zh: '显卡是 AMD 的：`--gpus` 只适用于 NVIDIA。' },
    ],
    fixes: [
      { en: 'Install the NVIDIA Container Toolkit, then `sudo nvidia-ctk runtime configure --runtime=docker` and `sudo systemctl restart docker`.', zh: '安装 NVIDIA Container Toolkit，然后执行 `sudo nvidia-ctk runtime configure --runtime=docker` 和 `sudo systemctl restart docker`。' },
      { en: 'Check with `docker run --rm --gpus all ubuntu nvidia-smi`.', zh: '用 `docker run --rm --gpus all ubuntu nvidia-smi` 验证。' },
      { en: 'On AMD, drop `--gpus` and pass the devices instead: `--device /dev/kfd --device /dev/dri`, with a ROCm image.', zh: 'AMD 显卡去掉 `--gpus`，改为传入设备：`--device /dev/kfd --device /dev/dri`，并使用 ROCm 镜像。' },
    ],
    guides: ['docker-ollama-gpu', 'docker-llm-compose'],
    seeAlso: ['failed-to-initialize-cuda'],
    sources: [{ label: 'Moby daemon/errors.go (incompatibleDeviceRequest)', url: 'https://github.com/moby/moby/blob/master/daemon/errors.go' }],
    checkedAt: CHECKED,
  },
  {
    id: 'ollama-100-percent-cpu',
    runtime: 'Ollama',
    hardware: 'any',
    message: '100% CPU',
    setting: true,
    title: { en: 'Ollama shows 100% CPU instead of the GPU', zh: 'Ollama 显示 100% CPU，没用上显卡' },
    summary: {
      en: 'ollama ps shows where a model is loaded. "100% CPU" means none of it is on the GPU; a split such as "48%/52% CPU/GPU" means it did not fit.',
      zh: '`ollama ps` 会显示已加载模型放在哪里。"100% CPU" 表示完全没有放到显卡上；"48%/52% CPU/GPU" 这样的拆分表示显存装不下，有一部分在内存里运行。',
    },
    causes: [
      { en: 'Ollama found no usable GPU: driver problem, container without GPU access, or an AMD card outside ROCm\'s list.', zh: 'Ollama 没找到可用的显卡：驱动问题、容器没有 GPU 权限，或 AMD 显卡不在 ROCm 支持列表里。' },
      { en: 'A split figure: the model and its context are larger than the card.', zh: '出现拆分比例：模型加上下文比显存大。' },
    ],
    fixes: [
      { en: 'Read the server log for the GPU discovery lines (Ollama\'s troubleshooting doc lists where the log lives on each OS).', zh: '查看服务端日志里的 GPU 检测信息（Ollama 的故障排查文档列出了各系统的日志位置）。' },
      { en: 'For a split, check the size in the calculator and pick a smaller level, or lower `num_ctx`.', zh: '如果是拆分，在计算器里核对大小，换更小的档位，或调低 `num_ctx`。' },
      { en: 'AMD on Linux: an unlisted Radeon may run with `HSA_OVERRIDE_GFX_VERSION` (see that page).', zh: 'Linux 上的 AMD：不在列表里的 Radeon 可以尝试 `HSA_OVERRIDE_GFX_VERSION`（见对应页面）。' },
    ],
    calc: true,
    guides: ['windows-ollama-native', 'wsl2-ollama-gpu', 'mac-ollama-setup'],
    seeAlso: ['hsa-override-gfx-version', 'failed-to-initialize-cuda'],
    sources: [
      { label: 'Ollama docs/faq.mdx', url: `${OLLAMA}docs/faq.mdx` },
      { label: 'Ollama docs/troubleshooting.mdx', url: `${OLLAMA}docs/troubleshooting.mdx` },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'torch-capability-not-compatible',
    runtime: 'PyTorch',
    hardware: 'nvidia',
    message: '<GPU> with CUDA capability sm_<nn> is not compatible with the current PyTorch installation.',
    title: { en: 'CUDA capability sm_120 is not compatible with PyTorch', zh: 'sm_120 is not compatible with PyTorch 报错' },
    summary: {
      en: 'The installed PyTorch was not built for this GPU generation — the usual case is an RTX 50-series card (sm_120) with a PyTorch built for an older CUDA. vLLM and Transformers then fail or fall back.',
      zh: '安装的 PyTorch 没有为这一代显卡编译 —— 最常见的是 RTX 50 系（sm_120）配上了为旧 CUDA 编译的 PyTorch。vLLM 和 Transformers 随后会报错或退回 CPU。',
    },
    causes: [
      { en: 'A PyTorch wheel built for CUDA older than 12.8; Blackwell cards need 12.8 or newer.', zh: 'PyTorch 安装包是为低于 12.8 的 CUDA 编译的；Blackwell 显卡需要 12.8 或更新。' },
    ],
    fixes: [
      { en: 'Install vLLM with `uv pip install vllm --torch-backend=auto`, which picks the PyTorch build that matches your driver.', zh: '用 `uv pip install vllm --torch-backend=auto` 安装 vLLM，它会自动选择和你的驱动匹配的 PyTorch 版本。' },
      { en: 'For PyTorch alone, use the install selector on pytorch.org and choose a CUDA 12.8+ build.', zh: '只装 PyTorch 时，用 pytorch.org 的安装选择器，选 CUDA 12.8 及以上的版本。' },
    ],
    guides: ['rtx5090-32gb-what-to-run', 'vllm-awq-production'],
    sources: [{ label: 'PyTorch torch/cuda/__init__.py (_check_cubins)', url: 'https://github.com/pytorch/pytorch/blob/main/torch/cuda/__init__.py' }],
    checkedAt: CHECKED,
  },

  // ── AMD / ROCm ────────────────────────────────────────────────────────────
  {
    id: 'rocblas-cannot-read-tensilelibrary',
    runtime: 'ROCm',
    hardware: 'amd',
    message: 'rocBLAS error: Cannot read <path>/TensileLibrary.dat: No such file or directory for GPU arch : gfx<nnnn>',
    title: { en: 'rocBLAS error: Cannot read TensileLibrary.dat', zh: 'rocBLAS 报错找不到 TensileLibrary.dat' },
    summary: {
      en: 'rocBLAS ships kernels only for the GPU targets ROCm supports. Your card\'s gfx target, at the end of the line, is not one of them.',
      zh: 'rocBLAS 只为 ROCm 支持的显卡型号附带编译好的计算内核。你的显卡型号（末尾的 gfx 编号）不在其中，所以没有可加载的内核文件。',
    },
    causes: [
      { en: 'Common on consumer Radeons ROCm does not list, such as RDNA2 cards other than gfx1030 (gfx1031, gfx1032 …) and some integrated GPUs.', zh: '常见于 ROCm 不支持的消费级 Radeon，例如 gfx1030 以外的 RDNA2 显卡（gfx1031、gfx1032 等）和部分集成显卡。' },
    ],
    fixes: [
      { en: 'On Linux, tell ROCm to use the nearest supported target: `HSA_OVERRIDE_GFX_VERSION=10.3.0` for RDNA2 (gfx103x), `11.0.0` for RDNA3 (gfx110x). It is a workaround, not support — it usually works within one family.', zh: '在 Linux 上，让 ROCm 使用最接近的受支持型号：RDNA2（gfx103x）用 `HSA_OVERRIDE_GFX_VERSION=10.3.0`，RDNA3（gfx110x）用 `11.0.0`。这是变通办法，不是官方支持 —— 同一代架构内通常可行。' },
      { en: 'Or skip ROCm: llama.cpp\'s Vulkan backend and Ollama\'s Vulkan path run on Radeons ROCm does not list.', zh: '或者不用 ROCm：llama.cpp 的 Vulkan 后端和 Ollama 的 Vulkan 路径可以在 ROCm 不支持的 Radeon 上运行。' },
    ],
    guides: ['amd-rocm-llamacpp'],
    seeAlso: ['hsa-override-gfx-version'],
    sources: [
      { label: 'rocBLAS library/src/tensile_host.cpp', url: 'https://github.com/ROCm/rocBLAS/blob/develop/library/src/tensile_host.cpp' },
      { label: 'Ollama docs/gpu.mdx (Overrides on Linux)', url: `${OLLAMA}docs/gpu.mdx` },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'hsa-override-gfx-version',
    runtime: 'ROCm',
    hardware: 'amd',
    message: 'HSA_OVERRIDE_GFX_VERSION',
    setting: true,
    title: { en: 'HSA_OVERRIDE_GFX_VERSION: ROCm on unlisted Radeons', zh: 'HSA_OVERRIDE_GFX_VERSION 怎么设置' },
    summary: {
      en: 'An environment variable that makes ROCm treat your Radeon as a nearby supported model, so ROCm builds of Ollama and llama.cpp can use a card ROCm does not list. Linux only.',
      zh: '一个环境变量，让 ROCm 把你的 Radeon 当成相近的受支持型号，从而让 ROCm 版的 Ollama 和 llama.cpp 能用上 ROCm 不支持的显卡。仅限 Linux。',
    },
    causes: [
      { en: 'You need it when the card\'s gfx target is missing from ROCm\'s list — the symptom is a rocBLAS "Cannot read TensileLibrary" error, or Ollama falling back to the CPU.', zh: '当显卡的 gfx 型号不在 ROCm 支持列表里时需要它 —— 表现为 rocBLAS 的 "Cannot read TensileLibrary" 报错，或 Ollama 退回 CPU。' },
    ],
    fixes: [
      { en: 'Find your target with `rocminfo | grep gfx`, then set the version of the nearest supported one in `x.y.z` form: `10.3.0` stands for gfx1030, `11.0.0` for gfx1100.', zh: '用 `rocminfo | grep gfx` 查出你的型号，再按 `x.y.z` 格式设置最接近的受支持型号：`10.3.0` 对应 gfx1030，`11.0.0` 对应 gfx1100。' },
      { en: 'Set it for the server, not your shell: for the Ollama service, `sudo systemctl edit ollama` and add `Environment="HSA_OVERRIDE_GFX_VERSION=10.3.0"`, then restart it.', zh: '要设置给服务端，而不是当前终端：Ollama 服务用 `sudo systemctl edit ollama`，加入 `Environment="HSA_OVERRIDE_GFX_VERSION=10.3.0"`，然后重启服务。' },
      { en: 'With two different Radeons, set each one: `HSA_OVERRIDE_GFX_VERSION_0=10.3.0`, `HSA_OVERRIDE_GFX_VERSION_1=11.0.0`.', zh: '两张不同型号的 Radeon 要分别设置：`HSA_OVERRIDE_GFX_VERSION_0=10.3.0`、`HSA_OVERRIDE_GFX_VERSION_1=11.0.0`。' },
      { en: 'On Windows it does not apply: Ollama there uses ROCm on RX 7600–7900 and Vulkan on other Radeons.', zh: 'Windows 上不适用：那里的 Ollama 在 RX 7600–7900 上用 ROCm，其他 Radeon 用 Vulkan。' },
    ],
    guides: ['amd-rocm-llamacpp', 'windows-ollama-native'],
    seeAlso: ['rocblas-cannot-read-tensilelibrary', 'ollama-100-percent-cpu'],
    sources: [{ label: 'Ollama docs/gpu.mdx (Overrides on Linux)', url: `${OLLAMA}docs/gpu.mdx` }],
    checkedAt: CHECKED,
  },

  // ── Ollama ────────────────────────────────────────────────────────────────
  {
    id: 'ollama-model-incompatible',
    runtime: 'Ollama',
    hardware: 'any',
    message: 'this model may be incompatible with your version of Ollama. If you previously pulled this model, try updating it by running `ollama pull <model>`',
    title: { en: 'Ollama: model may be incompatible with your version', zh: 'Ollama 报 model may be incompatible' },
    summary: {
      en: 'Ollama\'s built-in llama.cpp could not load the file: the model is newer than your Ollama, or your copy was pulled long ago and since republished.',
      zh: 'Ollama 内置的 llama.cpp 加载不了这个文件。要么模型比你的 Ollama 新，要么你很久以前拉取的模型后来被重新发布过。',
    },
    causes: [
      { en: 'Ollama is older than the model\'s architecture support.', zh: 'Ollama 版本比该模型架构的支持要旧。' },
      { en: 'An old local copy of a model that has been re-uploaded in a newer format.', zh: '本地是旧副本，而模型已经以新格式重新上传。' },
      { en: 'A GGUF imported by hand that llama.cpp itself cannot load (see the llama.cpp errors in your server log).', zh: '手动导入的 GGUF 本身就无法被 llama.cpp 加载（查看服务端日志里的 llama.cpp 报错）。' },
    ],
    fixes: [
      { en: 'Update Ollama, then run `ollama pull <model>` again.', zh: '更新 Ollama，然后重新执行 `ollama pull <model>`。' },
      { en: 'If you imported the GGUF yourself, find the underlying llama.cpp message in the server log and look it up here.', zh: '如果是自己导入的 GGUF，在服务端日志里找到底层 llama.cpp 的报错，再在本页查找。' },
    ],
    seeAlso: ['ollama-requires-newer-version', 'unknown-model-architecture'],
    sources: [{ label: 'Ollama server/sched.go', url: `${OLLAMA}server/sched.go` }],
    checkedAt: CHECKED,
  },
  {
    id: 'ollama-requires-newer-version',
    runtime: 'Ollama',
    hardware: 'any',
    message: 'model requires ollama version <x.y.z> or newer (current version is v<a.b.c>)',
    title: { en: 'Ollama: model requires a newer Ollama version', zh: 'Ollama 报 model requires ollama version' },
    summary: {
      en: 'The model\'s manifest names a minimum Ollama version and yours is older. The download is fine; Ollama refuses before loading because it cannot run it.',
      zh: '模型清单里声明了最低 Ollama 版本，而你的版本更旧。下载本身没问题；Ollama 知道自己跑不了，所以在加载前就拒绝了。',
    },
    causes: [{ en: 'A new model family, published for a recent Ollama release.', zh: '这是新的模型系列，针对最近的 Ollama 版本发布。' }],
    fixes: [
      { en: 'Update Ollama to the version named in the message or later (`ollama -v` shows yours).', zh: '把 Ollama 更新到报错里写的版本或更新（`ollama -v` 查看当前版本）。' },
      { en: 'On Linux rerun the install script; on Windows and macOS the app updates itself or can be reinstalled from ollama.com.', zh: 'Linux 上重新运行安装脚本；Windows 和 macOS 上应用会自动更新，也可以从 ollama.com 重新安装。' },
    ],
    seeAlso: ['ollama-model-incompatible'],
    sources: [{ label: 'Ollama server/images.go', url: `${OLLAMA}server/images.go` }],
    checkedAt: CHECKED,
  },
  {
    id: 'ollama-model-not-found',
    runtime: 'Ollama',
    hardware: 'any',
    message: 'model "<name>" not found, try pulling it first',
    title: { en: 'Ollama: model not found, try pulling it first', zh: 'Ollama 报 model not found, try pulling it first' },
    summary: {
      en: 'The API was asked for a model this machine does not have. Ollama\'s API never downloads on its own; the name must match a pulled model, tag included.',
      zh: 'API 请求的模型名在这台机器上不存在。Ollama 的 API 不会自动下载；模型名必须和已拉取的模型完全一致，包括标签。',
    },
    causes: [
      { en: 'The model was never pulled on this machine (or in this container).', zh: '这台机器（或这个容器）上从没拉取过这个模型。' },
      { en: 'The tag differs: `qwen3:8b` and `qwen3` are different names.', zh: '标签不同：`qwen3:8b` 和 `qwen3` 是两个不同的名字。' },
      { en: 'The client talks to a different Ollama server than the one you pulled with (another port, host or container).', zh: '客户端连的不是你拉取模型时用的那个 Ollama 服务（不同端口、主机或容器）。' },
    ],
    fixes: [
      { en: '`ollama list` shows exactly what is installed; use that name in the request.', zh: '`ollama list` 会列出已安装模型的准确名称；在请求里用这个名字。' },
      { en: 'Pull it on the server the client uses: `ollama pull <name>`.', zh: '在客户端实际连接的服务上拉取：`ollama pull <name>`。' },
    ],
    seeAlso: ['ollama-pull-manifest-not-found'],
    sources: [{ label: 'Ollama server/routes.go', url: `${OLLAMA}server/routes.go` }],
    checkedAt: CHECKED,
  },
  {
    id: 'ollama-pull-manifest-not-found',
    runtime: 'Ollama',
    hardware: 'any',
    message: 'pull model manifest: file does not exist',
    title: { en: 'Ollama: pull model manifest: file does not exist', zh: 'Ollama 报 pull model manifest: file does not exist' },
    summary: {
      en: 'The registry has no model under that name and tag. It is almost always a typo or a tag that was never published, not a network problem.',
      zh: '仓库里没有这个名字和标签的模型。几乎都是名字拼错，或者这个模型根本没有发布过你写的那个标签，而不是网络或代理的问题。',
    },
    causes: [
      { en: 'A misspelt name, or a size tag that does not exist for that model.', zh: '名字拼错，或者该模型没有这个尺寸标签。' },
      { en: 'A Hugging Face GGUF requested without the `hf.co/` prefix, or with a quant tag the repo does not contain.', zh: '拉取 Hugging Face 上的 GGUF 时没加 `hf.co/` 前缀，或者指定的量化标签仓库里没有。' },
    ],
    fixes: [
      { en: 'Copy the exact name and tag from the model\'s page on ollama.com.', zh: '从 ollama.com 的模型页面复制准确的名称和标签。' },
      { en: 'For Hugging Face: `ollama pull hf.co/<user>/<repo>:<quant>`, with a quant level that file list actually has.', zh: 'Hugging Face 上的模型：`ollama pull hf.co/<user>/<repo>:<quant>`，量化档位必须是文件列表里确实有的。' },
    ],
    seeAlso: ['ollama-model-not-found'],
    sources: [
      { label: 'Ollama server/images.go (PullModel)', url: `${OLLAMA}server/images.go` },
      { label: 'Hugging Face hub-docs docs/hub/ollama.md', url: 'https://github.com/huggingface/hub-docs/blob/main/docs/hub/ollama.md' },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'hf-hub-cannot-locate-file',
    runtime: 'huggingface_hub',
    hardware: 'any',
    message: 'An error happened while trying to locate the file on the Hub and we cannot find the requested files in the local cache. Please check your connection and try again or make sure your Internet connection is on.',
    title: { en: 'hf download: cannot locate the file on the Hub', zh: 'hf download 报 cannot locate the file on the Hub' },
    summary: {
      en: 'huggingface_hub could not reach the Hub and has no cached copy. It is a network failure, not a missing repo, and common from mainland China.',
      zh: 'huggingface_hub 连不上 Hugging Face，本地缓存里也没有这个文件。仓库多半是存在的，是网络没连通 —— 在中国大陆直连时很常见。',
    },
    causes: [
      { en: 'huggingface.co is unreachable from this network: blocked, timing out, or behind a proxy the tool is not using. This is the branch the library takes when the request fails for a reason other than a missing repo, a gated repo or a bad token.', zh: '这个网络访问不了 huggingface.co：被拦截、超时，或者需要代理而工具没有走代理。源码里，只要请求失败的原因不是仓库不存在、需要授权或 token 无效，就会走到这条报错。' },
      { en: 'A gated or private repo is a different message (a 401 or a gated-repo error), so this one is not a token problem.', zh: '需要授权或私有的仓库会报另一种错误（401 或 gated repo），所以这条报错不是 token 的问题。' },
    ],
    fixes: [
      { en: 'Point the library at a mirror: `export HF_ENDPOINT=https://hf-mirror.com` before `hf download`. `HF_ENDPOINT` is huggingface_hub\'s own setting for the Hub address; hf-mirror.com is a third-party mirror, not run by Hugging Face. The Chinese pages of this site\'s command generator already add it.', zh: '把下载地址换成镜像：在 `hf download` 之前执行 `export HF_ENDPOINT=https://hf-mirror.com`。`HF_ENDPOINT` 是 huggingface_hub 自带的 Hub 地址设置；hf-mirror.com 是第三方镜像，不是 Hugging Face 官方运营的。本站中文版的命令生成器已经自动加上了这一行。' },
      { en: '`ollama pull hf.co/…` does not read `HF_ENDPOINT`. Download the GGUF with `hf download` through the mirror, then import it with a Modelfile (`FROM ./file.gguf`) and `ollama create`.', zh: '`ollama pull hf.co/…` 不读 `HF_ENDPOINT`。先经镜像用 `hf download` 下载 GGUF，再写一个 Modelfile（`FROM ./文件名.gguf`）用 `ollama create` 导入。' },
    ],
    seeAlso: ['ollama-pull-manifest-not-found'],
    sources: [
      { label: 'huggingface_hub src/huggingface_hub/file_download.py (_raise_on_head_call_error)', url: `${HF_HUB}src/huggingface_hub/file_download.py` },
      { label: 'huggingface_hub src/huggingface_hub/constants.py (HF_ENDPOINT)', url: `${HF_HUB}src/huggingface_hub/constants.py` },
      { label: 'Ollama docs/import.mdx', url: `${OLLAMA}docs/import.mdx` },
    ],
    checkedAt: '2026-10-28',
  },
];

export const errorById = (id: string) => runtimeErrors.find(e => e.id === id);
