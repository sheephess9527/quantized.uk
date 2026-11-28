import { vllmRocmSupported } from '@/lib/utils/gpu-page';
import { quantWeights } from '@/lib/utils/vram';
import type { QuantVariant } from '@/lib/data/types';
import { LLAMACPP_BUILD, LLAMACPP_MTP_FLAGS } from '@/lib/data/runtime-build';

export type Framework = 'llamacpp' | 'ollama' | 'vllm' | 'exllama';
/** `windows` is PowerShell on the host (prebuilt llama.cpp zips, Ollama's Windows installer). */
export type Env = 'linux' | 'mac' | 'windows' | 'docker' | 'compose';

export interface CLIOptions {
  framework: Framework;
  env: Env;
  modelId: string;
  modelName: string;
  quantLevel: string;
  /** Verified single-file GGUF path from the selected quant source, not a guessed variant. */
  ggufFilename?: string;
  /** First-part file name of a split build minus `-00001-of-NNNNN.gguf`, when it is not `<repo base>-<level>`. */
  ggufShardStem?: string;
  /**
   * GGUF repo id from `lib/data/hf-repos.mjs`, e.g.
   * `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF`.
   *
   * Without it these commands can only guess, and a guess derived from the
   * display name is wrong more often than not — "Llama 3.1 8B Instruct" is not
   * the repo, not the filename, and not an Ollama tag.
   */
  hfRepo?: string;
  /**
   * Size of the selected GGUF file in GB (`ggufFileGB()`). Past `SHARD_GB` a build is usually
   * published in parts (`…-00001-of-00005.gguf`, often in a per-level folder), so the
   * exact single filename downloads nothing; the command then matches the parts instead.
   */
  fileGB?: number;
  gpuLayers: number;
  /**
   * llama.cpp only: keep routed experts in system RAM — `n` for `--n-cpu-moe n`,
   * `all` for `--cpu-moe` (`offloadPlan().moe`). Pair it with a full `-ngl`.
   */
  cpuMoe?: { n: number; all: boolean };
  contextLen: number;
  parallel?: number;
  tensorSplit?: string;
  draftMode?: 'none' | 'mtp' | 'draft';
  /** Pin num_ctx in a local Ollama model for the calculator's native commands. */
  ollamaSetContext?: boolean;
  threads: number;
  port: number;
  apiKey?: string;
  /**
   * The reader's GPU backend (`backendFor()` of the hardware profile). Only
   * the container commands use it: a CUDA image with `--gpus all` on an AMD
   * card, or a GPU block commented out on an NVIDIA one, both start cleanly
   * and run everything on the CPU. Defaults to CUDA.
   */
  backend?: 'cuda' | 'rocm' | 'sycl' | 'metal' | 'cpu';
  /** Language of `notes` — they render as visible text on both trees. Defaults to English. */
  lang?: 'en' | 'zh';
  /** Display name of the reader's GPU — vLLM's ROCm build supports only some Radeon/Instinct parts. */
  gpuName?: string;
}

type Lang = NonNullable<CLIOptions['lang']>;
/** One note in both languages; every note goes through this so `/zh` never shows an English one. */
function L(lang: Lang, en: string, zh: string): string {
  return lang === 'zh' ? zh : en;
}

/**
 * Mainland readers cannot reach huggingface.co directly, and they are most of
 * the Chinese tree. `HF_ENDPOINT` is huggingface_hub's own switch for the Hub
 * URL (`constants.py`, checked 2026-10-28), so every `hf download` and every
 * vLLM model fetch follows it. hf-mirror.com is a community mirror, not
 * Hugging Face — the line says so, and it is only emitted for `zh`.
 */
export const HF_MIRROR = 'https://hf-mirror.com';
function mirrorLines(lang: Lang): string[] {
  return lang === 'zh'
    ? ['# 国内网络：经第三方镜像 hf-mirror.com 下载（不是 Hugging Face 官方；在海外可删掉下一行）', `export HF_ENDPOINT=${HF_MIRROR}`]
    : [];
}

/**
 * `hfRepoMap` exists to source HF download/like stats, so for ~14 models it
 * points at the *original weights* (`openai/gpt-oss-20b`,
 * `deepseek-ai/DeepSeek-R1`) rather than a GGUF conversion. Handing one of
 * those to `hf download --include "*.gguf"` or to `ollama run
 * hf.co/…` produces a command that looks right and downloads nothing, so a
 * repo only counts here if it has the GGUF suffix or a verified GGUF filename.
 */
function ggufRepoId(hfRepo?: string, filename?: string): string | undefined {
  // Some publishers (TwIL) put verified GGUFs beside original weights.
  return hfRepo && (/-GGUF$/i.test(hfRepo) || filename?.endsWith('.gguf')) ? hfRepo : undefined;
}

/** `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` → `Meta-Llama-3.1-8B-Instruct`. */
function ggufBase(hfRepo: string): string {
  return (hfRepo.split('/')[1] ?? hfRepo).replace(/-GGUF$/i, '');
}

/**
 * Hugging Face's per-file limit has long been 50 GB, and bartowski/unsloth split anything near
 * it into parts; ggml-org also publishes 70–130 GB single files. Above this the command matches
 * either layout rather than assuming one.
 */
export const SHARD_GB = 48;

/** File size of a model's GGUF build at `level`, recorded bytes or an estimate from params × bpw / 8. */
export function ggufFileGB(model: { params: number; quants: { format: string; level: string; bpw: number; source?: QuantVariant['source']; publishedBytes?: number }[] }, level: string): number | undefined {
  const q = model.quants.find(x => x.format === 'GGUF' && x.level === level);
  if (!q) return undefined;
  const { weightBytes } = quantWeights(q);
  return weightBytes === undefined ? (model.params * q.bpw) / 8 : weightBytes / 1e9;
}

type Backend = NonNullable<CLIOptions['backend']>;

/** `docker run` lines that hand the container the GPU (llama.cpp / Ollama docker docs). */
function dockerGpuLines(backend: Backend): string[] {
  if (backend === 'cuda') return ['  --gpus all \\'];
  if (backend === 'rocm') return ['  --device /dev/kfd \\', '  --device /dev/dri \\'];
  // Intel: the render nodes only — /dev/kfd is AMD's, and Docker refuses to
  // start a container whose --device does not exist on the host.
  if (backend === 'sycl') return ['  --device /dev/dri \\'];
  return [];
}

/** The compose equivalent, indented for a service at two spaces. */
function composeGpuBlock(backend: Backend): string {
  if (backend === 'cuda') return `
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]`;
  if (backend === 'rocm') return `
    devices:
      - /dev/kfd
      - /dev/dri`;
  if (backend === 'sycl') return `
    devices:
      - /dev/dri`;
  return '';
}

/** llama.cpp server image per backend (docs/docker.md): `:server` alone is the CPU build. */
function llamaImageTag(backend: Backend): string {
  return backend === 'cuda' ? 'server-cuda' : backend === 'rocm' ? 'server-rocm' : backend === 'sycl' ? 'server-intel' : 'server';
}

/** Notes every container command carries for the reader's backend. */
function containerNotes(backend: Backend, lang: Lang): string[] {
  if (backend === 'cuda') return [L(lang, 'Requires the NVIDIA Container Toolkit on the host', '主机需要安装 NVIDIA Container Toolkit')];
  if (backend === 'rocm') return [L(lang, 'AMD GPU: needs ROCm drivers on the host; /dev/kfd and /dev/dri are passed through', 'AMD 显卡：主机需要安装 ROCm 驱动；命令已透传 /dev/kfd 和 /dev/dri')];
  if (backend === 'sycl') return [L(lang, "Intel Arc: needs Intel's GPU driver on the host (dgpu-docs.intel.com); /dev/dri is passed through", 'Intel Arc 显卡：主机需要安装英特尔 GPU 驱动（见 dgpu-docs.intel.com）；命令已透传 /dev/dri')];
  if (backend === 'metal') return [L(lang, 'Docker on macOS cannot reach the Apple GPU — this container runs on the CPU. Choose "macOS Terminal" to run natively on Metal', 'macOS 上的 Docker 无法使用苹果 GPU——这个容器会跑在 CPU 上。想用 Metal 加速，请选择 "macOS 终端" 直接在本机运行')];
  return [L(lang, 'CPU-only container', '纯 CPU 容器')];
}

/** Every container port here is published on loopback only; say how to widen it. */
function exposureNote(lang: Lang): string {
  return L(lang, 'Port published on 127.0.0.1 only — a bare -p PORT:PORT would expose this unauthenticated API on every network interface. To reach it from other machines, put an authenticating proxy in front first', '端口只发布在 127.0.0.1 上——如果写成 -p 端口:端口，这个没有鉴权的接口会暴露在所有网卡上。要从其他机器访问，先在前面加一层带鉴权的反向代理');
}

/** `nproc` is GNU coreutils — it does not exist on a stock macOS. */
function coreCount(env: Env): string {
  return env === 'mac' ? '$(sysctl -n hw.ncpu)' : '$(nproc)';
}

export interface CLIOutput {
  command: string;
  compose?: string;
  notes: string[];
}

function isGraniteSwitchGGUF(modelId?: string, repo?: string): boolean {
  return /^granite-switch-4\.1-(8b|30b)$/.test(modelId ?? '') ||
    /^ibm-granite\/granite-switch-4\.1-(8b|30b)-gguf$/i.test(repo ?? '');
}

function isLlamaCppV11GGUF(modelId?: string, repo?: string): boolean {
  return /^(domyn-edge-sft|inkling-2-mini|raon-1-mini)$/.test(modelId ?? '') ||
    /^(prithivmlmods\/domyn-edge-sft-gguf|(?:bartowski|unsloth|ggml-org)\/inkling-2-mini-gguf|krafton\/raon-1-mini-gguf)$/i.test(repo ?? '');
}

export function canOfferOllamaLaunch(modelId?: string, repo?: string): boolean {
  // The publisher verifies stock llama.cpp for this rotated GGUF. Ollama's
  // handling of its Hadamard metadata, Granite Switch's adapters, and newly
  // added llama.cpp v1.1.0 (b12774) architectures is unverified for hf.co GGUF imports.
  return !/^ternary-bonsai-2(?:-5)?-27b$/.test(modelId ?? '') &&
    !/^prism-ml\/ternary-bonsai-2(?:\.5)?-27b-gguf$/i.test(repo ?? '') &&
    !isGraniteSwitchGGUF(modelId, repo) &&
    !isLlamaCppV11GGUF(modelId, repo);
}

export function generateCLI(opts: CLIOptions): CLIOutput {
  const { framework } = opts;

  if (opts.env === 'windows' && (framework === 'vllm' || framework === 'exllama')) {
    const out = generateCLI({ ...opts, env: 'linux' });
    const lang: Lang = opts.lang ?? 'en';
    return { ...out, notes: [L(lang, 'There is no native Windows build of this runtime: run these commands inside WSL2 (Ubuntu), or use llama.cpp / Ollama on Windows itself', '这个运行时没有原生 Windows 版本：请在 WSL2（Ubuntu）里运行下面的命令，或者直接在 Windows 上用 llama.cpp / Ollama'), ...out.notes] };
  }
  if (framework === 'llamacpp') return generateLlamaCpp(opts);
  if (framework === 'ollama') {
    if (!canOfferOllamaLaunch(opts.modelId, opts.hfRepo)) {
      const lang = opts.lang ?? 'en';
      const note = isGraniteSwitchGGUF(opts.modelId, opts.hfRepo)
        ? L(lang, 'IBM publishes these Granite Switch GGUFs for llama.cpp b11798 or newer. Ollama support is unverified.',
          'IBM 为 llama.cpp b11798 或更新版本发布了这批 Granite Switch GGUF。Ollama 支持尚未核实。')
        : isLlamaCppV11GGUF(opts.modelId, opts.hfRepo)
          ? L(lang, 'Use llama.cpp v1.1.0 (b12774) or newer for this GGUF. Importing this exact file into Ollama is unverified.',
            '此 GGUF 请使用 llama.cpp v1.1.0（b12774）或更新版本。该文件导入 Ollama 的兼容性尚未核实。')
          : L(lang, 'Ollama support for this Hadamard-rotated GGUF is unverified. Select llama.cpp b11556 or newer.',
            '此 Hadamard 旋转 GGUF 尚未核实 Ollama 支持。请选择 llama.cpp b11556 或更新版本。');
      return { command: '# ' + note, notes: [note] };
    }
    return generateOllama(opts);
  }
  if (framework === 'vllm')     return generateVLLM(opts);
  if (framework === 'exllama')  return generateExLlama(opts);
  return { command: '# Select a framework', notes: [] };
}

/**
 * ExLlamaV2's chat template for a model, from the names `examples/chat.py`
 * accepts (`-modes` lists them). A wrong template still runs and answers
 * badly, so anything unrecognised falls back to `chatml` with a note.
 */
function exllamaMode(modelName: string): { mode: string; guessed: boolean } {
  const n = modelName.toLowerCase();
  if (/llama[ -]?3|llama 4/.test(n)) return { mode: 'llama3', guessed: false };
  if (/qwq/.test(n)) return { mode: 'qwq', guessed: false };
  if (/qwen|yi-|hermes/.test(n)) return { mode: 'chatml', guessed: false };
  if (/gemma/.test(n)) return { mode: 'gemma', guessed: false };
  if (/phi-?3|phi-?4/.test(n)) return { mode: 'phi3', guessed: false };
  if (/deepseek/.test(n)) return { mode: 'deepseek', guessed: false };
  if (/command[ -]?r|cohere/.test(n)) return { mode: 'cohere', guessed: false };
  if (/glm/.test(n)) return { mode: 'glm', guessed: false };
  return { mode: 'chatml', guessed: true };
}

/**
 * ExLlamaV2 as it actually stands (checked 2026-10-02): its README marks the
 * project archived, development has moved to ExLlamaV3, and the servers that
 * used to load EXL2 — TabbyAPI (`pyproject.toml` depends on exllamav3 only)
 * and text-generation-webui (ExLlamav3 loaders only) — no longer do. The repo
 * has no `__main__` server and no Dockerfile, so the `python -m
 * exllamav2.server` command and `ghcr.io/turboderp/exllamav2` image this used
 * to print did not exist. What does run is the library's own chat example.
 */
function generateExLlama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, contextLen } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const bpw = quantLevel.replace(/[^0-9.]/g, '') || '4.65';
  const modelDir = modelName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const { mode, guessed } = exllamaMode(modelName);
  const status = L(lang,
    'ExLlamaV2 is archived (its README says development continues in ExLlamaV3), and TabbyAPI and text-generation-webui now load EXL3, not EXL2 — so there is no maintained OpenAI-compatible server for EXL2 any more. These commands run the model locally with ExLlamaV2\'s own chat script',
    'ExLlamaV2 已归档（README 写明开发转到 ExLlamaV3），TabbyAPI 和 text-generation-webui 现在加载的是 EXL3 而不是 EXL2 —— 所以 EXL2 已经没有仍在维护的 OpenAI 兼容服务端。下面的命令用 ExLlamaV2 自带的聊天脚本在本机运行模型');
  const apiAlt = L(lang,
    'Need an API? Serve the same model as GGUF with llama.cpp, or as AWQ/GPTQ with vLLM — both still maintained',
    '需要 API？用 llama.cpp 跑这个模型的 GGUF 版本，或用 vLLM 跑 AWQ/GPTQ 版本 —— 两者都仍在维护');

  if (env === 'mac') {
    return {
      command: `# ExLlamaV2 requires an NVIDIA GPU (CUDA) — it does not run on Apple silicon.\n# Use llama.cpp or Ollama with the GGUF build instead.`,
      notes: [status],
    };
  }

  if (env === 'docker' || env === 'compose') {
    return {
      command: `# ExLlamaV2 publishes no Docker image, and the maintained servers that used to\n# load EXL2 (TabbyAPI, text-generation-webui) now load EXL3 only.\n# Choose "Linux / Ubuntu" for a local run, or switch to llama.cpp / vLLM for a container.`,
      notes: [status, apiAlt],
    };
  }

  const command = [
    `# Install ExLlamaV2 from source (the chat script lives in the repo)`,
    `git clone https://github.com/turboderp-org/exllamav2 && cd exllamav2`,
    `pip install -r requirements.txt`,
    `pip install .`,
    ``,
    `# Download the EXL2 build — each bitrate is a separate branch of the repo`,
    `pip install -U huggingface_hub`,
    ...mirrorLines(lang),
    `hf download <hf-exl2-repo-id> --revision ${bpw}bpw --local-dir ../models/${modelDir}-exl2-${bpw}bpw`,
    ``,
    `# Chat locally (-gs auto splits across GPUs; -l sets the context length)`,
    `python examples/chat.py -m ../models/${modelDir}-exl2-${bpw}bpw -mode ${mode} -l ${contextLen} -gs auto`,
  ].join('\n');

  return {
    command,
    notes: [
      status,
      L(lang, 'NVIDIA only — ExLlamaV2 has no ROCm or Metal path', '仅支持 NVIDIA —— ExLlamaV2 没有 ROCm 或 Metal 路径'),
      L(lang, 'Replace <hf-exl2-repo-id> with this model\'s EXL2 repo — EXL2 quants are per-model (turboderp, LoneStriker, bartowski), not derivable from the name. Check the branch name matches the bitrate', '把 <hf-exl2-repo-id> 换成这个模型的 EXL2 仓库——EXL2 量化按模型单独发布（turboderp、LoneStriker、bartowski 等），无法从名字推出。请确认分支名与比特率一致'),
      guessed
        ? L(lang, `-mode ${mode} is a guess for this model — run python examples/chat.py -modes to list the templates and pick the model's own`, `-mode ${mode} 是对这个模型的猜测 —— 运行 python examples/chat.py -modes 列出所有模板，选与模型匹配的那个`)
        : L(lang, `-mode ${mode} is the chat template; python examples/chat.py -modes lists the others`, `-mode ${mode} 是聊天模板；python examples/chat.py -modes 可列出其他模板`),
      apiAlt,
    ],
  };
}

/**
 * The native Linux build for the reader's backend (llama.cpp docs/build.md,
 * docs/backend/SYCL.md). This used to be the CUDA build for everyone: an AMD
 * reader got `-DGGML_CUDA=ON`, which stops at CMake for want of nvcc, and a
 * CPU-only reader was told to install a CUDA toolkit first.
 */
function linuxBuild(backend: Backend): string {
  const clone = `sudo apt install -y build-essential cmake git\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp`;
  if (backend === 'rocm') {
    // GPU_TARGETS is the card's gfx id; it is not derivable from a marketing
    // name reliably enough to print, so it stays a visible placeholder.
    return `# Prerequisites: ROCm 6.1+ on the host, Python 3\n# Install on Linux (with ROCm / HIP)\n${clone}\n# <gfx-target>: your card's id from \`rocminfo | grep gfx\` (e.g. gfx1100 for RX 7900)\nHIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" \\\n  cmake -S . -B build -DGGML_HIP=ON -DGPU_TARGETS=<gfx-target> -DCMAKE_BUILD_TYPE=Release`;
  }
  if (backend === 'sycl') {
    return `# Prerequisites: Intel's GPU driver and the oneAPI Base Toolkit, Python 3\n# Install on Linux (with SYCL, for Intel Arc)\n${clone}\nsource /opt/intel/oneapi/setvars.sh\ncmake -B build -DGGML_SYCL=ON -DCMAKE_C_COMPILER=icx -DCMAKE_CXX_COMPILER=icpx -DGGML_SYCL_F16=ON`;
  }
  if (backend === 'cpu') {
    return `# Prerequisites: Python 3\n# Install on Linux (CPU only)\n${clone}\ncmake -B build`;
  }
  return `# Prerequisites: a CUDA toolkit matching your driver (nvcc --version), Python 3\n# Install on Linux (with CUDA)\n${clone}\ncmake -B build -DGGML_CUDA=ON`;
}

function splitWeights(input?: string): string[] {
  const weights = input?.split(',').map(weight => weight.trim()) ?? [];
  return weights.length >= 2 && weights.every(weight => /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(weight) && Number.isFinite(Number(weight))) &&
    weights.some(weight => Number(weight) > 0) ? weights : [];
}

function generateLlamaCpp(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, gpuLayers, contextLen, threads, port, apiKey, cpuMoe } = opts;
  const moeFlag = cpuMoe ? (cpuMoe.all ? '--cpu-moe' : `--n-cpu-moe ${cpuMoe.n}`) : '';
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
  const hfRepo = ggufRepoId(opts.hfRepo, opts.ggufFilename);
  // GGUF repos name their files after the *source* repo, not the display name:
  // bartowski/Meta-Llama-3.1-8B-Instruct-GGUF ships
  // Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf. Deriving the filename from the
  // display name drops the "Meta-" and `--include` then matches nothing —
  // `hf download` downloads zero files and exits 0.
  const modelFile = opts.ggufFilename ?? (hfRepo
    ? `${ggufBase(hfRepo)}-${quantLevel}.gguf`
    : `${modelName.replace(/[^a-zA-Z0-9._-]/g, '-')}-${quantLevel}.gguf`);
  const repoId = hfRepo ?? '<hf-gguf-repo-id>';
  // A build past SHARD_GB may be one file or several parts in a folder, depending on the
  // publisher: download by pattern and let the shell find the first part (llama.cpp loads the
  // rest from it). Compose cannot run a shell, so it gets a visible placeholder instead.
  const sharded = !!hfRepo && (opts.fileGB ?? 0) > SHARD_GB;
  const filePattern = opts.ggufShardStem ? `${opts.ggufShardStem}*.gguf` : modelFile.replace(/\.gguf$/, '*.gguf');
  const findFirst = (dir: string) => `$(find ${dir} -name '${filePattern}' | sort | head -1)`;
  const hostModelPath = sharded ? `"${findFirst('./models')}"` : `./models/${modelFile}`;
  const containerModelPath = sharded ? `"/models/$(cd models && find . -name '${filePattern}' | sort | head -1)"` : `/models/${modelFile}`;
  const composeModelPath = sharded ? `/models/<first part: ${modelFile.replace(/\.gguf$/, '')}-00001-of-NNNNN.gguf, or the single file>` : `/models/${modelFile}`;
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';
  const weights = splitWeights(opts.tensorSplit);
  const flags = [
    ...(moeFlag ? [moeFlag] : []),
    ...((opts.parallel ?? 1) > 1 ? [`-np ${opts.parallel}`] : []),
    ...(weights.length ? [`-sm layer -ts ${weights.join(',')}`] : []),
    ...(opts.draftMode === 'mtp' ? [LLAMACPP_MTP_FLAGS] : []),
  ];
  const draftFlag = (directory: string) => `--spec-type draft-simple -md ${directory}/compatible-draft.gguf --spec-draft-n-max 12`;
  const nativeFlags = opts.draftMode === 'draft' ? [...flags, draftFlag('./models')] : flags;
  const containerFlags = opts.draftMode === 'draft' ? [...flags, draftFlag('/models')] : flags;
  const draftNotes = opts.draftMode === 'mtp'
    ? [L(lang, 'MTP requires a model and GGUF that contain a compatible MTP head.', 'MTP 需要模型和 GGUF 文件包含兼容的 MTP 草稿头。')]
    : opts.draftMode === 'draft'
      ? [L(lang, 'Save a compatible draft GGUF as models/compatible-draft.gguf before starting the server.', '启动前，请将兼容的草稿 GGUF 保存为 models/compatible-draft.gguf。')]
      : [];
  if (env === 'windows') {
    const output = llamaCppWindows(opts, { repoId, modelFile, filePattern, sharded, extraFlags: nativeFlags, lang, backend });
    return { ...output, notes: [...output.notes, ...draftNotes] };
  }

  // Loopback by default. `--host 0.0.0.0` publishes an unauthenticated
  // inference server to every interface on the machine, which is not what
  // "run it on my laptop" should mean. Inside a container the server must
  // bind 0.0.0.0 to be reachable through the port mapping at all, so exposure
  // is decided by the mapping: a bare `-p 8080:8080` publishes on every host
  // interface (and Docker's own iptables rules bypass ufw), so every mapping
  // here is `127.0.0.1:` — see `exposureNote`.
  const serverCmd = [
    `./build/bin/llama-server \\`,
    `  -m ${hostModelPath} \\`,
    `  --host 127.0.0.1 --port ${port} \\`,
    `  -ngl ${gpuLayers} \\`,
    ...nativeFlags.map(flag => `  ${flag} \\`),
    `  -c ${contextLen} \\`,
    `  -t ${threads}${apiKeyFlag}`,
  ].join('\n');

  if (env === 'docker') {
    const command = [
      `docker run --rm -it \\`,
      ...dockerGpuLines(backend),
      `  -p 127.0.0.1:${port}:${port} \\`,
      `  -v $(pwd)/models:/models \\`,
      `  ghcr.io/ggml-org/llama.cpp:${llamaImageTag(backend)} \\`,
      `  -m ${containerModelPath} \\`,
      `  --host 0.0.0.0 --port ${port} \\`,
      `  -ngl ${gpuLayers} \\`,
      ...containerFlags.map(flag => `  ${flag} \\`),
      `  -c ${contextLen}${apiKey ? ` \\\n  --api-key "${apiKey}"` : ''}`,
    ].join('\n');
    // `:server` is the CPU-only image (llama.cpp docs/docker.md); with it,
    // `--gpus all -ngl` starts cleanly and silently runs everything on the CPU.
    return { command, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, `Image :${llamaImageTag(backend)} — :server is CPU-only, :server-cuda is NVIDIA, :server-rocm is AMD, :server-intel is Intel (SYCL)`, `镜像 :${llamaImageTag(backend)}——:server 是纯 CPU 版，:server-cuda 用于 NVIDIA，:server-rocm 用于 AMD，:server-intel 用于英特尔（SYCL）`), L(lang, 'Model file must be in ./models/ directory', '模型文件需放在 ./models/ 目录下'), ...draftNotes] };
  }

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  llama-server:
    image: ghcr.io/ggml-org/llama.cpp:${llamaImageTag(backend)}
    container_name: llama-server
    ports:
      - "127.0.0.1:${port}:${port}"
    volumes:
      - ./models:/models
    command: >
      -m ${composeModelPath}
      --host 0.0.0.0
      --port ${port}
      -ngl ${gpuLayers}${containerFlags.map(flag => `\n      ${flag}`).join('')}
      -c ${contextLen}${apiKey ? `\n      --api-key ${apiKey}` : ''}
    restart: unless-stopped${composeGpuBlock(backend)}`;
    return { command: serverCmd, compose, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, 'Edit the compose file to mount your model directory', '修改 compose 文件，挂载你的模型目录'), ...draftNotes] };
  }

  // Build flags: llama.cpp renamed every LLAMA_* CMake option to GGML_*. Its
  // CMakeLists maps the old names (LLAMA_CUDA warns and still enables CUDA,
  // LLAMA_CUBLAS is a fatal error), but a *misspelt* -D is only reported as an
  // unused variable and yields a CPU-only build — emit the current names.
  const downloadCmd = [
    `# Download the model (installs the hf CLI the next line needs)`,
    `pip install -U huggingface_hub`,
    ...mirrorLines(lang),
    `hf download ${repoId} --include "${sharded ? `*${filePattern}` : modelFile}" --local-dir ./models`,
  ].join('\n');
  const installCmd = env === 'mac'
    ? `# Prerequisites: Xcode command line tools, Homebrew, Python 3\n# Install on macOS\nbrew install cmake git\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_METAL=ON\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`
    : `${linuxBuild(backend)}\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`;

  return {
    command: `${installCmd}\n${serverCmd}`,
    notes: [
      ...draftNotes,
      L(lang, `-ngl ${gpuLayers}: number of layers offloaded to GPU (set to 99 for full GPU)`, `-ngl ${gpuLayers}：放到 GPU 上的层数（设为 99 即全部放到 GPU）`),
      ...(cpuMoe ? [cpuMoe.all
        ? L(lang, '--cpu-moe: every expert weight stays in system RAM; attention, shared weights and the KV cache stay on the GPU', '--cpu-moe：全部专家权重留在系统内存，注意力、共享权重和 KV 缓存留在 GPU')
        : L(lang, `--n-cpu-moe ${cpuMoe.n}: the expert weights of the first ${cpuMoe.n} layers stay in system RAM. Lower it until loading fails for lack of VRAM, then step back up — fewer is faster`, `--n-cpu-moe ${cpuMoe.n}：前 ${cpuMoe.n} 层的专家权重留在系统内存。可以逐步调小，直到显存不够加载失败再调回一格——数字越小越快`)] : []),
      L(lang, `-c ${contextLen}: context length in tokens`, `-c ${contextLen}：上下文长度（token 数）`),
      L(lang, `API endpoint: http://127.0.0.1:${port}/v1/chat/completions (OpenAI-compatible)`, `接口地址：http://127.0.0.1:${port}/v1/chat/completions（OpenAI 兼容）`),
      L(lang, `Health check once it starts: curl -s http://127.0.0.1:${port}/health — expect {"status":"ok"}`, `启动后检查：curl -s http://127.0.0.1:${port}/health——应返回 {"status":"ok"}`),
      L(lang, 'To reach it from another machine, replace 127.0.0.1 with 0.0.0.0 and put it behind auth first', '要从其他机器访问，把 127.0.0.1 换成 0.0.0.0，并先加上身份验证'),
      L(lang, 'Large models ship sharded (…-00001-of-00002.gguf) — point -m at the first shard', '大模型会分片发布（…-00001-of-00002.gguf）——-m 指向第一个分片即可'),
      ...(hfRepo
        ? []
        : [L(lang, `Replace ${repoId}/the filename: no GGUF conversion is mapped for this model, only its original weights`, `请替换 ${repoId} 和文件名：本站没有为这个模型对应的 GGUF 转换版本，只有原始权重`)]),
    ],
  };
}

/** Ollama has no SYCL build; it reaches Intel Arc through Vulkan (docs/gpu.mdx). */
function ollamaIntelNote(lang: Lang): string {
  return L(lang, "Intel Arc runs through Ollama's Vulkan backend, which is on by default — `ollama ps` should show GPU in the PROCESSOR column. On Linux, install Intel's GPU driver first", 'Intel Arc 通过 Ollama 的 Vulkan 后端运行，默认已开启——`ollama ps` 的 PROCESSOR 一列应显示 GPU。Linux 上需先安装英特尔 GPU 驱动')
}

/**
 * llama.cpp on Windows from the project's own prebuilt zips — no compiler, which
 * is what most Windows readers lack. Asset names are copied from the release
 * page (`llama-<build>-bin-win-cuda-12.4-x64.zip`, `cudart-llama-bin-win-cuda-12.4-x64.zip`
 * — the runtime zip carries no build number, checked on b11941 and b11960), and
 * the URL pattern is the one winget's `ggml.llamacpp` manifest downloads. Every backend zip
 * carries the CPU zip's executables at its root (`.github/workflows/release-publish.yml` injects
 * them), and the cudart DLLs go next to them (`release.yml`: "extract next to the binaries").
 * CUDA 12.4 for NVIDIA except Blackwell (RTX 50), which gets the CUDA 13 zip (13.5 from
 * b12180; it was 13.4 through b12138 — re-read the asset names when bumping the build);
 * Vulkan for AMD and Intel, the build winget installs. PowerShell rules from
 * this repo: one command per line, no `^`, no `curl` alias.
 */
function llamaCppWindows(
  opts: CLIOptions,
  f: { repoId: string; modelFile: string; filePattern: string; sharded: boolean; extraFlags: string[]; lang: Lang; backend: Backend },
): CLIOutput {
  const { gpuLayers, contextLen, port, apiKey } = opts;
  const { lang, backend } = f;
  const blackwell = /RTX 50\d\d/i.test(opts.gpuName ?? '');
  const cuda = backend === 'cuda' ? (blackwell ? 'cuda-13.5' : 'cuda-12.4') : undefined;
  const flavour = cuda ?? (backend === 'cpu' ? 'cpu' : 'vulkan');
  const modelPath = f.sharded
    ? `(Get-ChildItem models -Recurse -Filter "${f.filePattern}" | Sort-Object FullName | Select-Object -First 1).FullName`
    : `models\\${f.modelFile}`;
  const flags = [
    `-m ${modelPath}`,
    `--host 127.0.0.1 --port ${port}`,
    `-ngl ${gpuLayers}`,
    ...f.extraFlags,
    `-c ${contextLen}`,
    ...(apiKey ? [`--api-key "${apiKey}"`] : []),
  ].join(' ');
  const command = [
    L(lang, `# 1. Download llama.cpp's prebuilt Windows build (${flavour}, release ${LLAMACPP_BUILD})`, `# 1. 下载 llama.cpp 官方预编译的 Windows 版（${flavour}，版本 ${LLAMACPP_BUILD}）`),
    `$ProgressPreference = "SilentlyContinue"`,
    `$B = "${LLAMACPP_BUILD}"`,
    `$U = "https://github.com/ggml-org/llama.cpp/releases/download/$B"`,
    `Invoke-WebRequest "$U/llama-$B-bin-win-${flavour}-x64.zip" -OutFile llama.zip`,
    ...(cuda ? [`Invoke-WebRequest "$U/cudart-llama-bin-win-${cuda}-x64.zip" -OutFile cudart.zip`] : []),
    `Expand-Archive llama.zip -DestinationPath llama.cpp -Force`,
    ...(cuda ? [`Expand-Archive cudart.zip -DestinationPath llama.cpp -Force`] : []),
    ``,
    L(lang, `# 2. Download the model (installs the hf CLI the next line needs)`, `# 2. 下载模型（先安装下一行要用的 hf 命令）`),
    `pip install -U huggingface_hub`,
    ...(lang === 'zh' ? ['# 国内网络：经第三方镜像 hf-mirror.com 下载（不是 Hugging Face 官方；在海外可删掉下一行）', `$env:HF_ENDPOINT = "${HF_MIRROR}"`] : []),
    `hf download ${f.repoId} --include "${f.sharded ? `*${f.filePattern}` : f.modelFile}" --local-dir models`,
    ``,
    L(lang, `# 3. Start the server`, `# 3. 启动服务`),
    `.\\llama.cpp\\llama-server.exe ${flags}`,
  ].join('\n');
  const notes = [
    L(lang, 'Run these in PowerShell, from the folder you want llama.cpp and the model in. Each command is on one line, so they also paste into Windows Terminal as they are', '在 PowerShell 里运行，先进入想放 llama.cpp 和模型的文件夹。每条命令都在一行内，直接粘贴即可'),
    ...(cuda ? [blackwell
      ? L(lang, 'RTX 50 cards need the CUDA 13 build; if llama-server exits at start, update the NVIDIA driver first', 'RTX 50 系列需要 CUDA 13 版本；如果 llama-server 一启动就退出，先更新 NVIDIA 驱动')
      : L(lang, 'The cudart zip holds the CUDA runtime DLLs — no CUDA Toolkit install is needed, only an NVIDIA driver', 'cudart 压缩包里是 CUDA 运行库 DLL——不需要安装 CUDA Toolkit，只需要 NVIDIA 驱动')] : []),
    ...(backend === 'rocm' ? [L(lang, 'The Vulkan build runs on any recent Radeon driver; the release also has a ROCm build (llama-<build>-bin-win-rocm-10.0-x64.zip) for cards ROCm supports', 'Vulkan 版在较新的 Radeon 驱动上都能运行；发布页另有 ROCm 版（llama-<版本>-bin-win-rocm-10.0-x64.zip），适用于 ROCm 支持的显卡')] : []),
    ...(backend === 'sycl' ? [L(lang, 'The Vulkan build runs on Intel Arc with the normal graphics driver; the release also has a SYCL build (llama-<build>-bin-win-sycl-x64.zip)', 'Vulkan 版用普通显卡驱动就能在 Intel Arc 上运行；发布页另有 SYCL 版（llama-<版本>-bin-win-sycl-x64.zip）')] : []),
    L(lang, '`winget install llama.cpp` also works and keeps it updated — it installs the Vulkan build', '也可以用 `winget install llama.cpp` 安装并自动更新——它装的是 Vulkan 版'),
    ...(lang === 'zh' ? ['GitHub 在国内下载可能很慢：也可以在浏览器里打开 llama.cpp 的发布页，手动下载上面这几个 zip，再解压到 llama.cpp 文件夹'] : []),
    L(lang, `-ngl ${gpuLayers}: number of layers offloaded to GPU (99 = all)`, `-ngl ${gpuLayers}：放到 GPU 上的层数（99 即全部）`),
    ...(opts.cpuMoe ? [opts.cpuMoe.all
      ? L(lang, '--cpu-moe: every expert weight stays in system RAM; attention, shared weights and the KV cache stay on the GPU', '--cpu-moe：全部专家权重留在系统内存，注意力、共享权重和 KV 缓存留在 GPU')
      : L(lang, `--n-cpu-moe ${opts.cpuMoe.n}: the expert weights of the first ${opts.cpuMoe.n} layers stay in system RAM. Lower it until loading fails for lack of VRAM, then step back up — fewer is faster`, `--n-cpu-moe ${opts.cpuMoe.n}：前 ${opts.cpuMoe.n} 层的专家权重留在系统内存。可以逐步调小，直到显存不够加载失败再调回一格——数字越小越快`)] : []),
    L(lang, `Health check once it starts: curl.exe -s http://127.0.0.1:${port}/health — expect {"status":"ok"} (write curl.exe: in Windows PowerShell, curl is an alias of Invoke-WebRequest)`, `启动后检查：curl.exe -s http://127.0.0.1:${port}/health——应返回 {"status":"ok"}（要写 curl.exe：Windows PowerShell 里的 curl 是 Invoke-WebRequest 的别名）`),
    L(lang, `API endpoint: http://127.0.0.1:${port}/v1/chat/completions (OpenAI-compatible)`, `接口地址：http://127.0.0.1:${port}/v1/chat/completions（OpenAI 兼容）`),
  ];
  return { command, notes };
}

function generateOllama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, port, contextLen } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
  const hfRepo = ggufRepoId(opts.hfRepo, opts.ggufFilename);
  // Ollama library tags are curated and short (`qwen2.5:7b`) — they are not
  // derivable from a display name, so the old slug ("llama-3.1-8b-instruct")
  // simply 404s on pull. Ollama can run any GGUF repo straight from Hugging
  // Face, which works for every model in the index and pins the exact quant.
  // For the mirror route in the zh notes: the same `<repo base>-<level>` file name the
  // llama.cpp command downloads.
  // Split builds (past SHARD_GB) land in a publisher-specific sub-folder, so their FROM path is
  // described rather than typed; a single file gets its exact name.
  const ollamaSharded = (opts.fileGB ?? 0) > SHARD_GB;
  const ollamaGgufPattern = opts.ggufFilename ?? (hfRepo ? `${ollamaSharded && opts.ggufShardStem ? opts.ggufShardStem : `${ggufBase(hfRepo)}-${quantLevel}`}${ollamaSharded ? '*' : ''}.gguf` : '');
  const ollamaLocalName = hfRepo ? `${ggufBase(hfRepo)}-${quantLevel}`.toLowerCase().replace(/[^a-z0-9._-]/g, '-') : '';
  const ollamaModel = hfRepo
    ? `hf.co/${hfRepo}:${opts.ggufFilename ?? quantLevel}`
    : modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.-]/g, '');
  let run = [`ollama pull ${ollamaModel}`, `ollama run ${ollamaModel}`];
  if (opts.ollamaSetContext && hfRepo && env !== 'docker' && env !== 'compose') {
    const local = `quantized-${opts.modelId ?? ollamaLocalName}:${quantLevel.toLowerCase()}-ctx${contextLen}`.replace(/[^a-z0-9._:-]/g, '-');
    const from = `FROM ${ollamaModel}`;
    const context = `PARAMETER num_ctx ${contextLen}`;
    run = env === 'windows' ? [
      `ollama pull ${ollamaModel}`,
      'if ($LASTEXITCODE -ne 0) { throw "ollama pull failed" }',
      '$modelFile = New-TemporaryFile',
      `Set-Content -LiteralPath $modelFile.FullName -Encoding ASCII -Value '${from}', '${context}'`,
      `ollama create ${local} -f $modelFile.FullName`,
      'Remove-Item -LiteralPath $modelFile.FullName',
      `if ($LASTEXITCODE -eq 0) { ollama run ${local} }`,
    ] : [
      `if ollama pull ${ollamaModel} && model_file=$(mktemp); then`,
      `  printf '%s\\n' '${from}' '${context}' > "$model_file" &&`,
      `    ollama create ${local} -f "$model_file" && ollama run ${local}`,
      'rm -f "$model_file"',
      'fi',
    ];
  }

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  ollama:
    image: ollama/ollama:${backend === 'rocm' ? 'rocm' : 'latest'}
    container_name: ollama
    ports:
      - "127.0.0.1:${port}:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped${composeGpuBlock(backend)}

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "127.0.0.1:3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    volumes:
      - webui_data:/app/backend/data
    restart: unless-stopped

volumes:
  ollama_data:
  webui_data:`;

    const command = `# After docker compose up -d:\ndocker exec ollama ollama pull ${ollamaModel}`;
    return { command, compose, notes: [...containerNotes(backend, lang), ...(backend === 'sycl' ? [ollamaIntelNote(lang)] : []), exposureNote(lang), L(lang, 'Open WebUI available at http://localhost:3000', 'Open WebUI 地址：http://localhost:3000'), L(lang, `OpenAI-compatible API at http://localhost:${port}/v1`, `OpenAI 兼容接口：http://localhost:${port}/v1`)] };
  }

  if (env === 'docker') {
    const command = [
      `# Start Ollama container`,
      `docker run -d \\`,
      ...dockerGpuLines(backend),
      `  -p 127.0.0.1:${port}:11434 \\`,
      `  -v ollama:/root/.ollama \\`,
      `  --name ollama \\`,
      `  ollama/ollama${backend === 'rocm' ? ':rocm' : ''}`,
      ``,
      `# Pull the model`,
      `docker exec ollama ollama pull ${ollamaModel}`,
    ].join('\n');
    return { command, notes: [...containerNotes(backend, lang), ...(backend === 'sycl' ? [ollamaIntelNote(lang)] : []), exposureNote(lang), L(lang, `API available at http://localhost:${port}/v1`, `接口地址：http://localhost:${port}/v1`)] };
  }

  if (env === 'windows') {
    const command = [
      L(lang, `# Install Ollama (its official PowerShell installer; OllamaSetup.exe from ollama.com does the same)`, `# 安装 Ollama（官方 PowerShell 安装脚本；也可以从 ollama.com 下载 OllamaSetup.exe）`),
      `irm https://ollama.com/install.ps1 | iex`,
      ``,
      L(lang, `# Pull and run ${modelName}`, `# 拉取并运行 ${modelName}`),
      ...run,
      ``,
      L(lang, `# Ollama keeps running in the background and serves the API on 127.0.0.1:11434.`, `# 安装后 Ollama 在后台运行，接口在 127.0.0.1:11434。`),
      ...(port === 11434 ? [] : [
        L(lang, `# To serve on port ${port} instead: quit Ollama from the tray icon first, then:`, `# 要改用 ${port} 端口：先从托盘图标退出 Ollama，然后：`),
        `$env:OLLAMA_HOST = "127.0.0.1:${port}"; ollama serve`,
      ]),
    ].join('\n');
    const zhImport = lang === 'zh' && hfRepo
      ? [`国内直连 huggingface.co 拉取常会失败，HF_ENDPOINT 对 Ollama 的 hf.co/ 拉取不起作用。可以先经镜像下载 GGUF 再导入（PowerShell）：pip install -U huggingface_hub；$env:HF_ENDPOINT = "${HF_MIRROR}"；hf download ${hfRepo} --include "${ollamaGgufPattern}" --local-dir models；${ollamaSharded ? '再写一个 Modelfile，FROM 用通配符指向下载到的全部分片文件，然后 ollama create ' + ollamaLocalName + ' -f Modelfile' : `Set-Content Modelfile "FROM ./models/${ollamaGgufPattern}"；ollama create ${ollamaLocalName} -f Modelfile`}（Windows PowerShell 里不要用 echo > 写 Modelfile，它会写成 UTF-16；hf-mirror.com 是第三方镜像，不是 Hugging Face 官方）`]
      : [];
    return {
      command,
      notes: [
        L(lang, 'Ollama for Windows needs Windows 10 22H2 or newer, and an NVIDIA driver 551.61+ or a recent AMD driver (ROCm v7 or Vulkan)', 'Windows 版 Ollama 需要 Windows 10 22H2 或更新版本，以及 551.61 以上的 NVIDIA 驱动或较新的 AMD 驱动（ROCm v7 或 Vulkan）'),
        L(lang, `OpenAI-compatible API: http://localhost:${port}/v1/chat/completions`, `OpenAI 兼容接口：http://localhost:${port}/v1/chat/completions`),
        ...(hfRepo ? [L(lang, `hf.co/… pulls the GGUF directly and pins the quant to ${quantLevel}`, `hf.co/… 会直接拉取 GGUF，并固定为 ${quantLevel} 量化`)] : []),
        ...zhImport,
        L(lang, 'Models are stored in your home folder; set the OLLAMA_MODELS user variable to put them on another drive', '模型默认存放在用户目录；要放到其他盘，设置用户环境变量 OLLAMA_MODELS'),
      ],
    };
  }

  const installCmd = env === 'mac'
    ? `curl -fsSL https://ollama.com/install.sh | sh`
    : `curl -fsSL https://ollama.com/install.sh | sh`;

  const command = [
    `# Install Ollama`,
    installCmd,
    ``,
    `# Pull and run ${modelName}`,
    ...run,
    ``,
    env === 'mac'
      ? `# The Ollama app already serves the API on 127.0.0.1:11434 while it is open.`
      : `# The Linux installer already runs the API on 127.0.0.1:11434 as a service.`,
    ...(port === 11434
      ? env === 'mac'
        ? [`# To run it in the foreground instead, quit the Ollama app first, then:`, `#   ollama serve`]
        : [`# To run it in the foreground instead, stop the service first:`, `#   sudo systemctl stop ollama && ollama serve`]
      : [`# To serve on port ${port} instead (loopback only):`, `OLLAMA_HOST=127.0.0.1:${port} ollama serve`]),
  ].join('\n');

  return {
    command,
    notes: [
      ...(backend === 'sycl' ? [ollamaIntelNote(lang)] : []),
      L(lang, `OpenAI-compatible API: http://localhost:${port}/v1/chat/completions`, `OpenAI 兼容接口：http://localhost:${port}/v1/chat/completions`),
      ...(hfRepo
        ? [
            L(lang, `hf.co/… pulls the GGUF directly and pins the quant to ${quantLevel}`, `hf.co/… 会直接拉取 GGUF，并固定为 ${quantLevel} 量化`),
            L(lang, 'If this model has a curated library tag (e.g. `ollama run qwen2.5:7b`), that works too — but it picks the quant for you', '如果这个模型在 Ollama 库里有官方标签（如 `ollama run qwen2.5:7b`），也可以用——但量化档位由它替你选'),
            // `ollama pull hf.co/…` talks to huggingface.co itself; HF_ENDPOINT does not
            // reach it. Ollama's own import doc (`docs/import.mdx`) loads a local GGUF
            // with `FROM <file>` (a wildcard for split files) and `ollama create`.
            ...(lang === 'zh' && hfRepo
              ? [`国内直连 huggingface.co 拉取常会失败，HF_ENDPOINT 对 Ollama 的 hf.co/ 拉取不起作用。可以先经镜像下载 GGUF 再导入：pip install -U huggingface_hub，然后 HF_ENDPOINT=${HF_MIRROR} hf download ${hfRepo} --include "${ollamaGgufPattern}" --local-dir ./models，${ollamaSharded ? '再写一个 Modelfile，FROM 用通配符指向下载到的全部分片文件（例如 FROM ./models/子目录/文件名-*.gguf），然后 ollama create ' + ollamaLocalName + ' -f Modelfile' : `再执行 echo "FROM ./models/${ollamaGgufPattern}" > Modelfile && ollama create ${ollamaLocalName} -f Modelfile`}（hf-mirror.com 是第三方镜像，不是 Hugging Face 官方）`]
              : []),
          ]
        : [L(lang, 'No GGUF conversion is mapped for this model — replace the tag with a real Ollama library tag or an hf.co/<user>/<repo>-GGUF tag', '本站没有为这个模型对应的 GGUF 转换版本——请换成真实的 Ollama 库标签，或 hf.co/<用户>/<仓库>-GGUF 形式的标签')]),
      L(lang, `Set OLLAMA_NUM_PARALLEL for concurrent requests`, `需要并发请求时设置 OLLAMA_NUM_PARALLEL`),
    ],
  };
}

function generateVLLM(opts: CLIOptions): CLIOutput {
  const { env, quantLevel, contextLen, port, apiKey } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
  const rocm = backend === 'rocm';
  // Notes that depend on the reader's hardware, shared by every vLLM output.
  const hwNotes: string[] =
    backend === 'metal' || backend === 'cpu' || backend === 'sycl'
      ? [L(lang, 'These vLLM commands are for NVIDIA and AMD GPUs — on Intel Arc, a Mac or a CPU-only machine, llama.cpp or Ollama is the practical choice', '这些 vLLM 命令面向 NVIDIA 和 AMD 显卡——在 Intel Arc、Mac 或纯 CPU 机器上，更实际的选择是 llama.cpp 或 Ollama')]
      : rocm && !vllmRocmSupported(opts.gpuName)
        ? [L(lang, `vLLM's ROCm build lists Radeon RX 7900/7800/7700 and RX 9000 cards and Instinct MI200+; ${opts.gpuName} is not on that list — llama.cpp or Ollama will run it`, `vLLM 的 ROCm 版本支持名单只有 Radeon RX 7900/7800/7700、RX 9000 系列和 Instinct MI200 及以上；${opts.gpuName} 不在名单上——用 llama.cpp 或 Ollama 可以运行`)]
        : [];

  const isAWQ = quantLevel.toLowerCase().includes('awq');
  const isGPTQ = quantLevel.toLowerCase().includes('gptq');
  // vLLM takes a Hugging Face *repo id*, and it serves FP16/AWQ/GPTQ weights —
  // not the GGUF repos this site maps. The display name used to be pasted in
  // here verbatim, which produced `--model Llama 3.1 8B Instruct`: three stray
  // argv entries and a server that never starts. An explicit placeholder is
  // the honest output when the right repo is not something we can derive.
  const repoId = isAWQ ? '<hf-awq-repo-id>' : isGPTQ ? '<hf-gptq-repo-id>' : '<hf-repo-id>';
  const quantFlag = isAWQ ? ' \\\n  --quantization awq' : isGPTQ ? ' \\\n  --quantization gptq' : '';
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';
  const devices = splitWeights(opts.tensorSplit).length;
  const options = [
    ...((opts.parallel ?? 1) > 1 ? [`--max-num-seqs ${opts.parallel}`] : []),
    ...(devices > 1 ? [`--tensor-parallel-size ${devices}`] : []),
  ];

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  vllm:
    image: vllm/vllm-openai${rocm ? '-rocm' : ''}:latest
    container_name: vllm
    ports:
      - "127.0.0.1:${port}:${port}"
    volumes:
      - huggingface_cache:/root/.cache/huggingface
    command: >
      --model ${repoId}${isAWQ ? '\n      --quantization awq' : ''}
      --max-model-len ${contextLen}
      --port ${port}
      --gpu-memory-utilization 0.85${options.map(flag => `\n      ${flag}`).join('')}${apiKey ? `\n      --api-key ${apiKey}` : ''}${rocm ? `
    devices:
      - /dev/kfd
      - /dev/dri
    group_add:
      - video
    cap_add:
      - SYS_PTRACE
    security_opt:
      - seccomp=unconfined` : `
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]`}
    ipc: host
    restart: unless-stopped
    environment:
      - HF_TOKEN=\${HF_TOKEN}
${lang === 'zh' ? `      - HF_ENDPOINT=${HF_MIRROR}\n` : ''}
volumes:
  huggingface_cache:`;

    const command = `# Start vLLM server\ndocker compose up -d\n\n# Test the API\ncurl http://localhost:${port}/v1/models`;
    return { command, compose, notes: [...hwNotes, exposureNote(lang), rocm ? L(lang, 'AMD: official vllm/vllm-openai-rocm image; needs ROCm drivers on the host', 'AMD：使用官方 vllm/vllm-openai-rocm 镜像；主机需要安装 ROCm 驱动') : L(lang, 'Requires NVIDIA Container Toolkit and an R580 or newer driver: vLLM\'s images are built on CUDA 13 since v0.33.0', '需要 NVIDIA Container Toolkit 和 R580 或更新的驱动：vLLM 镜像自 v0.33.0 起基于 CUDA 13'), L(lang, 'Set HF_TOKEN env var for gated models', '需要授权的模型请设置 HF_TOKEN 环境变量')] };
  }

  if (env === 'docker') {
    const command = [
      // ROCm flags as vLLM's ROCm install docs give them; --ipc=host as both
      // vLLM docker examples use it (PyTorch shared memory).
      ...(rocm
        ? [`docker run \\`, `  --group-add=video \\`, `  --cap-add=SYS_PTRACE \\`, `  --security-opt seccomp=unconfined \\`, `  --device /dev/kfd \\`, `  --device /dev/dri \\`]
        : [`docker run --gpus all \\`]),
      `  --ipc=host \\`,
      `  -p 127.0.0.1:${port}:${port} \\`,
      `  -v ~/.cache/huggingface:/root/.cache/huggingface \\`,
      `  -e HF_TOKEN=$HF_TOKEN \\`,
      ...(lang === 'zh' ? [`  -e HF_ENDPOINT=${HF_MIRROR} \\`] : []),
      `  vllm/vllm-openai${rocm ? '-rocm' : ''}:latest \\`,
      `  --model ${repoId}${quantFlag} \\`,
      `  --max-model-len ${contextLen} \\`,
      `  --gpu-memory-utilization 0.85 \\`,
      ...options.map(flag => `  ${flag} \\`),
      `  --port ${port}${apiKeyFlag}`,
    ].join('\n');
    return { command, notes: [...hwNotes, exposureNote(lang), rocm ? L(lang, 'AMD: official vllm/vllm-openai-rocm image; needs ROCm drivers on the host', 'AMD：使用官方 vllm/vllm-openai-rocm 镜像；主机需要安装 ROCm 驱动') : L(lang, 'Requires NVIDIA Container Toolkit and an R580 or newer driver: vLLM\'s images are built on CUDA 13 since v0.33.0', '需要 NVIDIA Container Toolkit 和 R580 或更新的驱动：vLLM 镜像自 v0.33.0 起基于 CUDA 13'), L(lang, 'Set HF_TOKEN env var for gated models', '需要授权的模型请设置 HF_TOKEN 环境变量')] };
  }

  const command = [
    // Install and entrypoint as vLLM's quickstart documents them: uv picks the
    // torch build for the CUDA driver; AMD installs from vLLM's ROCm index.
    ...(rocm
      ? [`# Install vLLM's ROCm build (Python 3.12; ROCm 10.0 wheels by default, which bring the ROCm SDK from pip)`, `uv venv --python 3.12 --seed && source .venv/bin/activate`, `uv pip install vllm --extra-index-url https://wheels.vllm.ai/rocm/`]
      : [`# Install vLLM in a fresh venv (uv picks the torch build for your CUDA driver)`, `pip install --upgrade uv`, `uv venv --python 3.12 --seed && source .venv/bin/activate`, `uv pip install vllm --torch-backend=auto`]),
    ``,
    ...mirrorLines(lang),
    `# Serve the model`,
    `vllm serve ${repoId}${quantFlag} \\`,
    `  --max-model-len ${contextLen} \\`,
    `  --gpu-memory-utilization 0.85 \\`,
    ...options.map(flag => `  ${flag} \\`),
    // `--host` defaults to None (every interface) in vllm serve; loopback, as
    // the llama.cpp command does.
    `  --host 127.0.0.1 --port ${port}${apiKeyFlag}`,
  ].join('\n');

  return {
    command,
    notes: [
      ...hwNotes,
      L(lang, `OpenAI-compatible API at http://localhost:${port}/v1`, `OpenAI 兼容接口：http://localhost:${port}/v1`),
      L(lang, `Adjust --gpu-memory-utilization (0.7–0.95) based on your GPU`, `根据显卡调整 --gpu-memory-utilization（0.7–0.95）`),
      L(lang, `Add --tensor-parallel-size N for multi-GPU setups`, `多卡时加上 --tensor-parallel-size N`),
      L(lang, `Replace ${repoId} with the ${isAWQ ? 'AWQ' : isGPTQ ? 'GPTQ' : 'FP16'} repo — vLLM does not serve the GGUF repos linked from the model page`, `把 ${repoId} 换成 ${isAWQ ? 'AWQ' : isGPTQ ? 'GPTQ' : 'FP16'} 仓库——vLLM 不能直接加载模型页链接的 GGUF 仓库`),
    ],
  };
}
